CREATE TABLE "ai_memory_jobs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "conversationVersion" INTEGER NOT NULL,
    "userMessage" TEXT NOT NULL,
    "assistantResponse" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_memory_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_memory_jobs_idempotencyKey_key" ON "ai_memory_jobs"("idempotencyKey");
CREATE INDEX "ai_memory_jobs_status_availableAt_idx" ON "ai_memory_jobs"("status", "availableAt");
CREATE INDEX "ai_memory_jobs_sessionId_conversationVersion_idx" ON "ai_memory_jobs"("sessionId", "conversationVersion");
