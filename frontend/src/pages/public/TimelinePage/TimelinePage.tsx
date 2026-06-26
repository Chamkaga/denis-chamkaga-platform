import React from 'react';
import { Calendar, GraduationCap, Award, Shield, Headphones, Cpu, Briefcase, ExternalLink, BookOpen, TrendingUp, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { IMAGES } from '../../../constants/images';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { heroStaggerContainer, fadeUpVariants, slideLeftVariants, slideRightVariants, lineGrowVariants } from '../../../lib/motion';
import { SecurexLogo, PCCILogo, YasLogo, UDSMLogo, UDCCLogo, TerrasafiLogo } from '../../../components/atoms/CompanyLogos/CompanyLogos';

export const TimelinePage: React.FC = () => {
  const milestones = [
    {
      year: '2015 – 2017',
      duration: '2 Years',
      role: 'Security Officer & Audit Coordinator',
      institution: 'Securex Africa',
      logo: <SecurexLogo />,
      image: IMAGES.timeline.security,
      website: 'https://securexafrica.com',
      responsibilities: [
        'Guarded critical entry pathways and patrolled commercial parameters under strict procedures.',
        'Audited manual guard registration logs and site checklists to trace security loopholes.',
        'Supervised night compliance rosters to verify proper incident tracking and access controls.'
      ],
      skillsGained: ['Access Auditing', 'Operations Discipline', 'Risk Analysis', 'Incident Management'],
      techLearned: ['Risk Logging Systems', 'Patrol Guard Hardware Systems'],
      achievement: 'Maintained 100% compliance rate on physical access registers across key commercial facilities.',
      impact: 'Prevented key operational vulnerabilities by enforcing hourly checkpoint log validations.',
      lessons: 'Vigilance is not a feeling, it\'s a procedural habit. If you miss the small checkpoints, the entire system becomes vulnerable.',
      type: 'work',
      icon: <Shield size={14} />
    },
    {
      year: '2017 – Present',
      duration: '8+ Years',
      role: 'Customer Service Professional',
      institution: 'PCCI Group',
      logo: <PCCILogo />,
      image: IMAGES.timeline.customerService,
      website: 'https://pcci-group.com',
      responsibilities: [
        'Configured ticketing routing rules and queue queues under strict customer agreements (SLA).',
        'Resolved complex digital channel inquiries (WhatsApp, Voice, Facebook) for tier-1 telecommunications clients.',
        'Audited daily queue logs to identify support bottlenecks and optimize response speeds.'
      ],
      skillsGained: ['SLA Compliance', 'Queue Optimization', 'Customer Support Strategy', 'CRM Management'],
      techLearned: ['Avaya Systems', 'Ticketing Databases', 'SAP Client Portals'],
      achievement: 'Received Top Performer Recognition for maintaining a 98%+ SLA response score across digital queues.',
      impact: 'Minimized queue response delays by configuring logical ticket routing pathways.',
      lessons: 'Behind every support ticket is a human voice waiting for clarity. Decoupled, automated routing systems build trust far faster than manual assignments.',
      type: 'work',
      icon: <Headphones size={14} />
    },
    {
      year: '2018 – 2021',
      duration: '3 Years',
      role: 'Business Systems Studies',
      institution: 'University of Dar es Salaam',
      logo: <UDSMLogo />,
      image: IMAGES.timeline.udcc,
      website: 'https://www.udsm.ac.tz',
      responsibilities: [
        'Studied relational database systems, corporate accounting models, and statistics.',
        'Formulated spreadsheet financial models and computed sales trend forecasts.',
        'Conducted systems analysis case studies analyzing corporate administrative structures.'
      ],
      skillsGained: ['Relational Database Modeling', 'Business Systems Analysis', 'Excel Financial Models', 'Statistics'],
      techLearned: ['Excel Financial Modeling', 'Relational Data Analysis'],
      achievement: 'Mastered double-entry ledgers and normalization rules to transition manual accounting safely.',
      impact: 'Bridged business operational theory with software modeling skills to prevent inventory leaks.',
      lessons: 'Accounting is the language of business, and databases are the translators. A poorly normalized database will eventually leak cash.',
      type: 'academic',
      icon: <GraduationCap size={14} />
    },
    {
      year: '2021 – 2025',
      duration: '4 Years',
      role: 'Diploma in Business Information Technology',
      institution: 'University of Dar es Salaam Computing Centre',
      logo: <UDCCLogo />,
      image: IMAGES.timeline.projects,
      website: 'https://www.ucc.co.tz',
      responsibilities: [
        'Designed custom normalized database schemas using MySQL and SQLite environments.',
        'Built full-stack web platforms using PHP, CSS, Bootstrap, and relational backends.',
        'Drafted systems requirement specifications (SRS) and defended BIT capstones.'
      ],
      skillsGained: ['Web Engineering', 'Fullstack Development', 'System Requirements', 'PHP & MySQL'],
      techLearned: ['PHP', 'MySQL', 'Bootstrap', 'Relational Databases'],
      achievement: 'Successfully built and defended a custom School Management System as a core graduation requirement.',
      impact: 'Proved that localized database systems successfully replace paper registers for SMEs.',
      lessons: 'A stable application is only as good as its underlying constraints. Strict schema design prevents years of debugging later on.',
      type: 'academic',
      icon: <GraduationCap size={14} />
    },
    {
      year: '2024 – 2025',
      duration: '1 Year',
      role: 'CRM Integration & Database Analyst',
      institution: 'Yas Tanzania',
      logo: <YasLogo />,
      image: IMAGES.timeline.development,
      website: 'https://www.yas.co.tz',
      responsibilities: [
        'Audited database record migration routines during the Tigo-to-Yas customer data transfer.',
        'Verified integration script logs and ran PostgreSQL schema verification checks.',
        'Audited data integration procedures to guarantee clean, duplicate-free customer profiles.'
      ],
      skillsGained: ['Data Migration Auditing', 'Schema Validation', 'API Verifications', 'CRM Integrations'],
      techLearned: ['PostgreSQL', 'API Integration', 'Migration Verification Scripts'],
      achievement: 'Validated customer records scripts with zero operational downtime for active lines during rebranding.',
      impact: 'Guaranteed customer profile continuity by validating SQL schemas prior to final production transfer.',
      lessons: 'Data migration is not just shifting rows; it is preserving histories. Rigorous PostgreSQL verification guarantees continuity of service.',
      type: 'work',
      icon: <Briefcase size={14} />
    },
    {
      year: '2025+',
      duration: 'Active',
      role: 'Founder & CEO (Future Vision)',
      institution: 'Terrasafi T Ltd',
      logo: <TerrasafiLogo />,
      image: IMAGES.timeline.futureVision,
      website: 'https://terrasafi.com',
      responsibilities: [
        'Bootstrapping clean, automated database software for local Tanzanian SMEs.',
        'Engineering lightweight monorepos with React, Node.js, and Prisma ORM mappings.',
        'Designing paperless workflow templates to secure inventory controls.'
      ],
      skillsGained: ['SaaS Strategy', 'Business Automation', 'Relational Systems Integration', 'React & Node.js'],
      techLearned: ['React / Vite', 'Node.js & Express API', 'PostgreSQL / Prisma ORM', 'Docker Containerization'],
      achievement: 'Laying the technical foundation to eliminate spreadsheet bottlenecks and manual list errors.',
      impact: 'Providing local entrepreneurs with tools to secure records, stop leaks, and exit manual entry books.',
      lessons: 'SaaS platforms scale when they are simple to use but engineered with uncompromising architectural discipline.',
      type: 'future',
      icon: <Cpu size={14} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left font-body">
      <PageTitle
        title="Career Journey | Denis Chamkaga"
        description="Denis Chamkaga's full career timeline — from Securex Africa to PCCI Group, Yas Tanzania, UDSM, UCC and Terrasafi."
      />

      {/* Header — staggered */}
      <motion.div className="space-y-4 max-w-3xl" variants={heroStaggerContainer} initial="hidden" animate="visible">
        <motion.span variants={fadeUpVariants} custom={0} className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display block">My Growth</motion.span>
        <motion.h1 variants={fadeUpVariants} custom={0.1} className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight">
          Career Timeline Case Studies
        </motion.h1>
        <motion.p variants={fadeUpVariants} custom={0.2} className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
          A visual chronicle of my career transitions from physical security operations to customer excellence strategy, and computing systems engineering.
        </motion.p>
      </motion.div>

      {/* Vertical Timeline wrapper — animated growing line */}
      <div className="relative ml-4 md:ml-6 space-y-16">
        {/* The growing vertical line */}
        <TimelineLine />

        {milestones.map((node, i) => (
          <TimelineCard key={i} node={node} index={i} />
        ))}
      </div>
    </div>
  );
};

// ── Growing timeline line ───────────────────────────────────────────────────
const TimelineLine: React.FC = () => {
  const { ref, isInView } = useScrollReveal({ threshold: 0.02, triggerOnce: true });
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={lineGrowVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="absolute left-0 top-0 bottom-0 w-0.5 dark:bg-zinc-800 light:bg-slate-200 origin-top"
    />
  );
};

// ── Individual timeline card ─────────────────────────────────────────────────
const TimelineCard: React.FC<{ node: ReturnType<typeof getMilestones>[0]; index: number }> = ({ node, index }) => {
  const { ref, isInView } = useScrollReveal({ threshold: 0.08 });
  const isLeft = index % 2 === 0;
  const variants = isLeft ? slideLeftVariants : slideRightVariants;

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={0}
      className="relative pl-8 sm:pl-10 text-left"
    >
      {/* Dot Node Indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          "absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 flex items-center justify-center dark:bg-primary-bg light:bg-light-bg",
          {
            "border-accent-violet text-accent-violet": node.type === 'work',
            "border-green-500 text-green-500": node.type === 'academic',
            "border-amber-500 text-amber-500": node.type === 'future',
          }
        )}
      >
      </motion.div>
      
      {/* Card Container */}
      <div className="p-6 sm:p-8 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-all duration-300 shadow-xl max-w-5xl group hover:shadow-accent-violet/5 space-y-6">
        
        {/* Top Row: Year and Type Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b dark:border-zinc-800/60 light:border-slate-100 pb-3">
          <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-accent-violet uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Calendar size={14} />
                    {node.year}
                  </span>
                  <span className="text-[10px] py-0.5 px-2.5 rounded-md dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600 font-semibold font-body">
                    Duration: {node.duration}
                  </span>
                </div>
                <span className={cn(
                  "text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  {
                    "bg-accent-violet/10 text-accent-violet": node.type === 'work',
                    "bg-green-500/10 text-green-500": node.type === 'academic',
                    "bg-amber-500/10 text-amber-500": node.type === 'future',
                  }
                )}>
                  {node.type}
                </span>
              </div>

              {/* Grid: Image on Left (Desktop), Details on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Image Block */}
                <div className="lg:col-span-4 relative rounded-xl overflow-hidden border dark:border-zinc-800 light:border-slate-200 h-44 bg-zinc-950">
                  <AnimatedImage 
                    src={node.image} 
                    alt={node.role} 
                    className="w-full h-full"
                    hoverZoom={true}
                  />
                  {/* Company Logo Badge */}
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-lg overflow-hidden bg-white/95 p-1 flex items-center justify-center border shadow-sm text-zinc-900">
                    {node.logo}
                  </div>
                </div>

          <div className="lg:col-span-8 space-y-4">
            <div>
              <h3 className="text-xl font-bold dark:text-white light:text-slate-800 leading-snug">{node.role}</h3>
              <h4 className="text-xs font-semibold dark:text-zinc-400 light:text-slate-500 font-body uppercase tracking-wider">{node.institution}</h4>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-[10px] dark:text-zinc-300 light:text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <CheckSquare size={12} className="text-accent-violet" /> Key Responsibilities:
              </span>
              <ul className="list-disc list-inside text-xs dark:text-zinc-400 light:text-slate-600 space-y-1 pl-1 leading-relaxed">
                {node.responsibilities.map((r, idx) => (<li key={idx}>{r}</li>))}
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-body leading-relaxed">
              <div className="p-3.5 rounded-xl dark:bg-zinc-950/40 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 space-y-1">
                <span className="font-extrabold text-[10px] dark:text-zinc-300 light:text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Award size={12} className="text-accent-violet" /> Achievement:
                </span>
                <p className="dark:text-zinc-400 light:text-slate-500 text-[11px]">{node.achievement}</p>
              </div>
              <div className="p-3.5 rounded-xl dark:bg-zinc-950/40 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 space-y-1">
                <span className="font-extrabold text-[10px] dark:text-zinc-300 light:text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={12} className="text-accent-violet" /> Business Impact:
                </span>
                <p className="dark:text-zinc-400 light:text-slate-500 text-[11px]">{node.impact}</p>
              </div>
              <div className="p-3.5 rounded-xl dark:bg-zinc-950/40 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 space-y-1 sm:col-span-2">
                <span className="font-extrabold text-[10px] dark:text-zinc-300 light:text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen size={12} className="text-accent-violet" /> Lesson Learned:
                </span>
                <p className="dark:text-zinc-400 light:text-slate-500 text-[11px]">{node.lessons}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="pt-4 border-t dark:border-zinc-800/40 light:border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-6 text-xs font-body">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold dark:text-zinc-300 light:text-slate-700 block mb-1">Skills Gained:</span>
              <div className="flex flex-wrap gap-1">
                {node.skillsGained.map((s) => (
                  <span key={s} className="text-[9px] font-semibold py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-semibold dark:text-zinc-300 light:text-slate-700 block mb-1">Technologies &amp; Systems:</span>
              <div className="flex flex-wrap gap-1">
                {node.techLearned.map((t) => (
                  <span key={t} className="text-[9px] font-semibold py-0.5 px-2 rounded-lg bg-accent-violet/10 text-accent-violet">{t}</span>
                ))}
              </div>
            </div>
          </div>
          {node.website && (
            <div className="shrink-0 pt-2 md:pt-0">
              <a
                href={node.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white dark:text-zinc-300 light:text-slate-700 hover:border-accent-violet hover:text-accent-violet transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet font-semibold text-[11px] shadow-sm"
                aria-label={`Visit official website for ${node.institution}`}
              >
                <span>Visit {node.institution}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// getMilestones return type helper
type MilestoneNode = {
  year: string; duration: string; role: string; institution: string;
  logo: React.ReactNode; image: string; website: string;
  responsibilities: string[]; skillsGained: string[]; techLearned: string[];
  achievement: string; impact: string; lessons: string;
  type: string; icon: React.ReactNode;
};
function getMilestones(): MilestoneNode[] { return []; }

export default TimelinePage;
