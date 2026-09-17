import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Folder, CheckCircle, X, ArrowRight } from 'lucide-react';
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
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const navigate = useNavigate();
  // useTranslation ensures i18n is reactive on client-side navigation
  const { i18n } = useTranslation();
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw' || i18n.language === 'sw';

  const fallbackProjects = [
    {
      title: isSwahili ? 'FODS — Mfumo wa Kuagiza na Kusafirisha Chakula' : 'FODS — Food Ordering and Delivery System',
      category: 'academic',
      status: isSwahili ? 'Imekamilika' : 'Completed',
      image: IMAGES.projects.fods,
      desc: isSwahili
        ? 'Soko la kidijitali la watoa huduma wengi linalowaunganisha wateja na migahawa, wauzaji wa vyakula vya haraka na vya asili, bakery, vinywaji, vitafunwa na cafeteria. App moja humsaidia mteja kugundua huduma zinazopatikana kulingana na eneo alipo.'
        : 'A multi-provider food marketplace connecting customers with restaurants, fast-food outlets, local vendors, bakeries, drinks and snacks providers, and cafeterias. One application helps customers discover available services based on their location.',
      tech: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'],
      problem: isSwahili
        ? 'Wafanyabiashara wengi wa chakula—wadogo, wa kati na wakubwa—hawana mfumo unaowaunganisha na wateja wa maeneo mbalimbali. Oda hutegemea simu, kutembelea duka, daftari na malipo yasiyounganishwa; wateja hawawezi kuona kwa urahisi watoa huduma wa karibu, menyu, bei, hali ya oda, delivery au historia ya malipo.'
        : 'Many small, medium and large food businesses lack a system that connects them with customers across different locations. Ordering depends on calls, physical visits, notebooks and disconnected payments, while customers cannot easily discover nearby providers, menus, prices, order status, delivery or payment history.',
      challenge: isSwahili ? 'Suluhisho Lililobuniwa' : 'Designed Solution',
      solution: isSwahili
        ? 'FODS huweka watoa huduma wengi kwenye app moja, hutumia eneo la mteja kusaidia kugundua huduma zinazofaa, na kuunganisha akaunti salama, menyu, oda, malipo, maandalizi, delivery, reviews, administration na reporting katika workflow moja kwa biashara za ukubwa wote.'
        : 'FODS places multiple providers in one application, uses customer location to support relevant discovery, and connects secure accounts, menus, orders, payments, fulfilment, delivery, reviews, administration and reporting in one workflow for food businesses of every size.',
      timeline: isSwahili ? 'Mwezi 1' : '1 Month',
      repoUrl: 'https://github.com/Chamkaga/FODS',
      demoUrl: import.meta.env.VITE_FODS_DEMO_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')
    },
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
      title: isSwahili ? 'Jukwaa la Wasifu na Uendeshaji wa Biashara' : 'Personal Portfolio & Business Operations Platform',
      category: 'personal',
      status: isSwahili ? 'Imekamilika' : 'Completed',
      image: IMAGES.projects.portfolio,
      desc: isSwahili
        ? 'Niliijenga kama jukwaa la biashara linalojieleza, si portfolio ya kawaida ya picha na wasifu pekee. Linaonyesha safari yangu, uwezo, huduma na miradi, huku likimsaidia mteja kuelewa ninachoweza kumjengea na kuanza safari ya huduma.'
        : 'I built this as a self-explanatory business platform rather than a conventional portfolio of images and biography alone. It presents my journey, capabilities, services and projects while helping a potential customer understand what I can build and begin a service journey.',
      tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'OpenAI'],
      problem: isSwahili
        ? 'Portfolio nyingi huonyesha taarifa na screenshots pekee, lakini hazimsaidii mteja kuelewa tatizo gani msanidi anaweza kutatua, kupata ushauri, kuwasiliana kwa mpangilio au kuendelea hadi kuwa mteja anayelipa. Hali hiyo hupoteza leads, ushahidi wa uwezo na nafasi ya kukuza biashara.'
        : 'Many portfolios only display information and screenshots. They do not help a visitor understand which business problems the developer can solve, receive guidance, make a structured enquiry or progress into a paying customer. This loses leads, evidence of capability and opportunities for business growth.',
      challenge: isSwahili ? 'Suluhisho Lililobuniwa' : 'Designed Solution',
      solution: isSwahili
        ? 'Mfumo unaeleza Denis ni nani, kazi alizofanya, uwezo na huduma zake; Mary huelimisha, huchambua hitaji, hukusanya lead na kufanya handoff. Safari inaendelea kupitia consultation, quotation, invoice, malipo na project delivery, huku Admin Console ikisimamia CRM, fedha, calls, knowledge, content, reports na follow-up—ili kugeuza uaminifu na uwezo kuwa wateja, mapato na ukuaji wa biashara.'
        : 'The platform explains who Denis is, the work he has completed, his capabilities and services. Mary educates visitors, diagnoses needs, captures leads and coordinates handoff. The journey continues through consultation, quotation, invoice, payment and project delivery, while the Admin Console manages CRM, finance, calls, knowledge, content, reporting and follow-up—turning trust and demonstrated capability into customers, revenue and business growth.',
      timeline: isSwahili ? 'Miezi 3' : '3 Months',
      repoUrl: 'https://github.com/Chamkaga/denis-chamkaga-platform',
      demoUrl: '/'
    },
    {
      title: isSwahili ? 'Terrasafi T Ltd — Jukwaa la Kampuni' : 'Terrasafi T Ltd — Company Platform',
      category: 'ongoing',
      status: isSwahili ? 'Inaendelea' : 'Ongoing',
      image: IMAGES.projects.terrasafi,
      desc: isSwahili
        ? 'Terrasafi ni kampuni ninayoijenga kama mwanzilishi na lead developer, ikiunganisha stationery na printing, technology solutions, network setup, graphic design, pamoja na uuzaji wa electronics na accessories kupitia public website na mfumo salama wa ndani.'
        : 'Terrasafi is a company I am building as founder and lead developer, bringing together stationery and printing, technology solutions, network setup, graphic design, and electronics and accessories retail through a public website and secure private operations system.',
      tech: ['PostgreSQL', 'Express', 'React', 'Node.js'],
      problem: isSwahili
        ? 'Wateja na biashara nyingi hulazimika kutafuta printing, vifaa vya ofisi, graphic design, network setup, electronics na ushauri wa teknolojia kwa watoa huduma tofauti. Hii huongeza muda, gharama na ugumu wa kufuatilia quotations, oda, malipo na huduma baada ya mauzo.'
        : 'Customers and businesses often source printing, office supplies, graphic design, network setup, electronics and technology support from separate providers. This increases time, cost and the difficulty of tracking quotations, orders, payments and after-sales service.',
      challenge: isSwahili ? 'Suluhisho Lililopangwa' : 'Planned Solution',
      solution: isSwahili
        ? 'Upande wa public utaonyesha huduma, bidhaa, portfolio, maombi ya quotation, oda na support. Upande wa private utasimamia CRM, inventory, POS, quotations, invoices, payments, projects, printing jobs, suppliers, customer follow-up, reports na ruhusa za wafanyakazi katika mfumo mmoja.'
        : 'The public side will present services, products, portfolio work, quotation requests, orders and support. The private side will manage CRM, inventory, POS, quotations, invoices, payments, projects, printing jobs, suppliers, customer follow-up, reports and staff permissions in one system.',
      timeline: isSwahili ? 'Inaendelea' : 'Ongoing',
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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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
              <div className="aspect-video bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
                <AnimatedImage 
                  src={p.image} 
                  alt={p.title} 
                  className="w-full h-full"
                  objectFit="cover"
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
              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold dark:text-white light:text-slate-800">
                    {p.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body line-clamp-3">
                    {p.desc}
                  </p>
                  <button onClick={() => setSelectedProject(p)} className="inline-flex items-center gap-2 text-xs font-bold text-accent-violet hover:underline focus:outline-none focus:ring-2 focus:ring-accent-violet rounded w-fit">
                    {isSwahili ? 'Soma Case Study' : 'View Case Study'} <ArrowRight size={13} />
                  </button>
                </div>

                {/* Bottom Metadata */}
                <div className="space-y-4 pt-4 border-t dark:border-zinc-800/40 light:border-slate-100">
                  
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.slice(0, 5).map((t: string) => (
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

      <AnimatePresence>
        {selectedProject && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)}>
            <motion.article role="dialog" aria-modal="true" aria-labelledby="project-case-study-title" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.22 }} onClick={(event) => event.stopPropagation()} className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950 light:bg-white shadow-2xl">
              <div className="relative h-44 overflow-hidden rounded-t-2xl bg-zinc-950 sm:h-52">
                <AnimatedImage src={selectedProject.image} alt={selectedProject.title} className="h-full w-full" objectFit="cover" hoverZoom={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <button onClick={() => setSelectedProject(null)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-zinc-950/75 text-white hover:bg-zinc-900" aria-label={isSwahili ? 'Funga' : 'Close'}><X size={17} /></button>
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">{selectedProject.category} · {selectedProject.status}</p>
                  <h2 id="project-case-study-title" className="mt-1 text-xl font-extrabold sm:text-2xl">{selectedProject.title}</h2>
                </div>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-sm leading-relaxed dark:text-zinc-300 light:text-slate-700">{selectedProject.desc}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <section className="rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/40 light:bg-slate-50 p-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider dark:text-white light:text-slate-900">{isSwahili ? 'Tatizo' : 'Problem'}</h3>
                    <p className="mt-2 text-xs leading-relaxed dark:text-zinc-400 light:text-slate-600">{selectedProject.problem}</p>
                  </section>
                  <section className="rounded-xl border border-accent-violet/20 bg-accent-violet/5 p-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent-violet">{selectedProject.challenge}</h3>
                    <p className="mt-2 text-xs leading-relaxed dark:text-zinc-300 light:text-slate-700">{selectedProject.solution}</p>
                  </section>
                </div>
                <div className="flex flex-wrap gap-2">{selectedProject.tech.map((tech: string) => <span key={tech} className="rounded-lg dark:bg-zinc-800 light:bg-slate-100 px-2.5 py-1 text-[10px] font-semibold dark:text-zinc-300 light:text-slate-600">{tech}</span>)}</div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t dark:border-zinc-800 light:border-slate-200 pt-5">
                  <span className="text-xs dark:text-zinc-500 light:text-slate-500">{isSwahili ? 'Muda wa kazi' : 'Timeline'}: <strong>{selectedProject.timeline}</strong></span>
                  <div className="flex gap-3">
                    {selectedProject.repoUrl && <a href={selectedProject.repoUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border dark:border-zinc-800 light:border-slate-200 px-4 py-2 text-xs font-bold hover:border-accent-violet hover:text-accent-violet">GitHub</a>}
                    {selectedProject.demoUrl && <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-accent-violet px-4 py-2 text-xs font-bold text-white">{isSwahili ? 'Onyesho la Mfumo' : 'Live Demo'}</a>}
                  </div>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

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
