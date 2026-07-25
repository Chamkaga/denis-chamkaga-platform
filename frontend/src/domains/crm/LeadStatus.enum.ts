export const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  PROPOSAL: "PROPOSAL",
  WON: "WON",
  LOST: "LOST"
} as const;

export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];
