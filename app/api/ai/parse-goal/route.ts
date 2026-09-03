import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";

/**
 * Natural language intent parser for Aidex Goal Creation.
 * Parses natural prompt into structured goal attributes and matches against static catalog.
 */
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const text = prompt.trim();
    const lower = text.toLowerCase();

    // 1. Inferred Item
    let itemTitle = "";
    let emoji = "🎯";

    if (lower.includes("iphone 14")) {
      itemTitle = "Apple iPhone 14";
      emoji = "📱";
    } else if (lower.includes("iphone") || lower.includes("phone")) {
      itemTitle = "Smartphone";
      emoji = "📱";
    } else if (lower.includes("macbook air") || lower.includes("macbook")) {
      itemTitle = "MacBook Air M2";
      emoji = "💻";
    } else if (lower.includes("laptop") || lower.includes("computer")) {
      itemTitle = "Laptop";
      emoji = "💻";
    } else if (lower.includes("projector")) {
      itemTitle = "Department Projector";
      emoji = "🎥";
    } else if (lower.includes("ecoflow") || lower.includes("inverter") || lower.includes("power station") || lower.includes("generator")) {
      itemTitle = "Portable Power Station";
      emoji = "⚡";
    } else if (lower.includes("camera") || lower.includes("canon") || lower.includes("sony")) {
      itemTitle = "Vlog Camera";
      emoji = "📷";
    } else {
      // General cleaning of phrases like "I want to save for a..." or "saving for..."
      const cleaned = text
        .replace(/^(i want to save for|i want|saving for|save for|buy|get|need)\s+/i, "")
        .replace(/\s+(before|by|in|next|for)\s+.*$/i, "")
        .trim();
      itemTitle = cleaned || "My Savings Goal";
    }

    // 2. Inferred Deadline
    const now = new Date();
    let deadline = new Date(now.getTime() + 90 * 86_400_000).toISOString().split("T")[0]; // default: 3 months

    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];

    for (let i = 0; i < months.length; i++) {
      if (lower.includes(months[i])) {
        const targetYear = now.getFullYear();
        const targetDate = new Date(targetYear, i + 1, 1);
        if (targetDate.getTime() > now.getTime()) {
          deadline = targetDate.toISOString().split("T")[0];
        } else {
          deadline = new Date(targetYear + 1, i + 1, 1).toISOString().split("T")[0];
        }
        break;
      }
    }

    if (lower.includes("next month")) {
      const nextM = new Date(now.getFullYear(), now.getMonth() + 2, 1);
      deadline = nextM.toISOString().split("T")[0];
    } else if (lower.includes("december") || lower.includes("xmas") || lower.includes("christmas")) {
      deadline = `${now.getFullYear()}-12-25`;
    }

    // 3. Inferred Frequency
    let frequency = "monthly";
    if (lower.includes("daily") || lower.includes("every day") || lower.includes("per day")) {
      frequency = "daily";
    } else if (lower.includes("weekly") || lower.includes("every week")) {
      frequency = "weekly";
    }

    // 4. Match against static catalog
    const retailerMatches = searchCatalog(itemTitle || prompt);

    return NextResponse.json({
      success: true,
      parsed: {
        itemTitle,
        deadline,
        frequency,
        emoji,
      },
      retailerMatches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Parsing failed" }, { status: 500 });
  }
}
