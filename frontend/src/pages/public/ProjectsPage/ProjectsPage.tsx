import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Folder } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { IMAGES } from '../../../constants/images';
import { SOCIALS } from '../../../constants/socials';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'ongoing' | 'academic' | 'commercial'>('all');

  const projects = [
    {
      title: 'School Management System',
      category: 'academic',
      status: 'Completed',
      image: IMAGES.projects.schoolManagement,
      desc: 'A complete system for managing student tracking, teachers, class schedules, fees, exams, and reports.',
      tech: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
      problem: 'Manual bookkeeping and spreadsheets caused massive bottlenecks and errors during exam reporting and fee payment verification.',
      challenge: 'Structuring database constraints so that scheduling overlaps were verified server-side without degrading API execution speeds.',
      solution: 'Built a multi-role relational system that automated report generation and provided instant financial transaction verification logs.',
      timeline: '2023 (3 Months)',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: 'Library Management System',
      category: 'academic',
      status: 'Completed',
      image: IMAGES.projects.libraryManagement,
      desc: 'System for managing book inventories, member issued cards, return deadlines, automatic fines calculation, and reporting.',
      tech: ['PHP', 'MySQL', 'JavaScript', 'CSS'],
      problem: 'Unverified book issues and manual return calculations led to inventory loss and lost time tracking defaults.',
      challenge: 'Writing transaction-safe reserve query procedures to prevent two students booking the same copy simultaneously.',
      solution: 'Created an alerts-based reservation system that computed late fines automatically on book checks.',
      timeline: '2023 (2 Months)',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: 'Hostel Management System',
      category: 'academic',
      status: 'Completed',
      image: IMAGES.projects.hostelManagement,
      desc: 'Manage hostels, student room allocations, payments, maintenance logs, and visitor registrations.',
      tech: ['PHP', 'MySQL', 'CSS'],
      problem: 'Overbooking of hostel rooms and zero tracking of active maintenance work or visitor entries.',
      challenge: 'Rendering room coordinates dynamically to represent occupancy and cleanliness updates simultaneously.',
      solution: 'Developed a calendar-based allocation grid showing occupied and cleaning status dynamically.',
      timeline: '2024 (2 Months)',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: 'Inventory Management System',
      category: 'commercial',
      status: 'Completed',
      image: IMAGES.projects.inventoryManagement,
      desc: 'Track retail products, stock levels, suppliers, sales reports, and barcode generations.',
      tech: ['PHP', 'MySQL', 'Bootstrap', 'Chart.js'],
      problem: 'Frequent stock-outs and lack of sales trends data prevented simple forecast analysis.',
      challenge: 'Handling real-time stock deductions on rapid cash sales while preserving inventory log audits.',
      solution: 'Created a stock threshold alert dashboard with monthly sales summary charts.',
      timeline: '2024 (3 Months)',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: '/contact'
    },
    {
      title: 'Personal Portfolio & Business Platform',
      category: 'ongoing',
      status: 'Ongoing',
      image: IMAGES.projects.portfolio,
      desc: 'The current business platform, CRM dashboard, and local Ollama Llama 3 AI chatbot integration.',
      tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Ollama'],
      problem: 'Denis needed a unified digital office to qualify leads, present credentials, and act as a base for future company vision.',
      challenge: 'Enforcing strict system prompts to prevent Denis Assistant behaving as a general chatbot while preserving local inference speed.',
      solution: 'Developing an npm-workspaced monorepo featuring Atomic Components, Zustand, and a local AI coordinator.',
      timeline: '2025 (Active)',
      repoUrl: 'https://github.com/Chamkaga/denis-chamkaga-platform',
      demoUrl: '/'
    },
    {
      title: 'Terrasafi Platform',
      category: 'commercial',
      status: 'ongoing',
      image: IMAGES.projects.terrasafi,
      desc: 'A future scalable system to empower African SMEs with clean, robust digital operations software.',
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'NGINX'],
      problem: 'Most local small business owners struggle with complex systems and lack specialized tech consultations.',
      challenge: 'Designing modular database configurations to serve isolated multitenant client pools securely.',
      solution: 'Developing a SaaS modular suite mapping billing, database tracking, and IT support strategy.',
      timeline: '2025+ (Future Vision)',
      repoUrl: 'https://github.com/Chamkaga',
      demoUrl: 'https://terrasafi.com'
    }
  ];

  const filteredProjects = projects.filter(
    (p) => filter === 'all' || p.category === filter || (filter === 'completed' && p.status.toLowerCase() === 'completed') || (filter === 'ongoing' && p.status.toLowerCase() === 'ongoing')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left font-body">
      <PageTitle
        title="Projects & Works | Denis Chamkaga Portfolio"
        description="Browse academic and commercial software projects built by Denis Chamkaga, featuring relational database configurations, customer CRM pipelines, and clean architectures."
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
          My Showcase
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          Completed & Ongoing Projects
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          A complete portfolio of commercial systems, academic assignments, and ongoing platforms built using PHP, JavaScript, and TypeScript.
        </motion.p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b dark:border-zinc-800/80 light:border-slate-200">
        {(['all', 'completed', 'ongoing', 'academic', 'commercial'] as const).map((tab) => (
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
          {filteredProjects.map((p) => (
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
                    p.status.toLowerCase() === 'completed'
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
                        <span className="font-semibold dark:text-zinc-300 light:text-slate-800">Challenge:</span>{' '}
                        <span className="dark:text-zinc-500 light:text-slate-500">{p.challenge}</span>
                      </div>
                      <div>
                        <span className="font-semibold dark:text-zinc-300 light:text-slate-800">Solution:</span>{' '}
                        <span className="dark:text-zinc-500 light:text-slate-500">{p.solution}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="space-y-4 pt-4 border-t dark:border-zinc-800/40 light:border-slate-100">
                  
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <span key={t} className="text-[10px] font-semibold font-body py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between text-xs dark:text-zinc-500 light:text-slate-400 font-body pt-1">
                    <span>Timeline: {p.timeline}</span>
                    <div className="flex gap-4">
                      <a 
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1 transition-colors font-semibold"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d={SOCIALS.gitHub.svgPath} />
                        </svg>
                        <span>Repository</span>
                      </a>
                      <a 
                        href={p.demoUrl}
                        target={p.demoUrl.startsWith('/') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1 transition-colors font-semibold"
                      >
                        <ExternalLink size={14} className="shrink-0" />
                        <span>Live Demo</span>
                      </a>
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProjectsPage;
