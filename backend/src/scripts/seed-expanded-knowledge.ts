import prisma from '../config/database';
import { databaseKnowledgeProvider } from '../ai/providers/database-knowledge.provider';

async function seedExpandedKnowledge() {
  console.log('================================================================');
  console.log('🌱 SEEDING AUTHORITATIVE BUSINESS KNOWLEDGE EXPANSION');
  console.log('================================================================');

  const items = [
    {
      title: 'Social Commerce Transition Playbook: Instagram, TikTok & WhatsApp to Owned Infrastructure',
      category: 'business',
      keywords: 'instagram, tiktok, facebook, whatsapp, social-commerce, website, online-store, crm, customer-database, leads, retention',
      content: `Social media platforms like Instagram, TikTok, Facebook, and WhatsApp are essential customer acquisition and brand awareness channels for modern Tanzanian businesses. However, relying exclusively on social media DMs creates major operational vulnerabilities: buried messages, lost customer leads, lack of customer purchase history, and risk of account suspension or algorithm changes. Denis Chamkaga helps merchants build Owned Digital Business Infrastructure around their social channels. The strategic principle is: Social Media = Customer Acquisition Channel (Discovery & Reach), while Owned Infrastructure = Customer Control, Operations & Retention (Website, Online Catalog, CRM, Order Management, Customer Database). By deploying a Business Website with an integrated WhatsApp order button, self-service catalog, and centralized CRM database, merchants capture every incoming lead, automate order processing, retain customer contact records permanently, and drive repeat sales independently of third-party social algorithms.`,
      tags: ['instagram', 'tiktok', 'social-commerce', 'website', 'crm', 'retention'],
      status: 'published',
      qualityScore: 100
    },
    {
      title: 'Specialized Retail, Pharmacy, and Hospitality Management Systems',
      category: 'services',
      keywords: 'retail, pos, inventory, barcode, pharmacy, expiry, batch, restaurant, hotel, kot, madeni, debt, multi-branch, theft',
      content: `Denis Chamkaga POS and Inventory Management Systems include specialized operational modules for key commercial sectors:
1. Retail & Supermarkets: Barcode scanner integration, stock depletion tracking, cashier permission roles, and remote audit trails to stop employee stock theft and cash leakage.
2. Pharmacies & Cosmetics: Batch number tracking, automated drug expiry date alerts (near-expiry notifications), and supplier purchase ledgers.
3. Restaurants & Cafés: Counter POS, Kitchen Order Tickets (KOT) printing/display, table status tracking, and recipe ingredient inventory depletion.
4. Hardware & Spare Parts: Serial number tracking, multi-unit sales (pieces, boxes, cartons), and customer credit management (Madeni) with automated SMS payment reminders.
5. Multi-Branch Operations: Centralized cloud database synchronizing stock movement, branch sales, and consolidated executive profit dashboards.`,
      tags: ['retail', 'pharmacy', 'restaurant', 'pos', 'inventory', 'multi-branch'],
      status: 'published',
      qualityScore: 100
    },
    {
      title: 'Complete Project Delivery, Onboarding & Support Lifecycle',
      category: 'sop',
      keywords: 'discovery, requirements, quotation, deposit, development, testing, uat, deployment, training, handover, support, onboarding, timeline',
      content: `Every custom software system, POS, CRM, or web platform delivered by Denis Chamkaga follows a structured 5-stage lifecycle:
1. Business Discovery & Requirement Definition (Days 1-3): Understanding business goals, user roles, branch counts, and operational bottlenecks.
2. Database ERD & System Architecture Design (Days 4-7): Normalizing PostgreSQL schemas and system workflows.
3. Development Sprints (Weeks 2-4): Full-stack web/mobile application building.
4. User Acceptance Testing & Staging Review (Week 5): Client UAT testing in staging environment.
5. Production Deployment, Staff Training & Handover (Week 6): Live server setup, data migration, hands-on staff training, and 30-day free post-handover bug support guarantee.
Terms: 50% deposit upon quotation approval, 50% upon final delivery & UAT sign-off. Official quotations remain valid for 30 days with no hidden software licensing fees.`,
      tags: ['delivery', 'onboarding', 'sop', 'timeline', 'guarantee', 'support'],
      status: 'published',
      qualityScore: 100
    },
    {
      title: 'Professional B2B Services, Consulting & Project Workflow Engine',
      category: 'services',
      keywords: 'consulting, agency, service, crm, quotation, lead, invoice, project, task, professional-services, b2b',
      content: `For service-based businesses (consultants, law firms, agencies, repair shops, contractors), Denis Chamkaga delivers custom CRM and Project Management Workflows. The business ecosystem covers:
Lead Capture → Sales CRM Pipeline → Interactive Quotation Proposal → Online Client Approval → Project Task Workspace → Milestone Invoicing → M-Pesa/DPO Payment Checkout → Client Portal Support.
Service businesses do not need counter POS; they require automated client proposal generation, lead follow-up reminders, contract management, and integrated online invoicing so no client proposal or billable hour is forgotten.`,
      tags: ['b2b', 'consulting', 'crm', 'workflow', 'quotations', 'invoicing'],
      status: 'published',
      qualityScore: 100
    }
  ];

  for (const item of items) {
    const existing = await prisma.aiKnowledgeItem.findFirst({
      where: { title: item.title }
    });

    if (existing) {
      await prisma.aiKnowledgeItem.update({
        where: { id: existing.id },
        data: item
      });
      console.log(`  ✓ Updated Knowledge Item: "${item.title.substring(0, 55)}..."`);
    } else {
      await prisma.aiKnowledgeItem.create({
        data: item
      });
      console.log(`  ✓ Created Knowledge Item: "${item.title.substring(0, 55)}..."`);
    }
  }

  // Clear knowledge cache to trigger immediate re-indexing
  databaseKnowledgeProvider.clearCache();
  console.log('\n ✅ PASS: Knowledge cache invalidated. Re-indexed 4 comprehensive knowledge items.');
  console.log('================================================================\n');
}

seedExpandedKnowledge().then(() => process.exit(0)).catch(err => {
  console.error('❌ SEEDING FAILED:', err);
  process.exit(1);
});
