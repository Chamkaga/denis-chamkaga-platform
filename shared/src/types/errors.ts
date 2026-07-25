export type ErrorCode =
  | "AUTH-001" // Unauthorized access
  | "AUTH-002" // Invalid credentials
  | "CRM-001"  // Lead creation failed
  | "CRM-002"  // Lead scoring engine error
  | "PAY-001"  // Payment processing failure
  | "PAY-002"  // Payment verification mismatch
  | "SYS-001"  // Internal server error
  | "SYS-002"  // Upload size exceeded
  | "AI-001"   // LLM dispatcher error
  | "AI-002";  // Guardrails policy violation
