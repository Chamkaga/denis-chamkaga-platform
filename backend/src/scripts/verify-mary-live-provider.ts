import prisma from '../config/database';
import { aiOrchestrator } from '../ai/orchestrator';

async function main(): Promise<void> {
  delete process.env.AI_FORCE_OFFLINE;
  process.env.AI_MEMORY_ENGINE = 'false';
  const visitorId = `live_cert_${Date.now()}`;
  const startedAt = Date.now();
  let firstTokenAt = 0;
  let output;

  try {
    output = await aiOrchestrator.processMessage(
      { message: 'In one short paragraph, explain what a POS is for a small shop.', visitorId },
      (token) => { if (!firstTokenAt && token) firstTokenAt = Date.now(); }
    );

    const evidence = {
      timestamp: new Date().toISOString(),
      provider: output.provider,
      model: output.model,
      generationMode: output.generationMode,
      success: output.generationMode === 'live',
      error: output.providerErrorCode || null,
      liveTtftMs: output.generationMode === 'live' && firstTokenAt ? firstTokenAt - startedAt : null,
      fallbackFirstTokenMs: output.generationMode !== 'live' && firstTokenAt ? firstTokenAt - startedAt : null,
      totalMs: Date.now() - startedAt,
      intent: output.intent,
    };
    console.log(JSON.stringify(evidence, null, 2));
    if (!evidence.success) throw new Error(`Live provider certification failed: ${evidence.error || evidence.generationMode}`);
  } finally {
    if (output?.sessionId) {
      await prisma.chatSession.deleteMany({ where: { id: output.sessionId } });
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
