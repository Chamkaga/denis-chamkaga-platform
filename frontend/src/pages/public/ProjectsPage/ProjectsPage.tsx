import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Folder, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/cn';
import { IMAGES } from '../../../constants/images';
import { SOCIALS } from '../../../constants/socials';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { Button } from '../../../components/atoms/Button';
import { ROUTES } from '../../../config/routes';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';
import { useLanguageStore } from '../../../store/useLanguageStore';

export const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'academic' | 'personal' | 'client' | 'ongoing'>('all');
  const navigate = useNavigate();
  // useTranslation ensures i18n is reactive on client-side navigation
  const { i18n } = useTranslation();
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw' || i18n.language === 'sw';

  const fallbackProjects = [
    {
      title: isSwahili ? 'Mfumo wa Usimamizi wa Shule' : 'School Management System',
      category: 'academic',
      status: isSwahili ? 'Imekamilika' : 'Completed',
      image: IMAGES.projects.schoolManagement,
      desc: isSwahili 
        ? 'Mfumo wa wavuti wa kusimamia wanafunzi, walimu, madarasa, mitihani na ada za shule.'
        : 'A web-based system for managing students, teachers, classes, examinations and school fees.',
      tech: ['PHP', 'MySQL', 'Bootstrap', 'HTML/CSS'],
      problem: isSwahili 
        ? 'Shule nyingi bado zinategemea kumbukumbu za mikono, na kufanya iwe vigumu kusimamia wanafunzi, mitihani na ada kwa ufanisi.'
        : 'Many schools still rely on manual record keeping, making it difficult to manage students, examinations and fee records efficiently.',
      challenge: isSwahili ? 'Yale Niliyojifunza' : 'What I Learned',
      solution: isSwahili
        ? 'Mradi huu ulinisaidia kuelewa majukumu ya watumiaji (user roles), kanzidata za uhusiano, utengenezaji wa ripoti na kubuni mifumo inayopanga shughuli za shule kwa ufanisi.'
        : 'This project helped me understand user roles, relational databases, report generation and designing systems that organize school operations efficiently.',
      timeline: isSwahili ? 'Miezi 2' : '2 Months',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: isSwahili ? 'Mfumo wa Usimamizi wa Maktaba' : 'Library Management System',
      category: 'academic',
      status: isSwahili ? 'Imekamilika' : 'Completed',
      image: IMAGES.projects.libraryManagement,
      desc: isSwahili
        ? 'Mfumo wa kuorodhesha vitabu, kusajili wanachama, na kufuatilia kuazima.'
        : 'A system for book indexing, member registration, and borrow tracking.',
      tech: ['PHP', 'MySQL', 'JavaScript', 'CSS'],
      problem: isSwahili
        ? 'Kile Nilichojenga: Usimamizi wa vitabu, usajili wa wanachama, kufuatilia kuazima na kurudisha, kukokotoa faini, na ripoti.'
        : 'What I Built: Book management, member registration, borrow & return tracking, fine calculation, and reports.',
      challenge: isSwahili ? 'Yale Niliyojifunza' : 'What I Learned',
      solution: isSwahili
        ? 'Uhusiano wa database, shughuli za CRUD, mantiki ya biashara (business logic), na uundaji wa programu kwa PHP.'
        : 'Database relationships, CRUD operations, business logic, and PHP development.',
      timeline: isSwahili ? 'Miezi 2' : '2 Months',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: isSwahili ? 'Mfumo wa Usimamizi wa Hosteli' : 'Hostel Management System',
      category: 'academic',
      status: isSwahili ? 'Imekamilika' : 'Completed',
      image: IMAGES.projects.hostelManagement,
      desc: isSwahili
        ? 'Mfumo wa kusimamia ugawaji wa vyumba, ufuatiliaji wa nafasi, na usajili wa wanafunzi wanaoingia.'
        : 'A system to manage room allocations, occupancy tracking, and student check-ins.',
      tech: ['PHP', 'MySQL', 'CSS'],
      problem: isSwahili
        ? 'Kile Nilichojenga: Usimamizi wa vyumba, ugawaji wa vyumba, kufuatilia nafasi zilizopo, na sajili za wanafunzi wanaoingia.'
        : 'What I Built: Room management, room allocation, occupancy tracking, check-in log registers.',
      challenge: isSwahili ? 'Yale Niliyojifunza' : 'What I Learned',
      solution: isSwahili
        ? 'Mradi huu ulinisaidia kuelewa ugawaji wa vyumba, kufuatilia nafasi zilizochukuliwa na kupanga taarifa za hosteli katika mfumo uliopangwa.'
        : 'The project helped me understand room allocation, occupancy tracking and organizing hostel information in a structured system.',
      timeline: isSwahili ? 'Miezi 2' : '2 Months',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: isSwahili ? 'Mfumo wa Usimamizi wa Stoo' : 'Inventory Management System',
      category: 'client',
      status: isSwahili ? 'Imekamilika' : 'Completed',
      image: IMAGES.projects.inventoryManagement,
      desc: isSwahili
        ? 'Dashibodi ya biashara kufuatilia bidhaa, viwango vya stoki, wauzaji na ripoti za mauzo.'
        : 'A retail dashboard to track products, monitor stock levels, manage suppliers, and generate sales reports.',
      tech: ['PHP', 'MySQL', 'Bootstrap', 'Chart.js'],
      problem: isSwahili
        ? 'Biashara nyingi ndogo zinatatizika kufuatilia bidhaa zao kwa usahihi, jambo linalopelekea tofauti za stoki na kupotea kwa mauzo.'
        : 'Many small businesses struggle to track their inventory accurately, leading to stock discrepancies and lost sales.',
      challenge: isSwahili ? 'Yale Niliyojifunza' : 'What I Learned',
      solution: isSwahili
        ? 'Kusanifu dashibodi za stoo zinazofaa kwenye simu, kukokotoa viwango vya chini vya bidhaa ili kuweka tahadhari, na kupanga majedwali salama.'
        : 'Designing responsive inventory dashboards, calculating stock thresholds for alerts, and structuring secure tables.',
      timeline: isSwahili ? 'Miezi 3' : '3 Months',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: isSwahili ? 'Tovuti ya Wasifu na Jukwaa la Biashara' : 'Personal Portfolio & Business Platform',
      category: 'personal',
      status: isSwahili ? 'Inaendelea' : 'Ongoing',
      image: IMAGES.projects.portfolio,
      desc: isSwahili
        ? 'Tovuti hii inaonyesha ujuzi wangu, miradi na huduma huku ikifanya iwe rahisi kwa wateja wanaotarajiwa kujifunza kuhusu kazi yangu na kuwasiliana nami.'
        : 'This portfolio showcases my skills, projects and services while making it easy for potential clients to learn about my work and contact me.',
      tech: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'OpenAI'],
      problem: isSwahili
        ? 'Kuanzisha uwepo wa kitaalamu mtandaoni unaowakilisha elimu yangu ya kweli na uzoefu wa kazi.'
        : 'Establishing a professional online presence that represents my genuine educational background and operational expertise.',
      challenge: isSwahili ? 'Vipengele Vilivyopo' : 'Features',
      solution: isSwahili
        ? 'Muundo unaofaa simu, Msaidizi wa AI, Sehemu ya Miradi, Fomu ya Mawasiliano, na Kurasa za Huduma.'
        : 'Responsive Design, AI Assistant, Project Showcase, Contact Form, Service Pages.',
      timeline: isSwahili ? 'Amilifu' : 'Active',
      repoUrl: 'https://github.com/Chamkaga/denis-chamkaga-platform',
      demoUrl: '/'
    },
    {
      title: isSwahili ? 'Jukwaa la Terrasafi' : 'Terrasafi Platform',
      category: 'ongoing',
      status: isSwahili ? 'Mradi wa Baadaye' : 'Future Project',
      image: IMAGES.projects.terrasafi,
      desc: isSwahili
        ? 'Terrasafi ni maono yangu ya muda mrefu ya kujenga suluhisho za programu za vitendo zinazosaidia biashara ndogo na za kati kurahisisha shughuli zao kupitia teknolojia.'
        : 'Terrasafi is my long-term vision to build practical software solutions that help small and medium-sized businesses simplify daily operations through modern technology.',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'NGINX'],
      problem: isSwahili
        ? 'Biashara nyingi ndogo nchini Tanzania zinatatizika na mifumo migumu na kukosa ushauri maalum wa kiufundi.'
        : 'Most local small business owners struggle with complex systems and lack specialized tech consultations.',
      challenge: isSwahili ? 'Maono ya Baadaye' : 'Future Goal',
      solution: isSwahili
        ? 'Kuwapatia wajasiriamali wa ndani zana za kulinda kumbukumbu zao, kuzuia uvujaji wa utendaji, na kuhama kutoka kwenye makaratasi.'
        : 'Providing local entrepreneurs with tools to secure records, stop operational leaks, and transition from manual paper systems.',
      timeline: isSwahili ? 'Maono ya Baadaye' : 'Future Vision',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: 'https://terrasafi.com'
    }
  ];

  const displayProjects = fallbackProjects;

  const filteredProjects = displayProjects.filter(
    (p: any) => filter === 'all' || p.category === filter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left font-body">
      <PageTitle
        title={isSwahili ? "Miradi Yangu | Denis Chamkaga" : "Projects & Works | Denis Chamkaga Portfolio"}
        description={isSwahili ? "Kagua miradi ya programu iliyojengwa na Denis Chamkaga." : "Browse academic, personal, and client software projects built by Denis Chamkaga."}
      />
      
      {/* Header */}
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
          {isSwahili ? "Kazi Zangu" : "My Showcase"}
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          {isSwahili ? "Miradi ya Kweli, Kujifunza na Maendeleo ya Baadaye" : "Real Projects, Learning Projects & Ongoing Development"}
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          {isSwahili 
            ? "Kila mradi unawakilisha hatua katika ukuaji wangu kama msanidi programu. Baadhi zilijengwa kwa masomo, zingine kwa mahitaji ya kweli ya biashara, na zingine zinaendelea kutengenezwa."
            : "Every project represents a step in my growth as a software developer. Some were built for academic learning, others for real-world business needs, and some are currently under active development."}
        </motion.p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b dark:border-zinc-800/80 light:border-slate-200">
        {(['all', 'academic', 'personal', 'client', 'ongoing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-accent-violet",
              filter === tab
                ? "dark:bg-accent-violet dark:text-white dark:border-accent-violet light:bg-light-accent light:text-white light:border-light-accent"
                : "dark:border-zinc-800 dark:text-zinc-400 dark:bg-zinc-900/40 light:border-slate-200 light:text-slate-600 light:bg-white hover:border-accent-violet"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects Grid with layout transitions */}
      <motion.div 
        layout 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p: any) => (
            <motion.div
              layout
              key={p.title}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg hover:border-accent-violet transition-colors duration-300 flex flex-col justify-between"
            >
              
              {/* Visual Image Block */}
              <div className="h-52 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
                <AnimatedImage 
                  src={p.image} 
                  alt={p.title} 
                  className="w-full h-full"
                  hoverZoom={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
                <div className="absolute top-4 left-4 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-950/80 text-[10px] text-white border border-white/10 uppercase tracking-widest font-semibold z-20">
                  <Folder size={12} className="text-accent-violet" />
                  {p.category}
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <span className={cn(
                    "text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                    p.status.toLowerCase().includes('completed') || p.status.toLowerCase().includes('imekamilika')
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Content area */}
              <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold dark:text-white light:text-slate-800">
                    {p.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
                    {p.desc}
                  </p>

                  {/* Problem/Challenge/Solution Details */}
                  <div className="space-y-3 pt-2 text-xs font-body leading-relaxed">
                    <div className="p-3.5 rounded-xl dark:bg-zinc-950/30 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 space-y-2">
                      <div>
                        <span className="font-semibold dark:text-zinc-300 light:text-slate-800">Problem:</span>{' '}
                        <span className="dark:text-zinc-500 light:text-slate-500">{p.problem}</span>
                      </div>
                      <div>
                        <span className="font-semibold dark:text-zinc-300 light:text-slate-800">{p.challenge}:</span>{' '}
                        <span className="dark:text-zinc-500 light:text-slate-500">{p.solution}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="space-y-4 pt-4 border-t dark:border-zinc-800/40 light:border-slate-100">
                  
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((t: string) => (
                      <span key={t} className="text-[10px] font-semibold font-body py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between text-xs dark:text-zinc-500 light:text-slate-400 font-body pt-1">
                    <span>{isSwahili ? "Muda wa Kazi" : "Timeline"}: {p.timeline}</span>
                    <div className="flex gap-4">
                      {p.repoUrl && (
                        <a 
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1 transition-colors font-semibold"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d={SOCIALS.gitHub.svgPath} />
                          </svg>
                          <span>GitHub</span>
                        </a>
                      )}
                      {p.demoUrl && (
                        p.demoUrl.startsWith('/') ? (
                          <Link 
                            to={p.demoUrl}
                            className="flex items-center gap-1 hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1 transition-colors font-semibold"
                          >
                            <ExternalLink size={14} className="shrink-0" />
                            <span>{isSwahili ? "Onyesho la Mfumo" : "Live Demo"}</span>
                          </Link>
                        ) : (
                          <a 
                            href={p.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1 transition-colors font-semibold"
                          >
                            <ExternalLink size={14} className="shrink-0" />
                            <span>{isSwahili ? "Onyesho la Mfumo" : "Live Demo"}</span>
                          </a>
                        )
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* "What I Can Build For You" Section */}
      <section className="p-8 sm:p-12 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-violet/5 rounded-full blur-[80px] -z-10" />
        <Folder size={32} className="text-accent-violet" />
        
        <div className="space-y-2 max-w-lg">
          <h2 className="text-xl sm:text-2xl font-extrabold dark:text-white font-display">
            {isSwahili ? "Nini Ninaweza Kukujengea" : "What I Can Build For You"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-body">
            {isSwahili 
              ? "Nina utaalamu wa kuunda suluhisho za vitendo na tovuti za kisasa ambazo zinarahisisha uendeshaji wa shughuli zako za kila siku."
              : "I specialize in building practical software systems and modern websites that simplify your daily operational workflows."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full text-left font-body text-xs sm:text-sm dark:text-zinc-300 light:text-slate-700">
          {[
            isSwahili ? "Mifumo ya Shule (School Management)" : "School Management Systems",
            isSwahili ? "Mifumo ya Stoo (Inventory Systems)" : "Inventory Systems",
            isSwahili ? "Mifumo ya Mauzo (POS Systems)" : "POS Systems",
            isSwahili ? "Mifumo ya Usimamizi (Business Management)" : "Business Management Systems",
            isSwahili ? "Tovuti za Biashara (Company Websites)" : "Company Websites",
            isSwahili ? "Programu Maalum za Wavuti (Web Apps)" : "Custom Web Applications"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border dark:border-zinc-800/60 light:border-slate-200/80 dark:bg-zinc-900/20 light:bg-white shadow-sm">
              <CheckCircle size={16} className="text-accent-violet shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <Button 
          variant="primary" 
          size="md" 
          onClick={() => navigate(ROUTES.CONTACT)} 
          className="mt-4 cursor-pointer shadow-md shadow-accent-violet/10 font-bold"
        >
          {isSwahili ? "Tujenge Mradi Wako" : "Let's Build Your Project"}
        </Button>
      </section>
    </div>
  );
};

export default ProjectsPage;
