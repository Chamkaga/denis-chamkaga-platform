import prisma from '../config/database';

async function dumpInventory() {
  console.log('--- DUMPING DATABASE KNOWLEDGE INVENTORY ---');
  
  const [services, projects, faqs, aiItems] = await Promise.all([
    prisma.service.findMany(),
    prisma.project.findMany(),
    prisma.faq.findMany(),
    prisma.aiKnowledgeItem.findMany()
  ]);

  console.log(`\n=== SERVICES (${services.length}) ===`);
  services.forEach((s: any) => console.log(`- [${s.category}] ${s.title}: ${s.description?.substring(0, 80)}...`));

  console.log(`\n=== PROJECTS (${projects.length}) ===`);
  projects.forEach((p: any) => console.log(`- [${p.category}] ${p.title}: ${p.description?.substring(0, 80)}...`));

  console.log(`\n=== FAQS (${faqs.length}) ===`);
  faqs.forEach((f: any) => console.log(`- [${f.category}] Q: ${f.question}`));

  console.log(`\n=== AI KNOWLEDGE ITEMS (${aiItems.length}) ===`);
  aiItems.forEach((a: any) => console.log(`- [${a.category}] ${a.title} (Tags: ${a.tags?.join(', ')})`));
}

dumpInventory().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
