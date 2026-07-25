// src/ai/providers/static-knowledge.provider.ts
// Static content knowledge provider indexing biography, policies, and future visions.

import { KnowledgeProvider, KnowledgeDocument, registerKnowledgeProvider } from './knowledge.provider';
import { BM25 } from '../utils/bm25';

const STATIC_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'static_biography',
    source: 'experience',
    title: 'About Denis Chamkaga Biography, Experience, and Career Profile',
    content: 'Denis Chamkaga is a professional Business Information Technology Professional, Software Developer, and Database/CRM Consultant based in Dar es Salaam, Tanzania. He holds a Diploma in Business Information Technology from the University of Dar es Salaam Computing Centre (UDCC), specializing in system analysis, accounting information systems, and relational databases. He has over 8 years of operational excellence experience, including physical security auditing (Securex, 2015-2017), customer relation strategy and management (PCCI Group, 2017-Present), and systems engineering. He specializes in designing relational database schemas, custom CRM pipelines, retail POS systems, and digital dashboards to optimize workflows and prevent sales leaks.'
  },
  {
    id: 'static_services',
    source: 'service',
    title: 'Services Offered by Denis Chamkaga',
    content: 'Denis Chamkaga offers professional digital transformation and software development services: 1. Database Design & Optimization: Custom PostgreSQL and MySQL schemas, query tuning, indexing, and data security. 2. CRM Implementation: Tailored customer relationship pipelines to track sales leads and automate follow-ups. 3. Business Process Automation: Streamlining manual tasks, inventory logs, and automatic PDF reports. 4. Digital Transformation Consulting: Helping companies shift from paper registers to digital systems. 5. Custom Software Development: Full-stack applications (React, Node.js, Express) for POS, logistics, and retail management. 6. Technology Consulting: Advising on cloud hosting (AWS, DigitalOcean) and scalable tech architecture.'
  },
  {
    id: 'static_technologies',
    source: 'technology',
    title: 'Technologies, Frameworks, and Tools in Denis Chamkaga Stack',
    content: 'Denis Chamkaga specializes in a modern full-stack developer stack: Relational Databases (PostgreSQL, MySQL, SQLite, Prisma ORM, Redis caching), Backend Frameworks (Node.js, Express, REST APIs, Webhooks), Frontend Frameworks (React.js, TypeScript, Tailwind CSS, Vanilla CSS, HTML5), DevOps & Hosting (Docker containers, Linux bash, Git/GitHub, AWS, DigitalOcean cloud deployment), and Third-party APIs (Twilio SMS API, local mobile money integration like M-Pesa, Tigopesa, Airtel Money).'
  },
  {
    id: 'static_process',
    source: 'service',
    title: 'Denis Chamkaga Business Process and Software Development Lifecycle (SDLC)',
    content: 'Denis uses a consultative, iterative 4-step process for all development projects: 1. Needs Discovery (mapping current workflows, manual logs, and identifying bottlenecks). 2. Architecture & Design (creating normalized SQL database schemas, Entity Relationship Diagrams (ERDs), and wireframes). 3. Agile Sprints & Testing (iterative code updates, security audits, and continuous integration testing). 4. Secure Deployment & Handover (deployment to staging/production servers, staff training, custom user guides, and post-handover support).'
  },
  {
    id: 'static_contact_methods',
    source: 'service',
    title: 'Contact Methods for Denis Chamkaga',
    content: 'Clients can reach Denis Chamkaga through: Email (hello@denischamkaga.com), Phone or WhatsApp (available on the website contact links), or by using the appointment booking form on the platform to schedule a live call.'
  },
  {
    id: 'static_appointment_workflow',
    source: 'service',
    title: 'Appointment Booking and Live Call Workflow',
    content: 'To book a consultation with Denis Chamkaga: 1. Use the booking section on the platform to select a date and time. 2. Provide basic business details (name, email, industry, estimated budget). 3. The platform schedules a video meeting (via Zoom or Google Meet) and sends an email confirmation. 4. After the meeting, Denis provides a tailored recommendation report and quotation.'
  },
  {
    id: 'static_pricing_policy',
    source: 'service',
    title: 'Project Pricing and Estimation Policy',
    content: 'Pricing for Denis Chamkaga\'s development and consulting services is custom-tailored based on the project scope, complexity, and database requirements determined during the discovery meeting. Custom projects start from basic database setups and API integrations up to comprehensive enterprise CRM/ERP platforms. Formal quotations with detailed pricing breakdowns (subtotal, VAT/tax, total) are sent to clients for approval prior to development.'
  },
  {
    id: 'static_faqs_general',
    source: 'faq',
    title: 'Frequently Asked Questions (FAQ) about working with Denis Chamkaga',
    content: 'Q: How long does a project typically take? A: Project timelines range from 2 to 6 weeks depending on database schema complexity. Q: Which database should my business choose? A: Denis recommends PostgreSQL for relational data and high concurrency, and MySQL for standard retail operations. Q: Is post-handover support included? A: Yes, Denis provides 30 days of free post-deployment support and staff training as part of the service agreement. Q: Are systems mobile-friendly? A: All frontends are fully responsive, working seamlessly on desktop, laptop, tablet, and mobile screens.'
  },
  {
    id: 'static_simuinvest',
    source: 'success_story',
    title: 'Agribusiness Platform SimuInvest Project Case Study',
    content: 'SimuInvest is a custom digital agribusiness micro-investment platform built by Denis Chamkaga. It connects smallholder farmers in Tanzania with micro-investors. Key features: dynamic investment progress tracking, SMS notifications (Twilio API) for payment milestones, local mobile money integrations (M-Pesa, Tigopesa), automated digital investment contract generation, and administrative reports. Tech stack: Node.js, Express, PostgreSQL, Redis caching, Docker, and Bootstrap.'
  },
  {
    id: 'static_terrasafi',
    source: 'future_vision',
    title: 'Terrasafi Clean Tech E-Waste Recycling Project Case Study',
    content: 'Terrasafi stands for Terra (Earth) + Safi (Clean). It is an enterprise CRM and logistics system designed by Denis Chamkaga for electronic waste recycling. Features: scheduling collection requests, dynamic sorting queue management, weight-based pricing calculator, barcode tracking for batches, and impact reporting. Tech stack: React, Express, MySQL database, Tailwind CSS, Prisma ORM, and Chart.js.'
  },
  {
    id: 'static_retail_pos',
    source: 'success_story',
    title: 'Retail POS & Inventory Database Automation Case Study',
    content: 'Denis successfully integrated a custom MySQL and React POS platform for a major local wholesale distributor in Dar es Salaam. The system replaced a manual sales ledger, automated daily invoicing queues, and reduced stock leakage by 98%.'
  }
];

class StaticKnowledgeProvider implements KnowledgeProvider {
  name = 'static';

  isEnabled(): boolean {
    return true;
  }

  async retrieve(query: string, limit: number): Promise<KnowledgeDocument[]> {
    const corpus = STATIC_DOCUMENTS.map(d => `${d.title} ${d.content}`);
    const bm25 = new BM25(corpus);
    const scores = bm25.search(query);

    const scored = STATIC_DOCUMENTS.map((d, idx) => ({ doc: d, score: scores[idx] }))
      .filter(item => item.score > 0.001)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);

    return scored.slice(0, limit);
  }
}

// Automatically register provider
registerKnowledgeProvider(new StaticKnowledgeProvider());
export const staticKnowledgeProvider = new StaticKnowledgeProvider();
