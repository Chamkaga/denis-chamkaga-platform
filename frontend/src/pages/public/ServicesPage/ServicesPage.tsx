import React from 'react';
import { Code, Database, Cpu, HelpCircle, Layers, Lightbulb, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../../../constants/images';
import { Button } from '../../../components/atoms/Button';
import { ROUTES } from '../../../config/routes';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';
import { useLanguageStore } from '../../../store/useLanguageStore';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';

  const fallbackServices = isSwahili
    ? [
        {
          title: 'Uundaji wa Programu Maalum',
          icon: <Code size={22} className="text-accent-violet" />,
          image: IMAGES.services.webDev,
          desc: 'Ninasanifu na kutengeneza mifumo maalum ya wavuti inayosaidia biashara kurahisisha shughuli za kila siku, kuongeza tija, na kutoa huduma bora kwa wateja. Kila suluhisho hutengenezwa kulingana na mahitaji ya mteja.',
          benefits: 'Mifumo ya Usimamizi wa Shule, Mifumo ya Mauzo (POS), Mifumo ya Stoo/Stoki, Mifumo ya Wateja, na Mifumo ya Biashara.',
          tech: ['React', 'TypeScript', 'Node.js', 'Express', 'PHP', 'MySQL'],
          ctaLabel: 'Jadili Mradi Wako'
        },
        {
          title: 'Uundaji wa Tovuti za Biashara',
          icon: <Layers size={22} className="text-accent-violet" />,
          image: IMAGES.services.consultation,
          desc: 'Ninajenga tovuti za haraka, za kisasa na zinazofaa kwenye simu na kompyuta ili kusaidia biashara kuanzisha uwepo wa kitaalamu mtandaoni na kuvutia wateja zaidi.',
          benefits: 'Tovuti za Makampuni, Kurasa za Kutua (Landing Pages), Tovuti za Wasifu (Portfolios), Muundo Unaofaa Simu, na Muundo wa SEO.',
          tech: ['Vite / React', 'Muundo Unaofaa Simu', 'Ujumuishaji wa SEO', 'Kurasa Maalum za Kutua'],
          ctaLabel: 'Pata Ushauri wa Bure'
        },
        {
          title: 'Uchambuzi wa Mifumo ya Biashara',
          icon: <Lightbulb size={22} className="text-accent-violet" />,
          image: IMAGES.services.training,
          desc: 'Kabla ya kuandika kodi ya programu, ninasaidia biashara kuelewa michakato yao, kutambua changamoto zao, na kupanga suluhisho za programu zinazolingana na mahitaji yao halisi ya kiutendaji.',
          benefits: 'Kukusanya Mahitaji, Uchambuzi wa Michakato ya Biashara, Ramani za Utendaji wa Kazi, na Nyaraka za Mifumo.',
          tech: ['Kukusanya Mahitaji', 'Ramani ya Michakato', 'Nyaraka za Mfumo', 'Michoro ya Kazi'],
          ctaLabel: 'Tuzungumze Kuhusu Biashara Yako'
        },
        {
          title: 'Ubunifu wa Kanzidata (Database)',
          icon: <Database size={22} className="text-accent-violet" />,
          image: IMAGES.services.databaseDesign,
          desc: 'Ninasanifu kanzidata (databases) za uhusiano zilizopangwa vizuri zinazoweka data za biashara zikiwa zimepangwa, salama na rahisi kusimamia.',
          benefits: 'Mifumo ya Usimamizi wa Stoo (Kufuatilia bidhaa, stoki na kutoa ripoti kwa urahisi), majedwali salama ya miamala, na normalization safi ya kanzidata.',
          tech: ['MySQL', 'Prisma', 'Database Design', 'ERD', 'Misingi ya SQL'],
          ctaLabel: 'Jadili Mradi Wako'
        },
        {
          title: 'Uzoefu wa Kidijitali wa Wateja',
          icon: <HelpCircle size={22} className="text-accent-violet" />,
          image: IMAGES.services.customerSupport,
          desc: 'Uzoefu wangu katika huduma kwa wateja unanisaidia kujenga mifumo ambayo ni ya vitendo, rahisi kutumia na iliyoundwa kulingana na mahitaji halisi ya wateja badala ya dhahania.',
          benefits: 'Miundo rahisi kwa watumiaji, mtiririko angavu wa kazi, arifa za barua pepe zilizo wazi, na uundaji wa mifumo inayolenga mawasiliano.',
          tech: ['Mkakati wa Msaada', 'Urahisi wa Matumizi', 'Maoni ya Wateja', 'Michakato ya Vitendo'],
          ctaLabel: 'Weka Ratiba ya Ushauri'
        },
        {
          title: 'Ushauri wa Kiufundi',
          icon: <Cpu size={22} className="text-accent-violet" />,
          image: IMAGES.services.automation,
          desc: 'Je, unahitaji msaada kuchagua teknolojia sahihi kwa ajili ya mradi wako? Ninasaidia watu binafsi, kampuni mpya (startups) na biashara ndogo kupanga miradi ya programu kabla ya kuanza maendeleo.',
          benefits: 'Kupanga wigo wa mradi, ushauri wa teknolojia sahihi, miongozo ya bajeti, na uundaji wa ramani ya mradi.',
          tech: ['Kupanga Wigo wa Mradi', 'Ushauri wa Teknolojia', 'Ramani za Programu', 'Tafiti za Kazi'],
          ctaLabel: 'Weka Ratiba ya Ushauri'
        }
      ]
    : [
        {
          title: 'Custom Software Development',
          icon: <Code size={22} className="text-accent-violet" />,
          image: IMAGES.services.webDev,
          desc: "I design and develop custom web applications that help businesses simplify daily operations, improve productivity and deliver better customer experiences. Every solution is tailored to the client's workflow and business goals.",
          benefits: 'Business Management Systems, School Management Systems, POS Systems, Inventory Systems, Customer Portals.',
          tech: ['React', 'TypeScript', 'Node.js', 'Express', 'PHP', 'MySQL'],
          ctaLabel: 'Discuss Your Project'
        },
        {
          title: 'Business Website Development',
          icon: <Layers size={22} className="text-accent-violet" />,
          image: IMAGES.services.consultation,
          desc: 'I build fast, modern and responsive websites that help businesses establish a professional online presence and attract more customers.',
          benefits: 'Company Websites, Landing Pages, Portfolio Websites, Responsive Design, SEO-friendly Structure.',
          tech: ['Vite / React', 'Responsive Web Design', 'SEO Integration', 'Custom Landing Pages'],
          ctaLabel: 'Get a Free Consultation'
        },
        {
          title: 'Business System Analysis',
          icon: <Lightbulb size={22} className="text-accent-violet" />,
          image: IMAGES.services.training,
          desc: 'Before writing code, I help businesses understand their processes, identify challenges and plan software solutions that fit their real operational needs.',
          benefits: 'Requirements Gathering, Business Process Analysis, Workflow Mapping, System Documentation.',
          tech: ['Requirements Gathering', 'Process Mapping', 'System Specs', 'Workflow Diagrams'],
          ctaLabel: "Let's Talk About Your Business"
        },
        {
          title: 'Database Design',
          icon: <Database size={22} className="text-accent-violet" />,
          image: IMAGES.services.databaseDesign,
          desc: 'I design well-structured relational databases that keep business data organized, secure and easy to manage.',
          benefits: 'Inventory Management Systems (Track products, monitor stock levels and generate reports with ease), secure transaction tables, clean database normalization.',
          tech: ['MySQL', 'Prisma', 'Database Design', 'ERD', 'SQL Fundamentals'],
          ctaLabel: 'Discuss Your Project'
        },
        {
          title: 'Digital Customer Experience',
          icon: <HelpCircle size={22} className="text-accent-violet" />,
          image: IMAGES.services.customerSupport,
          desc: 'My background in customer service helps me build systems that are practical, user-friendly and designed around real customer needs rather than assumptions.',
          benefits: 'Customer-friendly interfaces, intuitive workflows, clear email notifications, communication-driven systems design.',
          tech: ['User Support Strategy', 'UX Focus', 'Client Feedback Integration', 'Practical Workflows'],
          ctaLabel: 'Schedule a Consultation'
        },
        {
          title: 'Technical Consultation',
          icon: <Cpu size={22} className="text-accent-violet" />,
          image: IMAGES.services.automation,
          desc: 'Need help choosing the right technology for your project? I help individuals, startups and small businesses plan software projects before development begins.',
          benefits: 'Project scope planning, technology stack advice, budget guidelines, roadmap development.',
          tech: ['Project Scope Planning', 'Tech Stack Advisory', 'Software Roadmaps', 'Feasibility Studies'],
          ctaLabel: 'Schedule a Consultation'
        }
      ];

  const displayServices = fallbackServices;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <PageTitle
        title={isSwahili ? "Huduma Zangu | Denis Chamkaga" : "Services | Denis Chamkaga Systems Consultant"}
        description={isSwahili ? "Ushauri wa mifumo ya kiotomatiki, database na usaidizi wa timu." : "Browse professional systems services including database design, custom CRM setups, SLA formulation, and business technology consulting."}
      />
      
      <motion.div 
        className="space-y-4 max-w-3xl"
        variants={heroStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span 
          variants={fadeUpVariants}
          custom={0}
          className="inline-block text-xs font-semibold text-accent-violet uppercase tracking-wider font-display"
        >
          {isSwahili ? "Huduma Zangu" : "My Core Services"}
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          {isSwahili ? "Ushauri wa Mifumo Yenye Ubora" : "High-Quality Systems Consultation"}
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          {isSwahili 
            ? "Ninabuni database za kisasa, CRM, na mifumo ya kiotomatiki inayosaidia biashara yako kukua kiutendaji na kuongeza ufanisi stoo na mauzo."
            : "I design relational database schemas, configure custom CRM dashboards, and build business automations that optimize operational efficiency."}
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayServices.map((svc: any, i: number) => (
          <MotionCard 
            key={i}
            delay={i * 0.08}
            className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg flex flex-col justify-between"
          >
            <div className="h-48 bg-zinc-950 overflow-hidden relative">
              <AnimatedImage src={svc.image} alt={svc.title} className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-white/10 backdrop-blur-sm shadow-sm">{svc.icon}</div>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-bold text-xl dark:text-white light:text-slate-800">{svc.title}</h3>
                <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 font-body leading-relaxed">{svc.desc}</p>
              </div>
              <div className="p-3.5 rounded-xl dark:bg-zinc-950/40 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 space-y-1 text-[11px] font-body">
                <span className="font-semibold dark:text-zinc-300 light:text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <TrendingUp size={12} className="text-accent-violet" />
                  {isSwahili ? "Faida kwa Biashara:" : "Business Benefit:"}
                </span>
                <p className="dark:text-zinc-400 light:text-slate-500 leading-normal">{svc.benefits}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold dark:text-zinc-500 light:text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                  <Layers size={10} /> {isSwahili ? "Upeo/Zana:" : "Scope/Tools:"}
                </span>
                <div className="flex flex-wrap gap-1">
                  {svc.tech.map((t: string) => (
                    <span key={t} className="text-[9px] font-semibold font-body py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(ROUTES.CONTACT)} className="cursor-pointer">{svc.ctaLabel}</Button>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
