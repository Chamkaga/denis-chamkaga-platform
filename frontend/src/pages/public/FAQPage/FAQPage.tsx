import React, { useState } from 'react';
import { ChevronDown, ArrowRight, HelpCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../../../constants/images';
import { Button } from '../../../components/atoms/Button';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../services/api';
import { useUIStore } from '../../../store/useUIStore';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { i18n } = useTranslation();
  const isSwahili = i18n.language === 'sw';

  const { data: dbFaqs } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => publicApi.getFaqs(),
  });

  const fallbackFaqs = [
    {
      q: isSwahili 
        ? 'Kwa nini nijenge mfumo maalum badala ya kutumia mitandao ya kijamii pekee?'
        : 'Why should I build a custom system instead of using social media?',
      a: isSwahili ? (
        <span>
          Ingawa Facebook, Instagram, na WhatsApp ni zana nzuri za kuvutia wateja, haziendeshi shughuli zako kiotomatiki. Hifadhidata maalum za CRM, kurasa za hesabu za bidhaa, na ufuatiliaji wa fedha hulinda data zako, zinalazimisha uzingatiaji wa SLA, na kuwapa wafanyakazi muda wa kuzingatia kukuza biashara.
        </span>
      ) : (
        <span>
          While Facebook, Instagram, and WhatsApp are great marketing hooks, they do not automate your operations. Custom CRM databases, inventory portals, and automated finance tracking secure your business data, enforce SLAs, and free up employee time to focus on scaling.
        </span>
      )
    },
    {
      q: isSwahili
        ? 'Uzoefu na utaalamu wako ni upi?'
        : 'What is your background and expertise?',
      a: isSwahili ? (
        <span>
          Nina Stashahada ya Teknolojia ya Habari za Biashara kutoka{' '}
          <a 
            href="https://www.ucc.co.tz" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-violet font-semibold hover:underline inline-flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-0.5"
          >
            Kituo cha Chuo Kikuu cha Dar es Salaam cha Ufumbuzi wa Teknolojia (UCC)
            <ExternalLink size={12} className="inline shrink-0" />
          </a>. Zaidi ya hayo, nina miaka 8+ ya uzoefu katika utendaji bora: miaka 2 katika usimamizi wa usalama na ukaguzi wa hatari huko{' '}
          <a 
            href="https://securexafrica.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-violet font-semibold hover:underline inline-flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-0.5"
          >
            Securex Africa
            <ExternalLink size={12} className="inline shrink-0" />
          </a>, na miaka 6+ katika huduma kwa wateja na mikakati ya tiketi za SLA huko{' '}
          <a 
            href="https://pcci-group.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-violet font-semibold hover:underline inline-flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-0.5"
          >
            PCCI Group
            <ExternalLink size={12} className="inline shrink-0" />
          </a>.
        </span>
      ) : (
        <span>
          I hold a Diploma in Business Information Technology from the{' '}
          <a 
            href="https://www.ucc.co.tz" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-violet font-semibold hover:underline inline-flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-0.5"
          >
            University of Dar es Salaam Computing Centre
            <ExternalLink size={12} className="inline shrink-0" />
          </a>. In addition, I have 8+ years of operational excellence experience: 2 years in security supervision and risk audit at{' '}
          <a 
            href="https://securexafrica.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-violet font-semibold hover:underline inline-flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-0.5"
          >
            Securex Africa
            <ExternalLink size={12} className="inline shrink-0" />
          </a>, and 6+ years in customer relations and SLA ticketing strategy at{' '}
          <a 
            href="https://pcci-group.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-violet font-semibold hover:underline inline-flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-0.5"
          >
            PCCI Group
            <ExternalLink size={12} className="inline shrink-0" />
          </a>.
        </span>
      )
    },
    {
      q: isSwahili
        ? 'Je, unasaidia miradi ya Kiswahili na Kiingereza?'
        : 'Do you support Swahili and English projects?',
      a: isSwahili ? (
        <span>
          Ndiyo, ninasanifu mifumo ya lugha mbili inayounga mkono Kiswahili na Kiingereza kiasili kuwezesha SMEs za kitanzania kuhudumia wateja wa kikanda na wa kimataifa.
        </span>
      ) : (
        <span>
          Yes, I design bilingual software systems natively supporting Swahili and English to help local Tanzanian SMEs serve both regional and international customers.
        </span>
      )
    },
    {
      q: isSwahili
        ? 'Uhifadhi wa ushauri unafanyaje kazi?'
        : 'How does the consultation booking work?',
      a: isSwahili ? (
        <span>
          Unaweza kuwasilisha changamoto zako za kiutendaji kupitia fomu ya Mawasiliano au kuomba muda wa kikao. Wakati wa mazungumzo, tunafafanua mtiririko wako wa kazi, tunachora uhusiano wa data, na kuandaa hati wazi ya mahitaji ya mfumo.
        </span>
      ) : (
        <span>
          You can submit your operational problems via the Contact form or request a meeting block. During the call, we define your business workflow, map data relationships, and draw up a clear system requirements document.
        </span>
      )
    }
  ];

  const faqs = (dbFaqs && dbFaqs.length > 0)
    ? dbFaqs.map((f: any) => ({ q: f.question, a: f.answer }))
    : fallbackFaqs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left font-body">
      <PageTitle 
        title={isSwahili ? "Maswali Yanayoulizwa Sana | Denis Chamkaga" : "FAQ | Denis Chamkaga"} 
        description={isSwahili ? "Maswali yanayoulizwa mara kwa mara kuhusu huduma za Denis Chamkaga na mifumo ya biashara." : "Frequently asked questions about Denis Chamkaga's services, approach, and business technology expertise."} 
      />

      {/* Header — staggered */}
      <motion.div className="space-y-4 max-w-3xl" variants={heroStaggerContainer} initial="hidden" animate="visible">
        <motion.span variants={fadeUpVariants} custom={0} className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display block">
          {isSwahili ? "Maswali ya Kawaida" : "Common Queries"}
        </motion.span>
        <motion.h1 variants={fadeUpVariants} custom={0.1} className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
          {isSwahili ? "Maswali Yanayoulizwa Sana" : "Frequently Asked Questions"}
        </motion.h1>
        <motion.p variants={fadeUpVariants} custom={0.2} className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
          {isSwahili ? "Jifunze jinsi teknolojia inavyoweza kusaidia kurahisisha utendaji wako na kukuza biashara yako ndogo." : "Learn how technology can help automate your workflow and scale your small business."}
        </motion.p>
      </motion.div>

      {/* Grid: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Guide & CTA */}
        <div className="lg:col-span-5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg flex flex-col justify-between">
          <div className="h-48 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
            <AnimatedImage src={IMAGES.services.customerSupport} alt={isSwahili ? "Kielelezo cha Huduma kwa Wateja" : "Customer Support Operations Mockup"} className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 p-2.5 rounded-lg bg-white/95 border shadow flex items-center justify-center pointer-events-none">
              <HelpCircle size={18} className="text-accent-violet" />
            </div>
            <span className="absolute bottom-3 left-4 text-xs font-bold text-white uppercase tracking-wider">
              {isSwahili ? "Miongozo ya Maswali" : "Operations FAQ"}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="font-extrabold text-lg dark:text-white light:text-slate-800">
              {isSwahili ? "Jinsi Teknolojia Inavyothibitisha Utendaji" : "How Technology Validates Workflows"}
            </h3>
            <p className="text-xs dark:text-zinc-400 light:text-slate-500 leading-relaxed">
              {isSwahili 
                ? "Wamiliki wengi wa biashara wanakabiliwa na ucheleweshaji wa majibu, uhifadhi wa mara mbili, na uvujaji wa hesabu za bidhaa. Maswali haya yanaeleza jinsi hifadhidata za kawaida na mifumo ya CRM inavyolinda uendeshaji wako." 
                : "Many business owners struggle with response delays, double bookings, and inventory leaks. These queries explain how standard relational databases and automated CRMs secure your operations."}
            </p>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm"
                fullWidth
                onClick={() => useUIStore.getState().toggleChat(true)}
                rightIcon={<ArrowRight size={14} />}
              >
                {isSwahili ? "Muulize Msaidizi wa Denis" : "Ask Denis Assistant"}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {faqs.map((faq: any, i: number) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full py-4 px-6 flex items-center justify-between gap-4 cursor-pointer text-left dark:hover:bg-zinc-800/20 light:hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base dark:text-white light:text-slate-800 leading-snug">{faq.q}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={18} className="text-zinc-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-zinc-950/10 border-t dark:border-zinc-800/60 light:border-slate-100 text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default FAQPage;
