ALTER TABLE "campaigns"
  ALTER COLUMN "budget" TYPE DECIMAL(14,2) USING ROUND("budget"::numeric, 2),
  ALTER COLUMN "spend" TYPE DECIMAL(14,2) USING ROUND("spend"::numeric, 2),
  ALTER COLUMN "revenue" TYPE DECIMAL(14,2) USING ROUND("revenue"::numeric, 2);

ALTER TABLE "inventory_items"
  ALTER COLUMN "unitPrice" TYPE DECIMAL(14,2) USING ROUND("unitPrice"::numeric, 2);

ALTER TABLE "financial_transactions"
  ALTER COLUMN "amount" TYPE DECIMAL(14,2) USING ROUND("amount"::numeric, 2);

ALTER TABLE "supporter_profiles"
  ALTER COLUMN "totalLifetimeAmount" TYPE DECIMAL(14,2) USING ROUND("totalLifetimeAmount"::numeric, 2);

ALTER TABLE "support_contributions"
  ALTER COLUMN "amount" TYPE DECIMAL(14,2) USING ROUND("amount"::numeric, 2),
  ALTER COLUMN "exchangeRate" TYPE DECIMAL(18,6) USING ROUND("exchangeRate"::numeric, 6);
