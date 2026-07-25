import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowRight, 
  Server, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Laptop,
  Database,
  Smartphone,
  Zap,
  BarChart,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/atoms/Button';
import { ROUTES } from '../../../config/routes';
import { IMAGES } from '../../../constants/images';
import { SOCIALS } from '../../../constants/socials';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useCountUp } from '../../../hooks/useCountUp';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { heroStaggerContainer, fadeUpVariants, staggerContainer } from '../../../lib/motion';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../services/api';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useUIStore } from '../../../store/useUIStore';

// ── Animated stat item ────────────────────────────────────────────────────────
const StatItem: React.FC<{ target: number; suffix: string; label: string; delay?: number }> = ({
  target, suffix, label, delay = 0
}) => {
  const { display, ref } = useCountUp({ target, suffix, duration: 1.6 });
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={fadeUpVariants}
      custom={delay}
      className="text-center space-y-2 border-r last:border-0 dark:border-zinc-800 light:border-slate-200"
    >
      <span className="block text-3xl sm:text-4xl font-extrabold dark:text-white light:text-slate-800">{display}</span>
      <span className="block text-xs sm:text-sm dark:text-zinc-500 light:text-slate-500 font-medium">{label}</span>
    </motion.div>
  );
};

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { toggleChat } = useUIStore();
  const navigate = useNavigate();
  const { ref: statsRef, isInView: statsInView } = useScrollReveal({ threshold: 0.2 });
  const { ref: pillarsRef, isInView: pillarsInView } = useScrollReveal({ threshold: 0.1 });
  const { ref: journeyRef, isInView: journeyInView } = useScrollReveal({ threshold: 0.1 });
  const { ref: capabilitiesRef, isInView: capabilitiesInView } = useScrollReveal({ threshold: 0.1 });

  const { data: siteSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => publicApi.getSettings(),
    staleTime: Infinity, // Caches site configurations permanently during the session
  });

  const expYears = siteSettings?.years_experience ? parseInt(siteSettings.years_experience) : 8;
  const completedProj = siteSettings?.projects_completed ? parseInt(siteSettings.projects_completed) : 20;
  const happyClients = siteSettings?.clients_served ? parseInt(siteSettings.clients_served) : 50;

  const socialLinks = [
    ...Object.values(SOCIALS).map((soc) => ({
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox={soc.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
          <path d={soc.svgPath} />
        </svg>
      ),
      href: soc.url,
      label: soc.name,
      colorClass: soc.colorClass,
    })),
    {
      icon: <Mail size={20} />,
      href: 'mailto:denischamkaga@gmail.com',
      label: 'Email',
      colorClass: 'hover:text-accent-violet',
    },
  ];

  const statsData = [
    { target: expYears,   suffix: '+',  labelKey: 'hero.expYears' },
    { target: completedProj,  suffix: '+',  labelKey: 'hero.projectsCompleted' },
    { target: happyClients,  suffix: '+',  labelKey: 'hero.happyClients' },
    { target: 100, suffix: '+',  labelKey: 'hero.systemsTrained' },
  ];

  const businessPillars = [
    { title: t('businessModel.softwareDev'),     desc: t('businessModel.softwareDevDesc'),     icon: <Server className="text-accent-violet shrink-0" size={24} /> },
    { title: t('businessModel.businessSystems'), desc: t('businessModel.businessSystemsDesc'), icon: <Briefcase className="text-accent-violet shrink-0" size={24} /> },
    { title: t('businessModel.training'),        desc: t('businessModel.trainingDesc'),        icon: <GraduationCap className="text-accent-violet shrink-0" size={24} /> },
    { title: t('businessModel.consulting'),      desc: t('businessModel.consultingDesc'),      icon: <CheckCircle2 className="text-accent-violet shrink-0" size={24} /> },
  ];

  const journeySteps = [
    { 
      step: '01', 
      title: language === 'sw' ? 'Tambua Mapungufu ya Kiutendaji' : 'Outline Operational Gaps', 
      desc: language === 'sw' ? 'Zungumza na Denis Assistant kueleza changamoto za mikono, makosa ya leja, au uvujaji wa stoo.' : 'Engage with Denis Assistant to describe manual workflow bottlenecks, duplicate entries, or inventory leaks.' 
    },
    { 
      step: '02', 
      title: language === 'sw' ? 'Msaidizi Anarekodi Mahitaji' : 'Assistant Logs Parameters', 
      desc: language === 'sw' ? 'Msaidizi anakusanya maelezo yako na kupanga mahitaji kwenye mfumo thabiti wa hifadhidata na CRM.' : 'The digital coordinator compiles your inputs, framing requirements around standard databases and CRM/POS.' 
    },
    { 
      step: '03', 
      title: language === 'sw' ? 'Uchambuzi wa Mwanzo Imekamilika' : 'Consulting Intake Complete', 
      desc: language === 'sw' ? 'Wasifu wa mahitaji unaandaliwa kikamilifu kwa ajili ya ushauri wa moja kwa moja na Denis.' : 'Intake profiles are compiled. The assistant schedules a smooth path for personal coordination.' 
    },
    { 
      step: '04', 
      title: language === 'sw' ? 'Denis Anajiunga Moja kwa Moja' : 'Denis Personally Joins', 
      desc: language === 'sw' ? 'Denis anajiunga nawe 1-on-1 kukagua maelezo, kupanga muundo wa mfumo, na kuainisha wigo wa mradi.' : 'Denis connects 1-on-1 to audit details, draft the relational schema design, and outline custom scopes.' 
    },
    { 
      step: '05', 
      title: language === 'sw' ? 'Uwekaji wa Mfumo na Usaidizi' : 'Systems Deployment & SLA', 
      desc: language === 'sw' ? 'Denis anatengeneza na kuanzisha mfumo pamoja na kutoa mafunzo kwa timu yako.' : 'Denis codes, deploys the product locally, and holds capacity building classes for staff onboarding.' 
    }
  ];

  const capabilities = [
    { 
      title: language === 'sw' ? 'Mkakati wa Biashara' : 'Business Strategy', 
      desc: language === 'sw' ? 'Kukagua mahitaji, vikwazo vya kiutendaji, na makadirio ya fedha kabla ya kuandika kodi kuzuia hasara.' : 'Audit demand, structural constraints, and cash projections before writing code to prevent waste.', 
      icon: <TrendingUp size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Mifumo ya CRM' : 'CRM Systems', 
      desc: language === 'sw' ? 'Kupanga arifa za huduma kwa wateja, ufuatiliaji wa tiketi za usaidizi, na kupunguza upotevu wa wateja.' : 'Configure automatic queue routing, SLA escalations, and customer feedback metrics to reduce churn.', 
      icon: <MessageSquare size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Programu za Mauzo (POS)' : 'POS Solutions', 
      desc: language === 'sw' ? 'Kusimamia zamu za makasiriki, kulinda vituo vya malipo, kuchapa risiti, na kuzuia uvujaji wa pesa.' : 'Log cashier shifts, secure payment points, print receipt logs, and eliminate sales leakage.', 
      icon: <Laptop size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Usimamizi wa Stoo' : 'Inventory Management', 
      desc: language === 'sw' ? 'Kufuatilia viwango vya bidhaa stoo na kuweka arifa za kiotomatiki wakati bidhaa zinapoisha.' : 'Monitor active stock levels, create automatic low-stock alerts, and verify stock audits.', 
      icon: <Briefcase size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Mifumo ya Hifadhidata' : 'Database Systems', 
      desc: language === 'sw' ? 'Kujenga muundo thabiti wa hifadhidata (PostgreSQL/MySQL) unaolinda usalama na uadilifu wa data.' : 'Structure clean schema constraints (PostgreSQL/MySQL) ensuring transaction logs integrity.', 
      icon: <Database size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Utengenezaji wa Tovuti' : 'Website Development', 
      desc: language === 'sw' ? 'Kutengeneza tovuti zenye kasi na SEO zinazoeleza thamani ya biashara na kuleta wateja wapya.' : 'Build responsive, SEO-optimized web engines that explain values, answer FAQs, and generate leads.', 
      icon: <Laptop size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Programu za Simu' : 'Mobile Solutions', 
      desc: language === 'sw' ? 'Kuhakikisha wafanyakazi wa nyanjani wanaweza kukagua taarifa na kupakia stoo kupitia simu.' : 'Deploy customized setups allowing field employees to verify logs and upload stock levels remotely.', 
      icon: <Smartphone size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Uotomatishaji wa Michakato' : 'Workflow Automation', 
      desc: language === 'sw' ? 'Kuandika triggers na API routing rules kufanya kazi za kujirudia kiotomatiki papo hapo.' : 'Write strict database triggers and API routing rules to run repetitive operational steps instantly.', 
      icon: <Zap size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Uchambuzi wa Biashara' : 'Business Analytics', 
      desc: language === 'sw' ? 'Kukusanya taarifa za miamala, kasi ya usaidizi, na stoo kwenye dashibodi moja ya utawala.' : 'Summarize transactions, SLA ticketing speeds, and stock changes onto centralized admin tables.', 
      icon: <BarChart size={20} className="text-accent-violet" /> 
    },
    { 
      title: language === 'sw' ? 'Akili Bandia ya Biashara' : 'AI Business Intelligence', 
      desc: language === 'sw' ? 'Kusafisha na kuchambua data yako kubaini mwelekeo wa ukuaji wa biashara ukitumia AI na RAG.' : 'Clean, normalize, and query your database to locate growth patterns and configure RAG triggers.', 
      icon: <Cpu size={20} className="text-accent-violet" /> 
    }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      <PageTitle
        title="Denis Chamkaga | Web Software Developer"
        description="Denis Chamkaga is a Business Information Technology graduate and Web Software Developer based in Tanzania. He builds practical software solutions that help businesses simplify operations."
      />

      {/* ── 1. Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left — staggered text entrance */}
          <motion.div
            className="lg:col-span-7 text-left space-y-6"
            variants={heroStaggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.span
              variants={fadeUpVariants}
              custom={0}
              className="inline-block text-sm font-semibold tracking-wider uppercase text-accent-violet light:text-light-accent font-display"
            >
              {t('hero.subtitle')}
            </motion.span>

            {/* Heading */}
            <motion.h1
              variants={fadeUpVariants}
              custom={0.1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight dark:text-white light:text-slate-800 leading-tight"
            >
              {t('hero.titlePrefix')}{' '}
              <span className="block dark:text-transparent bg-clip-text bg-gradient-to-r dark:from-accent-violet dark:to-purple-400 light:text-light-accent">
                {t('hero.name')}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUpVariants}
              custom={0.2}
              className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 max-w-xl font-body leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUpVariants} custom={0.3} className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.CONTACT)} rightIcon={<ArrowRight size={18} />}>
                {language === 'sw' ? 'Tufanye Kazi Pamoja' : "Let's Work Together"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => {
                  toggleChat(true);
                }}
              >
                {language === 'sw' ? 'Ongea na Msaidizi' : 'Talk with Assistant'}
              </Button>
            </motion.div>

            {/* Social icons */}
            <motion.div
              variants={fadeUpVariants}
              custom={0.4}
              className="flex items-center gap-3 pt-4 border-t dark:border-zinc-800/80 light:border-slate-200 w-fit"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg dark:bg-zinc-900/60 light:bg-slate-100 dark:text-zinc-400 light:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-violet ${social.colorClass}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — portrait with fade-in */}
          <motion.div
            className="lg:col-span-5 flex justify-center items-center relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 rounded-full dark:bg-accent-violet/20 blur-3xl" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dashed dark:border-accent-violet/40 light:border-light-accent/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 dark:border-zinc-800 light:border-white shadow-2xl bg-zinc-950">
                <AnimatedImage src={IMAGES.hero.portrait} alt="Denis Chamkaga Portrait" className="w-full h-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Animated Stats Row ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={statsRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={statsInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl border glass-panel shadow-lg"
        >
          {statsData.map((s, i) => (
            <StatItem key={i} target={s.target} suffix={s.suffix} label={t(s.labelKey)} delay={i * 0.1} />
          ))}
        </motion.div>
      </section>

      {/* ── 3. Business Model Pillars ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800">{t('businessModel.title')}</h2>
          <p className="text-sm sm:text-base dark:text-zinc-400 light:text-slate-500 max-w-2xl leading-relaxed">
            {t('businessModel.description')}
          </p>
        </div>

        <motion.div
          ref={pillarsRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={pillarsInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {businessPillars.map((pillar, i) => (
            <MotionCard
              key={i}
              delay={i * 0.08}
              className="p-6 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-colors duration-300 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="p-3 w-fit rounded-lg bg-accent-violet/10"
                >
                  {pillar.icon}
                </motion.div>
                <h3 className="font-semibold text-base dark:text-white light:text-slate-800">{pillar.title}</h3>
              </div>
              <p className="text-xs dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">{pillar.desc}</p>
            </MotionCard>
          ))}
        </motion.div>
      </section>

      {/* ── 4. The Conversation Journey Visual Flow ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 border-t dark:border-zinc-800/60 light:border-slate-100 pt-10 text-left">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800">
            {language === 'sw' ? 'Mchakato wa Ushauri Unavyofanya Kazi' : 'How Consultation Works'}
          </h2>
          <p className="text-sm sm:text-base dark:text-zinc-400 light:text-slate-500 max-w-2xl leading-relaxed font-body">
            {language === 'sw' 
              ? 'Ramani rahisi inayoonyesha jinsi unavyoshirikiana na Denis na Msaidizi wa Kidijitali kutoka kwenye utambuzi wa mapungufu mpaka kutekeleza mfumo.'
              : 'A customer-friendly roadmap detailing how you collaborate with Denis and the digital representative from diagnostic discovery to system deployment.'}
          </p>
        </div>

        <motion.div 
          ref={journeyRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={journeyInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
        >
          {journeySteps.map((step, idx) => (
            <MotionCard 
              key={idx}
              delay={idx * 0.08}
              className="p-5 rounded-xl border dark:border-zinc-800/60 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white space-y-3 relative flex flex-col justify-between shadow-sm hover:border-accent-violet/40 transition-colors"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-bold py-0.5 px-2 rounded-full dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-500 uppercase tracking-widest font-display inline-block">
                  Step {step.step}
                </span>
                <h4 className="font-extrabold text-sm dark:text-white light:text-slate-800 leading-tight">
                  {step.title}
                </h4>
              </div>
              <p className="text-[11px] dark:text-zinc-500 light:text-slate-500 font-body leading-relaxed">
                {step.desc}
              </p>
            </MotionCard>
          ))}
        </motion.div>
      </section>

      {/* ── 5. Business Solutions We Deliver ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 border-t dark:border-zinc-800/60 light:border-slate-100 pt-10 text-left">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800">
            {language === 'sw' ? 'Mifumo na Suluhisho za Biashara Tunazotoa' : 'Business Solutions We Deliver'}
          </h2>
          <p className="text-sm sm:text-base dark:text-zinc-400 light:text-slate-500 max-w-2xl leading-relaxed font-body">
            {language === 'sw'
              ? 'Tunatengeneza mifumo thabiti ya programu inayolinda na kukuza biashara yako kutoka kwenye mauzo, stoo, CRM mpaka uotomatishaji wa michakato.'
              : 'We design and build robust software systems that secure and scale your business operations from sales, inventory, CRM to workflow automation.'}
          </p>
        </div>

        <motion.div 
          ref={capabilitiesRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={capabilitiesInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {capabilities.map((item, idx) => (
            <MotionCard 
              key={idx}
              delay={idx * 0.05}
              className="p-6 rounded-2xl border dark:border-zinc-800/60 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white hover:border-accent-violet hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-accent-violet/10 dark:bg-accent-violet/10 light:bg-slate-100">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-sm dark:text-white light:text-slate-800 leading-tight">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs dark:text-zinc-500 light:text-slate-500 font-body leading-relaxed">
                {item.desc}
              </p>
            </MotionCard>
          ))}
        </motion.div>
      </section>

    </div>
  );
};

export default HomePage;
