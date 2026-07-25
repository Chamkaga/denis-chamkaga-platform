import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  Laptop,
  BookOpen
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
const TimelineSection: React.FC<{ journeyMilestones: any[]; isSwahili: boolean }> = ({ journeyMilestones, isSwahili }) => {
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
            <motion.div 
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(139,92,246,0.06)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet shadow-xl max-w-5xl group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">

                {/* LEFT — 3D Illustration: 42% desktop width, min-h-[300px], 220px height mobile */}
                <div className="relative flex-shrink-0 dark:bg-zinc-950 light:bg-slate-50 w-full h-[220px] md:w-[42%] md:h-auto md:min-h-[300px] border-b md:border-b-0 md:border-r dark:border-zinc-800 light:border-slate-200">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full p-4"
                  >
                    <AnimatedImage 
                      src={node.image} 
                      alt={node.role} 
                      className="w-full h-full"
                      objectFit="contain"
                      hoverZoom={false}
                    />
                  </motion.div>
                  {/* Company Logo badge */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-lg overflow-hidden bg-white/95 p-0.5 flex items-center justify-center border shadow-sm text-zinc-900 z-10">
                    {node.logo}
                  </div>
                  {/* Type badge overlay */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm bg-accent-violet/20 text-accent-violet border border-accent-violet/30">
                      {isSwahili ? 'milestone' : 'milestone'}
                    </span>
                  </div>
                </div>

                {/* RIGHT — Content column: 58% desktop width */}
                <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  {/* Top Header */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-violet/70 uppercase tracking-wider font-display">
                      {node.icon}
                      <span>{node.years}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold dark:text-white light:text-slate-900 leading-tight tracking-tight">
                      {node.organization}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider font-body text-accent-violet">
                      {node.role}
                    </p>
                  </div>

                  {/* Story */}
                  <p className="text-sm dark:text-zinc-300 light:text-slate-700 leading-relaxed font-body">
                    {node.story}
                  </p>

                  {/* Lesson */}
                  <div className="flex items-start gap-2 border-l-2 border-accent-violet/40 pl-3 py-0.5">
                    <BookOpen size={11} className="text-accent-violet shrink-0 mt-0.5" />
                    <p className="text-[11px] italic dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
                      &ldquo;{node.lesson}&rdquo;
                    </p>
                  </div>

                  {/* Skills chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {node.skills.map((sk: string) => (
                      <motion.span
                        key={sk}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="text-[10px] font-semibold py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600 border dark:border-zinc-700/50 light:border-slate-200 transition-colors hover:border-accent-violet hover:text-accent-violet cursor-default inline-block"
                      >
                        {sk}
                      </motion.span>
                    ))}
                  </div>

                  {/* Website Button */}
                  {node.website && (
                    <div>
                      <motion.a 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        href={node.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white dark:text-zinc-300 light:text-slate-700 hover:border-accent-violet hover:text-accent-violet transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet font-semibold text-[11px] shadow-sm cursor-pointer"
                        aria-label={`Visit official portal for ${node.organization}`}
                      >
                        <span>{node.btnText}</span>
                        <ExternalLink size={11} />
                      </motion.a>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>

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

import { SecurexLogo, PCCILogo, UDSMLogo, UDCCLogo, TerrasafiLogo } from '../../../components/atoms/CompanyLogos/CompanyLogos';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSwahili = i18n.language === 'sw';

  // Milestone data representing the stepping stones of Denis's career
  const journeyMilestones = [
    {
      years: '2015 – 2017',
      organization: 'Securex Security',
      role: isSwahili ? 'Askari Usalama' : 'Security Officer',
      logo: <SecurexLogo />,
      image: IMAGES.timeline.security3d,
      icon: <Shield size={16} className="text-accent-violet" />,
      story: isSwahili
        ? 'Baada ya kumaliza shule, nilikabiliwa na fursa chache na nikaamua kuanza safari yangu ya kazi Securex Security. Kufanya kazi kwa zamu za usiku na mchana kulinifundisha nidhamu kubwa, uwajibikaji na uvumilivu chini ya shinikizo. Uzoefu huu wa kazi ngumu ulinivutia kuendelea na masomo ya juu ili kujenga mustakabali wangu wa kiteknolojia.'
        : 'After finishing high school, I began my professional journey at Securex Security to support myself. Working demanding day and night shifts taught me deep discipline, vigilance, and operational patience. These foundational experiences ultimately motivated me to pursue higher education, realizing it was the key to building my long-term future in technology.',
      lessonTitle: isSwahili ? 'Somo Kuu Nililojifunza:' : 'Key Lesson Learned:',
      lesson: isSwahili
        ? 'Nidhamu huunda fursa kabla mafanikio hayajafika.'
        : 'Discipline creates opportunities before success arrives.',
      skills: isSwahili 
        ? ['Ulinzi wa Lango', 'Uendeshaji CCTV', 'Kudhibiti Uingiaji', 'Umakini', 'Taarifa za Matukio', 'Nidhamu'] 
        : ['Gate Security', 'CCTV Operations', 'Access Control', 'Observation', 'Incident Reporting', 'Discipline'],
      website: 'https://securexafrica.com',
      btnText: isSwahili ? 'Tembelea Securex Security' : 'Visit Securex Security'
    },
    {
      years: '2017 – Present',
      organization: 'PCCI Group',
      role: isSwahili ? 'Mwakilishi wa Huduma kwa Wateja' : 'Customer Service Representative',
      logo: <PCCILogo />,
      image: IMAGES.timeline.customerService3d,
      icon: <Headphones size={16} className="text-accent-violet" />,
      story: isSwahili
        ? 'PCCI Group ilikuwa mabadiliko makubwa katika safari yangu, ambapo nilitoa usaidizi kwa akaunti ya Tigo na baadaye Yas. Kutatua changamoto za wateja kila siku kuliimarisha stadi zangu za mawasiliano, utatuzi wa migogoro na ushirikiano wa timu chini ya malengo thabiti. Kipindi hiki kilinichochea rasmi kusomea taaluma ya mifumo ya kompyuta.'
        : 'Joining PCCI Group was a major milestone where I supported the Tigo account, which later transitioned to Yas. Resolving complex subscriber issues daily refined my communication, conflict resolution, and collaborative problem-solving skills under strict corporate performance standards. This professional customer service experience inspired me to pursue my formal computing studies.',
      lessonTitle: isSwahili ? 'Somo Kuu Nililojifunza:' : 'Key Lesson Learned:',
      lesson: isSwahili
        ? 'Kila mazungumzo na mteja ni fursa ya kujifunza na kuboresha.'
        : 'Every customer interaction is an opportunity to learn and improve.',
      skills: isSwahili 
        ? ['Huduma kwa Wateja', 'Usaidizi wa Kidijitali', 'Usaidizi wa HVC', 'Mawasiliano', 'Utatuzi wa Shida', 'Ushirikiano wa Timu'] 
        : ['Customer Service', 'Digital Customer Support', 'HVC Support', 'Communication', 'Problem Resolution', 'Teamwork'],
      website: 'https://pcci-group.com',
      btnText: isSwahili ? 'Tembelea PCCI Group' : 'Visit PCCI Group'
    },
    {
      years: '2021 – 2026',
      organization: 'University of Dar es Salaam Computing Centre (UDCC/UCC)',
      role: isSwahili ? 'Stashahada ya Teknolojia ya Habari za Biashara' : 'Diploma in Business Information Technology',
      logo: <UDCCLogo />,
      image: IMAGES.timeline.udcc3d,
      icon: <GraduationCap size={16} className="text-accent-violet" />,
      story: isSwahili
        ? 'Wakati nikifanya kazi PCCI, nilijiandikisha UCC kusomea stashahada ya Teknolojia ya Habari za Biashara. Kujifunza nadharia darasani na kuzitumia kwenye mifumo halisi ya kiofisi kulinisaidia kuunganisha elimu na vitendo kwa haraka sana. Uzoefu huu uliimarisha shauku yangu ya uundaji programu na ushauri wa mifumo ya biashara.'
        : 'While working customer service shifts, I enrolled at the University of Dar es Salaam Computing Centre. Studying Business Information Technology allowed me to immediately apply academic concepts like database design and programming to my daily corporate environment. This synergy connected theoretical engineering with real-world business needs, solidifying my software career.',
      lessonTitle: isSwahili ? 'Somo Kuu Nililojifunza:' : 'Key Lesson Learned:',
      lesson: isSwahili
        ? 'Maarifa yanakuwa na thamani pale nadharia inapokutana na vitendo.'
        : 'Knowledge becomes valuable when theory meets practice.',
      skills: isSwahili 
        ? ['Mifumo ya Habari ya Biashara', 'Misingi ya Uprogramu', 'Misingi ya Kanzidata', 'Mitandao', 'Uundaji wa Programu', 'Uchambuzi wa Mifumo'] 
        : ['Business Information Systems', 'Programming Fundamentals', 'Database Fundamentals', 'Networking', 'Software Development', 'System Analysis'],
      website: 'https://www.ucc.co.tz',
      btnText: isSwahili ? 'Tembelea UCC' : 'Visit UCC'
    },
    {
      years: '2026 – Future',
      organization: 'University of Dar es Salaam',
      role: isSwahili ? 'Shahada ya Kwanza ya Teknolojia ya Habari za Biashara' : "Bachelor's Degree in Business Information Technology",
      logo: <UDSMLogo />,
      image: IMAGES.timeline.udsmFuture3d,
      icon: <GraduationCap size={16} className="text-accent-violet" />,
      story: isSwahili
        ? 'Hatua yangu inayofuata ni kusomea Shahada ya Kwanza ya Teknolojia ya Habari za Biashara katika Chuo Kikuu cha Dar es Salaam. Hatua hii ya kitaaluma inawakilisha nia yangu ya kusimamia usanifu wa programu za kiwango cha juu, uhandisi wa kanzidata, na mifumo ya kibiashara. Lengo langu ni kutatua changamoto halisi za biashara nchini.'
        : 'My immediate next milestone is pursuing a Bachelor’s Degree in Business Information Technology at the University of Dar es Salaam. This academic step represents my dedication to deep software architecture, advanced database engineering, and enterprise systems design. I aim to leverage this knowledge to build solutions for local and global business challenges.',
      lessonTitle: isSwahili ? 'Somo Kuu Nililojifunza:' : 'Key Lesson Learned:',
      lesson: isSwahili
        ? 'Kujifunza hakuishii kamwe.'
        : 'Learning never ends.',
      skills: isSwahili 
        ? ['Uhandisi wa Programu wa Hali ya Juu', 'Mifumo ya Habari ya Biashara', 'Ubunifu wa Mifumo', 'Utafiti na Ubunifu', 'Ukuaji wa Uongozi'] 
        : ['Advanced Software Engineering', 'Enterprise Information Systems', 'System Design', 'Research & Innovation', 'Leadership Development'],
      website: 'https://www.udsm.ac.tz',
      btnText: isSwahili ? 'Tembelea UDSM' : 'Visit UDSM'
    },
    {
      years: 'Future',
      organization: 'Terrasafi Ltd',
      role: isSwahili ? 'Mwanzilishi na Mkurugenzi Mtendaji' : 'Founder & CEO (Future Vision)',
      logo: <TerrasafiLogo />,
      image: IMAGES.timeline.terrasafi3d,
      icon: <Cpu size={16} className="text-accent-violet" />,
      story: isSwahili 
        ? 'Nilianzisha Terrasafi T Ltd baada ya kuona wamiliki wa biashara wakipata hasara kwa kutumia daftari za karatasi. Ninaamini mifumo safi ya kiofisi na kanzidata si anasa kwa kampuni kubwa tu, bali ni zana ya kumsaidia kila mjasiriamali wa ndani kulinda kumbukumbu zake. Kazi yangu inalenga kujenga programu zinazozuia uvujaji wa utendaji na kukuza biashara.' 
        : 'I founded Terrasafi T Ltd because I saw Tanzanian business owners drowning in paper registers. I believe that clean, automated database software should not be a luxury for large enterprises, but a tool that helps local entrepreneurs secure records. My life\'s work is dedicated to building systems that stop operational leaks and power clean business growth.',
      lessonTitle: isSwahili ? 'Somo Kuu Nililojifunza:' : 'Key Lesson Learned:',
      lesson: isSwahili 
        ? 'Mifumo ya SaaS inakua inapotumika kwa urahisi lakini ikiwa imeundwa kwa nidhamu ya kiutawala isiyoyumba.' 
        : 'SaaS platforms scale when they are simple to use but engineered with uncompromising architectural discipline.',
      skills: isSwahili 
        ? ['Mkakati wa SaaS', 'Uendeshaji Kiotomatiki', 'Ujumuishaji wa Mifumo', 'React na Node.js'] 
        : ['SaaS Strategy', 'Business Automation', 'Relational Systems Integration', 'React & Node.js'],
      website: 'https://terrasafi.com',
      btnText: isSwahili ? 'Tembelea Terrasafi' : 'Visit Terrasafi'
    }
  ];

  // Core competency lessons and definitions
  const competencies = [
    {
      title: isSwahili ? 'Uongozi' : 'Leadership',
      icon: <User size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kuandaa orodha za ukaguzi wa uendeshaji na kusimamia ratiba za usalama, kuhakikisha uzingatiaji kamili wa majukumu.' 
        : 'Formulating operations checklists and supervising physical security rosters, ensuring absolute task adherence.',
      mockup: (
        <div className="flex gap-1 items-center justify-start mt-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-500">{isSwahili ? 'Ratiba Amilifu: 100%' : 'Rosters Active: 100%'}</span>
        </div>
      )
    },
    {
      title: isSwahili ? 'Uzoefu wa Wateja' : 'Customer Experience',
      icon: <Headphones size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kupanga viwango vya huduma kwa wateja, mikakati ya foleni, na vipimo vya kuelekeza tiketi chini ya malengo madhubuti ya shirika.' 
        : 'Formulating customer service standards, queue strategies, and ticket routing metrics under strict corporate targets.',
      mockup: (
        <div className="flex gap-1 items-center justify-start mt-2">
          <span className="text-[10px] py-0.5 px-2 rounded bg-accent-violet/10 text-accent-violet font-mono font-semibold">SLA: 98.4%</span>
          <span className="text-[10px] font-mono text-zinc-500">{isSwahili ? 'Subiri: <15d' : 'Wait: <15m'}</span>
        </div>
      )
    },
    {
      title: isSwahili ? 'Uendeshaji wa Biashara' : 'Business Operations',
      icon: <Briefcase size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kuweka vitabu vya hesabu za hasara na faida kwenye mifumo ya programu ya biashara, kuzuia uvujaji wa pesa taslimu na hesabu.' 
        : 'Mapping corporate accounting ledgers onto automated business software, stopping cash inventory leaks.',
      mockup: (
        <div className="w-full bg-zinc-950/40 rounded p-1.5 mt-2 border dark:border-zinc-800/80 light:border-slate-100 flex items-center justify-between text-[9px] font-mono">
          <span className="text-zinc-400">{isSwahili ? 'Mapato Jumla' : 'Total Revenue'}</span>
          <span className="text-green-500 font-bold">$12,450.00</span>
        </div>
      )
    },
    {
      title: isSwahili ? 'Mifumo ya CRM' : 'CRM Systems',
      icon: <HelpCircle size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kubuni miundo ya foleni za tiketi, kupanga vipaumbele vya majibu, na kufuatilia magogo ya kiotomatiki ya wateja.' 
        : 'Designing ticketing queue structures, mapping response priorities, and tracking automated customer logs.',
      mockup: (
        <div className="flex gap-1 mt-2">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase">{isSwahili ? 'Imefungwa' : 'Closed'}</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase">{isSwahili ? 'Wazi' : 'Open'}</span>
        </div>
      )
    },
    {
      title: isSwahili ? 'Hifadhidata' : 'Databases',
      icon: <Database size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kupanga mifumo ya PostgreSQL na MySQL, kuandika vizuizi na faharisi ili kulinda rekodi za miamala.' 
        : 'Structuring PostgreSQL and MySQL models, writing constraints and indexes to secure transaction records.',
      mockup: (
        <div className="text-[8px] font-mono bg-zinc-950 p-1.5 rounded border dark:border-zinc-800 light:border-slate-200 mt-2 text-left space-y-0.5 text-zinc-400">
          <div><span className="text-purple-400">CREATE TABLE</span> <span className="text-white">"users"</span> (</div>
          <div className="pl-3">"id" <span className="text-amber-400">UUID PRIMARY KEY</span></div>
          <div>);</div>
        </div>
      )
    },
    {
      title: isSwahili ? 'Mifumo ya Kiotomatiki' : 'Automation',
      icon: <Cpu size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kuandika viunganishi vya webhook, vichochezi vya bidhaa kupungua, na kuongeza arifa za matukio ya WhatsApp API.' 
        : 'Writing webhook automations, low-stock threshold triggers, and WhatsApp API event escalations.',
      mockup: (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
          <span className="text-[9px] font-mono text-zinc-400">{isSwahili ? 'Kichocheo: Bidhaa < 10' : 'Trigger: Stock < 10'}</span>
          <span className="text-[9px] text-green-500 font-bold font-mono">→ Email Sent</span>
        </div>
      )
    },
    {
      title: isSwahili ? 'Uundaji wa Programu' : 'Software Development',
      icon: <Code size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Uhandisi wa mifumo inayoweza kukua kwa kutumia React, Vite, TypeScript, Node.js, Express, PHP, na Bootstrap.' 
        : 'Engineering scalable systems using React, Vite, TypeScript, Node.js, Express, PHP, and Bootstrap.',
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
      title: isSwahili ? 'Mageuzi ya Kidijitali' : 'Digital Transformation',
      icon: <TrendingUp size={20} className="text-accent-violet" />,
      desc: isSwahili 
        ? 'Kuhimiza SMEs kuacha daftari za karatasi na faili za mwili na kuhamia kwenye hifadhidata za wingu za multitenant.' 
        : 'Transitioning SMEs from manual logbooks and physical files into single-source multitenant cloud environments.',
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
      title: isSwahili ? 'Kuelewa' : 'Understand',
      desc: isSwahili 
        ? 'Kukagua mtiririko wa kazi wa mikono, vitabu vya hesabu, na taratibu za sasa za ukaguzi ili kubaini uvujaji wa mfumo.' 
        : 'Audit manual workflows, ledger layouts, and current check procedures to identify system leaks.',
      icon: <SearchIcon size={16} />
    },
    {
      step: '2',
      title: isSwahili ? 'Kuchambua' : 'Analyse',
      desc: isSwahili 
        ? 'Kupanga mahitaji ya data, kutambua vikwazo vya uendeshaji, na kubainisha ujumuishaji wa teknolojia.' 
        : 'Map data requirements, locate operational bottlenecks, and identify technology integrations.',
      icon: <BarChart size={16} />
    },
    {
      step: '3',
      title: isSwahili ? 'Kubuni' : 'Design',
      desc: isSwahili 
        ? 'Kurasimu mifumo ya hifadhidata, michoro ya taasisi, na mifano ya mbao za waya za UI/UX console.' 
        : 'Draft relational database schemas, entity diagrams, and UI/UX console wireframe mockups.',
      icon: <Laptop size={16} />
    },
    {
      step: '4',
      title: isSwahili ? 'Kujenga' : 'Build',
      desc: isSwahili 
        ? 'Kuandika nambari salama za uzalishaji (React, Node, Swahili/English) kwa kutumia mazingira yaliyotengana.' 
        : 'Write secure production code (React, Node, Swahili/English) using decoupled sandboxes.',
      icon: <Code size={16} />
    },
    {
      step: '5',
      title: isSwahili ? 'Kusaidia' : 'Support',
      desc: isSwahili 
        ? 'Kuandaa miongozo ya watumiaji, kuongoza mafunzo kwa wafanyakazi wapya, na kufuatilia uzingatiaji wa SLA.' 
        : 'Draft user manual guidelines, host staff onboarding classes, and monitor SLA compliance.',
      icon: <ShieldCheck size={16} />
    }
  ];

  // Skill data — authentic percentages reflecting real experience level
  const skillsData = [
    {
      category: isSwahili ? 'Ujuzi wa Kiufundi' : 'Technical Skills',
      skills: [
        { name: 'HTML / CSS / Bootstrap', val: 85 },
        { name: 'JavaScript', val: 75 },
        { name: 'React + TypeScript', val: 65 },
        { name: 'PHP', val: 65 },
        { name: 'Node.js + Express', val: 60 },
        { name: 'MySQL', val: 70 },
        { name: 'Git & GitHub', val: 65 },
      ]
    },
    {
      category: isSwahili ? 'Ujuzi wa Kibiashara' : 'Business Skills',
      skills: [
        { name: isSwahili ? 'Huduma kwa Wateja' : 'Customer Service', val: 90 },
        { name: isSwahili ? 'Mawasiliano' : 'Communication', val: 90 },
        { name: isSwahili ? 'Kutatua Matatizo' : 'Problem Solving', val: 85 },
        { name: isSwahili ? 'Kazi ya Pamoja' : 'Team Collaboration', val: 90 },
        { name: isSwahili ? 'Uchambuzi wa Mifumo' : 'Systems Analysis', val: 65 },
      ]
    },
    {
      category: isSwahili ? 'Zana na Mifumo' : 'Tools & Systems',
      skills: [
        { name: isSwahili ? 'Avaya Contact Centre' : 'Avaya Contact Centre', val: 90 },
        { name: isSwahili ? 'Mifumo ya CRM' : 'CRM Systems', val: 85 },
        { name: 'Microsoft Office', val: 80 },
        { name: 'VS Code', val: 80 },
        { name: isSwahili ? 'Docker (Kujifunza)' : 'Docker (Learning)', val: 40 },
      ]
    },
    {
      category: isSwahili ? 'Viwanda Vinavyoeleweka' : 'Industries Understood',
      skills: [
        { name: isSwahili ? 'Huduma kwa Wateja' : 'Customer Service', val: 90 },
        { name: isSwahili ? 'Mawasiliano ya Simu' : 'Telecommunications', val: 85 },
        { name: isSwahili ? 'Usalama wa Kimwili' : 'Physical Security', val: 85 },
        { name: isSwahili ? 'Teknolojia ya Habari za Biashara' : 'Business Information Technology', val: 70 },
        { name: isSwahili ? 'Uundaji wa Programu (Kujifunza)' : 'Software Development (Learning)', val: 60 },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-28 text-left font-body relative overflow-hidden">
      <PageTitle
        title={isSwahili ? "Kuhusu Denis Chamkaga | Msanidi Programu" : "About Denis Chamkaga | Web Software Developer"}
        description={isSwahili ? "Denis Chamkaga ni mhitimu wa Teknolojia ya Habari za Biashara, Msanidi wa Programu za Wavuti na mwanafunzi wa maisha yote anayeishi Tanzania. Anafurahia kujenga suluhisho za programu zinazosaidia biashara kurahisisha uendeshaji wao wa kila siku, kuongeza ufanisi na kukubali mabadiliko ya kidijitali." : "Denis Chamkaga is a Business Information Technology graduate, Web Software Developer and lifelong learner based in Tanzania. He enjoys building practical software solutions that help businesses simplify their daily operations, improve efficiency and embrace digital transformation."}
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
            {isSwahili ? "Wasifu wa Mtendaji" : "Executive Biography"}
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
            {isSwahili 
              ? "Mimi ni Mtaalamu wa Teknolojia ya Habari za Biashara, Msanidi Programu wa Wavuti, na Mshauri wa Mifumo. Ninabobea katika kuunganisha mtiririko wa kazi wa kampuni, urekebishaji wa hifadhidata, na mifumo ya CRM/POS ili kuondoa uvujaji wa uendeshaji."
              : "I am a Business Information Technology Professional, Web Software Developer, and Systems Consultant. I specialize in bridging company workflows, database normalization, and automated CRM/POS systems to eliminate operational leaks."}
          </motion.p>
          <motion.p 
            variants={fadeUpVariants}
            custom={0.3}
            className="text-xs sm:text-sm dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body"
          >
            {isSwahili 
              ? "Badala ya kusakinisha kurasa za kimsingi, historia yangu ya uendeshaji—inayojumuisha ukaguzi wa usalama, huduma kwa wateja, uhamishaji wa bili za biashara, na masomo ya uhandisi wa kompyuta—inaniwezesha kubuni hifadhidata zinazolinda uaminifu wa miamala."
              : "Rather than installing generic pages, my operational history—spanning physical access auditing, voice customer support, enterprise billing migrations, and computing engineering studies—enables me to design database structures that protect transaction integrity."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeUpVariants}
            custom={0.4}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Button variant="primary" onClick={() => navigate(ROUTES.CONTACT)} rightIcon={<ArrowRight size={16} />}>
              {isSwahili ? "Wasiliana na Denis" : "Consult Denis"}
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
              <span>{isSwahili ? "Ongea Haraka" : "Quick Chat"}</span>
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
              <span className="block text-sm font-extrabold dark:text-white light:text-slate-800">{isSwahili ? "Miaka 8+" : "8+ Years"}</span>
              <span className="text-[9px] dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold">{isSwahili ? "Uendeshaji" : "Operations"}</span>
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
              <span className="text-[9px] dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold">{isSwahili ? "SaaS ya Baadaye" : "Future SaaS"}</span>
            </div>
          </motion.div>
        </motion.div>

      </section>

      {/* SECTION 2 — MY JOURNEY TIMELINE (Visual Career Stepping Stones) */}
      <section id="timeline" className="space-y-12 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100 relative">
        
        {/* Timeline Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-accent-violet animate-spin-slow" />
            <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
              {isSwahili ? "Njia ya Ukuaji" : "Path of Growth"}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            {isSwahili ? "Hatua Muhimu za Kazi Yangu" : "The Stepping Stones of My Career"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {isSwahili 
              ? "Fuatilia ukuaji wangu wa kitaalamu kutoka kwa umakini wa kudhibiti uingiaji, hadi usanidi wa foleni za SLA, uchambuzi wa mifumo ya uhusiano, na uhandisi wa bidhaa."
              : "Follow my professional growth from access-control vigilance, to SLA queue configuration, to relational systems analysis, and product engineering."}
          </p>
        </div>

        {/* Visual Milestone Timeline Loop */}
        <TimelineSection journeyMilestones={journeyMilestones} isSwahili={isSwahili} />

      </section>

      {/* SECTION 3 — WHAT I LEARNED (Premium Competency Cards) */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            {isSwahili ? "Uwezo" : "Competencies"}
          </span>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            {isSwahili ? "Kile Uendeshaji Ulinifundisha" : "What Operations Taught Me"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {isSwahili 
              ? "Kila jukumu liliunda uelewa wangu wa teknolojia. Ninajenga programu kutoka kwa msingi huu wa ubora wa uendeshaji:"
              : "Each role shaped my technology understanding. I build software from this bedrock of operational excellence:"}
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
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            {isSwahili ? "Mbinu" : "Methodology"}
          </span>
          <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            {isSwahili ? "Mtiririko wa Ushauri na Utendaji wa Mradi" : "Consulting & Project Execution Flow"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {isSwahili 
              ? "Ninakabiliwa na kupeleka mifumo na bomba la uendeshaji lililo na mpangilio: Kuelewa, Kuchambua, Kubuni, Kujenga, na Kusaidia."
              : "I approach systems deployment with a structured operational pipeline: Understand, Analyze, Design, Build, and Support."}
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
                <span className="text-accent-violet">{isSwahili ? "Amilifu" : "Active"}</span>
              </div>
            </MotionCard>
          ))}
        </div>

      </section>

      {/* SECTION 5 — DASHBOARD-STYLE SKILLS PANEL */}
      <section className="space-y-8 pt-8 border-t dark:border-zinc-800/60 light:border-slate-100">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
            {isSwahili ? "Tathmini ya Ujuzi" : "Skills Assessment"}
          </span>
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800 font-display">
            {isSwahili ? "Viwango vya Ujuzi na Vipimo vya Dashboard" : "Dashboard Skills & Metrics"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {isSwahili 
              ? "Ujuzi wa uendeshaji na viwango vya programu vilivyotathminiwa dhidi ya upeo wa kibiashara na miradi ya kitaaluma:"
              : "Operational and programming skill benchmarks evaluated against commercial scopes and academic projects:"}
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
            {isSwahili ? "Kujenga Jukwaa la Baadaye la SME" : "Building the Future SME Platform"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
            {isSwahili 
              ? "Maono yangu ya baadaye yamejikita katika kukuza **Terrasafi T Ltd** kuwa programu safi, endelevu ya kulipia ya Kiswahili na Kiingereza, POS, na CRM. Wajasiriamali wa Kitanzania hawapaswi kutegemea daftari za karatasi au mifumo ya gumzo iliyotawanyika."
              : "My future vision is centered on bootstrapping **Terrasafi T Ltd** into a clean, sustainable Swahili-English billing, POS, and CRM suite. Local Tanzanian SMEs should not rely on manual bookkeeping logs or disjointed chat systems."}
          </p>

          {/* Pillars List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body leading-relaxed pt-2">
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">{isSwahili ? "Maabara ya Ubunifu:" : "Innovation Lab:"}</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">
                  {isSwahili ? "Kufanya majaribio ya mifumo salama ya Swahili NLP na algorithms za hesabu ya bidhaa." : "Prototyping secure Swahili NLP and inventory algorithms."}
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">{isSwahili ? "Kampuni ya Programu:" : "Software Company:"}</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">
                  {isSwahili ? "Kupeleka hifadhidata zilizojanibishwa na vifurushi vya biashara vya multitenant." : "Deploying localized databases and multitenant business packages."}
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">{isSwahili ? "Kituo cha Mafunzo:" : "Training Centre:"}</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">
                  {isSwahili ? "Kutoa mafunzo ya uendeshaji na moduli za huduma kwa wateja za SLA." : "Offering operations and SLA customer training modules."}
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle size={14} className="text-accent-violet shrink-0 mt-0.5" />
              <div>
                <strong className="dark:text-zinc-300 light:text-slate-700">{isSwahili ? "Suluhisho la Hifadhidata:" : "Database Solutions:"}</strong>
                <span className="block dark:text-zinc-500 light:text-slate-500">
                  {isSwahili ? "Kuweka rekodi za zamani za Excel kwenye mifumo ya uhakika ya uhusiano." : "Normalizing legacy spreadsheets into transaction-safe environments."}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="primary" onClick={() => navigate(ROUTES.FUTURE_VISION)} rightIcon={<ArrowRight size={14} />}>
              {isSwahili ? "Gundua Maono ya Baadaye" : "Explore Future Vision"}
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
            alt={isSwahili ? "Maabara ya Ubunifu ya Baadaye ya Terrasafi" : "Terrasafi Future Innovation Lab"} 
            className="w-full h-full opacity-85"
            hoverZoom={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
          
          <div className="absolute top-4 left-4 py-1.5 px-3 rounded-lg bg-zinc-950/80 text-[10px] text-white border border-white/10 uppercase tracking-widest font-semibold flex items-center gap-1.5 z-20">
            <Award size={12} className="text-accent-violet" />
            {isSwahili ? "Mazingira Amilifu ya Sandbox" : "Active Sandbox"}
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
