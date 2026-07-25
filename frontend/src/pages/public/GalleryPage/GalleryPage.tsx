import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, MapPin, Tag } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../services/api';
import { useLanguageStore } from '../../../store/useLanguageStore';

export const GalleryPage: React.FC = () => {
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';

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
    { key: 'all', label: isSwahili ? 'Zote' : 'All' },
    { key: 'professional', label: isSwahili ? 'Kitaalamu' : 'Professional' },
    { key: 'university', label: isSwahili ? 'Chuo Kikuu' : 'University' },
    { key: 'assignments', label: isSwahili ? 'Kazi za Chuo' : 'Assignments' },
    { key: 'projects', label: isSwahili ? 'Miradi' : 'Projects' },
    { key: 'certificates', label: isSwahili ? 'Vyeti' : 'Certificates' },
    { key: 'awards', label: isSwahili ? 'Tuzo' : 'Awards' },
    { key: 'events', label: isSwahili ? 'Matukio' : 'Events' },
    { key: 'training', label: isSwahili ? 'Mafunzo' : 'Training' },
    { key: 'community', label: isSwahili ? 'Jamii' : 'Community' },
    { key: 'technology', label: isSwahili ? 'Teknolojia' : 'Technology' }
  ] as const;

  const { data: dbGallery } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: () => publicApi.getGallery(),
  });

  const fallbackItems = [
    {
      title: 'PCCI Group Operations',
      desc: isSwahili ? 'Mafunzo ya kiutendaji na usaidizi kwa timu ya huduma kwa wateja kulingana na sheria za SLA.' : 'Active customer experience team operations and system guidance training, focusing on SLA metrics.',
      date: '2023',
      location: 'PCCI Operations Desk',
      category: 'professional',
      image: IMAGES.gallery.work,
      categoryLabel: isSwahili ? 'Kitaalamu' : 'Professional'
    },
    {
      title: 'UDCC Computing Lab',
      desc: isSwahili ? 'Kikao cha ushirikiano cha uchambuzi wa mifumo katika Chuo Kikuu cha Dar es Salaam Computing Centre.' : 'Systems analysis collaborative team session at University of Dar es Salaam Computing Centre.',
      date: '2022',
      location: 'UDSM Campus',
      category: 'university',
      image: IMAGES.gallery.university,
      categoryLabel: isSwahili ? 'Chuo Kikuu' : 'University'
    },
    {
      title: 'Relational SQL Coursework',
      desc: isSwahili ? 'Ubunifu wa database, normalization, na majaribio ya trigger kwa ajili ya grading za chuo.' : 'Database schema design, normalization, and trigger constraints testing for academic grading.',
      date: '2023',
      location: 'UDCC Science Lab',
      category: 'assignments',
      image: IMAGES.gallery.assignments,
      categoryLabel: isSwahili ? 'Kazi za Chuo' : 'Assignments'
    },
    {
      title: 'Terrasafi Platform Testing',
      desc: isSwahili ? 'Kuandaa vipengele vya POS maalum na kujaribu monorepo package distributions kwenye sandbox ya majaribio.' : 'Coding custom POS components and testing monorepo package distributions in the development sandbox.',
      date: '2025',
      location: 'Denis Digital Office',
      category: 'projects',
      image: IMAGES.gallery.projects,
      categoryLabel: isSwahili ? 'Miradi' : 'Projects'
    },
    {
      title: 'BIT Academic Credentials Wall',
      desc: isSwahili ? 'Vyeti vya kitaaluma na vya kitaalam vilivyopatikana katika ubunifu wa database na mifumo.' : 'Academic and professional certificates obtained in system engineering and database design.',
      date: '2025',
      location: 'UDCC Registry',
      category: 'certificates',
      image: IMAGES.gallery.certificates,
      categoryLabel: isSwahili ? 'Vyeti' : 'Certificates'
    },
    {
      title: 'PCCI Top Performer Recognition',
      desc: isSwahili ? 'Sherehe ya tuzo ya kutambua nyakati bora za majibu ya SLA na kiwango cha kuridhisha cha wateja.' : 'Award ceremony recognizing outstanding SLA response times and customer support satisfaction score benchmarks.',
      date: '2021',
      location: 'PCCI Headquarters',
      category: 'awards',
      image: IMAGES.gallery.awards,
      categoryLabel: isSwahili ? 'Tuzo' : 'Awards'
    }
  ];

  const dbItems = dbGallery?.data || [];

  const displayItems = (dbItems && dbItems.length > 0)
    ? dbItems.map((item: any) => ({
        title: item.title,
        desc: item.description || '',
        date: item.eventDate ? new Date(item.eventDate).getFullYear().toString() : 'Active',
        location: item.location || 'Tanzania',
        category: item.category?.toLowerCase() || 'professional',
        image: item.imageUrl || IMAGES.gallery.work,
        categoryLabel: item.category || 'Professional'
      }))
    : fallbackItems;

  const filteredItems = displayItems.filter(
    (item: any) => activeTab === 'all' || item.category === activeTab
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left font-body">
      
      <PageTitle
        title={isSwahili ? "Matunzio | Denis Chamkaga" : "Gallery | Denis Chamkaga Systems Consultant"}
        description={isSwahili ? "Picha za matukio ya kitaalamu, vyuo na miradi ya IT." : "Visual archive of operational career highlights, university labs, certificate acquisitions, and developer workspaces."}
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
          {isSwahili ? "Kumbukumbu za Picha" : "Visual Archive"}
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          {isSwahili ? "Matunzio ya Kitaalamu & Vyuo" : "Operational & Academic Gallery"}
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          {isSwahili 
            ? "Kumbukumbu za picha za safari yangu ya kiutendaji, kazi za chuo cha UDSM Computing Centre, na mifano ya maendeleo ya mifumo."
            : "A visual archive of my career checkpoints, university coursework labs, certificates presentation, and developer sandboxes."}
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
          {filteredItems.map((item: any) => (
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
