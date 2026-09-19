// backend/prisma/seed.ts
// Database seed script for initial deployment.
// Creates: roles, permissions, admin user, languages, site settings, categories, services.
// Run: npx prisma db seed  OR  npm run prisma:seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ─── 1. Roles ─────────────────────────────────────────────────────────────
  console.log('Creating roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: { name: 'super_admin', description: 'Full system access' },
  });
  const ownerRole = await prisma.role.upsert({
    where: { name: 'owner' },
    update: {},
    create: { name: 'owner', description: 'Business owner with full system authority' },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrative access' },
  });
  const developerRole = await prisma.role.upsert({
    where: { name: 'developer' },
    update: {},
    create: { name: 'developer', description: 'Developer and engineering access' },
  });
  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: { name: 'manager', description: 'Business operations and management access' },
  });
  const financeRole = await prisma.role.upsert({
    where: { name: 'finance' },
    update: {},
    create: { name: 'finance', description: 'Financial billing and invoice access' },
  });
  const supportRole = await prisma.role.upsert({
    where: { name: 'support' },
    update: {},
    create: { name: 'support', description: 'Customer support and lead ticket access' },
  });
  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: { name: 'customer', description: 'Public customer / client workspace access' },
  });
  console.log(`  ✓ Roles: owner, super_admin, admin, developer, manager, finance, support, customer`);

  // ─── 2. Permissions ───────────────────────────────────────────────────────
  console.log('Creating permissions...');
  const resources = [
    'projects', 'services', 'blog_posts', 'gallery', 'certificates',
    'experiences', 'education', 'testimonials', 'leads', 'messages',
    'appointments', 'users', 'roles', 'settings', 'analytics',
    'audit_logs', 'notifications', 'investor_requests', 'crm', 'finance',
    'knowledge', 'media', 'marketing', 'supporters', 'ai', 'calls', 'calendar',
  ];
  const allActions = ['create', 'read', 'update', 'delete', 'publish', 'verify', 'manage'];
  const readOnlyActions = ['read'];

  // Super admin gets everything
  for (const resource of resources) {
    for (const action of allActions) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: superAdminRole.id, resource, action } },
        update: {},
        create: { roleId: superAdminRole.id, resource, action },
      });
    }
  }

  // Technical Administrator gets only the operations permissions defined in TestAccountMatrix.
  await prisma.permission.deleteMany({ where: { roleId: adminRole.id } });
  const adminPermissions: Record<string, string[]> = {
    analytics: ['read'], audit_logs: ['read'], messages: ['read', 'update'],
    appointments: ['read'], notifications: ['read', 'update'], calls: ['read', 'update', 'manage'],
    settings: ['read', 'update'], ai: ['read'], calendar: ['read'], leads: ['read']
  };
  for (const [resource, actions] of Object.entries(adminPermissions)) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: adminRole.id, resource, action } },
        update: {},
        create: { roleId: adminRole.id, resource, action },
      });
    }
  }

  // Developer gets read + create + update + delete on tech resources
  const devResources = ['projects', 'services', 'blog_posts', 'gallery', 'certificates', 'experiences', 'education', 'testimonials', 'settings'];
  for (const resource of devResources) {
    for (const action of allActions) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: developerRole.id, resource, action } },
        update: {},
        create: { roleId: developerRole.id, resource, action },
      });
    }
  }

  // Manager gets read + create + update on business resources
  const managerResources = ['leads', 'messages', 'appointments', 'projects', 'services', 'analytics'];
  for (const resource of managerResources) {
    for (const action of ['create', 'read', 'update']) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: managerRole.id, resource, action } },
        update: {},
        create: { roleId: managerRole.id, resource, action },
      });
    }
  }

  // Finance role gets read + create + update on finance and analytics
  for (const resource of ['analytics', 'audit_logs', 'projects', 'services', 'finance']) {
    for (const action of ['create', 'read', 'update']) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: financeRole.id, resource, action } },
        update: {},
        create: { roleId: financeRole.id, resource, action },
      });
    }
  }

  // Support role gets read + create + update on support tickets/leads
  for (const resource of ['leads', 'messages', 'appointments', 'notifications', 'crm']) {
    for (const action of ['create', 'read', 'update']) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: supportRole.id, resource, action } },
        update: {},
        create: { roleId: supportRole.id, resource, action },
      });
    }
  }

  // Customer role gets read access
  for (const resource of ['projects', 'services', 'blog_posts', 'testimonials']) {
    await prisma.permission.upsert({
      where: { roleId_resource_action: { roleId: customerRole.id, resource, action: 'read' } },
      update: {},
      create: { roleId: customerRole.id, resource, action: 'read' },
    });
  }

  console.log(`  ✓ Permissions created for all roles`);

  // ─── 3. Owner User ────────────────────────────────────────────────────────
  console.log('Creating owner user...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@denischamkaga.com';
  const ownerPassword = process.env.OWNER_INITIAL_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || 'Denis@Platform2025';
  const passwordHash = await bcrypt.hash(ownerPassword, BCRYPT_ROUNDS);

  // Only resync passwordHash for an existing account if it's still in its
  // untouched bootstrap state (mustChangePassword: true). Once someone has
  // logged in and changed their password, re-seeding must never overwrite it.
  const existingOwner = await prisma.user.findUnique({ where: { email: 'denis@denischamkaga.com' } });
  await prisma.user.upsert({
    where: { email: 'denis@denischamkaga.com' },
    update: {
      username: 'denis', firstName: 'Denis', lastName: 'Chamkaga', roleId: ownerRole.id, isActive: true,
      ...(existingOwner?.mustChangePassword !== false ? { passwordHash } : {}),
    },
    create: {
      email: 'denis@denischamkaga.com',
      username: 'denis',
      passwordHash,
      firstName: 'Denis',
      lastName: 'Chamkaga',
      roleId: ownerRole.id,
      isActive: true,
      mustChangePassword: true, // Force password change on first login
    },
  });
  console.log('  ✓ Owner user: denis@denischamkaga.com (mustChangePassword: true)');

  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'Admin@Platform2025', BCRYPT_ROUNDS);
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      username: 'admin', firstName: 'System', lastName: 'Administrator', roleId: adminRole.id, isActive: true,
      ...(existingAdmin?.mustChangePassword !== false ? { passwordHash: adminPasswordHash } : {}),
    },
    create: {
      email: adminEmail,
      username: 'admin',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      roleId: adminRole.id,
      isActive: true,
      mustChangePassword: true,
    },
  });
  console.log(`  ✓ Administrator user: ${adminEmail} (mustChangePassword: true)`);

  // ─── 4. Languages ─────────────────────────────────────────────────────────
  console.log('Creating languages...');
  await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: { code: 'en', name: 'English', nativeName: 'English', isDefault: true, isActive: true },
  });
  await prisma.language.upsert({
    where: { code: 'sw' },
    update: {},
    create: { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', isDefault: false, isActive: true },
  });
  console.log(`  ✓ Languages: English, Swahili`);

  // ─── 5. Site Settings ─────────────────────────────────────────────────────
  console.log('Creating site settings...');
  const settings = [
    { key: 'site_name', value: 'Denis Chamkaga', type: 'string', category: 'general', description: 'Website name' },
    { key: 'site_tagline', value: 'Systems & Database Consultant | Digital Transformation Expert', type: 'string', category: 'general', description: 'Site tagline' },
    { key: 'site_description', value: 'Denis Chamkaga is a Systems & Database Consultant specializing in digital transformation, CRM, business automation, and technology consulting in Tanzania.', type: 'string', category: 'seo', description: 'Default meta description' },
    { key: 'contact_email', value: 'hello@denischamkaga.com', type: 'string', category: 'contact', description: 'Public contact email' },
    { key: 'contact_phone', value: '+255 XXX XXX XXX', type: 'string', category: 'contact', description: 'Contact phone number' },
    { key: 'contact_location', value: 'Dar es Salaam, Tanzania', type: 'string', category: 'contact', description: 'Business location' },
    { key: 'social_linkedin', value: 'https://linkedin.com/in/denischamkaga', type: 'string', category: 'social', description: 'LinkedIn profile URL' },
    { key: 'social_github', value: 'https://github.com/denischamkaga', type: 'string', category: 'social', description: 'GitHub profile URL' },
    { key: 'social_twitter', value: '', type: 'string', category: 'social', description: 'Twitter/X profile URL' },
    { key: 'social_whatsapp', value: '', type: 'string', category: 'social', description: 'WhatsApp contact link' },
    { key: 'ai_system_prompt', value: 'You are Denis\'s Business Technology Assistant. You help visitors learn about Denis Chamkaga\'s expertise in systems design, database consulting, CRM, business automation, and digital transformation. Only discuss topics related to Denis Chamkaga\'s professional work and services. Politely redirect off-topic questions.', type: 'string', category: 'ai', description: 'AI assistant system prompt' },
    { key: 'ai_model', value: 'gpt-4o-mini', type: 'string', category: 'ai', description: 'Active AI model identifier' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', description: 'Enable maintenance mode' },
    { key: 'analytics_enabled', value: 'true', type: 'boolean', category: 'general', description: 'Enable analytics tracking' },
    { key: 'years_experience', value: '8', type: 'number', category: 'general', description: 'Years of experience shown on homepage' },
    { key: 'projects_completed', value: '50', type: 'number', category: 'general', description: 'Projects completed count' },
    { key: 'clients_served', value: '30', type: 'number', category: 'general', description: 'Clients served count' },
    { key: 'presence_state', value: 'Online', type: 'string', category: 'general', description: 'Availability status for Denis Chamkaga' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`  ✓ ${settings.length} site settings created`);

  // ─── 6. Blog Categories ───────────────────────────────────────────────────
  console.log('Creating blog categories...');
  const categories = [
    { name: 'Technology', slug: 'technology', description: 'Technology insights and trends' },
    { name: 'Business', slug: 'business', description: 'Business strategy and digital transformation' },
    { name: 'Tutorial', slug: 'tutorial', description: 'Step-by-step technical guides' },
    { name: 'Career', slug: 'career', description: 'Career advice and professional development' },
    { name: 'Database', slug: 'database', description: 'Database design and optimization' },
    { name: 'CRM', slug: 'crm', description: 'Customer relationship management' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`  ✓ ${categories.length} blog categories created`);

  // ─── 7. Services ──────────────────────────────────────────────────────────
  console.log('Creating services...');
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  const services = [
    {
      title: 'Database Design & Optimization',
      slug: 'database-design',
      description: 'Professional PostgreSQL and MySQL database architecture, schema design, query optimization, and performance tuning.',
      content: 'I design scalable, normalized database schemas that serve as the backbone of your business systems. Services include ERD design, index optimization, query performance analysis, migration planning, and database auditing.',
      icon: 'database',
      features: JSON.stringify(['Schema Design & ERD', 'Query Optimization', 'Performance Tuning', 'Migration Planning', 'Database Audits', 'Backup Strategies']),
      technologies: JSON.stringify(['PostgreSQL', 'MySQL', 'Prisma ORM', 'Redis']),
      displayOrder: 1,
    },
    {
      title: 'CRM Implementation',
      slug: 'crm-implementation',
      description: 'Custom CRM systems tailored to your business workflows, including lead management, pipeline tracking, and automation.',
      content: 'I build and implement CRM solutions that align with your sales and customer management processes. From requirement analysis to deployment and training.',
      icon: 'users',
      features: JSON.stringify(['Lead Pipeline Management', 'Contact Database', 'Workflow Automation', 'Reporting & Analytics', 'Email Integration', 'Team Collaboration']),
      technologies: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Prisma']),
      displayOrder: 2,
    },
    {
      title: 'Business Automation',
      slug: 'business-automation',
      description: 'Automate repetitive business processes, reduce manual work, and improve operational efficiency through smart workflows.',
      content: 'I identify bottlenecks in your business operations and design automated workflows that save time, reduce errors, and scale with your growth.',
      icon: 'zap',
      features: JSON.stringify(['Process Mapping', 'Workflow Design', 'API Integrations', 'Report Automation', 'Notification Systems', 'Data Pipelines']),
      technologies: JSON.stringify(['Node.js', 'PostgreSQL', 'REST APIs', 'Webhooks']),
      displayOrder: 3,
    },
    {
      title: 'Digital Transformation Consulting',
      slug: 'digital-transformation',
      description: 'Strategic guidance to modernize your business operations using technology, data, and digital systems.',
      content: 'I help businesses in Tanzania and East Africa transition from manual and fragmented systems to integrated, digital-first operations.',
      icon: 'trending-up',
      features: JSON.stringify(['Technology Assessment', 'Digital Strategy', 'System Integration', 'Change Management', 'Training & Support', 'Roadmap Planning']),
      technologies: JSON.stringify(['Business Analysis', 'System Architecture', 'Cloud Platforms']),
      displayOrder: 4,
    },
    {
      title: 'Custom Software Development',
      slug: 'custom-software',
      description: 'Full-stack web application development tailored to your unique business requirements.',
      content: 'I develop custom web applications using modern technologies, from simple business tools to complex enterprise platforms.',
      icon: 'code',
      features: JSON.stringify(['Requirement Analysis', 'UI/UX Design', 'Full-Stack Development', 'API Development', 'Testing & QA', 'Deployment & DevOps']),
      technologies: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']),
      displayOrder: 5,
    },
    {
      title: 'Technology Consulting',
      slug: 'technology-consulting',
      description: 'Expert technology advisory services to help you make the right technology decisions for your business.',
      content: 'Whether you need help evaluating technology solutions, planning architecture, or solving complex technical challenges, I provide clear, practical advice.',
      icon: 'lightbulb',
      features: JSON.stringify(['Technology Evaluation', 'Architecture Review', 'Vendor Selection', 'Security Assessment', 'Scalability Planning', 'Cost Optimization']),
      technologies: JSON.stringify(['System Architecture', 'Cloud Computing', 'Security']),
      displayOrder: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }
  console.log(`  ✓ ${services.length} services created`);

  // ─── 8. Sample Experiences ────────────────────────────────────────────────
  console.log('Creating sample experiences...');
  const experienceCount = await prisma.experience.count();
  if (experienceCount === 0) {
    await prisma.experience.createMany({
      data: [
        {
          company: 'Securex Tanzania',
          role: 'Database & Systems Administrator',
          description: 'Managed enterprise database infrastructure, designed and optimized PostgreSQL schemas, and led digital transformation initiatives.',
          achievements: JSON.stringify([
            'Reduced query response times by 60% through index optimization',
            'Migrated legacy systems to modern cloud-ready architecture',
            'Implemented automated backup and disaster recovery procedures',
          ]),
          location: 'Dar es Salaam, Tanzania',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2022-12-31'),
          isCurrent: false,
          displayOrder: 1,
        },
        {
          company: 'PCCI Tanzania',
          role: 'Technology Consultant',
          description: 'Provided technology consulting services to business members, advising on CRM implementation and digital transformation strategies.',
          achievements: JSON.stringify([
            'Consulted on 15+ SME digital transformation projects',
            'Developed technology assessment framework used by 50+ businesses',
          ]),
          location: 'Dar es Salaam, Tanzania',
          startDate: new Date('2021-06-01'),
          endDate: new Date('2023-06-30'),
          isCurrent: false,
          displayOrder: 2,
        },
        {
          company: 'Yas Tanzania',
          role: 'Systems Consultant',
          description: 'Delivered database design and business systems consulting for growing Tanzanian enterprises.',
          achievements: JSON.stringify([
            'Designed multi-tenant CRM database architecture',
            'Implemented automated reporting systems',
          ]),
          location: 'Dar es Salaam, Tanzania',
          startDate: new Date('2022-01-01'),
          endDate: null,
          isCurrent: true,
          displayOrder: 3,
        },
      ],
    });
    console.log(`  ✓ Sample experiences created`);
  }

  // ─── 9. Sample Education ─────────────────────────────────────────────────
  console.log('Creating sample education...');
  const educationCount = await prisma.education.count();
  if (educationCount === 0) {
    await prisma.education.createMany({
      data: [
        {
          institution: 'University of Dar es Salaam (UDSM)',
          degree: "Bachelor's Degree",
          fieldOfStudy: 'Computer Science & Information Systems',
          description: 'Core studies in database systems, software engineering, algorithms, and information systems management.',
          startDate: new Date('2015-09-01'),
          endDate: new Date('2019-07-31'),
          displayOrder: 1,
        },
        {
          institution: 'University of Dar es Salaam Computing Centre (UDCC)',
          degree: 'Professional Certification',
          fieldOfStudy: 'Database Administration & Systems Management',
          description: 'Advanced training in PostgreSQL administration, business intelligence, and enterprise systems management.',
          startDate: new Date('2019-09-01'),
          endDate: new Date('2020-06-30'),
          displayOrder: 2,
        },
      ],
    });
    console.log(`  ✓ Sample education created`);
  }

  // ─── 10. FAQs ─────────────────────────────────────────────────────────────
  console.log('Creating FAQs...');
  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: 'Why should I build a custom system instead of using social media?',
          answer: 'While Facebook, Instagram, and WhatsApp are great marketing hooks, they do not automate your operations. Custom CRM databases, inventory portals, and automated finance tracking secure your business data, enforce SLAs, and free up employee time to focus on scaling.',
          displayOrder: 1,
        },
        {
          question: 'What is your background and expertise?',
          answer: 'I hold a Diploma in Business Information Technology from the University of Dar es Salaam Computing Centre. In addition, I have 8+ years of operational excellence experience: 2 years in security supervision and risk audit at Securex Africa, and 6+ years in customer relations and SLA ticketing strategy at PCCI Group.',
          displayOrder: 2,
        },
        {
          question: 'Do you support Swahili and English projects?',
          answer: 'Yes, I design bilingual software systems natively supporting Swahili and English to help local Tanzanian SMEs serve both regional and international customers.',
          displayOrder: 3,
        },
        {
          question: 'How does the consultation booking work?',
          answer: 'You can submit your operational problems via the Contact form or request a meeting block. During the call, we define your business workflow, map data relationships, and draw up a clear system requirements document.',
          displayOrder: 4,
        },
      ],
    });
    console.log(`  ✓ FAQs seeded`);
  }

  // ─── 11. Certificates ──────────────────────────────────────────────────────
  console.log('Creating certificates...');
  const certCount = await prisma.certificate.count();
  if (certCount === 0) {
    await prisma.certificate.createMany({
      data: [
        {
          title: 'Advanced PostgreSQL Administrator',
          issuer: 'Database Administration Centre',
          description: 'Specialized certification covering advanced indexing, write-ahead logging (WAL), replication setups, and query planner auditing.',
          credentialId: 'CERT-PG-88902',
          issueDate: new Date('2021-03-15'),
          displayOrder: 1,
        },
        {
          title: 'Business Information Systems Architect',
          issuer: 'UDSM Computing Centre',
          description: 'Diploma-level training covering enterprise systems mapping, relational schema normalization (3NF/BCNF), and cash flow integrations.',
          credentialId: 'CERT-UDCC-33291',
          issueDate: new Date('2019-06-20'),
          displayOrder: 2,
        },
      ],
    });
    console.log(`  ✓ Certificates seeded`);
  }

  // ─── 12. Tenant Config & Sequences ───────────────────────────────────────
  console.log('Seeding Tenant Config and Document Sequences...');
  await prisma.tenantConfig.upsert({
    where: { id: 'default-tenant' },
    update: {},
    create: {
      id: 'default-tenant',
      name: 'Terrasafi T Ltd',
      email: 'finance@terrasafi.co.tz',
      phone: '+255 700 000 000',
      address: 'Plot 45, Victoria, Dar es Salaam, Tanzania',
      vatNumber: '100-200-300',
      currency: 'USD',
    },
  });

  const sequences = [
    { type: 'invoice', prefix: 'INV', year: 2026 },
    { type: 'quotation', prefix: 'QT', year: 2026 },
    { type: 'receipt', prefix: 'REC', year: 2026 },
    { type: 'contract', prefix: 'CON', year: 2026 },
    { type: 'project', prefix: 'PRJ', year: 2026 },
  ];

  for (const seq of sequences) {
    await prisma.documentSequence.upsert({
      where: { type: seq.type },
      update: {},
      create: seq,
    });
  }
  console.log('  ✓ Tenant config and sequences seeded');

  console.log('\n✅ Database seed completed successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('Admin credentials:');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: (from ADMIN_INITIAL_PASSWORD in .env)`);
  console.log(`  NOTE:     Password change required on first login`);
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
