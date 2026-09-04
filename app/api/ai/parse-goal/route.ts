import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchCatalog } from "@/lib/catalog";

/**
 * POST /api/ai/parse-goal
 *
 * STEP 1 — Real LLM call (Anthropic / OpenAI / Gemini) to parse natural language intent.
 *   Extracts ONLY:
 *     - item: string (e.g., "iPhone 14")
 *     - deadline: ISO date (YYYY-MM-DD), resolving relative dates like "before December"
 *     - notes: optional string
 *   If the prompt is too vague (e.g., "I want to save some money"), returns an error field.
 *
 * STEP 2 — Price/retailer lookup via static catalog in lib/catalog.ts.
 *   Fuzzy matching against Slot, Jumia, Konga, iStore, Studio 24.
 *   No live web search or scraping.
 */

function todayISO() {
  return "2026-09-04"; // Synchronized system date
}

const SYSTEM_PROMPT = `You are a structured intent extraction assistant for a savings-goal app in Nigeria.

Today's date is ${todayISO()}.

The user will describe something they want to save for. Your job is to extract ONLY:
- "item": the thing they want, normalized and clean (e.g. "iPhone 14", "MacBook Air M2", "Sony ZV-E10 camera").
  Strip unnecessary filler words like "a", "an", "the", "some", "save for". Capitalize product names properly.
- "deadline": the target date as an ISO 8601 date (YYYY-MM-DD). Resolve relative dates relative to today (${todayISO()}):
  - "before December" → "2026-11-30"
  - "by Christmas" → "2026-12-25"
  - "next month" → "2026-10-31"
  - "soon" or vague deadline → "2026-12-04" (3 months from today)
  - If no date is mentioned → 3 months from today ("2026-12-04")
- "notes": any other relevant context (optional, may be null).

RULES:
- Return ONLY a valid JSON object. No markdown fences, no explanation, no preamble.
- If the input is too vague or does NOT specify a clear item (e.g. "I want to save some money", "I need cash", "something"), return EXACTLY:
  {"error": "Your request is too vague. Please specify a product or item you want to save for, e.g. 'iPhone 14 before December'."}
- For valid inputs, return: {"item": "...", "deadline": "YYYY-MM-DD", "notes": "..." | null}
- Do NOT include prices or retailer links. ONLY parse the user's intent.`;

interface ParsedLLMResult {
  item?: string;
  deadline?: string;
  notes?: string | null;
  error?: string;
  source?: string;
}

async function callLLM(prompt: string): Promise<ParsedLLMResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // 1. Try Anthropic if key exists
  if (anthropicKey) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return { ...parsed, source: "anthropic/claude-3-5-haiku" };
    } catch (e: any) {
      console.warn("Anthropic API error, falling back:", e?.message);
    }
  }

  // 2. Try OpenAI if key exists
  if (openAIKey) {
    try {
      const openai = new OpenAI({ apiKey: openAIKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 256,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });
      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return { ...parsed, source: "openai/gpt-4o-mini" };
    } catch (e: any) {
      console.warn("OpenAI API error, falling back:", e?.message);
    }
  }

  // 3. Try Google Gemini if key exists
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser Prompt: ${prompt}`);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return { ...parsed, source: "google/gemini-1.5-flash" };
    } catch (e: any) {
      console.warn("Gemini API error, falling back:", e?.message);
    }
  }

  // 4. Fallback parser if API keys are absent or failed (quota exceeded)
  return fallbackNLPParse(prompt);
}

function fallbackNLPParse(prompt: string): ParsedLLMResult {
  const p = prompt.trim().toLowerCase();

  // Check for vague requests
  if (
    p === "i want to save some money" ||
    p === "save money" ||
    p === "i want to save" ||
    p === "something" ||
    p.length < 5
  ) {
    return {
      error:
        "Your request is too vague. Please describe a specific item you want to save for, e.g. 'iPhone 14 before December'.",
    };
  }

  // Extract item
  let item = prompt
    .replace(/^(i want to save for|i want to save|i want a|i want an|i want|save for a|save for an|save for|saving for|buy a|buy an|buy|get a|get an|get|need a|need an|need)\s+/i, "")
    .replace(/\s+(before|by|in|next|soon|for|until)\s+.*$/i, "")
    .trim();

  // Strip leading articles
  item = item.replace(/^(a|an|the|for|to)\s+/i, "").trim();

  if (!item || item.toLowerCase().includes("money") || item.toLowerCase().includes("some cash")) {
    return {
      error:
        "Your request is too vague. Please describe a specific item you want to save for, e.g. 'iPhone 14 before December'.",
    };
  }

  // Capitalize item words nicely (preserving special tech tokens)
  item = item
    .split(" ")
    .map((w) =>
      ["iphone", "ipad", "macbook", "samsung", "epson", "wanbo", "canon", "sony", "hp", "dell"].includes(w.toLowerCase())
        ? w.charAt(0).toUpperCase() + w.slice(1)
        : w.length <= 3 && !["mac", "m1", "m2", "m3", "pro"].includes(w.toLowerCase())
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");

  // Resolve relative deadline against today (2026-09-04)
  let deadline = "2026-12-04"; // 3 months default
  if (p.includes("december")) {
    deadline = "2026-11-30";
  } else if (p.includes("christmas") || p.includes("xmas")) {
    deadline = "2026-12-25";
  } else if (p.includes("next month")) {
    deadline = "2026-10-31";
  } else if (p.includes("soon")) {
    deadline = "2026-11-04";
  }

  return {
    item,
    deadline,
    notes: null,
    source: "fallback/local-intent-parser",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // STEP 1 — LLM Natural Language Parsing
    const llmResult = await callLLM(prompt.trim());

    // If LLM determines prompt is vague
    if (llmResult.error) {
      return NextResponse.json({ error: llmResult.error }, { status: 200 });
    }

    if (!llmResult.item) {
      return NextResponse.json(
        { error: "Could not extract a valid goal item. Please be more specific." },
        { status: 200 }
      );
    }

    // STEP 2 — Price/Retailer Catalog Lookup (lib/catalog.ts)
    const retailerMatches = searchCatalog(llmResult.item);

    // Emoji heuristic
    const itemLower = llmResult.item.toLowerCase();
    let emoji = "🎯";
    if (itemLower.includes("iphone") || itemLower.includes("phone") || itemLower.includes("samsung") || itemLower.includes("redmi")) {
      emoji = "📱";
    } else if (itemLower.includes("macbook") || itemLower.includes("laptop") || itemLower.includes("computer") || itemLower.includes("hp")) {
      emoji = "💻";
    } else if (itemLower.includes("projector")) {
      emoji = "🎥";
    } else if (itemLower.includes("camera") || itemLower.includes("canon") || itemLower.includes("sony")) {
      emoji = "📷";
    } else if (itemLower.includes("ecoflow") || itemLower.includes("power") || itemLower.includes("inverter")) {
      emoji = "⚡";
    }

    if (retailerMatches.length > 0 && retailerMatches[0].emoji) {
      emoji = retailerMatches[0].emoji;
    }

    return NextResponse.json({
      success: true,
      parsed: {
        itemTitle: llmResult.item,
        deadline: llmResult.deadline ?? "2026-12-04",
        notes: llmResult.notes ?? null,
        emoji,
      },
      retailerMatches,
      source: llmResult.source || "llm",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to parse goal intent" },
      { status: 500 }
    );
  }
}
