import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import { useUIStore } from '../../../store/useUIStore';
import { 
  heroStaggerContainer, 
  fadeUpVariants, 
  lineGrowVariants, 
  slideLeftVariants, 
  slideRightVariants 
} from '../../../lib/motion';

const RoadmapSection: React.FC<{ items: any[]; statusStyle: any; statusLabel: any; isSwahili: boolean }> = ({ items, statusStyle, statusLabel, isSwahili }) => {
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
                <span className="ml-auto text-[11px] font-bold dark:text-zinc-500 light:text-slate-400 uppercase tracking-widest">{isSwahili ? item.phaseSw : item.phase}</span>
              </div>
              <h3 className="font-bold text-lg dark:text-white light:text-slate-800 leading-tight">{item.title}</h3>
              <p className="text-sm dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">{item.desc}</p>
              <ul className="space-y-1.5 pt-1 text-left">
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
  const { i18n } = useTranslation();
  const isSwahili = i18n.language === 'sw';

  const concepts = [
    {
      title: isSwahili ? 'Maabara ya Ubunifu' : 'Innovation Lab',
      desc: isSwahili 
        ? 'Kufanya majaribio ya mifumo salama ya kiteknolojia, hifadhidata za RAG, na mifumo ya uchambuzi wa SME.' 
        : 'Prototyping sustainable tech frameworks, RAG databases, and SME analytics models.',
      image: IMAGES.future.innovationLab,
      icon: <Cpu size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Ofisi ya Baadaye' : 'Future Office',
      desc: isSwahili 
        ? 'Kituo cha ushirikiano cha uchambuzi vya mifumo ya ramani za hifadhidata na vipimo vya msaada wa CRM.' 
        : 'A collaborative systems analysis center mapping relational databases and CRM support metrics.',
      image: IMAGES.future.futureOffice,
      icon: <Building2 size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Kampuni ya Programu' : 'Software Company',
      desc: isSwahili 
        ? 'Mfumo wa kampuni wa Terrasafi T Ltd kukuza otomatiki ya uendeshaji kote Afrika Mashariki.' 
        : 'The corporate framework for Terrasafi T Ltd scaling operational automation across East Africa.',
      image: IMAGES.future.softwareCompany,
      icon: <Layers size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Timu ya Teknolojia' : 'Technology Team',
      desc: isSwahili 
        ? 'Kukuza vipaji vya ndani ya Tanzania katika uhandisi wa programu na ukaguzi wa hifadhidata.' 
        : 'Fostering local Tanzanian talent in software engineering and database auditing.',
      image: IMAGES.future.technologyTeam,
      icon: <Users size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Kituo cha Mafunzo' : 'Training Center',
      desc: isSwahili 
        ? 'Chuo cha mafunzo ya usaidizi kwa wateja kwa mtiririko wa tiketi za SLA na taratibu za uendeshaji.' 
        : 'Direct customer support training academy for SLA ticket workflows and operational procedures.',
      image: IMAGES.future.trainingCenter,
      icon: <Star size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Uatamiaji wa Biashara' : 'Business Incubation',
      desc: isSwahili 
        ? 'Kutoa ushauri wa mpango wa biashara wa hatua za kwanza na usanidi wa miundombinu ya IT kwa wajasiriamali.' 
        : 'Providing early-stage business plan advisory and IT infrastructure setups for entrepreneurs.',
      image: IMAGES.future.incubation,
      icon: <Globe size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Mageuzi ya Kidijitali' : 'Digital Transformation',
      desc: isSwahili 
        ? 'Kuondoa ufanisi mdogo wa daftari za mikono kwa kujenga hifadhidata zisizo na karatasi na dashibodi zilizounganishwa.' 
        : 'Eliminating manual ledger inefficiencies by building paperless relational databases and unified company dashboards.',
      image: IMAGES.future.transformation,
      icon: <Database size={18} className="text-accent-violet" />
    },
    {
      title: isSwahili ? 'Ukuaji wa Startup' : 'Startup Growth',
      desc: isSwahili 
        ? 'Kuwezesha mifano endelevu ya ukuaji wa uendeshaji kwa wajasiriamali wa Afrika Mashariki wenye programu thabiti.' 
        : 'Enabling sustainable operational scaling models for East African entrepreneurs with robust software suites.',
      image: IMAGES.future.startup,
      icon: <BarChart size={18} className="text-accent-violet" />
    }
  ];

  const roadmapItems = [
    {
      year: '2025',
      phase: 'Phase I',
      phaseSw: 'Awamu ya I',
      title: isSwahili ? 'Uzinduzi wa Jukwaa na Utendaji wa Sandbox' : 'Platform Launch & Sandbox Operations',
      desc: isSwahili 
        ? 'Kuweka Jukwaa la Chapa ya Denis Chamkaga. Kuthibitisha moduli za ujumuishaji wa CRM katika mazingira halisi ya uendeshaji.' 
        : 'Deploy Denis Chamkaga Brand Platform. Validate CRM lead pipeline modules in live operational settings.',
      status: 'active',
      milestones: isSwahili 
        ? ['Tovuti ya umma imezinduliwa', 'Msaidizi wa Denis yuko hewani', 'Njia ya kukubali ushauri ipo hai'] 
        : ['Public website launched', 'Denis Assistant interface live', 'Consulting intake pipeline active']
    },
    {
      year: '2025 – 2026',
      phase: 'Phase II',
      phaseSw: 'Awamu ya II',
      title: isSwahili ? 'Utendaji wa Ushauri wa Terrasafi' : 'Terrasafi Consulting Operations',
      desc: isSwahili 
        ? 'Kuzindua huduma maalumu za ukaguzi wa mifumo ya IT. Kuanza uundaji wa mifumo ya bili iliyojanibishwa kwa Kiswahili.' 
        : 'Launch specialized IT systems audit consultancies. Begin development on localized Swahili billing models.',
      status: 'planned',
      milestones: isSwahili 
        ? ['Mteja wa kwanza wa ushauri wa kulipia amekubaliwa', 'Moduli ya bili ya Swahili POS MVP ipo', 'Maktaba ya schema ya PostgreSQL imetolewa'] 
        : ['First paying consulting client onboarded', 'Swahili POS billing module MVP', 'PostgreSQL schema library released']
    },
    {
      year: '2026 – 2027',
      phase: 'Phase III',
      phaseSw: 'Awamu ya III',
      title: isSwahili ? 'WhatsApp API na Ujumuishaji wa Kazi' : 'WhatsApp API & Workflow Integrations',
      desc: isSwahili 
        ? 'Kuunganisha hifadhidata za moja kwa moja na uelekezaji wa tiketi za kiotomatiki na njia za arifa.' 
        : 'Integrate live databases with automated ticket escalation and notification channels.',
      status: 'planned',
      milestones: isSwahili 
        ? ['Vichochezi vya webhook vya WhatsApp API vimepelekwa', 'Huduma ya kiotomatiki ya SLA ipo hai', 'Mfumo wa arifa wa bidhaa kupungua'] 
        : ['WhatsApp API webhook triggers deployed', 'Automated SLA escalation service live', 'Inventory threshold notification system']
    },
    {
      year: '2027+',
      phase: 'Phase IV',
      phaseSw: 'Awamu ya IV',
      title: isSwahili ? 'SaaS Multitenant na Ukuaji' : 'Multitenant SaaS Scaling',
      desc: isSwahili 
        ? 'Kuzindua moduli za POS, hesabu ya bidhaa, na kurasa za wateja za SLA kwa biashara ndogo kote Afrika Mashariki.' 
        : 'Launch modular POS, inventory, and SLA customer portals for small businesses across East Africa.',
      status: 'vision',
      milestones: isSwahili 
        ? ['Dashibodi ya Terrasafi SaaS imezinduliwa', 'Jukwaa la soko la SME la Afrika Mashariki', 'Mikataba 10+ ya kampuni kubwa ipo hai'] 
        : ['Terrasafi SaaS dashboard launched', 'East Africa SME marketplace portal', '10+ enterprise contracts active']
    }
  ];

  const terrasafiFeatures = [
    {
      icon: <Zap size={20} className="text-accent-violet" />,
      title: isSwahili ? 'Uendeshaji wa Kiotomatiki' : 'Operational Automation',
      desc: isSwahili 
        ? 'Kuendesha stoki, bili, na uelekezaji wa tiketi kwa SMEs kiotomatiki' 
        : 'Automating stock, billing, and ticket routing for SMEs'
    },
    {
      icon: <Database size={20} className="text-accent-violet" />,
      title: isSwahili ? 'Uhandisi wa Hifadhidata' : 'Database Engineering',
      desc: isSwahili 
        ? 'Schema za PostgreSQL, vizuizi, na miundo iliyo tayari kwa ukaguzi' 
        : 'PostgreSQL schemas, constraints, and audit-ready designs'
    },
    {
      icon: <MessageSquare size={20} className="text-accent-violet" />,
      title: isSwahili ? 'Ujumuishaji wa WhatsApp' : 'WhatsApp Integration',
      desc: isSwahili 
        ? 'Njia za arifa za wateja zinazoendeshwa na API ya moja kwa moja' 
        : 'Direct API-driven customer notification pipelines'
    },
    {
      icon: <Rocket size={20} className="text-accent-violet" />,
      title: isSwahili ? 'Ushauri wa Startup' : 'Startup Advisory',
      desc: isSwahili 
        ? 'Ramani za barabara za IT na ushauri wa mifumo tangu siku ya kwanza' 
        : 'IT roadmaps and business systems consulting from day one'
    }
  ];

  const statusStyle: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    planned: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    vision: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20'
  };

  const statusLabel: Record<string, string> = {
    active: isSwahili ? 'Amilifu' : 'Active',
    planned: isSwahili ? 'Imepangwa' : 'Planned',
    vision: isSwahili ? 'Maono ya Muda Mrefu' : 'Long-Term Vision'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 text-left">
      <PageTitle
        title={isSwahili ? "Maono ya Mbeleni | Terrasafi T Ltd" : "Future Vision | Terrasafi T Ltd Roadmap"}
        description={isSwahili ? "Gundua maono ya baadaye ya Terrasafi T Ltd na ramani ya barabara ya kiteknolojia iliyoundwa na mshauri wa mifumo Denis Chamkaga." : "Explore the future vision of Terrasafi T Ltd and the long-term technical roadmap built by systems consultant Denis Chamkaga."}
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
            {isSwahili ? "Mkakati wa Muda Mrefu" : "Long-Term Strategy"}
          </motion.span>
          <motion.h1 
            variants={fadeUpVariants}
            custom={0.1}
            className="text-4xl sm:text-5xl font-extrabold dark:text-white light:text-slate-800 tracking-tight leading-tight font-display"
          >
            Terrasafi T Ltd —{' '}
            <span className="bg-gradient-to-r from-accent-violet to-purple-400 bg-clip-text text-transparent">
              {isSwahili ? "Maono ya Baadaye" : "The Future Vision"}
            </span>
          </motion.h1>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.2}
            className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
          >
            <strong className="dark:text-white light:text-slate-800">"Terra"</strong> (Dunia) +{' '}
            <strong className="dark:text-white light:text-slate-800">"Safi"</strong> ({isSwahili ? 'Kiswahili cha ' : 'Swahili for '}{' '}
            <em>Clean / Pure</em>). Terrasafi represents the future software company dedicated to
            building sustainable, robust, and clean digital systems for African SMEs.
          </motion.p>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.3}
            className="text-sm dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body"
          >
            {isSwahili 
              ? "Jukwaa la Chapa ya Denis Chamkaga linaweka misingi ya kiufundi na kiutendaji kwa mpito huu — likifanya kazi kama sandbox ya kujenga schema salama za DB, otomatiki za uendeshaji, na wasaidizi wa AI watakaokomaa kuwa moduli kamili za SaaS."
              : "The Denis Chamkaga Brand Platform lays the technical and operational foundations for this transition — acting as a sandbox for building secure DB schemas, workflow automations, and AI coordinators that will eventually mature into full SaaS modules."}
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
              {isSwahili ? "Anza Ushauri" : "Start a Consultation"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.ABOUT)}
              className="inline-flex items-center gap-2"
            >
              <ArrowRight size={16} />
              {isSwahili ? "Safari ya Denis" : "Denis's Journey"}
            </Button>
          </motion.div>

          {/* Social Follow Row */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0.5}
            className="pt-4 space-y-2"
          >
            <p className="text-xs dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold font-display">
              {isSwahili ? "Fuatilia Safari ya Terrasafi" : "Follow the Terrasafi Journey"}
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
              <div className="w-24 h-24 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-2xl ring-4 ring-accent-violet/20 overflow-hidden">
                <img src="/terrasafi-logo.png" alt="Terrasafi T Ltd logo" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                {isSwahili ? "hai" : "LIVE"}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-xl dark:text-white light:text-slate-800 tracking-tight">TERRASAFI T LTD</h3>
              <span className="text-xs dark:text-zinc-500 light:text-slate-500 uppercase tracking-widest font-semibold block mt-1 font-display">
                {isSwahili ? "Seti ya Teknolojia Endelevu · Tanzania" : "Sustainable Technology Suite · Tanzania"}
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
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            {isSwahili ? "Dhana za Miundombinu" : "Infrastructure Concepts"}
          </span>
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800 font-display">
            {isSwahili ? "Misingi ya Visual ya Terrasafi" : "Visual Foundations of Terrasafi"}
          </h2>
          <p className="text-sm dark:text-zinc-500 light:text-slate-500 font-body max-w-2xl">
            {isSwahili 
              ? "Vielelezo vya majaribio vinavyoonyesha ofisi ya baadaye ya ushirikiano, Maabara ya Ubunifu, kituo cha mafunzo, na vitengo vya uatamiaji wa biashara." 
              : "Mocked visuals illustrating the future corporate workspace, Innovation Lab, training center, and business incubation units."}
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
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            {isSwahili ? "Njia ya Muda" : "Timeline"}
          </span>
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800 font-display">
            {isSwahili ? "Safari ya Terrasafi ya Mbeleni" : "Terrasafi Journey Ahead"}
          </h2>
          <p className="text-sm dark:text-zinc-500 light:text-slate-500 font-body max-w-2xl">
            {isSwahili 
              ? "Mkakati wa awamu ukihama kutoka chapa ya ushauri hadi kampuni kamili ya programu ya SaaS inayohudumia Afrika Mashariki." 
              : "A phased strategy moving from a consulting brand to a full SaaS software company serving East Africa."}
          </p>
        </div>

        <RoadmapSection items={roadmapItems} statusStyle={statusStyle} statusLabel={statusLabel} isSwahili={isSwahili} />

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

          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            {isSwahili ? "Uko Tayari Ushirikiano?" : "Ready to Collaborate?"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            {isSwahili ? "Kuwa Sehemu ya Hadithi ya Terrasafi" : "Be Part of the Terrasafi Story"}
          </h2>
          <p className="max-w-2xl mx-auto text-base dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
            {isSwahili 
              ? "Ikiwa wewe ni SME unayetaka kuweka shughuli zako kidijitali, msanidi programu unayevutiwa na ushirikiano, au mwekezaji anayechunguza fursa za SaaS za Afrika Mashariki — Denis yuko tayari kuzungumza." 
              : "Whether you are an SME looking to digitize your operations, a developer interested in collaboration, or an investor exploring East African SaaS opportunities — Denis is ready to talk."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Button
              variant="primary"
              size="md"
              onClick={() => useUIStore.getState().toggleChat(true)}
              className="inline-flex items-center gap-2"
            >
              <MessageSquare size={18} />
              {isSwahili ? "Fungua Msaidizi wa Denis" : "Open Denis Assistant"}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(ROUTES.CONTACT)}
              className="inline-flex items-center gap-2"
            >
              {isSwahili ? "Tuma Ujumbe wa Moja kwa Moja" : "Send a Direct Message"}
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(ROUTES.INNOVATION)}
              className="inline-flex items-center gap-2 border-accent-violet/60 text-accent-violet hover:bg-accent-violet/10"
            >
              {isSwahili ? "Kagua Maabara ya Majaribio" : "Explore Innovation Lab"}
              <ArrowRight size={16} />
            </Button>
          </div>

          {/* Social row */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t dark:border-zinc-800/60 light:border-slate-200 mt-4 relative z-10">
            <span className="text-xs dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold font-display">
              {isSwahili ? "Mshauri Denis" : "Follow Denis"}
            </span>
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
