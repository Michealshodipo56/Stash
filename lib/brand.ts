/**
 * Single source of truth for the product's name and voice.
 *
 * The reference designs brand this "GoalNaija". The final name is still TBD —
 * change it HERE (and nowhere else) and it propagates to the logo, page titles,
 * and marketing copy across the whole app.
 */
export const BRAND = {
  /** Full product name, used in page titles and prose. */
  name: "GoalNaija",
  /**
   * Two-tone logo wordmark: the first part renders in ink, the second in the
   * brand green (matching the reference logo "Goal" + "Naija").
   */
  nameParts: ["Goal", "Naija"] as [string, string],
  tagline: "Big things start with small steps",
  description:
    "Set a goal, save on a schedule, and hit your target — solo or with friends. " +
    "No account needed to contribute, and we keep it fair when plans change.",
  /** Named after the settlement rail we sit on, surfaced in the pitch/footer. */
  rail: "BMONI",
} as const;
