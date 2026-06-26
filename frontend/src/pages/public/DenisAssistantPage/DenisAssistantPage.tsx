import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  HelpCircle, 
  Briefcase, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Layers, 
  BarChart, 
  Database, 
  Laptop, 
  Smartphone, 
  MessageSquare, 
  ClipboardList, 
  CheckCircle, 
  ArrowRight
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useCountUp } from '../../../hooks/useCountUp';
import { heroStaggerContainer, fadeUpVariants, stepVariants } from '../../../lib/motion';
import { LogoIcon } from '../../../components/atoms/Logo/Logo';

interface Message {
  sender: 'user' | 'assistant';
  text: string | React.ReactNode;
  timestamp: string;
}

const CountUpStat: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 1.2 }) => {
  const { display, ref } = useCountUp({ target, suffix, duration });
  return <span ref={ref as React.RefObject<HTMLSpanElement>} className="font-mono font-bold text-accent-violet">{display}</span>;
};

const TypingDot: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.span
    className="w-1.5 h-1.5 rounded-full bg-accent-violet"
    animate={{ y: [0, -5, 0] }}
    transition={{
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
  />
);

export const DenisAssistantPage: React.FC = () => {
  const { language } = useLanguageStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 5 Starter Prompts for the Empty Chat State
  const starters = language === 'sw'
    ? [
        "Ninahitaji tovuti ya biashara",
        "Saidia kuweka mifumo ya kiotomatiki stoo",
        "Jenga mfumo salama wa database",
        "Ushauri wa mabadiliko ya kidijitali",
        "Ushauri wa mifumo ya biashara"
      ]
    : [
        "I need a business website",
        "Help automate my store inventory",
        "Build a secure database system",
        "Digital transformation advice",
        "Book an IT business consultation"
      ];

  // 6 Business Consultation Cards
  const consultationCards = language === 'sw'
    ? [
        {
          title: 'Uchambuzi wa Biashara',
          desc: 'Kukagua mapungufu ya kiutendaji, michakato ya leja, na uvujaji wa data ili kupanga mahitaji ya programu.',
          prompt: 'Ninahitaji msaada wa kukagua mapungufu ya kiutendaji na kuzuia uvujaji wa data kwenye biashara yetu.',
          icon: <Layers size={18} />
        },
        {
          title: 'Muundo wa Hifadhidata',
          desc: 'Kupanga miundo ya hifadhidata ya uhusiano (PostgreSQL/MySQL) yenye vizuizi thabiti vya kulinda kumbukumbu.',
          prompt: 'Tunawezaje kupanga mfumo mzuri na salama wa database kwa ajili ya kulinda kumbukumbu zetu?',
          icon: <Database size={18} />
        },
        {
          title: 'Uotomatishaji wa Biashara',
          desc: 'Kuondoa Excel za mikono na kuweka mifumo ya kiotomatiki inayotumia arifa na webhooks kuzuia uvujaji.',
          prompt: 'Je, tunawezaje kuondoa majedwali ya mikono na kuweka mifumo ya kiotomatiki ya stoo?',
          icon: <Cpu size={18} />
        },
        {
          title: 'Mifumo ya CRM & SLA',
          desc: 'Kuweka mifumo ya tiketi, sheria za kuelekeza wateja, na kuzuia kuchelewa kujibu wateja (SLA).',
          prompt: 'Tunawezaje kuboresha mifumo yetu ya huduma kwa wateja na SLA ili kuzuia kupoteza wateja?',
          icon: <HelpCircle size={18} />
        },
        {
          title: 'Maendeleo ya Programu',
          desc: 'Kujenga mifumo thabiti ya wavuti (React/Node.js) na programu za simu kwa ajili ya timu yako.',
          prompt: 'Ninahitaji kutengeneza mfumo maalum wa wavuti na programu ya simu kwa ajili ya timu yangu.',
          icon: <Laptop size={18} />
        },
        {
          title: 'AI & Dijitali',
          desc: 'Kuingiza wasaidizi wa akili mnemba (AI) na mifumo ya utafutaji kwenye hifadhidata za biashara yako.',
          prompt: 'Tunawezaje kuingiza teknolojia ya AI na mabadiliko ya kidijitali kwenye biashara yetu?',
          icon: <Zap size={18} />
        }
      ]
    : [
        {
          title: 'Business Analysis',
          desc: 'Auditing manual workflows, ledger routines, and locating data leaks to plan software requirements.',
          prompt: "I need help auditing our company's workflow bottlenecks and identifying operational data leaks.",
          icon: <Layers size={18} />
        },
        {
          title: 'Database Design',
          desc: 'Structuring normalized database relational schemas (PostgreSQL/MySQL) with strict constraints.',
          prompt: 'How can we design a secure, normalized database structure for our transaction logs?',
          icon: <Database size={18} />
        },
        {
          title: 'Business Automation',
          desc: 'Replacing manual spreadsheet tasks with automated workflows, webhooks, and thresholds.',
          prompt: 'Can we automate our manual spreadsheets and configure low-stock event triggers?',
          icon: <Cpu size={18} />
        },
        {
          title: 'CRM & Customer Support',
          desc: 'Configuring automatic ticketing queues, SLA response alerts, and customer routing.',
          prompt: 'How do we configure support ticketing queues and routing rules under customer SLAs?',
          icon: <HelpCircle size={18} />
        },
        {
          title: 'Web & Mobile Development',
          desc: 'Engineering responsive custom admin panels, customer portals, and mobile consoles.',
          prompt: 'I need a custom web application and mobile console built for our operational team.',
          icon: <Laptop size={18} />
        },
        {
          title: 'AI & Digital Transformation',
          desc: 'Integrating intelligent chat agents and vector search systems into databases.',
          prompt: 'How can we integrate AI assistant agents and vector searches into our business databases?',
          icon: <Zap size={18} />
        }
      ];

  // Auto-scroll handler
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Insert suggested prompts into the input area
  const handleCardClick = (promptText: string) => {
    setInputValue(promptText);
    const inputEl = document.getElementById('chat-input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { sender: 'user', text, timestamp };
    
    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate assistant thinking delay
    setTimeout(() => {
      let specificReply: React.ReactNode = '';
      const query = text.toLowerCase();

      // Core matching logic based on keywords
      if (query.includes('social') || query.includes('mitandao') || query.includes('pos') || query.includes('crm') || query.includes('beats')) {
        specificReply = language === 'sw' 
          ? "Mitandao ya kijamii kama WhatsApp au Instagram ni mizuri kwa kupata wateja wapya, lakini haisimamishi biashara. Mfumo wa CRM unakusaidia kutunza historia ya wateja, kuzuia uvujaji wa mapato, na kudhibiti oda zako. Denis Chamkaga anajenga mifumo maalum ya database (PostgreSQL/MySQL) ili uwe na udhibiti kamili wa data za biashara."
          : "Social media hooks visitors, but custom systems manage operations. Standard social media does not provide sales forecasting, strict inventory threshold notifications, or SLA performance tracking. Denis builds tailored CRM and database environments to centralize your operations so you scale without data losses.";
      } else if (query.includes('web') || query.includes('site') || query.includes('tovuti')) {
        specificReply = language === 'sw'
          ? "Denis anaunda tovuti za kisasa zilizoboreshwa kwa ajili ya injini za utafutaji (SEO) kwa kutumia React, Vite, TypeScript, na PHP ili kuelezea huduma zako na kupata wateja wapya. Tembelea kurasa za Huduma na Miradi kuona mifano zaidi ya kodi na mifumo."
          : "Denis designs responsive, SEO-optimized custom web systems using React, Vite, TypeScript, and PHP to showcase your value and capture client leads. Visit the Services and Projects pages to inspect details of personal portfolios and billing engines.";
      } else if (query.includes('automat') || query.includes('kiotomatiki') || query.includes('leaks') || query.includes('spreadsheet') || query.includes('stoo') || query.includes('stoo')) {
        specificReply = language === 'sw'
          ? "Uotomatishaji wa biashara unaondoa kazi za mikono kwa kutumia webhooks, arifa za WhatsApp API, na vichochezi vya hifadhidata. Denis anaweza kukusaidia kuanzisha arifa za stoo inayoisha, kuhifadhi kumbukumbu za mauzo, na kuzuia upotevu wa bidhaa."
          : "Business automation replaces manual tracking with webhooks, WhatsApp API notifications, and database event triggers. Denis can help you configure low-stock alerts, automate cashier logs, and eliminate sales leaks.";
      } else if (query.includes('databas') || query.includes('hifadhi') || query.includes('sql') || query.includes('schema')) {
        specificReply = language === 'sw'
          ? "Mifumo ya hifadhidata (PostgreSQL/MySQL) inaundwa na sheria kali za faharisi na mahusiano ili kuhakikisha usalama wa kumbukumbu. Denis ana uzoefu wa kubadilisha majedwali ya Excel kuwa mifumo salama ya watumiaji wengi."
          : "Relational database structures (PostgreSQL/MySQL) are designed with strict index rules and integrity constraints to ensure ledger safety. Denis specializes in normalizing spreadsheet layouts into safe multi-user database systems.";
      } else if (query.includes('transform') || query.includes('dijitali') || query.includes('mabadiliko')) {
        specificReply = language === 'sw'
          ? "Mabadiliko ya kidijitali yanahamisha kampuni kutoka kwenye vitabu vya mikono na faili za karatasi hadi kwenye mifumo ya wingu ya chanzo kimoja, ikisaidia timu yako kukagua bidhaa na rekodi kwa wakati halisi."
          : "Digital transformation transitions companies from manual logbooks and physical files into single-source cloud environments. It helps your team verify inventory and customer records in real-time.";
      } else if (query.includes('book') || query.includes('consult') || query.includes('miadi') || query.includes('ushauri') || query.includes('mifumo')) {
        specificReply = language === 'sw'
          ? "Kuweka ushauri wa mifumo na Denis ni rahisi sana. Nenda kwenye ukurasa wa Mawasiliano (Contact Page), weka maelezo ya mifumo unayotaka kuanzisha, na Denis atakujibu ndani ya masaa 24 ili kupanga mazungumzo."
          : "Booking an IT systems consultation with Denis is very simple. Navigate to the Contact Page, fill out your company's systems requirements, and Denis will contact you within 24 hours to schedule a deep-dive call.";
      } else if (query.includes('uzoefu') || query.includes('vyeti') || query.includes('experience') || query.includes('certificate')) {
        specificReply = language === 'sw' ? (
          <span>
            Denis ana uzoefu wa miaka 8+ katika shughuli za kiutendaji. Alifanya kazi Securex Africa (Miaka 2 - Ulinzi na ukaguzi wa vihatarishi) na PCCI Group (Miaka 6+ - Huduma kwa wateja na mikakati ya SLA). Ana Stashahada ya BIT kutoka Chuo Kikuu cha Dar es Salaam Computing Centre (UCC). Hii inamaanisha anaelewa changamoto halisi za biashara na namna ya kuzitatua kwa kodi.
          </span>
        ) : (
          <span>
            Denis has 8+ years of operational experience: 2 years in risk audit/security controls at Securex Africa, and 6+ years in customer relations, SLA ticketing strategy, and CRM configurations at PCCI Group. He holds a Diploma in BIT from the University of Dar es Salaam Computing Centre (UCC). He writes systems that solve real operational bottlenecks.
          </span>
        );
      } else if (query.includes('shule') || query.includes('school') || query.includes('built') || query.includes('developed')) {
        specificReply = language === 'sw' ? (
          <span>
            Denis amejenga miradi kadhaa ikiwemo: Mfumo wa Kusimamia Shule (School Management), Mfumo wa Kusimamia Maktaba (Library System), Mfumo wa stoo na bidhaa (Inventory Management) unaotoa taarifa ya bidhaa zinazoisha, na Jukwaa la Terrasafi T Ltd linalolenga kusaidia biashara ndogo.
          </span>
        ) : (
          <span>
            Denis's portfolio includes: a School Management System (tracking schedules, grades, and payments), an Inventory System (with stock thresholds, barcode creation, and sales reports), a Hostel Allocation System, and the Terrasafi T Ltd platform to assist businesses. Check his Projects page to see detail sheets!
          </span>
        );
      } else {
        specificReply = language === 'sw'
          ? "Nipo hapa kukusaidia. Nikusaidie nini leo kuhusu database, mifumo ya stoo (POS/Inventory), au maendeleo ya programu?"
          : "I am here to help you. How can I help you today regarding databases, store systems (POS/Inventory), or software development?";
      }

      // Check if this was the very first interaction (messages list has exactly 1 user message before appending this reply)
      const isFirstResponse = messages.length === 0;

      let finalReplyContent: React.ReactNode = specificReply;

      if (isFirstResponse) {
        const welcomeGreeting = language === 'sw'
          ? "Habari 👋\n\nKaribu kwenye Ofisi ya Kidijitali ya Denis Chamkaga. Mimi ni Msaidizi wa Denis (Denis Assistant).\n\nNamsaidia mgeni kuelewa changamoto zake za kiutendaji, kupendekeza suluhisho sahihi za kiteknolojia, kujibu maswali kuhusu huduma za Denis, na kuwaunganisha wateja makini moja kwa moja na Denis."
          : "Hello 👋\n\nWelcome to Denis Chamkaga's Digital Office. I am Denis Assistant.\n\nI help businesses identify operational challenges, recommend suitable technology solutions, explain Denis's professional services, and connect clients directly for consultation.";

        const isSimpleGreeting = query === 'hello' || query === 'hi' || query === 'mambo' || query === 'habari' || query === 'mambo vipi';
        const followUpText = isSimpleGreeting
          ? (language === 'sw' ? "Je, nikusaidie vipi leo?" : "How may I help you today?")
          : specificReply;

        finalReplyContent = (
          <div className="space-y-3">
            <div className="pb-3 border-b dark:border-zinc-800/80 light:border-slate-200/60 leading-relaxed">
              {welcomeGreeting.split('\n\n').map((para, pIdx) => (
                <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>{para}</p>
              ))}
            </div>
            <div>
              {typeof followUpText === 'string' ? <p>{followUpText}</p> : followUpText}
            </div>
          </div>
        );
      }

      const assistantMsg: Message = {
        sender: 'assistant',
        text: finalReplyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1100);
  };

  const journeySteps = [
    { step: '01', title: 'Outline Operational Gaps', desc: 'Engage with Denis Assistant to describe manual workflow bottlenecks, duplicate entries, or inventory leaks.' },
    { step: '02', title: 'Assistant Logs Parameters', desc: 'The digital coordinator compiles your inputs, framing requirements around standard databases and CRM/POS.' },
    { step: '03', title: 'Consulting Intake Complete', desc: 'Intake profiles are compiled. The assistant schedules a smooth path for personal coordination.' },
    { step: '04', title: 'Denis Personally Joins', desc: 'Denis connects 1-on-1 to audit details, draft the relational schema design, and outline custom scopes.' },
    { step: '05', title: 'Systems Deployment & SLA', desc: 'Denis codes, deploys the product locally, and holds capacity building classes for staff onboarding.' }
  ];

  const educations = [
    { title: 'Business Idea Validation', desc: 'Audit demand, structural constraints, and cash projections before writing code to prevent waste.', icon: <CheckCircle size={18} className="text-accent-violet" /> },
    { title: 'Business Planning', desc: 'Establish standard operating procedures, milestones, and resource projections for clear execution.', icon: <ClipboardList size={18} className="text-accent-violet" /> },
    { title: 'Digital Transformation', desc: 'Transition from physical notebook lists and personal diaries to unified multi-user cloud platforms.', icon: <Layers size={18} className="text-accent-violet" /> },
    { title: 'CRM Automation', desc: 'Configure automatic queue routing, SLA escalations, and customer feedback metrics to reduce churn.', icon: <MessageSquare size={18} className="text-accent-violet" /> },
    { title: 'POS Software Design', desc: 'Log cashier shifts, secure payment points, print receipt logs, and eliminate sales leakage.', icon: <Laptop size={18} className="text-accent-violet" /> },
    { title: 'Inventory Management', desc: 'Monitor active levels, create automatic low-stock notifications, and verify stock audits.', icon: <Briefcase size={18} className="text-accent-violet" /> },
    { title: 'Relational Databases', desc: 'Structure clean schema constraints (PostgreSQL/MySQL) ensuring absolute transaction logs integrity.', icon: <Database size={18} className="text-accent-violet" /> },
    { title: 'Professional Websites', desc: 'Build responsive, SEO-optimized web engines that explain values, answer FAQs, and generate leads.', icon: <Laptop size={18} className="text-accent-violet" /> },
    { title: 'Mobile Apps', desc: 'Deploy customized setups allowing field employees to verify logs and upload stock levels remotely.', icon: <Smartphone size={18} className="text-accent-violet" /> },
    { title: 'Workflow Automation', desc: 'Write strict database triggers and API routing rules to run repetitive operational steps instantly.', icon: <Zap size={18} className="text-accent-violet" /> },
    { title: 'Dynamic Reporting', desc: 'Summarize transactions, SLA ticketing speeds, and stock changes onto centralized admin tables.', icon: <BarChart size={18} className="text-accent-violet" /> },
    { title: 'Analytics & AI Insights', desc: 'Clean, normalize, and query your database to locate growth patterns and configure RAG triggers.', icon: <CheckCircle size={18} className="text-accent-violet" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 text-left font-body relative overflow-hidden">
      <PageTitle
        title="Denis Assistant | Digital Front Office"
        description="Interact with Denis Assistant, the digital representative of Denis Chamkaga, to diagnose systems audit issues, SLA routing logs, and database schemas."
      />
      
      {/* Background Decorative Glow (SaaS Aesthetic) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-accent-violet/3 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* 1. Header Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-b dark:border-zinc-800/80 light:border-slate-200 pb-16 relative">
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
            <span className="relative flex h-2 w-2">
              <motion.span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-violet opacity-75"
                animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-violet" />
            </span>
            Digital Front Office
          </motion.div>
          <motion.h1 
            variants={fadeUpVariants}
            custom={0.1}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold dark:text-white light:text-slate-800 tracking-tight leading-none font-display"
          >
            Denis Assistant Workspace
          </motion.h1>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.2}
            className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
          >
            Welcome to my digital business office. Denis Assistant serves as my digital coordinator to guide you on how standard operating procedures (SOPs), custom CRM/POS setups, and relational databases resolve manual leaks.
          </motion.p>
          <motion.div 
            variants={fadeUpVariants}
            custom={0.3}
            className="flex flex-wrap items-center gap-6 text-xs dark:text-zinc-500 light:text-slate-400 pt-2 font-medium"
          >
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Client Coordination Portal</span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> 
              SLA Guarantee: &lt; <CountUpStat target={24} duration={0.8} /> Hours
            </span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="lg:col-span-5 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.48, delay: 0.15 }}
        >
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-2 dark:border-zinc-800 light:border-slate-200 shadow-2xl bg-zinc-950 group">
            <img 
              src={IMAGES.assistant.botPortrait} 
              alt="Denis Assistant Portrait" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 right-4 py-2 px-4 rounded-xl glass-panel text-center text-xs text-white font-semibold flex items-center justify-center gap-2 shadow-lg border dark:border-zinc-800/80">
              <span className="relative flex h-2 w-2">
                <motion.span 
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Denis Assistant is Online
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Interactive Console & Intake Mockup Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Business Consultation Overview */}
        <div className="lg:col-span-5 p-6 rounded-3xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/20 light:bg-slate-50/50 flex flex-col h-[650px] shadow-xl overflow-hidden justify-between">
          <div className="space-y-3">
            <h3 className="font-extrabold text-lg dark:text-white light:text-slate-800 font-display">
              What Denis Assistant Can Help With
            </h3>
            <p className="text-xs dark:text-zinc-400 light:text-slate-500 font-body leading-relaxed">
              Click a capability card below to load a suggested query into the chat input, then send it to begin auditing your workflows.
            </p>
          </div>

          {/* List of 6 Consultation Areas */}
          <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-3 scrollbar">
            {consultationCards.map((card, idx) => (
              <button 
                key={idx} 
                onClick={() => handleCardClick(card.prompt)}
                className="w-full text-left p-3.5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-white dark:hover:bg-zinc-900/30 light:hover:bg-slate-50 border-transparent hover:border-accent-violet transition-all duration-300 flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-accent-violet/10 dark:bg-accent-violet/10 text-accent-violet group-hover:scale-105 transition-transform duration-300 shrink-0">
                  {card.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm dark:text-white light:text-slate-800 group-hover:text-accent-violet transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs dark:text-zinc-500 light:text-slate-500 leading-normal font-body">
                    {card.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom direct CTA info */}
          <div className="space-y-2 pt-4 border-t dark:border-zinc-850 light:border-slate-200">
            <h4 className="font-extrabold text-xs dark:text-white light:text-slate-800 flex items-center gap-1.5 font-display">
              <ShieldCheck size={14} className="text-accent-violet" />
              SLA Support Coordinator
            </h4>
            <p className="text-[10px] dark:text-zinc-500 light:text-slate-500 leading-normal font-body">
              Denis works directly with your operational stakeholders to audit, design, and scale technology stacks under active support agreements.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Console inside a desktop frame */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl border dark:border-zinc-850 light:border-slate-200 dark:bg-zinc-950/50 light:bg-white/80 backdrop-blur-xl shadow-2xl flex flex-col h-[650px] justify-between relative overflow-hidden">
          
          {/* Decorative console browser header */}
          <div className="flex items-center justify-between border-b dark:border-zinc-850 light:border-slate-200 pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[9px] font-bold dark:text-zinc-500 light:text-slate-400 font-display uppercase tracking-widest">
              Denis Assistant Console v1.0
            </span>
          </div>

          {/* Chat area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar flex flex-col"
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                // 1. Empty State
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6"
                >
                  <div className="w-14 h-14 text-accent-violet bg-accent-violet/10 rounded-2xl flex items-center justify-center shadow-lg border dark:border-zinc-800/80">
                    <LogoIcon sizeClass="h-9 w-9" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-extrabold dark:text-white light:text-slate-800 font-display">
                      Start a conversation
                    </h2>
                    <p className="text-xs dark:text-zinc-400 light:text-slate-500 max-w-sm font-body leading-relaxed">
                      Select a topic below or type your inquiry in the input field to diagnose systems challenges and audit operational leaks.
                    </p>
                  </div>

                  {/* Suggested starter prompts inside the empty chat container */}
                  <div className="w-full max-w-md grid grid-cols-1 gap-2 pt-2">
                    {starters.map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(promptText)}
                        className="p-3 text-xs sm:text-sm font-semibold rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white dark:hover:bg-zinc-800/80 light:hover:bg-slate-50 dark:text-zinc-300 light:text-slate-700 transition-all hover:border-accent-violet text-left flex items-center justify-between group cursor-pointer"
                      >
                        <span>{promptText}</span>
                        <ArrowRight size={14} className="text-zinc-400 group-hover:text-accent-violet group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // 2. Chat history display
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.sender === 'user' ? 'self-end flex-row-reverse ml-auto' : 'self-start mr-auto'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border dark:border-zinc-800 light:border-slate-200 shadow-sm">
                      {msg.sender === 'user' ? (
                        <div className="w-full h-full bg-accent-violet text-white flex items-center justify-center">
                          <User size={14} />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-white dark:bg-zinc-900 p-1 flex items-center justify-center">
                          <LogoIcon sizeClass="w-full h-full" />
                        </div>
                      )}
                    </div>
                    {/* Bubble */}
                    <div className="space-y-1">
                      <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white rounded-tr-none shadow-md'
                          : 'dark:bg-zinc-900/60 dark:text-zinc-100 light:bg-slate-100 light:text-slate-800 rounded-tl-none shadow-sm font-body'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="block text-[8px] dark:text-zinc-500 light:text-slate-400 mt-1 px-1 font-mono text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Premium typing indicator bubble */}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[85%] self-start mr-auto"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border dark:border-zinc-800 light:border-slate-200 flex items-center justify-center bg-white dark:bg-zinc-900 p-1 shadow-sm">
                  <LogoIcon sizeClass="w-full h-full" />
                </div>
                <div className="p-4 rounded-2xl dark:bg-zinc-900/60 light:bg-slate-100 rounded-tl-none shadow-sm flex items-center gap-1.5 h-10">
                  <TypingDot delay={0} />
                  <TypingDot delay={0.15} />
                  <TypingDot delay={0.3} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Form input */}
          <div className="shrink-0 border-t dark:border-zinc-850 light:border-slate-200 pt-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                id="chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                placeholder={language === 'sw' ? "Ongea na Msaidizi wa Denis..." : "Ask Denis Assistant..."}
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet disabled:opacity-50 transition-all placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="px-5 py-3 rounded-xl bg-accent-violet hover:bg-accent-violet-hover disabled:bg-zinc-800/30 disabled:text-zinc-600 disabled:border-zinc-800/10 text-white cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-lg disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* 3. The Conversation Journey Visual Flow */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white light:text-slate-800 font-display">
            How Consultation Works
          </h2>
          <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            A customer-friendly roadmap detailing how you collaborate with Denis and the digital representative from diagnostic discovery to system deployment.
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

      {/* 4. Strategic Business Education Library */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white light:text-slate-800 font-display">
            Strategic Business Education
          </h2>
          <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            Social media accounts like WhatsApp Business are great marketing hooks, but they are not complete business systems. Learn how custom software structures secure and scale operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {educations.map((item, idx) => (
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
