// src/services/public.service.ts
// Read-only public services — no auth required.
// Used by frontend to fetch real data from the database.

import prisma from '../config/database';
import { PaginationQuery } from '../types/api';

export const publicService = {
  // ── Projects ──────────────────────────────────────────────────────────────
  async getProjects(query: PaginationQuery = {}) {
    const { page = 1, limit = 12, search, sortBy = 'displayOrder', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true, title: true, slug: true, description: true,
          thumbnailUrl: true, techStack: true, category: true,
          status: true, liveUrl: true, githubUrl: true,
          isFeatured: true, displayOrder: true, createdAt: true,
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getProjectBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
  },

  async getFeaturedProjects() {
    return prisma.project.findMany({
      where: { isFeatured: true, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
      take: 6,
    });
  },

  // ── Services ──────────────────────────────────────────────────────────────
  async getServices() {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  },

  async getServiceBySlug(slug: string) {
    return prisma.service.findUnique({ where: { slug } });
  },

  // ── Blog ──────────────────────────────────────────────────────────────────
  async getBlogPosts(query: PaginationQuery & { categorySlug?: string } = {}) {
    const { page = 1, limit = 9, search, categorySlug } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: 'published',
      deletedAt: null,
      publishedAt: { lte: new Date() },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverImageUrl: true, publishedAt: true, readingTime: true,
          viewCount: true, isFeatured: true,
          category: { select: { name: true, slug: true } },
          author: { select: { firstName: true, lastName: true, avatarUrl: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getBlogPostBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { firstName: true, lastName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
      },
    });
    if (post) {
      await prisma.blogPost.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
    }
    return post;
  },

  async getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  },

  // ── Testimonials ──────────────────────────────────────────────────────────
  async getTestimonials(featuredOnly = false) {
    return prisma.testimonial.findMany({
      where: { isVisible: true, ...(featuredOnly ? { isFeatured: true } : {}) },
      orderBy: { displayOrder: 'asc' },
    });
  },

  // ── Experiences ───────────────────────────────────────────────────────────
  async getExperiences() {
    return prisma.experience.findMany({ orderBy: { displayOrder: 'asc' } });
  },

  // ── Education ─────────────────────────────────────────────────────────────
  async getEducation() {
    return prisma.education.findMany({ orderBy: { displayOrder: 'asc' } });
  },

  // ── Certificates ──────────────────────────────────────────────────────────
  async getCertificates() {
    return prisma.certificate.findMany({ orderBy: { displayOrder: 'asc' } });
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  async getGallery(category?: string) {
    return prisma.gallery.findMany({
      where: { isVisible: true, ...(category ? { category } : {}) },
      orderBy: { displayOrder: 'asc' },
    });
  },

  // ── FAQs ──────────────────────────────────────────────────────────────────
  async getFaqs() {
    return prisma.faq.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  },

  // ── Site Settings (public subset) ─────────────────────────────────────────
  async getPublicSettings() {
    const keys = [
      'site_name', 'site_tagline', 'site_description',
      'contact_email', 'contact_phone', 'contact_location',
      'social_linkedin', 'social_github', 'social_twitter', 'social_whatsapp',
      'years_experience', 'projects_completed', 'clients_served',
      'ai_quick_actions', 'booking_url',
      'support_enabled', 'support_title', 'support_description', 
      'support_amounts', 'support_custom_enabled', 'support_currency', 
      'support_thank_you'
    ];
    const settings = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    return Object.fromEntries(settings.map(s => [s.key, s.value]));
  },
};
