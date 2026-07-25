// src/ai/services/knowledge.service.ts
// Loads, caches, and retrieves Denis's knowledge base dynamically using BM25.

import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { BM25 } from '../utils/bm25';

export interface KnowledgeDocument {
  id: string;
  source: 'experience' | 'project' | 'service' | 'industry' | 'technology' | 'case_study' | 'faq' | 'success_story' | 'future_vision';
  title: string;
  content: string;
}

let documentCache: KnowledgeDocument[] | null = null;
let systemPromptCache: string = '';
let promptsCache: Record<string, string> | null = null;

export const knowledgeService = {
  async getOrBuildCache(force = false): Promise<{ documents: KnowledgeDocument[]; systemPrompt: string }> {
    if (documentCache && !force) {
      return { documents: documentCache, systemPrompt: systemPromptCache };
    }

    try {
      const startTime = Date.now();
      logger.info('Rebuilding knowledge cache from database...');

      const [settings, services, projects, experiences, education, certificates, faqs, blogPosts, galleryItems] = await Promise.all([
        prisma.siteSetting.findMany({ select: { key: true, value: true } }),
        prisma.service.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: { id: true, title: true, description: true, features: true, technologies: true },
        }),
        prisma.project.findMany({
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
          take: 15,
          select: { id: true, title: true, description: true, techStack: true, status: true, category: true },
        }),
        prisma.experience.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { id: true, company: true, role: true, description: true, achievements: true, isCurrent: true },
        }),
        prisma.education.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { id: true, institution: true, degree: true, fieldOfStudy: true },
        }),
        prisma.certificate.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { id: true, title: true, issuer: true, description: true },
        }),
        prisma.faq.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { id: true, question: true, answer: true },
        }),
        prisma.blogPost.findMany({
          where: { status: 'published', deletedAt: null },
          orderBy: { publishedAt: 'desc' },
          take: 10,
          select: { id: true, title: true, excerpt: true },
        }),
        prisma.gallery.findMany({
          where: { isVisible: true },
          orderBy: { displayOrder: 'asc' },
          select: { id: true, title: true, category: true, description: true },
        }),
      ]);

      const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

      const documents: KnowledgeDocument[] = [];

      // 1. About -> experience
      const siteTagline = settingsMap['site_tagline'] || '';
      const contactLocation = settingsMap['contact_location'] || 'Dar es Salaam, Tanzania';
      documents.push({
        id: 'about',
        source: 'experience',
        title: 'About Denis Chamkaga',
        content: `Name: Denis Chamkaga. Title: Business Information Technology Professional, Software Developer & Business Solutions Consultant. Tagline: ${siteTagline}. Location: ${contactLocation}. Description: Denis has 8+ years of operational excellence experience, including physical security auditing, customer relation strategy, and systems engineering.`,
      });

      // 2. Services -> service
      for (const s of services) {
        const features = Array.isArray(s.features) ? (s.features as string[]).join(', ') : '';
        const tech = Array.isArray(s.technologies) ? (s.technologies as string[]).join(', ') : '';
        documents.push({
          id: `service_${s.id}`,
          source: 'service',
          title: `Service: ${s.title}`,
          content: `${s.title}: ${s.description}. Features: ${features}. Technologies: ${tech}`,
        });
      }

      // 3. Projects -> project
      for (const p of projects) {
        const stack = Array.isArray(p.techStack) ? (p.techStack as string[]).join(', ') : '';
        documents.push({
          id: `project_${p.id}`,
          source: 'project',
          title: `Project: ${p.title}`,
          content: `${p.title} (${p.status}): ${p.description}. Category: ${p.category}. Stack: ${stack}`,
        });
      }

      // 4. Experience -> experience
      for (const e of experiences) {
        const achievements = Array.isArray(e.achievements) ? (e.achievements as string[]).join('; ') : '';
        documents.push({
          id: `experience_${e.id}`,
          source: 'experience',
          title: `Experience: ${e.role} at ${e.company}`,
          content: `${e.role} at ${e.company}${e.isCurrent ? ' (Current)' : ''}: ${e.description}. Key achievements: ${achievements}`,
        });
      }

      // 5. Education -> experience
      for (const ed of education) {
        documents.push({
          id: `education_${ed.id}`,
          source: 'experience',
          title: `Education: ${ed.degree} in ${ed.fieldOfStudy}`,
          content: `${ed.degree} in ${ed.fieldOfStudy} from ${ed.institution}`,
        });
      }

      // 6. Certificates -> experience
      for (const c of certificates) {
        documents.push({
          id: `certificate_${c.id}`,
          source: 'experience',
          title: `Certificate: ${c.title}`,
          content: `${c.title} issued by ${c.issuer}: ${c.description || ''}`,
        });
      }

      // 7. FAQs -> faq
      for (const f of faqs) {
        documents.push({
          id: `faq_${f.id}`,
          source: 'faq',
          title: `FAQ: ${f.question}`,
          content: `Question: ${f.question}\nAnswer: ${f.answer}`,
        });
      }

      // 8. Blog posts -> case_study
      for (const b of blogPosts) {
        documents.push({
          id: `blog_${b.id}`,
          source: 'case_study',
          title: `Blog Post/Case Study: ${b.title}`,
          content: `${b.title}: ${b.excerpt}`,
        });
      }

      // 9. Gallery -> project
      for (const g of galleryItems) {
        documents.push({
          id: `gallery_${g.id}`,
          source: 'project',
          title: `Gallery Portfolio Item: ${g.title}`,
          content: `${g.title} (${g.category}): ${g.description || ''}`,
        });
      }

      // 10. Skills -> technology
      documents.push({
        id: 'skills',
        source: 'technology',
        title: 'Denis Chamkaga Skills Portfolio',
        content: 'Skills: PostgreSQL, MySQL, Node.js, React, TypeScript, Prisma, Docker, Business Analysis, CRM, Digital Transformation, POS Systems, API Integrations',
      });

      // 11. Custom Detailed Knowledge Base expansions
      documents.push(
        {
          id: 'knowledge_simuinvest',
          source: 'success_story',
          title: 'Project SimuInvest: Agribusiness Micro-Investment Platform Case Study Success Story',
          content: 'SimuInvest is one of Denis Chamkaga\'s signature database and web platform projects. It functions as a digital agribusiness micro-investment system connecting local smallholder farmers in Tanzania with micro-investors. Key features: dynamic investment progress tracking, SMS notifications for funding milestones and payout schedules, payment gateway integrations (mobile money like M-Pesa, Tigopesa), automated digital investment contract generation, and administrator telemetry reports. Tech stack: Node.js, Express, PostgreSQL, Redis cache, Docker, Twilio SMS API.'
        },
        {
          id: 'knowledge_terrasafi',
          source: 'future_vision',
          title: 'Project Terrasafi: E-Waste Management & Recycling Future Vision',
          content: 'Terrasafi is an enterprise CRM and logistics system designed by Denis Chamkaga to optimize electronic waste recycling. Key features: collection request scheduling, dynamic sorting queue management, weight-based pricing calculator, barcode tracking for recycling batches, and environmental impact reporting dashboards. Tech stack: React, Express, MySQL database, Tailwind CSS, Prisma ORM, and Chart.js.'
        },
        {
          id: 'knowledge_industries',
          source: 'industry',
          title: 'Industries Served by Denis Chamkaga',
          content: 'Denis Chamkaga provides digital transformation, business consulting, and systems integration services across multiple industries: Agribusiness (funding finance, SMS notifications), Waste Management & Recycling (logistics trackers, batch processing), Retail & Distribution (custom point-of-sale inventory databases), Professional Services (custom CRM pipelines, customer relation automation, client dashboards). Target industries include: Restaurant, Salon, Pharmacy, School, NGO, Retail, Hospital, Agriculture, Construction, Real Estate, Manufacturing, Transport.'
        },
        {
          id: 'knowledge_process',
          source: 'service',
          title: 'Denis Chamkaga Software Development Lifecycle & Business Consulting Process',
          content: 'Denis implements a consultative, iterative 4-step digital transformation process: 1. Needs Discovery (analyzing workflow bottlenecks, mapping manual data logs). 2. Architecture & Design (database normalization, secure schema mapping, UX wireframes). 3. Agile Sprints & Testing (iterative code milestones, continuous integration testing). 4. Secure Deployment & Handover (manual verification, cloud server setup, client documentation and training).'
        },
        {
          id: 'knowledge_technologies',
          source: 'technology',
          title: 'Technologies and Frameworks Used by Denis Chamkaga',
          content: 'Denis specializes in robust backend systems and modern web architectures. Primary technologies: PostgreSQL, MySQL, SQLite databases, Node.js (Express), React, TypeScript, Tailwind CSS, Prisma ORM, Docker containerization, REST API integrations, Git control, Linux bash, and Cloud Hosting (AWS, DigitalOcean).'
        },
        {
          id: 'knowledge_success_stories',
          source: 'success_story',
          title: 'Denis Chamkaga Consulting Success Stories & Case Studies',
          content: '1. Retail Automation: Denis replaced a local Tanzanian wholesale distributor\'s manual sales ledger with a custom MySQL and React POS platform, reducing stock leakage by 98% and automating daily invoice queues. 2. SimuInvest platform setup: Connected over 500 smallholder farmers with micro-investment capital, automating contract generation and payout scheduling to reduce payment reconciliation errors to 0%.'
        },
        {
          id: 'knowledge_consulting',
          source: 'service',
          title: 'Business Consulting and Digital Transformation Services',
          content: 'Denis offers professional business consulting services to guide traditional organizations through digital transformation. Offerings: replacing paper files with secure relational databases, custom CRM system setup to track client pipelines, automated billing pipelines, dashboard reports for business metrics, and database optimization.'
        }
      );

      documentCache = documents;
      systemPromptCache = settingsMap['ai_system_prompt'] || '';

      logger.info(`Knowledge cache built successfully in ${Date.now() - startTime}ms. Total documents: ${documents.length}`);
      return { documents, systemPrompt: systemPromptCache };

    } catch (err) {
      logger.error('Failed to build AI knowledge cache:', err);
      return {
        documents: [
          {
            id: 'fallback_about',
            source: 'experience',
            title: 'About Denis Chamkaga',
            content: 'Denis Chamkaga is a Systems & Database Consultant in Dar es Salaam, Tanzania.',
          },
          {
            id: 'fallback_services',
            source: 'service',
            title: 'Services Offered',
            content: 'Database Design, CRM Implementation, Business Automation, Digital Transformation Consulting, Custom Software Development, Technology Consulting.',
          }
        ],
        systemPrompt: '',
      };
    }
  },

  async clearCache(): Promise<void> {
    documentCache = null;
    systemPromptCache = '';
    promptsCache = null;
    logger.info('Knowledge cache cleared.');
  },

  async getAiPrompts(force = false): Promise<Record<string, string>> {
    if (promptsCache && !force) {
      return promptsCache;
    }
    try {
      const prompts = await prisma.aiPrompt.findMany({
        where: { isActive: true },
        select: { key: true, prompt: true },
      });
      const map = Object.fromEntries(prompts.map(p => [p.key, p.prompt]));
      promptsCache = map;
      return map;
    } catch (err) {
      logger.error('Failed to load AI prompts from database:', err);
      return {};
    }
  },

  async getSystemPrompt(): Promise<string> {
    const prompts = await this.getAiPrompts();
    const system = prompts['system'] || '';
    const business = prompts['business'] || '';
    const followup = prompts['followup'] || '';
    const recommendation = prompts['recommendation'] || '';
    const closing = prompts['closing'] || '';
    const safety = prompts['safety'] || '';
    
    if (!system && !business) {
      const { systemPrompt } = await this.getOrBuildCache();
      return systemPrompt;
    }
    
    return [system, business, followup, recommendation, closing, safety]
      .filter(p => p.trim())
      .join('\n\n');
  },

  async retrieve(query: string, limit = 3): Promise<KnowledgeDocument[]> {
    const startTime = Date.now();
    const { documents } = await this.getOrBuildCache();
    if (documents.length === 0) return [];

    const corpus = documents.map(doc => `${doc.title} ${doc.content}`);
    const bm25 = new BM25(corpus);
    const scores = bm25.search(query);

    const scoredDocs = documents.map((doc, idx) => ({
      doc,
      score: scores[idx],
    }));

    const relevantDocs = scoredDocs
      .filter(item => item.score > 0.001)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);

    const retrievalDuration = Date.now() - startTime;
    logger.info(`[RAG BM25] Retrieved top ${Math.min(limit, relevantDocs.length)} docs in ${retrievalDuration}ms for query: "${query.substring(0, 40)}..."`);

    return relevantDocs.slice(0, limit);
  }
};
