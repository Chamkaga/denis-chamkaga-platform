// src/ai/services/knowledge.service.ts
// Loads Denis's knowledge base from the database.
// This makes the AI context automatically stay in sync with website content.

import prisma from '../../config/database';
import { logger } from '../../utils/logger';

export interface KnowledgeContext {
  about: string;
  services: string;
  projects: string;
  experience: string;
  education: string;
  skills: string;
  systemPrompt: string;
}

export const knowledgeService = {
  async buildContext(): Promise<KnowledgeContext> {
    try {
      // Load from DB in parallel
      const [settings, services, projects, experiences, education] = await Promise.all([
        prisma.siteSetting.findMany({ select: { key: true, value: true } }),
        prisma.service.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: { title: true, description: true, features: true, technologies: true },
        }),
        prisma.project.findMany({
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
          take: 10,
          select: { title: true, description: true, techStack: true, status: true, category: true },
        }),
        prisma.experience.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { company: true, role: true, description: true, achievements: true, isCurrent: true },
        }),
        prisma.education.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { institution: true, degree: true, fieldOfStudy: true },
        }),
      ]);

      const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

      // Build services text
      const servicesText = services
        .map(s => {
          const features = Array.isArray(s.features) ? (s.features as string[]).join(', ') : '';
          const tech = Array.isArray(s.technologies) ? (s.technologies as string[]).join(', ') : '';
          return `- ${s.title}: ${s.description}. Features: ${features}. Technologies: ${tech}`;
        })
        .join('\n');

      // Build projects text
      const projectsText = projects
        .map(p => {
          const stack = Array.isArray(p.techStack) ? (p.techStack as string[]).join(', ') : '';
          return `- ${p.title} (${p.status}): ${p.description}. Stack: ${stack}`;
        })
        .join('\n');

      // Build experience text
      const experienceText = experiences
        .map(e => {
          const achievements = Array.isArray(e.achievements)
            ? (e.achievements as string[]).join('; ')
            : '';
          return `- ${e.role} at ${e.company}${e.isCurrent ? ' (Current)' : ''}: ${e.description}. Key achievements: ${achievements}`;
        })
        .join('\n');

      // Build education text
      const educationText = education
        .map(e => `- ${e.degree} in ${e.fieldOfStudy} from ${e.institution}`)
        .join('\n');

      // System prompt from settings or default
      const systemPrompt = settingsMap['ai_system_prompt'] || '';

      return {
        about: `Name: Denis Chamkaga. Tagline: ${settingsMap['site_tagline'] || ''}. Location: ${settingsMap['contact_location'] || 'Dar es Salaam, Tanzania'}.`,
        services: servicesText,
        projects: projectsText,
        experience: experienceText,
        education: educationText,
        skills: 'PostgreSQL, MySQL, Node.js, React, TypeScript, Prisma, Docker, Business Analysis, CRM, Digital Transformation',
        systemPrompt,
      };
    } catch (err) {
      logger.error('Failed to build AI knowledge context:', err);
      // Return minimal fallback context
      return {
        about: 'Denis Chamkaga is a Systems & Database Consultant in Dar es Salaam, Tanzania.',
        services: 'Database Design, CRM Implementation, Business Automation, Digital Transformation Consulting, Custom Software Development, Technology Consulting.',
        projects: 'Various enterprise systems, CRM implementations, and database optimization projects.',
        experience: 'Experience at Securex Tanzania, PCCI, and Yas Tanzania.',
        education: 'Computer Science degree from University of Dar es Salaam.',
        skills: 'PostgreSQL, MySQL, Node.js, React, TypeScript, CRM, Digital Transformation.',
        systemPrompt: '',
      };
    }
  },
};
