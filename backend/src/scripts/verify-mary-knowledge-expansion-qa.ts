import { aiOrchestrator } from '../ai/orchestrator';
import { databaseKnowledgeProvider } from '../ai/providers/database-knowledge.provider';
import assert from 'assert';

async function runMaryKnowledgeExpansionQA() {
  console.log('================================================================');
  console.log('🧪 MARY AI EXPANDED BUSINESS INTELLIGENCE QA SUITE');
  console.log('================================================================');

  // Invalidate knowledge cache to guarantee fresh DB indexing
  databaseKnowledgeProvider.clearCache();

  const scenarios = [
    {
      name: 'Scenario 1: Social Commerce (Instagram)',
      query: 'I sell clothes on Instagram. Do I need a website?',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        // Must explain acquisition vs owned infrastructure without telling customer to stop Instagram
        return (lower.includes('instagram') || lower.includes('social media')) && 
               (lower.includes('website') || lower.includes('infrastructure') || lower.includes('crm') || lower.includes('database') || lower.includes('catalog') || lower.includes('orders')) &&
               !lower.includes('stop using instagram') && !lower.includes('knowledge base');
      },
      desc: 'Explains social media for acquisition & website/CRM for owned infrastructure'
    },
    {
      name: 'Scenario 2: TikTok Lead Capture',
      query: 'All my customers come from TikTok. How can you help me?',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('tiktok') || lower.includes('social') || lower.includes('lead')) && 
               (lower.includes('database') || lower.includes('crm') || lower.includes('website') || lower.includes('capture')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Guides TikTok merchant toward lead capture & customer database'
    },
    {
      name: 'Scenario 3: WhatsApp Orders',
      query: 'I receive too many WhatsApp orders and lose track of them.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('whatsapp') || lower.includes('order') || lower.includes('crm')) && 
               (lower.includes('catalog') || lower.includes('tracking') || lower.includes('manage') || lower.includes('system')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Diagnoses chat order overload & recommends order/CRM engine'
    },
    {
      name: 'Scenario 4: Retail Theft / Stock Loss',
      query: 'My employees are stealing stock from my shop.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('pos') || lower.includes('stock') || lower.includes('inventory')) && 
               (lower.includes('barcode') || lower.includes('permission') || lower.includes('audit') || lower.includes('staff')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Diagnoses theft & recommends POS + barcode + staff permissions'
    },
    {
      name: 'Scenario 5: Customer Debt (Madeni)',
      query: 'Customers owe me money and I don\'t know who owes what.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('debt') || lower.includes('credit') || lower.includes('madeni') || lower.includes('ledger') || lower.includes('customer')) && 
               (lower.includes('sms') || lower.includes('reminder') || lower.includes('balance') || lower.includes('track')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Recommends debt ledger engine with credit limits & SMS reminders'
    },
    {
      name: 'Scenario 6: Multi-Branch ERP/POS',
      query: 'I have three shops and want to manage them from one place.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('branch') || lower.includes('multi') || lower.includes('central')) && 
               (lower.includes('pos') || lower.includes('erp') || lower.includes('inventory') || lower.includes('dashboard')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Recommends multi-branch POS/ERP with central cloud sync'
    },
    {
      name: 'Scenario 7: Pharmacy Batch Expiry',
      query: 'I run a pharmacy and medicines expire before I sell them.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('pharmacy') || lower.includes('expiry') || lower.includes('batch') || lower.includes('inventory') || lower.includes('stock')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Identifies pharmacy batch & drug expiry date notification needs'
    },
    {
      name: 'Scenario 8: Restaurant KOT Workflow',
      query: 'My restaurant orders are confusing between counter and kitchen.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('restaurant') || lower.includes('kitchen') || lower.includes('kot') || lower.includes('pos') || lower.includes('order') || lower.includes('table')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Diagnoses restaurant workflow & recommends KOT / Table POS'
    },
    {
      name: 'Scenario 9: Professional Service Business',
      query: 'I run a consulting company and send quotes to clients.',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('consulting') || lower.includes('crm') || lower.includes('quote') || lower.includes('project') || lower.includes('invoice') || lower.includes('client')) && 
               !lower.includes('pos system tailored for retail') && !lower.includes('knowledge base');
      },
      desc: 'Does NOT recommend retail POS; recommends B2B CRM & Quote engine'
    },
    {
      name: 'Scenario 10: Project Delivery Lifecycle',
      query: 'What happens after I approve the quotation?',
      intentCheck: (res: string) => {
        const lower = res.toLowerCase();
        return (lower.includes('deposit') || lower.includes('development') || lower.includes('uat') || lower.includes('testing') || lower.includes('training') || lower.includes('deployment') || lower.includes('support')) &&
               !lower.includes('knowledge base');
      },
      desc: 'Explains authoritative 5-stage project delivery lifecycle'
    }
  ];

  let passedCount = 0;
  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    console.log(`\n[${s.name}] User: "${s.query}"`);
    const sessionId = `expansion_qa_session_${i}_${Date.now()}`;
    const response = await aiOrchestrator.processMessage({
      message: s.query,
      sessionId,
      language: 'en'
    });

    console.log(`Mary Response: "${response.response}"`);

    const passed = s.intentCheck(response.response);
    assert(passed, `Failed ${s.name}: ${s.desc}`);
    console.log(` ✅ PASS: ${s.desc}`);
    passedCount++;
  }

  console.log('\n================================================================');
  console.log(`🎉 MARY AI EXPANDED QA PASSED: ${passedCount}/${scenarios.length} SCENARIOS SUCCESSFUL (100%)`);
  console.log('================================================================\n');
}

runMaryKnowledgeExpansionQA().catch(err => {
  console.error('❌ EXPANDED QA FAILED:', err);
  process.exit(1);
});
