import prisma from '../config/database';
import { aiOrchestrator } from '../ai/orchestrator';

async function logSystemStatus(stepName: string) {
  console.log(`\n======================================================`);
  console.log(`🚀 STEP: ${stepName}`);
  console.log(`======================================================`);
}

async function runSimulation() {
  console.log('--- STARTING END-TO-END VISITOR FLOW SIMULATION ---');
  
  const visitorId = 'simulated_visitor_' + Math.random().toString(36).substring(2, 7);
  let sessionId: string | undefined;

  // Step 1: Onboarding Greeting & Intent Detection
  await logSystemStatus('1. Visitor Asks About Website Development');
  const chat1 = await aiOrchestrator.processMessage({
    message: 'Ninataka kujenga Tovuti ya Biashara na mifumo ya malipo. Bei zikoje?',
    visitorId,
    language: 'sw'
  });
  
  sessionId = chat1.sessionId;
  console.log(`[Mary Response]:`);
  console.log(chat1.response);
  console.log(`[Session ID]: ${sessionId}`);
  console.log(`[Detected Intent]: ${chat1.intent}`);
  console.log(`[Initial Lead Score]: ${chat1.leadScore}%`);

  // Step 2: Simulate Lead Data Collection
  await logSystemStatus('2. Visitor Submits Onboarding Profile Information');
  
  // Set memory facts for this session to simulate client profile collection
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      lead: {
        create: {
          name: 'Denis Test Customer',
          email: 'customer.test@gmail.com',
          phone: '+255712345678',
          source: 'ai_chat',
          status: 'new',
          score: 85,
          temperature: 'hot',
          requirements: 'Website development with payment gateway integration (Flutterwave/DPO)',
          notes: 'High intent simulated visitor inquiring about e-commerce systems.'
        }
      }
    }
  });

  // Re-read session to check lead creation
  const updatedSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: { lead: true }
  });
  
  console.log(`[Lead Created in DB]:`);
  console.log(`- Name: ${updatedSession?.lead?.name}`);
  console.log(`- Contact: ${updatedSession?.lead?.phone} | ${updatedSession?.lead?.email}`);
  console.log(`- Requirements: ${updatedSession?.lead?.requirements}`);
  console.log(`- Lead Score: ${updatedSession?.lead?.score}%`);
  console.log(`- Lead Source: AI Assistant (chat_widget)`);

  // Step 3: Call Request Handling & Presence Check
  await logSystemStatus('3. Visitor Requests Voice Call - Admin Offline');
  await prisma.siteSetting.upsert({
    where: { key: 'presence_state' },
    update: { value: 'Offline' },
    create: { key: 'presence_state', value: 'Offline', type: 'string', category: 'general' }
  });

  const chatCallOffline = await aiOrchestrator.processMessage({
    message: 'Naomba kupiga simu niongee na Denis sasa hivi.',
    sessionId,
    visitorId,
    language: 'sw'
  });
  
  console.log(`[Mary Response (Offline)]:`);
  console.log(chatCallOffline.response);

  await logSystemStatus('4. Visitor Requests Voice Call - Admin Online');
  await prisma.siteSetting.update({
    where: { key: 'presence_state' },
    data: { value: 'Online' }
  });

  const chatCallOnline = await aiOrchestrator.processMessage({
    message: 'Naomba kupiga simu niongee na Denis sasa hivi.',
    sessionId,
    visitorId,
    language: 'sw'
  });
  
  console.log(`[Mary Response (Online)]:`);
  console.log(chatCallOnline.response);

  // Step 4: Call Session Log Creation
  await logSystemStatus('5. Initiating WebRTC Voice Call Log Session');
  const callSession = await prisma.callSession.create({
    data: {
      sessionId,
      callerName: updatedSession?.lead?.name || 'Visitor',
      receiverName: 'Denis (Admin)',
      status: 'initiated',
      startedAt: new Date(),
      leadId: updatedSession?.leadId
    }
  });
  
  console.log(`[Call Log Saved in DB]:`);
  console.log(`- Call Session ID: ${callSession.id}`);
  console.log(`- Caller Name: ${callSession.callerName}`);
  console.log(`- Call Status: ${callSession.status}`);

  // Step 5: Admin Leads Inbox Count
  await logSystemStatus('6. Admin Console Verification');
  const totalLeadsCount = await prisma.lead.count();
  const latestLeads = await prisma.lead.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { name: true, phone: true, score: true, status: true }
  });

  console.log(`[Admin Console Metrics]:`);
  console.log(`- Total Leads in CRM DB: ${totalLeadsCount}`);
  console.log(`- Recent Leads:`);
  console.dir(latestLeads);

  console.log(`\n======================================================`);
  console.log('🎉 END-TO-END VISITOR FLOW SIMULATION COMPLETED');
  console.log('======================================================');
}

runSimulation()
  .catch(err => console.error('Simulation Failed:', err))
  .finally(async () => {
    await prisma.$disconnect();
  });
