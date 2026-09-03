/**
 * Single source of truth for the product's name and voice.
 */
export const BRAND = {
  /** Full product name, used in page titles and prose. */
  name: "Aidex",
  /**
   * Two-tone logo wordmark: "Ai" in dark ink, "dex" in brand green.
   */
  nameParts: ["Ai", "dex"] as [string, string],
  tagline: "Save toward what matters. Hit your target.",
  description:
    "A goal-based savings platform. Save toward specific items solo or with friends on an automated schedule powered by BMONI.",
  /** Settlement rail */
  rail: "BMONI",
} as const;

