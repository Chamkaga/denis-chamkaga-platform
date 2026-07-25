import React from 'react';
import { Calendar, GraduationCap, Shield, Headphones, Cpu, ExternalLink, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/cn';
import { IMAGES } from '../../../constants/images';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { heroStaggerContainer, fadeUpVariants, slideLeftVariants, slideRightVariants, lineGrowVariants } from '../../../lib/motion';
import { SecurexLogo, PCCILogo, UDSMLogo, UDCCLogo, TerrasafiLogo } from '../../../components/atoms/CompanyLogos/CompanyLogos';

export interface Milestone {
  year: string;
  role: string;
  institution: string;
  logo: React.ReactNode;
  image: string;
  website: string;
  story: string;       // Single concise paragraph, 3–5 sentences
  lessonLearned: string;
  skills: string[];
  type: 'work' | 'academic' | 'future';
  icon: React.ReactNode;
}

export const TimelinePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isSwahili = i18n.language === 'sw';

  const milestones: Milestone[] = [
    // ─── 1. Securex Security ───────────────────────────────────────────────
    {
      year: '2015 – 2017',
      role: isSwahili ? 'Askari Usalama' : 'Security Officer',
      institution: 'Securex Security',
      logo: <SecurexLogo />,
      image: IMAGES.timeline.security3d,
      website: 'https://securexafrica.com',
      story: isSwahili
        ? 'Baada ya kumaliza shule, nilikuwa na fursa ndogo sana. Securex ilinipa nafasi ya kuanza. Kufanya kazi mchana na usiku ilinifundisha nidhamu, uwajibikaji na uvumilivu. Miaka ile pia ilinifanya nitambue kwamba elimu itakuwa msingi wa mustakabali wangu.'
        : 'After finishing school, I started my career at Securex Security. Working day and night shifts taught me discipline, responsibility and patience. Those experiences made me realize that education would become the foundation of my future.',
      lessonLearned: isSwahili
        ? 'Nidhamu huunda fursa kabla mafanikio hayajafika.'
        : 'Discipline creates opportunities before success arrives.',
      skills: isSwahili
        ? ['Ulinzi wa Lango', 'Uendeshaji wa Doria', 'Udhibiti wa Uingiaji', 'Umakini', 'Taarifa za Matukio', 'Nidhamu']
        : ['Gate Security', 'Patrol Operations', 'Access Control', 'Observation', 'Incident Reporting', 'Discipline'],
      type: 'work',
      icon: <Shield size={14} />,
    },

    // ─── 2. PCCI Group ─────────────────────────────────────────────────────
    {
      year: '2017 – Present',
      role: isSwahili ? 'Mwakilishi wa Huduma kwa Wateja' : 'Customer Service Representative',
      institution: 'PCCI Group',
      logo: <PCCILogo />,
      image: IMAGES.timeline.customerService3d,
      website: 'https://pcci-group.com',
      story: isSwahili
        ? 'PCCI ikawa hatua ya mabadiliko. Nilisaidia akaunti ya Tigo — baadaye Yas — kupitia PCCI, sio kama mfanyakazi wa moja kwa moja wa Tigo. Kusaidia wateja kila siku kuliimarisha mawasiliano, utatuzi wa matatizo na kazi ya pamoja. Kipindi hiki pia kilinichocha kuendelea na masomo yangu.'
        : 'PCCI became my turning point. I supported the Tigo account — which later rebranded to Yas — through PCCI, not as a direct Tigo employee. Helping customers every day built my communication, problem-solving and teamwork. This period also motivated me to continue studying.',
      lessonLearned: isSwahili
        ? 'Kila mazungumzo na mteja ni fursa ya kujifunza na kuboresha.'
        : 'Every customer interaction is an opportunity to learn and improve.',
      skills: isSwahili
        ? ['Huduma kwa Wateja', 'Msaada wa HVC', 'Msaada wa Kidijitali', 'Mawasiliano', 'Kutatua Matatizo', 'Kazi ya Pamoja']
        : ['Customer Service', 'HVC Support', 'Digital Support', 'Communication', 'Problem Solving', 'Teamwork'],
      type: 'work',
      icon: <Headphones size={14} />,
    },

    // ─── 3. University of Dar es Salaam Computing Centre ──────────────────
    {
      year: '2021 – 2026',
      role: isSwahili ? 'Stashahada ya Teknolojia ya Habari za Biashara' : 'Diploma in Business Information Technology',
      institution: 'University of Dar es Salaam Computing Centre (UCC)',
      logo: <UDCCLogo />,
      image: IMAGES.timeline.udcc3d,
      website: 'https://www.ucc.co.tz',
      story: isSwahili
        ? 'Nikifanya kazi PCCI, nilijiandikisha UCC kusomea Teknolojia ya Habari za Biashara. Kujifunza darasani huku nikifanya kazi na mifumo halisi ya biashara kila siku kulinisaidia kuunganisha nadharia na vitendo. Uzoefu huu uliongeza shauku yangu ya uundaji wa programu na teknolojia ya biashara.'
        : 'While working at PCCI, I enrolled at UCC to study Business Information Technology. Learning theory in class while applying it in a real workplace helped me connect concepts with practice. This experience deepened my passion for software development and business technology.',
      lessonLearned: isSwahili
        ? 'Maarifa yanakuwa na thamani pale nadharia inapokutana na vitendo.'
        : 'Knowledge becomes valuable when theory meets practice.',
      skills: isSwahili
        ? ['Mifumo ya Habari za Biashara', 'Uprogramu', 'Kanzidata', 'Mitandao', 'Uundaji wa Programu', 'Uchambuzi wa Mifumo']
        : ['Business Information Systems', 'Programming', 'Databases', 'Networking', 'Software Development', 'System Analysis'],
      type: 'academic',
      icon: <GraduationCap size={14} />,
    },

    // ─── 4. University of Dar es Salaam (Future Goal) ─────────────────────
    {
      year: '2026 – Future',
      role: isSwahili ? 'Shahada ya Kwanza ya Teknolojia ya Habari za Biashara' : "Bachelor's Degree in Business Information Technology",
      institution: 'University of Dar es Salaam',
      logo: <UDSMLogo />,
      image: IMAGES.timeline.udsmFuture3d,
      website: 'https://www.udsm.ac.tz',
      story: isSwahili
        ? 'Hatua yangu inayofuata ni kufuata Shahada ya Kwanza ya Teknolojia ya Habari za Biashara katika Chuo Kikuu cha Dar es Salaam. Hii inawakilisha kujitolea kwangu kwa kujifunza kuendelea, maarifa ya kina ya kiufundi na ukuaji wa kitaalamu wa muda mrefu.'
        : "My next step is to pursue a Bachelor's Degree in Business Information Technology at the University of Dar es Salaam. This represents my commitment to continuous learning, deeper technical knowledge and long-term professional growth.",
      lessonLearned: isSwahili
        ? 'Kujifunza hakuishii kamwe.'
        : 'Learning never ends.',
      skills: isSwahili
        ? ['Uhandisi wa Programu wa Hali ya Juu', 'Mifumo ya Makampuni', 'Utafiti', 'Uongozi', 'Ubunifu']
        : ['Advanced Software Engineering', 'Enterprise Systems', 'Research', 'Leadership', 'Innovation'],
      type: 'future',
      icon: <GraduationCap size={14} />,
    },

    // ─── 5. Terrasafi T Ltd ── DO NOT MODIFY ──────────────────────────────
    {
      year: '2025+',
      role: isSwahili ? 'Mwanzilishi & Mkurugenzi Mtendaji' : 'Founder & CEO',
      institution: 'Terrasafi T Ltd',
      logo: <TerrasafiLogo />,
      image: IMAGES.timeline.terrasafi3d,
      website: 'https://terrasafi.com',
      story: isSwahili
        ? 'Terrasafi ilianza kama suluhisho la tatizo nililoiona kila siku — wafanyabiashara wadogo wa Tanzania wakijaribu kudhibiti hesabu, bidhaa, na wateja kwa vitabu vya mikono na lahajedwali. Niliamua kujenga mfumo rahisi, unaofanya kazi bila karatasi. Leo ninajipanga kutumia React, Node.js, na PostgreSQL kuunda programu nyepesi za SaaS zinazoweza kusaidia SMEs za ndani. Bado ninajenga — lakini msingi uko imara.'
        : 'Terrasafi started as a solution to a problem I witnessed every day — small Tanzanian businesses struggling to manage records, inventory, and customers using manual books and spreadsheets. I decided to build something clean, automated, and paperless. Today I am engineering lightweight SaaS applications using React, Node.js, and PostgreSQL to serve local SMEs. I am still building — but the foundation is solid.',
      lessonLearned: isSwahili
        ? 'Mifumo ya SaaS inakua inapokuwa rahisi kutumia lakini imeundwa kwa nidhamu ya kimuundo isiyoyumba.'
        : 'SaaS platforms scale when they are simple to use but engineered with uncompromising architectural discipline.',
      skills: isSwahili
        ? ['Mkakati wa SaaS', 'React & Node.js', 'PostgreSQL', 'Uendeshaji Kiotomatiki']
        : ['SaaS Strategy', 'React & Node.js', 'PostgreSQL', 'Business Automation'],
      type: 'future',
      icon: <Cpu size={14} />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left font-body">
      <PageTitle
        title={isSwahili ? 'Safari ya Kazi | Denis Chamkaga' : 'Career Journey | Denis Chamkaga'}
        description={
          isSwahili
            ? 'Historia kamili ya kazi ya Denis Chamkaga — kutoka Securex Africa hadi PCCI Group, UDSM, UCC na Terrasafi.'
            : "Denis Chamkaga's full career timeline — from Securex Africa to PCCI Group, UDSM, UCC and Terrasafi."
        }
      />

      {/* Header — staggered reveal */}
      <motion.div className="space-y-4 max-w-3xl" variants={heroStaggerContainer} initial="hidden" animate="visible">
        <motion.span variants={fadeUpVariants} custom={0} className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display block">
          {isSwahili ? 'Ukuaji Wangu' : 'My Growth'}
        </motion.span>
        <motion.h1 variants={fadeUpVariants} custom={0.1} className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight">
          {isSwahili ? 'Safari ya Ukuaji Wangu' : 'My Career Journey'}
        </motion.h1>
        <motion.p variants={fadeUpVariants} custom={0.2} className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
          {isSwahili
            ? 'Nilianza na kidogo. Nikaendelea. Bado ninajifunza. Hiyo ndiyo hadithi yangu.'
            : 'I started with very little. Kept working. Kept studying. I am still growing. That is the story.'}
        </motion.p>
      </motion.div>

      {/* Vertical Timeline wrapper — animated growing line */}
      <div className="relative ml-4 md:ml-6 space-y-16">
        <TimelineLine />
        {milestones.map((node, i) => (
          <TimelineCard key={i} node={node} index={i} isSwahili={isSwahili} />
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
const TimelineCard: React.FC<{ node: Milestone; index: number; isSwahili: boolean }> = ({ node, index, isSwahili }) => {
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
          'absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 flex items-center justify-center dark:bg-primary-bg light:bg-light-bg z-20',
          {
            'border-accent-violet text-accent-violet': node.type === 'work',
            'border-green-500 text-green-500': node.type === 'academic',
            'border-amber-500 text-amber-500': node.type === 'future',
          }
        )}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-current" />
      </motion.div>

      {/* ── Card — horizontal split: image left (42%), content right (58%) ── */}
      <div className="rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-all duration-300 shadow-xl max-w-5xl group hover:shadow-accent-violet/5 overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* LEFT — 3D Illustration: full-width on mobile (220px), 42% on desktop (min 300px) */}
          <div className={cn(
            'relative flex-shrink-0 dark:bg-zinc-950 light:bg-slate-50',
            'w-full h-[220px]',
            'md:w-[42%] md:h-auto md:min-h-[300px]',
            'border-b md:border-b-0 md:border-r dark:border-zinc-800 light:border-slate-200'
          )}>
            <AnimatedImage
              src={node.image}
              alt={`${node.institution} — ${node.role}`}
              className="absolute inset-0 w-full h-full"
              objectFit="contain"
              hoverZoom={false}
            />
            {/* Company Logo badge */}
            <div className="absolute top-3 left-3 w-7 h-7 rounded-lg overflow-hidden bg-white/95 p-0.5 flex items-center justify-center border shadow-sm text-zinc-900 z-10">
              {node.logo}
            </div>
            {/* Type chip — bottom of image */}
            <div className="absolute bottom-3 right-3 z-10">
              <span className={cn(
                'text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm',
                {
                  'bg-accent-violet/20 text-accent-violet border border-accent-violet/30': node.type === 'work',
                  'bg-green-500/20 text-green-400 border border-green-500/30': node.type === 'academic',
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30': node.type === 'future',
                }
              )}>
                {isSwahili
                  ? node.type === 'work' ? 'kazi' : node.type === 'academic' ? 'elimu' : 'maono'
                  : node.type}
              </span>
            </div>
          </div>

          {/* RIGHT — Content column */}
          <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col justify-between gap-4">

            {/* Top: year + company + role */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-accent-violet/70 flex items-center gap-1.5 uppercase tracking-wider font-display">
                <Calendar size={11} />
                {node.year}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold dark:text-white light:text-slate-900 leading-tight tracking-tight">
                {node.institution}
              </h3>
              <p className={cn(
                'text-[11px] font-bold uppercase tracking-wider font-body',
                {
                  'text-accent-violet': node.type === 'work',
                  'text-green-500': node.type === 'academic',
                  'text-amber-500': node.type === 'future',
                }
              )}>
                {node.role}
              </p>
            </div>

            {/* Story — single paragraph, 3–5 sentences */}
            <p className="text-sm dark:text-zinc-300 light:text-slate-700 leading-relaxed font-body">
              {node.story}
            </p>

            {/* Lesson Learned */}
            <div className="flex items-start gap-2 border-l-2 border-accent-violet/40 pl-3 py-0.5">
              <BookOpen size={11} className="text-accent-violet shrink-0 mt-0.5" />
              <p className="text-[11px] italic dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
                &ldquo;{node.lessonLearned}&rdquo;
              </p>
            </div>

            {/* Skills chips */}
            <div className="flex flex-wrap gap-1.5">
              {node.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] font-semibold py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600 border dark:border-zinc-700/50 light:border-slate-200 transition-colors hover:border-accent-violet hover:text-accent-violet cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Visit button */}
            {node.website && (
              <div>
                <a
                  href={node.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white dark:text-zinc-300 light:text-slate-700 hover:border-accent-violet hover:text-accent-violet transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet font-semibold text-[11px] shadow-sm"
                  aria-label={`Visit official website for ${node.institution}`}
                >
                  <span>{isSwahili ? 'Tembelea ' : 'Visit '}{node.institution}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default TimelinePage;
