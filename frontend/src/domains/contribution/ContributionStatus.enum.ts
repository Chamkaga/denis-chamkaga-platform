export const ContributionStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
} as const;

export type ContributionStatus = typeof ContributionStatus[keyof typeof ContributionStatus];
