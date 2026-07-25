export const InvoiceStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED"
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];
