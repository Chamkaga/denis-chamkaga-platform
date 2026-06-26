import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Briefcase, 
  User, 
  Compass, 
  Award, 
  HelpCircle, 
  ArrowRight,
  Shield,
  Headphones,
  GraduationCap,
  TrendingUp,
  Code,
  Database,
  BarChart,
  Laptop
} from 'lucide-react';
import { IMAGES } from '../../../constants/images';
import { Button } from '../../../components/atoms/Button';
import { ROUTES } from '../../../config/routes';
import { SOCIALS } from '../../../constants/socials';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { 
  heroStaggerContainer, 
  fadeUpVariants, 
  slideLeftVariants, 
  slideRightVariants, 
  lineGrowVariants, 
  skillBarVariants
} from '../../../lib/motion';

// ── Timeline section component to manage line growth and alternating children reveal ──
const TimelineSection: React.FC<{ journeyMilestones: any[] }> = ({ journeyMilestones }) => {
  const { ref: containerRef, isInView } = useScrollReveal({ threshold: 0.05 });

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className="relative ml-4 sm:ml-6 lg:ml-10 space-y-16">
      
      {/* Animated Vertical Line */}
      <motion.div
        variants={lineGrowVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="absolute -left-[1px] top-2 bottom-2 w-0.5 bg-accent-violet origin-top"
      />

      {journeyMilestones.map((node, idx) => {
        const isEven = idx % 2 === 0;
        const slideVariants = isEven ? slideLeftVariants : slideRightVariants;

        return (
          <motion.div 
            key={idx} 
            variants={slideVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={idx * 0.1}
            className="relative pl-8 sm:pl-10 lg:pl-12 text-left"
          >
            
            {/* Connector Dot */}
            <div className="absolute -left-[13px] top-2 w-6 h-6 rounded-full border-4 border-accent-violet bg-white dark:bg-zinc-950 flex items-center justify-center text-[10px] text-accent-violet font-bold z-10">
              {idx + 1}
            </div>

            {/* Step Card Container */}
            <div className="p-6 sm:p-8 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-all duration-300 shadow-xl max-w-5xl group hover:shadow-accent-violet/5">
              
              {/* Years & Logo Header row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b dark:border-zinc-800/60 light:border-slate-100 pb-3 mb-6 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold text-accent-violet uppercase tracking-widest bg-accent-violet/10 py-1 px-3 rounded-full flex items-center gap-1.5">
                    {node.icon}
                    {node.years}
                  </span>
                  <span className="text-xs font-bold dark:text-white light:text-slate-800 font-display">
                    {node.organization}
                  </span>
                </div>
                
                {/* Small Company Logo Icon */}
                <div className="w-6 h-6 rounded bg-white p-0.5 border flex items-center justify-center overflow-hidden text-zinc-900">
                  {node.logo}
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Image (4 cols) */}
                <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border dark:border-zinc-800 light:border-slate-200 h-44 bg-zinc-950">
                  <AnimatedImage 
                    src={node.image} 
                    alt={node.role} 
                    className="w-full h-full"
                    hoverZoom={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none z-10" />
                  <span className="absolute bottom-2 left-3 text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[90%] z-20">
                    {node.role}
                  </span>
                </div>

                {/* Story & Lesson (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
                    {node.story}
                  </p>

                  {/* Lesson learned block */}
                  <div className="p-3.5 rounded-xl dark:bg-zinc-950/50 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 text-[11px] font-body leading-relaxed">
                    <span className="font-extrabold text-[10px] dark:text-zinc-300 light:text-slate-800 uppercase tracking-widest block mb-1">
                      Key Lesson Learned:
                    </span>
                    <p className="dark:text-zinc-400 light:text-slate-500 italic">
                      "{node.lesson}"
                    </p>
                  </div>

                  {/* Skills acquired */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {node.skills.map((sk: string) => (
                      <span key={sk} className="text-[9px] font-semibold py-0.5 px-2 rounded-lg bg-accent-violet/10 dark:bg-accent-violet/15 text-accent-violet font-body">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Website Button */}
                  <div className="pt-2">
                    <a 
                      href={node.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white dark:text-zinc-300 light:text-slate-700 hover:border-accent-violet hover:text-accent-violet transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet font-body shadow-sm"
                      aria-label={`Visit official portal for ${node.organization}`}
                    >
                      <span>{node.btnText}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>
        );
      })}
    </div>
  );
};

// ── Skills card with animated progress bars on viewport reveal ──
const SkillsCard: React.FC<{ category: string; skills: any[] }> = ({ category, skills }) => {
  const { ref, isInView } = useScrollReveal({ threshold: 0.08 });

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className="p-6 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-white shadow-lg space-y-6"
    >
      <h3 className="font-extrabold text-base dark:text-white light:text-slate-800 flex items-center gap-2 border-b dark:border-zinc-850/60 light:border-slate-100 pb-3">
        <Briefcase size={16} className="text-accent-violet" />
        {category}
      </h3>

      <div className="space-y-4 font-body">
        {skills.map((sk) => (
          <div key={sk.name} className="space-y-1.5 text-xs text-left">
            <div className="flex justify-between items-center text-[11px] font-medium dark:text-zinc-400 light:text-slate-700">
              <span>{sk.name}</span>
              <span className="font-bold text-accent-violet font-mono">{sk.val}%</span>
            </div>
            {/* Progress track */}
            <div className="w-full bg-zinc-900/50 light:bg-slate-150 h-2.5 rounded-full overflow-hidden border dark:border-zinc-850 light:border-slate-200">
              <motion.div 
                className="bg-accent-violet h-full rounded-full" 
                variants={skillBarVariants(sk.val)}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { SecurexLogo, PCCILogo, YasLogo, UDSMLogo, UDCCLogo, TerrasafiLogo } from '../../../components/atoms/CompanyLogos/CompanyLogos';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  // Milestone data representing the stepping stones of Denis's career
  const journeyMilestones = [
    {
      years: '2015 – 2017',
      organization: 'Securex Africa',
      role: 'Security Officer & Audit Coordinator',
      logo: <SecurexLogo />,
      image: IMAGES.timeline.security,
      icon: <Shield size={16} className="text-accent-violet" />,
      story: 'I started with very little, guarding gates and patrolling premises at Securex Africa under the night sky. In those quiet hours, I didn\'t just watch doors; I studied the systems of discipline, observation, and vigilance that keep organizations safe. It was here that I realized every large system is built on small, relentless procedures.',
      lesson: 'Vigilance is not a feeling, it\'s a procedural habit. If you miss the small checkpoints, the entire system becomes vulnerable.',
      skills: ['Access Auditing', 'Operations Discipline', 'Risk Analysis', 'Incident Management'],
      website: 'https://securexafrica.com',
      btnText: 'Visit Securex Africa'
    },
    {
      years: '2017 – Present',
      organization: 'PCCI Group',
      role: 'Customer Service Professional',
      logo: <PCCILogo />,
      image: IMAGES.timeline.customerService,
      icon: <Headphones size={16} className="text-accent-violet" />,
      story: 'While working in security, I knew education was the key to transforming my future, but I had to support myself. PCCI Group gave me that bridge, allowing me to handle intense digital customer channels by day while planning my studies. Managing constant high-pressure customer queues taught me how critical routing and response times are to human trust.',
      lesson: 'Behind every support ticket is a human voice waiting for clarity. Decoupled, automated routing systems build trust far faster than manual assignments.',
      skills: ['SLA Compliance', 'Queue Optimization', 'Customer Support Strategy', 'CRM Management'],
      website: 'https://pcci-group.com',
      btnText: 'Visit PCCI Group'
    },
    {
      years: '2024 – 2025',
      organization: 'Yas Tanzania',
      role: 'CRM Integration & Database Analyst',
      logo: <YasLogo />,
      image: IMAGES.timeline.development,
      icon: <Briefcase size={16} className="text-accent-violet" />,
      story: 'When the Tigo-to-Yas rebranding took place, I was thrown into the deep end of database migrations and corporate re-structuring. I saw first-hand how easily thousands of customer histories can get lost in the transition if mapping is not done meticulously. I spent days validating SQL scripts and auditing integration logs to ensure that no single customer was forgotten.',
      lesson: 'Data migration is not just shifting rows; it is preserving histories. Rigorous PostgreSQL verification guarantees continuity of service.',
      skills: ['Data Migration Auditing', 'Schema Validation', 'API Verifications', 'CRM Integrations'],
      website: 'https://www.yas.co.tz',
      btnText: 'Visit Yas Tanzania'
    },
    {
      years: '2018 – 2021',
      organization: 'University of Dar es Salaam',
      role: 'Business Systems Studies',
      logo: <UDSMLogo />,
      image: IMAGES.timeline.udcc,
      icon: <GraduationCap size={16} className="text-accent-violet" />,
      story: 'Determined to understand the math and systems behind business, I enrolled at UDSM. I would leave my customer service shifts and head straight to class, learning how financial ledgers and relational databases power the modern economy. It was the moment where my practical work experience finally met rigorous database theory.',
      lesson: 'Accounting is the language of business, and databases are the translators. A poorly normalized database will eventually leak cash.',
      skills: ['Relational Database Modeling', 'Business Systems Analysis', 'Excel Financial Models', 'Statistics'],
      website: 'https://www.udsm.ac.tz',
      btnText: 'Visit UDSM'
    },
    {
      years: '2021 – 2025',
      organization: 'UDSM Computing Centre',
      role: 'Diploma in Business Information Technology',
      logo: <UDCCLogo />,
      image: IMAGES.timeline.projects,
      icon: <GraduationCap size={16} className="text-accent-violet" />,
      story: 'To turn theoretical models into living applications, I joined the UDCC for a Diploma in Business Information Technology. Building school management databases and custom POS systems with PHP and MySQL was like learning to build paths through raw wilderness. I realized I didn\'t just want to analyze systems; I wanted to code the solutions myself.',
      lesson: 'A stable application is only as good as its underlying constraints. Strict schema design prevents years of debugging later on.',
      skills: ['Web Engineering', 'Fullstack Development', 'System Requirements', 'PHP & MySQL'],
      website: 'https://www.ucc.co.tz',
      btnText: 'Visit UCC'
    },
    {
      years: '2025 – Future',
      organization: 'Terrasafi T Ltd',
      role: 'Founder & CEO (Future Vision)',
      logo: <TerrasafiLogo />,
      image: IMAGES.timeline.futureVision,
      icon: <Cpu size={16} className="text-accent-violet" />,
      story: 'I founded Terrasafi T Ltd because I saw Tanzanian business owners drowning in paper registers and lost records. I believe that clean, automated database software should not just be a luxury for large enterprises, but a tool that helps every local entrepreneur build their legacy. My life\'s work is now focused on creating systems that stop operational leaks and power clean business growth.',
      lesson: 'SaaS platforms scale when they are simple to use but engineered with uncompromising architectural discipline.',
      skills: ['SaaS Strategy', 'Business Automation', 'Relational Systems Integration', 'React & Node.js'],
      website: 'https://terrasafi.com',
      btnText: 'Visit Terrasafi'
    }
  ];

  // Core competency lessons and definitions
  const competencies = [
    {
      title: 'Leadership',
      icon: <User size={20} className="text-accent-violet" />,
      desc: 'Formulating operations checklists and supervising physical security rosters, ensuring absolute task adherence.',
      mockup: (
        <div className="flex gap-1 items-center justify-start mt-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-500">Rosters Active: 100%</span>
        </div>
      )
    },
    {
      title: 'Customer Experience',
      icon: <Headphones size={20} className="text-accent-violet" />,
      desc: 'Formulating customer service standards, queue strategies, and ticket routing metrics under strict corporate targets.',
      mockup: (
        <div className="flex gap-1 items-center justify-start mt-2">
          <span className="text-[10px] py-0.5 px-2 rounded bg-accent-violet/10 text-accent-violet font-mono font-semibold">SLA: 98.4%</span>
          <span className="text-[10px] font-mono text-zinc-500">Wait: &lt;15m</span>
        </div>
      )
    },
    {
      title: 'Business Operations',
      icon: <Briefcase size={20} className="text-accent-violet" />,
      desc: 'Mapping corporate accounting ledgers onto automated business software, stopping cash inventory leaks.',
      mockup: (
        <div className="w-full bg-zinc-950/40 rounded p-1.5 mt-2 border dark:border-zinc-800/80 light:border-slate-100 flex items-center justify-between text-[9px] font-mono">
          <span className="text-zinc-400">Total Revenue</span>
          <span className="text-green-500 font-bold">$12,450.00</span>
        </div>
      )
    },
    {
      title: 'CRM Systems',
      icon: <HelpCircle size={20} className="text-accent-violet" />,
      desc: 'Designing ticketing queue structures, mapping response priorities, and tracking automated customer logs.',
      mockup: (
        <div className="flex gap-1 mt-2">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase">Closed</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase">Open</span>
        </div>
      )
    },
    {
      title: 'Databases',
      icon: <Database size={20} className="text-accent-violet" />,
      desc: 'Structuring PostgreSQL and MySQL models, writing constraints and indexes to secure transaction records.',
      mockup: (
        <div className="text-[8px] font-mono bg-zinc-950 p-1.5 rounded border dark:border-zinc-800 light:border-slate-200 mt-2 text-left space-y-0.5 text-zinc-400">
          <div><span className="text-purple-400">CREATE TABLE</span> <span className="text-white">"users"</span> (</div>
          <div className="pl-3">"id" <span className="text-amber-400">UUID PRIMARY KEY</span></div>
          <div>);</div>
        </div>
      )
    },
    {
      title: 'Automation',
      icon: <Cpu size={20} className="text-accent-violet" />,
      desc: 'Writing webhook automations, low-stock threshold triggers, and WhatsApp API event escalations.',
      mockup: (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
          <span className="text-[9px] font-mono text-zinc-400">Trigger: Stock &lt; 10</span>
          <span className="text-[9px] text-green-500 font-bold font-mono">→ Email Sent</span>
        </div>
      )
    },
    {
      title: 'Software Development',
      icon: <Code size={20} className="text-accent-violet" />,
      desc: 'Engineering scalable systems using React, Vite, TypeScript, Node.js, Express, PHP, and Bootstrap.',
      mockup: (
        <div className="flex items-center gap-1.5 mt-2 text-[9px] font-mono">
          <span className="text-zinc-500">const</span>
          <span className="text-blue-400">app</span>
          <span className="text-zinc-500">=</span>
          <span className="text-purple-400">express()</span>
        </div>
      )
    },
    {
      title: 'Digital Transformation',
      icon: <TrendingUp size={20} className="text-accent-violet" />,
      desc: 'Transitioning SMEs from manual logbooks and physical files into single-source multitenant cloud environments.',
      mockup: (
        <div className="w-full bg-zinc-950/30 h-2 rounded overflow-hidden mt-2 border dark:border-zinc-800">
          <div className="bg-accent-violet h-full w-[80%]" />
        </div>
      )
    }
  ];

  // Steps in Denis's Consulting Flow
  const consultingSteps = [
    {
      step: '1',
      title: 'Understand',
      desc: 'Audit manual workflows, ledger layouts, and current check procedures to identify system leaks.',
      icon: <SearchIcon size={16} />
    },
    {
      step: '2',
      title: 'Analyse',
      desc: 'Map data requirements, locate operational bottlenecks, and identify technology integrations.',
      icon: <BarChart size={16} />
    },
    {
      step: '3',
      title: 'Design',
      desc: 'Draft relational database schemas, entity diagrams, and UI/UX console wireframe mockups.',
      icon: <Laptop size={16} />
    },
    {
      step: '4',
      title: 'Build',
      desc: 'Write secure production code (React, Node, Swahili/English) using decoupled sandboxes.',
      icon: <Code size={16} />
    },
    {
      step: '5',
      title: 'Support',
      desc: 'Draft user manual guidelines, host staff onboarding classes, and monitor SLA compliance.',
      icon: <ShieldCheck size={16} />
    }
  ];

  // Categories of skills with percentages representing experience/mastery
  const skillsData = [
    {
      category: 'Technical Skills',
      skills: [
        { name: 'SQL & Database Design (PostgreSQL / MySQL)', val: 95 },
        { name: 'React (Vite / TypeScript / Hooks)', val: 90 },
        { name: 'Backend API Development (Node.js / Express)', val: 85 },
        { name: 'Web Engineering (PHP / Vanilla JS / CSS)', val: 88 },
        { name: 'ORM Database Mapping (Prisma / Seeding)', val: 92 }
      ]
    },
    {
      category: 'Business Skills',
      skills: [
        { name: 'Systems Analysis & Schema Modeling', val: 96 },
        { name: 'Customer Support Queue Routing & SLA Design', val: 95 },
        { name: 'Accounting Information Systems Integration', val: 88 },
        { name: 'Operational Risk Auditing & Access Controls', val: 90 },
        { name: 'SOP Requirements Documentation & Training', val: 85 }
      ]
    },
    {
      category: 'Tools & Systems',
      skills: [
        { name: 'Avaya Systems & Ticket Routers', val: 92 },
        { name: 'SAP Client Portals & CRM Databases', val: 85 },
        { name: 'Docker Containers & NGINX Deployments', val: 80 },
        { name: 'Excel Financial Modeling & Statistics', val: 90 },
        { name: 'Git Version Controls & Monorepos', val: 88 }
      ]
    },
    {
      category: 'Industries Understood',
      skills: [
        { name: 'Customer Service & Contact Operations', val: 95 },
        { name: 'Physical Security & Supervisory Audits', val: 90 },
        { name: 'Telecommunications Customer Databases', val: 88 },
        { name: 'Retail & POS Store Inventory systems', val: 92 },
        { name: 'Academic Records Management IT', val: 90 }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-28 text-left font-body relative overflow-hidden">
      <PageTitle
        title="About Denis Chamkaga | Systems & Database Consultant"
        description="Denis Chamkaga is a Business Information Technology Consultant with 8+ years of experience in operational audits, SLA support queue rules, and software engineering."
      />
      
      {/* Background radial blurs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent-violet/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent-violet/3 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* SECTION 1 — HERO INTRODUCTION (SaaS Style) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side Info */}
        <motion.div 
          className="lg:col-span-7 space-y-6"
          variants={heroStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={fadeUpVariants}
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-zinc-900 light:bg-slate-100 border dark:border-zinc-800 light:border-slate-200 text-xs font-semibold text-accent-violet uppercase tracking-wider font-display"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
            Executive Biography
          </motion.div>
          <motion.h1 
            variants={fadeUpVariants}
            custom={0.1}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold dark:text-white light:text-slate-800 tracking-tight leading-none font-display"
          >
            Denis Chamkaga
          </motion.h1>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.2}
            className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
          >
            I am a Business Information Technology Professional, Web Software Developer, and Systems Consultant. I specialize in bridging company workflows, database normalization, and automated CRM/POS systems to eliminate operational leaks.
          </motion.p>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.3}
            className="text-xs sm:text-sm dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body"
          >
            Rather than installing generic pages, my operational history—spanning physical access auditing, voice customer support, enterprise billing migrations, and computing engineering studies—enables me to design database structures that protect transaction integrity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0.4}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Button variant="primary" onClick={() => navigate(ROUTES.CONTACT)} rightIcon={<ArrowRight size={16} />}>
              Consult Denis
            </Button>
            <a 
              href={SOCIALS.whatsApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white text-xs font-semibold hover:border-accent-violet hover:text-accent-violet transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet font-body shadow-sm"
            >
              <svg className="w-4 h-4 fill-current text-green-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d={SOCIALS.whatsApp.svgPath} />
              </svg>
              <span>Quick Chat</span>
            </a>
          </motion.div>

          {/* Social Links Row */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0.5}
            className="flex items-center gap-3 pt-4 border-t dark:border-zinc-800/80 light:border-slate-200 w-fit"
          >
            {Object.values(SOCIALS).map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/30 light:bg-slate-50 text-zinc-400 transition-all duration-300 ${soc.colorClass} focus:outline-none focus:ring-2 focus:ring-accent-violet`}
                aria-label={`Connect on ${soc.name}`}
              >
                <svg className="w-4 h-4 fill-current" viewBox={soc.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
                  <path d={soc.svgPath} />
                </svg>
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side Portrait */}
        <motion.div 
          className="lg:col-span-5 relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-2 dark:border-zinc-800 light:border-slate-200 shadow-2xl bg-zinc-950">
            <AnimatedImage 
              src={IMAGES.about.portrait} 
              alt="Denis Chamkaga Portrait" 
              className="w-full h-full" 
              hoverZoom={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Metric Badge 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="absolute -top-4 -right-4 p-3.5 rounded-2xl glass-panel border dark:border-zinc-850 shadow-lg flex items-center gap-2.5 max-w-[160px]"
          >
            <div className="p-2 rounded-lg bg-accent-violet/10 text-accent-violet">
              <Award size={18} />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-sm font-extrabold dark:text-white light:text-slate-800">8+ Years</span>
              <span className="text-[9px] dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold">Operations</span>
            </div>
          </motion.div>

          {/* Floating Metric Badge 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="absolute bottom-6 -left-6 p-3.5 rounded-2xl glass-panel border dark:border-zinc-850 shadow-lg flex items-center gap-2.5 max-w-[170px]"
          >
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <Cpu size={18} />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-sm font-extrabold dark:text-white light:text-slate-800">Terrasafi</span>
              <span className="text-[9px] dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold">Future SaaS</span>
            </div>
          </motion.div>
        </motion.div>

      </section>

      {/* SECTION 2 — MY JOURNEY TIMELINE (Visual Career Stepping Stones) */}
      <section className="space-y-12 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100 relative">
        
        {/* Timeline Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-accent-violet animate-spin-slow" />
            <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Path of Growth</span>
          </div>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            The Stepping Stones of My Career
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            Follow my professional growth from access-control vigilance, to SLA queue configuration, to relational systems analysis, and product engineering.
          </p>
        </div>

        {/* Visual Milestone Timeline Loop */}
        <TimelineSection journeyMilestones={journeyMilestones} />

      </section>

      {/* SECTION 3 — WHAT I LEARNED (Premium Competency Cards) */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Competencies</span>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            What Operations Taught Me
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            Each role shaped my technology understanding. I build software from this bedrock of operational excellence:
          </p>
        </div>

        {/* Competencies Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {competencies.map((comp, idx) => (
            <MotionCard 
              key={idx}
              delay={idx * 0.08}
              className="p-6 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/30 light:bg-white hover:border-accent-violet transition-all duration-300 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-accent-violet/15 text-accent-violet shadow-sm">
                  {comp.icon}
                </div>
                <h3 className="font-extrabold text-sm dark:text-white light:text-slate-800 leading-tight">
                  {comp.title}
                </h3>
                <p className="text-xs dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">
                  {comp.desc}
                </p>
              </div>

              {/* Graphic element rendering */}
              <div className="pt-4 border-t dark:border-zinc-850/50 light:border-slate-100">
                {comp.mockup}
              </div>
            </MotionCard>
          ))}
        </div>

      </section>

      {/* SECTION 4 — MY CONSULTING PHILOSOPHY */}
      <section className="space-y-12 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Methodology</span>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            Consulting & Project Execution Flow
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            I approach systems deployment with a structured operational pipeline: Understand, Analyze, Design, Build, and Support.
          </p>
        </div>

        {/* Pipeline connectors layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch relative">
          {consultingSteps.map((step, idx) => (
            <MotionCard 
              key={idx}
              delay={idx * 0.08}
              enableHover={false}
              className="p-5 rounded-2xl border dark:border-zinc-800/60 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white hover:border-accent-violet/60 transition-colors shadow-sm flex flex-col justify-between relative group"
            >
              {/* Connector lines on Desktop */}
              {idx < consultingSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3.5 w-7 border-t-2 border-dashed dark:border-zinc-800 light:border-slate-200 z-10" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-accent-violet/10 text-accent-violet flex items-center justify-center font-bold text-xs font-display">
                    {step.step}
                  </span>
                  <div className="text-zinc-400 group-hover:text-accent-violet transition-colors">
                    {step.icon}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm dark:text-white light:text-slate-800 leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-xs dark:text-zinc-500 light:text-slate-500 font-body leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Status pill decoration */}
              <div className="mt-4 pt-3 border-t dark:border-zinc-850/40 light:border-slate-100 flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                <span>Phase 0{idx + 1}</span>
                <span className="text-accent-violet">Active</span>
              </div>
            </MotionCard>
          ))}
        </div>

      </section>

      {/* SECTION 5 — DASHBOARD-STYLE SKILLS PANEL */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Skills Assessment</span>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            Dashboard Skills & Metrics
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            Operational and programming skill benchmarks evaluated against commercial scopes and academic projects:
          </p>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillsData.map((cat, idx) => (
            <SkillsCard key={idx} category={cat.category} skills={cat.skills} />
          ))}
        </div>

      </section>

      {/* SECTION 6 — TERRASAFI FUTURE MOCKUP */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        
        {/* Left Side: Mockup details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-zinc-900 light:bg-slate-100 border dark:border-zinc-800 light:border-slate-200 text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
            Terrasafi T Ltd
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight leading-none font-display">
            Building the Future SME Platform
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            My future vision is centered on bootstrapping **Terrasafi T Ltd** into a clean, sustainable Swahili-English billing, POS, and CRM suite. Local Tanzanian SMEs should not rely on manual bookkeeping logs or disjointed chat systems.
          </p>

          {/* Pillars List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body leading-relaxed pt-2">
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">Innovation Lab:</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">Prototyping secure Swahili NLP and inventory algorithms.</span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">Software Company:</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">Deploying localized databases and multitenant business packages.</span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">Training Centre:</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">Offering operations and SLA customer training modules.</span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">Database Solutions:</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">Normalizing legacy spreadsheets into transaction-safe environments.</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="primary" onClick={() => navigate(ROUTES.FUTURE_VISION)} rightIcon={<ArrowRight size={14} />}>
              Explore Future Vision
            </Button>
          </div>
        </div>

        {/* Right Side: Image illustration frame */}
        <MotionCard 
          delay={0.1}
          enableHover={false}
          className="lg:col-span-5 relative rounded-3xl overflow-hidden border dark:border-zinc-800 light:border-slate-200 h-64 sm:h-80 bg-zinc-950 shadow-xl group"
        >
          <AnimatedImage 
            src={IMAGES.future.innovationLab} 
            alt="Terrasafi Future Innovation Lab" 
            className="w-full h-full opacity-85"
            hoverZoom={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
          
          <div className="absolute top-4 left-4 py-1.5 px-3 rounded-lg bg-zinc-950/80 text-[10px] text-white border border-white/10 uppercase tracking-widest font-semibold flex items-center gap-1.5 z-20">
            <Award size={12} className="text-accent-violet" />
            Active Sandbox
          </div>
        </MotionCard>

      </section>

    </div>
  );
};

// Simple inline search icon for consulting workflow step 1
const SearchIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default AboutPage;
