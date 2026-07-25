-- CreateIndex
CREATE INDEX "business_activities_createdAt_idx" ON "business_activities"("createdAt");

-- CreateIndex
CREATE INDEX "call_sessions_leadId_idx" ON "call_sessions"("leadId");

-- CreateIndex
CREATE INDEX "call_sessions_createdAt_idx" ON "call_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "chat_sessions_leadId_idx" ON "chat_sessions"("leadId");

-- CreateIndex
CREATE INDEX "chat_sessions_startedAt_idx" ON "chat_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "clients_organizationId_idx" ON "clients"("organizationId");

-- CreateIndex
CREATE INDEX "consultations_organizationId_idx" ON "consultations"("organizationId");

-- CreateIndex
CREATE INDEX "consultations_leadId_idx" ON "consultations"("leadId");

-- CreateIndex
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");

-- CreateIndex
CREATE INDEX "invoices_projectId_idx" ON "invoices"("projectId");

-- CreateIndex
CREATE INDEX "invoices_quotationId_idx" ON "invoices"("quotationId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "projects_organizationId_idx" ON "projects"("organizationId");

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- CreateIndex
CREATE INDEX "quotations_organizationId_idx" ON "quotations"("organizationId");

-- CreateIndex
CREATE INDEX "quotations_consultationId_idx" ON "quotations"("consultationId");

-- CreateIndex
CREATE INDEX "quotations_projectId_idx" ON "quotations"("projectId");
