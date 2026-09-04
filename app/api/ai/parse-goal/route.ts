import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchCatalog } from "@/lib/catalog";

/**
 * POST /api/ai/parse-goal
 *
 * Fast path: race available LLM providers with a short timeout, then catalog lookup.
 * Falls back to local NLP if providers are slow/unavailable.
 */

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function monthsFromToday(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

const SYSTEM_PROMPT = `You are a structured intent extraction assistant for a savings-goal app in Nigeria.

Today's date is ${todayISO()}.

Extract ONLY:
- "item": the thing they want (product, trip, school fees, appliance, etc.). Clean and specific.
- "deadline": ISO date YYYY-MM-DD (relative to today). Default 3 months out if unspecified.
- "notes": optional context or null.

RULES:
- Return ONLY valid JSON. No markdown.
- Vague money-only requests → {"error":"Your request is too vague. Please specify what you want to save for, e.g. 'MacBook Air before December' or 'school fees by January'."}
- Valid → {"item":"...","deadline":"YYYY-MM-DD","notes":null}
- Do NOT invent prices. Items can be anything: phones, laptops, travel, school fees, generators, furniture, etc.`;

interface ParsedLLMResult {
  item?: string;
  deadline?: string;
  notes?: string | null;
  error?: string;
  source?: string;
}

const LLM_TIMEOUT_MS = 4500;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function tryAnthropic(prompt: string, key: string): Promise<ParsedLLMResult> {
  const anthropic = new Anthropic({ apiKey: key });
  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return { ...JSON.parse(cleaned), source: "anthropic/claude-3-5-haiku" };
}

async function tryOpenAI(prompt: string, key: string): Promise<ParsedLLMResult> {
  const openai = new OpenAI({ apiKey: key });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 200,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return { ...JSON.parse(cleaned), source: "openai/gpt-4o-mini" };
}

async function tryGemini(prompt: string, key: string): Promise<ParsedLLMResult> {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { maxOutputTokens: 200, temperature: 0 },
  });
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser: ${prompt}`);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return { ...JSON.parse(cleaned), source: "google/gemini-1.5-flash" };
}

async function callLLM(prompt: string): Promise<ParsedLLMResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // Race fast providers in parallel (first success wins) instead of slow sequential fallbacks
  const attempts: Promise<ParsedLLMResult>[] = [];
  if (geminiKey) attempts.push(withTimeout(tryGemini(prompt, geminiKey), LLM_TIMEOUT_MS));
  if (openAIKey) attempts.push(withTimeout(tryOpenAI(prompt, openAIKey), LLM_TIMEOUT_MS));
  if (anthropicKey) attempts.push(withTimeout(tryAnthropic(prompt, anthropicKey), LLM_TIMEOUT_MS));

  if (attempts.length === 0) {
    return fallbackNLPParse(prompt);
  }

  const wrapped = attempts.map((p) =>
    p.then((r) => {
      if (!r || (!r.item && !r.error)) throw new Error("empty");
      return r;
    }),
  );

  try {
    return await Promise.any(wrapped);
  } catch {
    return fallbackNLPParse(prompt);
  }
}

function fallbackNLPParse(prompt: string): ParsedLLMResult {
  const p = prompt.trim().toLowerCase();

  if (
    p === "i want to save some money" ||
    p === "save money" ||
    p === "i want to save" ||
    p === "something" ||
    p.length < 5
  ) {
    return {
      error:
        "Your request is too vague. Please describe a specific item you want to save for, e.g. 'MacBook Air before December' or 'school fees by January'.",
    };
  }

  let item = prompt
    .replace(
      /^(i want to save for|i want to save|i want a|i want an|i want|save for a|save for an|save for|saving for|buy a|buy an|buy|get a|get an|get|need a|need an|need)\s+/i,
      "",
    )
    .replace(/\s+(before|by|in|next|soon|for|until)\s+.*$/i, "")
    .trim();

  item = item.replace(/^(a|an|the|for|to)\s+/i, "").trim();

  if (!item || item.toLowerCase().includes("some cash") || item.toLowerCase() === "money") {
    return {
      error:
        "Your request is too vague. Please describe a specific item you want to save for.",
    };
  }

  item = item
    .split(" ")
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

  let deadline = monthsFromToday(3);
  if (p.includes("december")) deadline = `${new Date().getFullYear()}-11-30`;
  else if (p.includes("christmas") || p.includes("xmas")) deadline = `${new Date().getFullYear()}-12-25`;
  else if (p.includes("next month")) deadline = monthsFromToday(1);
  else if (p.includes("january")) deadline = `${new Date().getFullYear() + 1}-01-31`;

  return {
    item,
    deadline,
    notes: null,
    source: "fallback/local-intent-parser",
  };
}

function pickEmoji(item: string): string {
  const s = item.toLowerCase();
  if (/iphone|phone|samsung|tecno|redmi|smartphone/.test(s)) return "📱";
  if (/macbook|laptop|computer|dell|hp /.test(s)) return "💻";
  if (/projector/.test(s)) return "📽️";
  if (/camera|canon|sony|vlog/.test(s)) return "📷";
  if (/generator|inverter|ecoflow|power/.test(s)) return "⚡";
  if (/fridge|refrigerator|ac |air condition|microwave|washer|washing/.test(s)) return "🏠";
  if (/school|fees|tuition|jamb|exam|university/.test(s)) return "🎓";
  if (/trip|travel|flight|dubai|holiday|vacation|detty/.test(s)) return "✈️";
  if (/sofa|mattress|bed|furniture/.test(s)) return "🛋️";
  if (/ps5|playstation|gaming|console/.test(s)) return "🎮";
  if (/shoe|sneaker|nike|fashion/.test(s)) return "👟";
  return "🎯";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const llmResult = await callLLM(prompt.trim());

    if (llmResult.error) {
      return NextResponse.json({ error: llmResult.error }, { status: 200 });
    }

    if (!llmResult.item) {
      return NextResponse.json(
        { error: "Could not extract a valid goal item. Please be more specific." },
        { status: 200 },
      );
    }

    const retailerMatches = searchCatalog(llmResult.item);
    let emoji = pickEmoji(llmResult.item);
    if (retailerMatches[0]?.emoji) emoji = retailerMatches[0].emoji;

    return NextResponse.json({
      success: true,
      parsed: {
        itemTitle: llmResult.item,
        deadline: llmResult.deadline ?? monthsFromToday(3),
        notes: llmResult.notes ?? null,
        emoji,
      },
      retailerMatches,
      source: llmResult.source || "llm",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to parse goal intent" },
      { status: 500 },
    );
  }
}
