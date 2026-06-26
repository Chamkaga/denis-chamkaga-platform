import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, MapPin, Tag } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const GalleryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'all'
    | 'professional'
    | 'university'
    | 'assignments'
    | 'projects'
    | 'certificates'
    | 'awards'
    | 'events'
    | 'training'
    | 'community'
    | 'technology'
  >('all');

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'professional', label: 'Professional' },
    { key: 'university', label: 'University' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'projects', label: 'Projects' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'awards', label: 'Awards' },
    { key: 'events', label: 'Events' },
    { key: 'training', label: 'Training' },
    { key: 'community', label: 'Community' },
    { key: 'technology', label: 'Technology' }
  ] as const;

  const items = [
    {
      title: 'PCCI Group Operations',
      desc: 'Active customer experience team operations and system guidance training, focusing on SLA metrics.',
      date: '2023',
      location: 'PCCI Operations Desk',
      category: 'professional',
      image: IMAGES.gallery.work,
      categoryLabel: 'Professional'
    },
    {
      title: 'UDCC Computing Lab',
      desc: 'Systems analysis collaborative team session at University of Dar es Salaam Computing Centre.',
      date: '2022',
      location: 'UDSM Campus',
      category: 'university',
      image: IMAGES.gallery.university,
      categoryLabel: 'University'
    },
    {
      title: 'Relational SQL Coursework',
      desc: 'Database schema design, normalization, and trigger constraints testing for academic grading.',
      date: '2023',
      location: 'UDCC Science Lab',
      category: 'assignments',
      image: IMAGES.gallery.assignments,
      categoryLabel: 'Assignments'
    },
    {
      title: 'Terrasafi Platform Testing',
      desc: 'Coding custom POS components and testing monorepo package distributions in the development sandbox.',
      date: '2025',
      location: 'Denis Digital Office',
      category: 'projects',
      image: IMAGES.gallery.projects,
      categoryLabel: 'Projects'
    },
    {
      title: 'BIT Academic Credentials Wall',
      desc: 'Academic and professional certificates obtained in system engineering and database design.',
      date: '2025',
      location: 'UDCC Registry',
      category: 'certificates',
      image: IMAGES.gallery.certificates,
      categoryLabel: 'Certificates'
    },
    {
      title: 'PCCI Top Performer Recognition',
      desc: 'Award ceremony recognizing outstanding SLA response times and customer support satisfaction score benchmarks.',
      date: '2021',
      location: 'PCCI Headquarters',
      category: 'awards',
      image: IMAGES.gallery.awards,
      categoryLabel: 'Awards'
    },
    {
      title: 'SME Operational Mapping Meetup',
      desc: 'Teaching startup business owners database benefits over manual WhatsApp bookkeeping.',
      date: '2024',
      location: 'Dar es Salaam Hub',
      category: 'events',
      image: IMAGES.gallery.events,
      categoryLabel: 'Events'
    },
    {
      title: 'Retail Staff POS Training',
      desc: 'Conducting system guides and software training sessions for retail inventory managers.',
      date: '2024',
      location: 'Client Training Room',
      category: 'training',
      image: IMAGES.gallery.training,
      categoryLabel: 'Training'
    },
    {
      title: 'Tanzanian IT Network Meetup',
      desc: 'Sharing database designs and system analysis best practices at a local tech community gathering.',
      date: '2024',
      location: 'Community Space',
      category: 'community',
      image: IMAGES.gallery.community,
      categoryLabel: 'Community'
    },
    {
      title: 'Active Cloud Server Setup',
      desc: 'Configuring server environments, database backup automation, and NGINX reverse proxies.',
      date: '2025',
      location: 'Terrasafi Hosting Lab',
      category: 'technology',
      image: IMAGES.gallery.technology,
      categoryLabel: 'Technology'
    }
  ];

  const filteredItems = items.filter(
    (item) => activeTab === 'all' || item.category === activeTab
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <PageTitle
        title="Photo Gallery | Denis Chamkaga Work & Studies"
        description="A visual archive of professional customer relations operations, university computing labs, and software development sandbox setups."
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
          Journey in Photos
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          Operational & Academic Gallery
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          A visual archive of my career checkpoints, university coursework labs, certificates presentation, and developer sandboxes.
        </motion.p>
      </motion.div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b dark:border-zinc-800/80 light:border-slate-200">
        {categories.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-accent-violet",
              activeTab === tab.key
                ? "dark:bg-accent-violet dark:text-white dark:border-accent-violet light:bg-light-accent light:text-white light:border-light-accent"
                : "dark:border-zinc-800 dark:text-zinc-400 dark:bg-zinc-900/40 light:border-slate-200 light:text-slate-600 light:bg-white hover:border-accent-violet"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid with layout transitions */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.title}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg hover:border-accent-violet transition-colors duration-300 flex flex-col justify-between"
            >
              
              {/* Visual Block */}
              <div className="h-56 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
                <AnimatedImage 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full"
                  hoverZoom={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white font-semibold uppercase tracking-wider font-display z-20">
                  <Camera size={14} className="text-accent-violet" />
                  {item.title}
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-950/80 text-[10px] text-white border border-white/10 uppercase tracking-widest font-semibold z-20">
                  <Tag size={10} className="text-accent-violet" />
                  {item.categoryLabel}
                </div>
              </div>

              {/* Content area */}
              <div className="p-6 space-y-4 text-left">
                <p className="text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
                  {item.desc}
                </p>
                
                <div className="flex flex-wrap gap-4 text-xs dark:text-zinc-500 light:text-slate-400 font-body border-t dark:border-zinc-800/40 light:border-slate-100 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {item.location}
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default GalleryPage;
