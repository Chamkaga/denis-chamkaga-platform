// backend/src/scripts/verify-public-ai-chat.ts
// Regression Verification for Public AI Assistant Chat

import { conversationService } from '../ai/services/conversation.service';
import { aiOrchestrator } from '../ai/orchestrator';
import { getAIProvider } from '../ai/providers';
import { env } from '../config/env';

async function verifyPublicAIChat() {
  console.log('================================================================');
  console.log('🔍 PUBLIC AI ASSISTANT REGRESSION DIAGNOSTIC & VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [Check ${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [Check ${total}]: ${description}`);
      throw new Error(`Public AI Chat Failure: ${description}`);
    }
  };

  try {
    // Check 1: API Keys Loading
    console.log('1. Checking API keys loading...');
    const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    assert(!!openaiKey || !!geminiKey, 'At least one valid API Key (OPENAI_API_KEY or GEMINI_API_KEY) is present');

    // Check 2: LLM Provider Initialization
    console.log('\n2. Initializing LLM Provider...');
    const provider = getAIProvider();
    assert(!!provider, 'OpenAIProvider initialized successfully');

    // Check 3: Directly test LLM Provider Generation
    console.log('\n3. Testing LLM Provider generation & streaming capabilities...');
    let streamedTokens = '';
    const llmRes = await provider.stream(
      [{ role: 'user', content: 'What services does Denis Chamkaga offer?' }],
      (token) => {
        streamedTokens += token;
      }
    );
    assert(streamedTokens.length > 0 || llmRes.content.length > 0, `LLM Stream returned response (${streamedTokens.length || llmRes.content.length} chars)`);

    // Check 4: Test AI Orchestrator Integration
    console.log('\n4. Testing AI Orchestrator processMessage pipeline...');
    const orchestratorRes = await aiOrchestrator.processMessage({
      message: 'Hello, I need database consulting in Tanzania',
      userRole: 'visitor',
      language: 'en',
    });
    assert(!orchestratorRes.response.includes('temporarily offline'), 'AI Orchestrator produced active response without offline error');
    assert(orchestratorRes.response.length > 10, 'AI Orchestrator generated valid non-empty response');

    // Check 5: Mock SSE Response Writer to Test ConversationService.chatStream
    console.log('\n5. Testing ConversationService chatStream SSE pipeline...');
    let mockResponseData = '';
    const mockRes: any = {
      setHeader: () => {},
      write: (chunk: string) => {
        mockResponseData += chunk;
      },
      end: () => {},
    };

    await conversationService.chatStream(
      { message: 'What technologies are used in the platform?' },
      mockRes
    );

    assert(mockResponseData.includes('token'), 'ConversationService.chatStream formatted response chunks in valid Server-Sent Events (SSE) data format');
    assert(!mockResponseData.includes('temporarily unavailable'), 'ConversationService chatStream executed with zero unhandled errors');

    console.log('\n================================================================');
    console.log(`✅ PUBLIC AI ASSISTANT REGRESSION RESOLVED: ${passed}/${total} CHECKS PASSED`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ PUBLIC AI ASSISTANT DIAGNOSTIC FAILED:', error);
    process.exit(1);
  }
}

verifyPublicAIChat();
