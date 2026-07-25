import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  CheckCircle2,
  MessageSquare,
  Laptop,
  Briefcase,
  Database,
  Smartphone,
  BarChart,
  MessageCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useUIStore } from '../../../store/useUIStore';
import { Button } from '../../../components/atoms/Button';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { heroStaggerContainer, fadeUpVariants, stepVariants } from '../../../lib/motion';

export const DenisAssistantPage: React.FC = () => {
  const { language } = useLanguageStore();
  const { toggleChat } = useUIStore();

  // Smart Option B Auto-Open Logic
  useEffect(() => {
    // If visitor manually closed the widget in this session, do not auto-open
    const closedManually = sessionStorage.getItem('assistantWidgetClosedManually');
    if (closedManually === 'true') {
      return;
    }

    const timer = setTimeout(() => {
      toggleChat(true);
      setTimeout(() => {
        const inputEl = document.getElementById('chat-widget-input');
        if (inputEl) inputEl.focus();
      }, 350);
    }, 1000);
    return () => clearTimeout(timer);
  }, [toggleChat]);

  const handleTalkClick = () => {
    sessionStorage.removeItem('assistantWidgetClosedManually');
    toggleChat(true);
    setTimeout(() => {
      const inputEl = document.getElementById('chat-widget-input');
      if (inputEl) inputEl.focus();
    }, 350);
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 text-left font-body relative overflow-hidden">
      <PageTitle
        title="Denis Assistant | Digital Business Office"
        description="Welcome to Denis Assistant, the digital business office of Denis Chamkaga. Discover digital business solutions and consult with Denis Assistant."
      />
      
      {/* Background Decorative Glow (SaaS Aesthetic) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-accent-violet/3 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* 1. Premium Enterprise Hero Section */}
      <div className="flex flex-col items-center text-center space-y-8 w-full max-w-6xl mx-auto border-b dark:border-zinc-800/80 light:border-slate-200 pb-20 relative px-2 sm:px-4">
        <motion.div 
          className="space-y-8 flex flex-col items-center w-full"
          variants={heroStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full dark:bg-zinc-900/80 light:bg-slate-100/90 border dark:border-zinc-800/80 light:border-slate-200 text-xs font-semibold text-accent-violet uppercase tracking-wider font-display shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <motion.span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-violet opacity-75"
                animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-violet" />
            </span>
            DIGITAL BUSINESS OFFICE
          </motion.div>

          {/* Heading & Subtitle */}
          <div className="space-y-5 flex flex-col items-center w-full">
            <motion.h1 
              variants={fadeUpVariants}
              custom={0.1}
              className="text-6xl sm:text-7xl lg:text-8xl font-extrabold dark:text-white light:text-slate-900 tracking-tight leading-none font-display w-full"
            >
              Meet Denis Assistant
            </motion.h1>
            <motion.h2
              variants={fadeUpVariants}
              custom={0.15}
              className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-accent-violet via-purple-400 to-indigo-400 bg-clip-text text-transparent font-display w-full max-w-4xl leading-snug"
            >
              {language === 'sw' 
                ? 'Ushauri wa kibiashara, mkakati wa programu na mabadiliko ya kidijitali — vyote mahali pamoja.' 
                : 'Business consulting, software strategy and digital transformation — all in one place.'}
            </motion.h2>
          </div>

          {/* Problem-First Value Proposition */}
          <motion.p 
            variants={fadeUpVariants}
            custom={0.2}
            className="text-lg sm:text-xl lg:text-2xl dark:text-zinc-300 light:text-slate-700 w-full max-w-5xl leading-relaxed font-body"
          >
            {language === 'sw'
              ? 'Iwe unaanzisha biashara, unaboresha utendaji kazi, au unapanga mfumo maalum wa programu, Denis Assistant inakusaidia kugundua suluhisho sahihi kabla ya kuwekeza muda na fedha.'
              : 'Whether you\'re starting a business, improving operations, or planning custom software, Denis Assistant helps you discover the right solution before you invest time and money.'}
          </motion.p>

          {/* Primary CTA Cluster */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0.3}
            className="flex flex-col items-center gap-5 pt-4 w-full"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleTalkClick}
              rightIcon={<MessageCircle size={20} />}
              className="px-10 py-4 sm:py-5 text-lg sm:text-xl shadow-2xl shadow-accent-violet/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 font-display font-bold"
            >
              {language === 'sw' ? 'Ongea na Denis Assistant' : 'Talk with Denis Assistant'}
            </Button>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3 text-sm sm:text-base text-zinc-400 dark:text-zinc-400 light:text-slate-600 pt-2 font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                {language === 'sw' ? 'Hakuna usajili unaohitajika' : 'No registration required'}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                {language === 'sw' ? 'Endelea na mazungumzo yaliyopita' : 'Continue previous conversation'}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                {language === 'sw' ? 'Ufikiaji wa moja kwa moja kwa Denis' : 'Direct access to Denis when needed'}
              </span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* 2. The Conversation Journey Visual Flow */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white light:text-slate-800 font-display">
            {language === 'sw' ? 'Mchakato wa Ushauri Unavyofanya Kazi' : 'How Consultation Works'}
          </h2>
          <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {language === 'sw' 
              ? 'Ramani rahisi inayoonyesha jinsi unavyoshirikiana na Denis na Msaidizi wa Kidijitali kutoka kwenye utambuzi wa mapungufu mpaka kutekeleza mfumo.'
              : 'A customer-friendly roadmap detailing how you collaborate with Denis and the digital representative from diagnostic discovery to system deployment.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {journeySteps.map((step, idx) => (
            <motion.div 
              key={idx}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              custom={idx}
              className="p-5 rounded-xl border dark:border-zinc-800/60 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white space-y-3 relative flex flex-col justify-between shadow-sm hover:border-accent-violet/40 transition-colors"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-bold py-0.5 px-2 rounded-full dark:bg-zinc-855 dark:text-zinc-300 light:bg-slate-100 light:text-slate-500 uppercase tracking-widest font-display inline-block">
                  Step {step.step}
                </span>
                <h4 className="font-extrabold text-sm dark:text-white light:text-slate-800 leading-tight">
                  {step.title}
                </h4>
              </div>
              <p className="text-[11px] dark:text-zinc-500 light:text-slate-500 font-body leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Business Solutions We Deliver */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white light:text-slate-800 font-display">
            {language === 'sw' ? 'Mifumo na Suluhisho za Biashara Tunazotoa' : 'Business Solutions We Deliver'}
          </h2>
          <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {language === 'sw'
              ? 'Tunatengeneza mifumo thabiti ya programu inayolinda na kukuza biashara yako kutoka kwenye mauzo, stoo, CRM mpaka uotomatishaji wa michakato.'
              : 'We design and build robust software systems that secure and scale your business operations from sales, inventory, CRM to workflow automation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {capabilities.map((item, idx) => (
            <motion.div 
              key={idx}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              custom={idx * 0.05}
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
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default DenisAssistantPage;
