import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Globe,
  BarChart,
  Users,
  Cpu,
  Database,
  Layers,
  Building2,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Star,
  Zap
} from 'lucide-react';
import { IMAGES } from '../../../constants/images';
import { SOCIALS } from '../../../constants/socials';
import { ROUTES } from '../../../config/routes';
import { Button } from '../../../components/atoms/Button';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { 
  heroStaggerContainer, 
  fadeUpVariants, 
  lineGrowVariants, 
  slideLeftVariants, 
  slideRightVariants 
} from '../../../lib/motion';

const RoadmapSection: React.FC<{ items: any[]; statusStyle: any; statusLabel: any }> = ({ items, statusStyle, statusLabel }) => {
  const { ref: containerRef, isInView } = useScrollReveal({ threshold: 0.05 });

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className="relative space-y-0">
      {/* Vertical connecting line */}
      <motion.div 
        variants={lineGrowVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="absolute left-[calc(3rem-1px)] top-8 bottom-8 w-0.5 bg-accent-violet/60 origin-top hidden md:block" 
      />

      {items.map((item, i) => {
        const isEven = i % 2 === 0;
        const cardVariants = isEven ? slideLeftVariants : slideRightVariants;

        return (
          <motion.div 
            key={i} 
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={i * 0.12}
            className="relative flex flex-col md:flex-row gap-6 md:gap-10 p-6 group"
          >
            {/* Phase circle */}
            <div className="relative hidden md:flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 ${
                item.status === 'active'
                  ? 'border-green-500 bg-green-500/10 text-green-500'
                  : item.status === 'planned'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : 'border-accent-violet bg-accent-violet/10 text-accent-violet'
              } bg-white dark:bg-zinc-950 shadow-sm`}>
                {i + 1}
              </div>
            </div>

            {/* Card */}
            <div className="flex-1 p-6 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-all duration-300 space-y-4 text-left shadow-md hover:shadow-accent-violet/5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl font-extrabold text-accent-violet font-display">{item.year}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusStyle[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
                <span className="ml-auto text-[11px] font-bold dark:text-zinc-500 light:text-slate-400 uppercase tracking-widest">{item.phase}</span>
              </div>
              <h3 className="font-bold text-lg dark:text-white light:text-slate-800 leading-tight">{item.title}</h3>
              <p className="text-sm dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">{item.desc}</p>
              <ul className="space-y-1.5 pt-1">
                {item.milestones.map((m: string, j: number) => (
                  <li key={j} className="flex items-start gap-2 text-xs dark:text-zinc-400 light:text-slate-600">
                    <CheckCircle size={12} className={`shrink-0 mt-0.5 ${item.status === 'active' ? 'text-green-500' : 'text-accent-violet'}`} />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export const FutureVisionPage: React.FC = () => {
  const navigate = useNavigate();

  const concepts = [
    {
      title: 'Innovation Lab',
      desc: 'Prototyping sustainable tech frameworks, RAG databases, and SME analytics models.',
      image: IMAGES.future.innovationLab,
      icon: <Cpu size={18} className="text-accent-violet" />
    },
    {
      title: 'Future Office',
      desc: 'A collaborative systems analysis center mapping relational databases and CRM support metrics.',
      image: IMAGES.future.futureOffice,
      icon: <Building2 size={18} className="text-accent-violet" />
    },
    {
      title: 'Software Company',
      desc: 'The corporate framework for Terrasafi T Ltd scaling operational automation across East Africa.',
      image: IMAGES.future.softwareCompany,
      icon: <Layers size={18} className="text-accent-violet" />
    },
    {
      title: 'Technology Team',
      desc: 'Fostering local Tanzanian talent in software engineering and database auditing.',
      image: IMAGES.future.technologyTeam,
      icon: <Users size={18} className="text-accent-violet" />
    },
    {
      title: 'Training Center',
      desc: 'Direct customer support training academy for SLA ticket workflows and operational procedures.',
      image: IMAGES.future.trainingCenter,
      icon: <Star size={18} className="text-accent-violet" />
    },
    {
      title: 'Business Incubation',
      desc: 'Providing early-stage business plan advisory and IT infrastructure setups for entrepreneurs.',
      image: IMAGES.future.incubation,
      icon: <Globe size={18} className="text-accent-violet" />
    },
    {
      title: 'Digital Transformation',
      desc: 'Eliminating manual ledger inefficiencies by building paperless relational databases and unified company dashboards.',
      image: IMAGES.future.transformation,
      icon: <Database size={18} className="text-accent-violet" />
    },
    {
      title: 'Startup Growth',
      desc: 'Enabling sustainable operational scaling models for East African entrepreneurs with robust software suites.',
      image: IMAGES.future.startup,
      icon: <BarChart size={18} className="text-accent-violet" />
    }
  ];

  const roadmapItems = [
    {
      year: '2025',
      phase: 'Phase I',
      title: 'Platform Launch & Sandbox Operations',
      desc: 'Deploy Denis Chamkaga Brand Platform. Validate CRM lead pipeline modules in live operational settings.',
      status: 'active',
      milestones: ['Public website launched', 'Denis Assistant interface live', 'Consulting intake pipeline active']
    },
    {
      year: '2025 – 2026',
      phase: 'Phase II',
      title: 'Terrasafi Consulting Operations',
      desc: 'Launch specialized IT systems audit consultancies. Begin development on localized Swahili billing models.',
      status: 'planned',
      milestones: ['First paying consulting client onboarded', 'Swahili POS billing module MVP', 'PostgreSQL schema library released']
    },
    {
      year: '2026 – 2027',
      phase: 'Phase III',
      title: 'WhatsApp API & Workflow Integrations',
      desc: 'Integrate live databases with automated ticket escalation and notification channels.',
      status: 'planned',
      milestones: ['WhatsApp API webhook triggers deployed', 'Automated SLA escalation service live', 'Inventory threshold notification system']
    },
    {
      year: '2027+',
      phase: 'Phase IV',
      title: 'Multitenant SaaS Scaling',
      desc: 'Launch modular POS, inventory, and SLA customer portals for small businesses across East Africa.',
      status: 'vision',
      milestones: ['Terrasafi SaaS dashboard launched', 'East Africa SME marketplace portal', '10+ enterprise contracts active']
    }
  ];

  const terrasafiFeatures = [
    {
      icon: <Zap size={20} className="text-accent-violet" />,
      title: 'Operational Automation',
      desc: 'Automating stock, billing, and ticket routing for SMEs'
    },
    {
      icon: <Database size={20} className="text-accent-violet" />,
      title: 'Database Engineering',
      desc: 'PostgreSQL schemas, constraints, and audit-ready designs'
    },
    {
      icon: <MessageSquare size={20} className="text-accent-violet" />,
      title: 'WhatsApp Integration',
      desc: 'Direct API-driven customer notification pipelines'
    },
    {
      icon: <Rocket size={20} className="text-accent-violet" />,
      title: 'Startup Advisory',
      desc: 'IT roadmaps and business systems consulting from day one'
    }
  ];

  const statusStyle: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    planned: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    vision: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20'
  };

  const statusLabel: Record<string, string> = {
    active: 'Active',
    planned: 'Planned',
    vision: 'Long-Term Vision'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 text-left">
      <PageTitle
        title="Future Vision | Terrasafi T Ltd Roadmap"
        description="Explore the future vision of Terrasafi T Ltd and the long-term technical roadmap built by systems consultant Denis Chamkaga."
      />

      {/* ── Section 1: Hero ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Staggered entrance */}
        <motion.div 
          className="lg:col-span-7 space-y-6"
          variants={heroStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            variants={fadeUpVariants}
            custom={0}
            className="inline-block text-xs font-semibold text-accent-violet uppercase tracking-wider font-display"
          >
            Long-Term Strategy
          </motion.span>
          <motion.h1 
            variants={fadeUpVariants}
            custom={0.1}
            className="text-4xl sm:text-5xl font-extrabold dark:text-white light:text-slate-800 tracking-tight leading-tight font-display"
          >
            Terrasafi T Ltd —{' '}
            <span className="bg-gradient-to-r from-accent-violet to-purple-400 bg-clip-text text-transparent">
              The Future Vision
            </span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.2}
            className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
          >
            <strong className="dark:text-white light:text-slate-800">"Terra"</strong> (Earth) +{' '}
            <strong className="dark:text-white light:text-slate-800">"Safi"</strong> (Swahili for{' '}
            <em>Clean / Pure</em>). Terrasafi represents the future software company dedicated to
            building sustainable, robust, and clean digital systems for African SMEs.
          </motion.p>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.3}
            className="text-sm dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body"
          >
            The Denis Chamkaga Brand Platform lays the technical and operational foundations for
            this transition — acting as a sandbox for building secure DB schemas, workflow
            automations, and AI coordinators that will eventually mature into full SaaS modules.
          </motion.p>
          
          <motion.div 
            variants={fadeUpVariants}
            custom={0.4}
            className="flex flex-wrap gap-3 pt-2"
          >
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.DENIS_ASSISTANT)}
              className="inline-flex items-center gap-2"
            >
              <MessageSquare size={16} />
              Start a Consultation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.ABOUT)}
              className="inline-flex items-center gap-2"
            >
              <ArrowRight size={16} />
              Denis's Journey
            </Button>
          </motion.div>

          {/* Social Follow Row */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0.5}
            className="pt-4 space-y-2"
          >
            <p className="text-xs dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold font-display">
              Follow the Terrasafi Journey
            </p>
            <div className="flex items-center gap-3">
              {Object.values(SOCIALS).map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow on ${soc.name}`}
                  className={`p-2.5 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/30 light:bg-slate-50 text-zinc-400 transition-all duration-300 ${soc.colorClass} focus:outline-none focus:ring-2 focus:ring-accent-violet shadow-sm hover:scale-105`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox={soc.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
                    <path d={soc.svgPath} />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Terrasafi Brand Card */}
        <motion.div 
          className="lg:col-span-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="p-8 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/60 light:bg-slate-50 text-center space-y-6 glass-panel shadow-xl">
            <div className="relative mx-auto">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-violet to-purple-500 mx-auto flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-accent-violet/20">
                T
              </div>
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                LIVE
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-xl dark:text-white light:text-slate-800 tracking-tight">TERRASAFI T LTD</h3>
              <span className="text-xs dark:text-zinc-500 light:text-slate-500 uppercase tracking-widest font-semibold block mt-1 font-display">
                Sustainable Technology Suite · Tanzania
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {terrasafiFeatures.map((f, i) => (
                <div key={i} className="p-3 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white text-left space-y-1.5 hover:border-accent-violet transition-colors">
                  {f.icon}
                  <p className="text-xs font-bold dark:text-white light:text-slate-800">{f.title}</p>
                  <p className="text-[10px] dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </section>

      {/* ── Section 2: Visual Concepts Grid ─────────────────────────── */}
      <section className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Infrastructure Concepts</span>
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800 font-display">
            Visual Foundations of Terrasafi
          </h2>
          <p className="text-sm dark:text-zinc-500 light:text-slate-500 font-body max-w-2xl">
            Mocked visuals illustrating the future corporate workspace, Innovation Lab, training center, and business incubation units.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {concepts.map((c, i) => (
            <MotionCard
              key={i}
              delay={i * 0.06}
              className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-md hover:border-accent-violet flex flex-col justify-between"
            >
              <div className="h-44 bg-zinc-950 overflow-hidden relative">
                <AnimatedImage 
                  src={c.image} 
                  alt={c.title} 
                  className="w-full h-full" 
                  hoverZoom={true} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
                  <div className="p-1 bg-zinc-900/80 rounded-md backdrop-blur-sm">{c.icon}</div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow">{c.title}</span>
                </div>
              </div>
              <div className="p-4 text-left flex-grow">
                <p className="text-xs dark:text-zinc-500 light:text-slate-500 font-body leading-relaxed">{c.desc}</p>
              </div>
            </MotionCard>
          ))}
        </div>
      </section>

      {/* ── Section 3: Roadmap ───────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Timeline</span>
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800 font-display">
            Terrasafi Journey Ahead
          </h2>
          <p className="text-sm dark:text-zinc-500 light:text-slate-500 font-body max-w-2xl">
            A phased strategy moving from a consulting brand to a full SaaS software company serving East Africa.
          </p>
        </div>

        <RoadmapSection items={roadmapItems} statusStyle={statusStyle} statusLabel={statusLabel} />

      </section>

      {/* ── Section 4: Final CTA ─────────────────────────────────────── */}
      <section>
        <MotionCard 
          delay={0.1}
          enableHover={false}
          className="relative rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-slate-50 p-10 sm:p-14 overflow-hidden text-center space-y-6 shadow-xl"
        >
          {/* Ambient gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 via-transparent to-purple-500/5 pointer-events-none" />

          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">Ready to Collaborate?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            Be Part of the Terrasafi Story
          </h2>
          <p className="max-w-2xl mx-auto text-base dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
            Whether you are an SME looking to digitize your operations, a developer interested in collaboration,
            or an investor exploring East African SaaS opportunities — Denis is ready to talk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(ROUTES.DENIS_ASSISTANT)}
              className="inline-flex items-center gap-2"
            >
              <MessageSquare size={18} />
              Open Denis Assistant
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(ROUTES.CONTACT)}
              className="inline-flex items-center gap-2"
            >
              Send a Direct Message
              <ArrowRight size={16} />
            </Button>
          </div>

          {/* Social row */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t dark:border-zinc-800/60 light:border-slate-200 mt-4 relative z-10">
            <span className="text-xs dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold font-display">Follow Denis</span>
            {Object.values(SOCIALS).map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Denis on ${soc.name}`}
                className={`p-2 rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/30 light:bg-white text-zinc-400 transition-all duration-300 ${soc.colorClass} focus:outline-none focus:ring-2 focus:ring-accent-violet hover:scale-110`}
              >
                <svg className="w-4 h-4 fill-current" viewBox={soc.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
                  <path d={soc.svgPath} />
                </svg>
              </a>
            ))}
            <a
              href="https://terrasafi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-violet font-semibold hover:underline ml-2 font-body"
            >
              terrasafi.com <ExternalLink size={11} />
            </a>
          </div>
        </MotionCard>
      </section>

    </div>
  );
};

export default FutureVisionPage;
