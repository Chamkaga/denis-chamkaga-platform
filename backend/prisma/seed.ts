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
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrative access' },
  });
  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: { name: 'editor', description: 'Content editing access' },
  });
  console.log(`  ✓ Roles: super_admin, admin, editor`);

  // ─── 2. Permissions ───────────────────────────────────────────────────────
  console.log('Creating permissions...');
  const resources = [
    'projects', 'services', 'blog_posts', 'gallery', 'certificates',
    'experiences', 'education', 'testimonials', 'leads', 'messages',
    'appointments', 'users', 'roles', 'settings', 'analytics',
    'audit_logs', 'notifications', 'investor_requests',
  ];
  const allActions = ['create', 'read', 'update', 'delete'];
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

  // Admin gets everything except user/role management
  const adminResources = resources.filter(r => r !== 'users' && r !== 'roles');
  for (const resource of adminResources) {
    for (const action of allActions) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: adminRole.id, resource, action } },
        update: {},
        create: { roleId: adminRole.id, resource, action },
      });
    }
  }

  // Editor gets read + create + update on content, read only on leads
  const editorWriteResources = ['projects', 'services', 'blog_posts', 'gallery', 'certificates', 'experiences', 'education', 'testimonials'];
  const editorReadResources = ['leads', 'messages', 'appointments', 'analytics'];
  for (const resource of editorWriteResources) {
    for (const action of ['create', 'read', 'update']) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: editorRole.id, resource, action } },
        update: {},
        create: { roleId: editorRole.id, resource, action },
      });
    }
  }
  for (const resource of editorReadResources) {
    for (const action of readOnlyActions) {
      await prisma.permission.upsert({
        where: { roleId_resource_action: { roleId: editorRole.id, resource, action } },
        update: {},
        create: { roleId: editorRole.id, resource, action },
      });
    }
  }
  console.log(`  ✓ Permissions created for all roles`);

  // ─── 3. Admin User ────────────────────────────────────────────────────────
  console.log('Creating admin user...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@denischamkaga.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Denis@Platform2025';
  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: 'admin',
      passwordHash,
      firstName: 'Denis',
      lastName: 'Chamkaga',
      roleId: superAdminRole.id,
      isActive: true,
      mustChangePassword: true, // Force password change on first login
    },
  });
  console.log(`  ✓ Admin user: ${adminEmail} (mustChangePassword: true)`);

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
    { key: 'ai_model', value: 'llama3.2', type: 'string', category: 'ai', description: 'Active AI model identifier' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', description: 'Enable maintenance mode' },
    { key: 'analytics_enabled', value: 'true', type: 'boolean', category: 'general', description: 'Enable analytics tracking' },
    { key: 'years_experience', value: '8', type: 'number', category: 'general', description: 'Years of experience shown on homepage' },
    { key: 'projects_completed', value: '50', type: 'number', category: 'general', description: 'Projects completed count' },
    { key: 'clients_served', value: '30', type: 'number', category: 'general', description: 'Clients served count' },
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
