import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const BlogPage: React.FC = () => {
  const posts = [
    {
      title: 'Why Social Media is Not Enough for Online Business',
      desc: 'Many Tanzanian business owners use Facebook, WhatsApp, or TikTok as their entire online presence. Discover why you need unified CRM and database systems to manage customers, sales, and analytics.',
      date: 'June 24, 2026',
      readTime: '5 min read',
      category: 'IT Strategy',
      image: IMAGES.about.consulting
    },
    {
      title: 'Formulating SLAs: Key Lessons from Customer Excellence Operations',
      desc: 'Failing to define response times causes high support queues and client churn. Learn how to design ticket routing rules and SLA workflows to improve customer satisfaction.',
      date: 'May 12, 2026',
      readTime: '6 min read',
      category: 'Customer Strategy',
      image: IMAGES.services.customerSupport
    },
    {
      title: 'Database Security & Redundancy for Growing SMEs',
      desc: 'Relational database designs prevent transaction duplication and preserve financial data. Discover how PostgreSQL indexes and transaction locks secure your operational records.',
      date: 'March 18, 2026',
      readTime: '7 min read',
      category: 'Database Design',
      image: IMAGES.services.databaseDesign
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <PageTitle
        title="Blog & Insights | Denis Chamkaga Systems Consultant"
        description="Articles and guides on database design, CRM system architectures, SLA support strategies, and business information systems integration."
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
          Business Insights
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          Technology & Operations Blog
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          Articles, guides, and strategic posts on software systems, database designs, and customer experience operations.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <MotionCard
            key={i}
            delay={i * 0.08}
            className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg hover:border-accent-violet transition-colors duration-300 flex flex-col justify-between"
          >
            {/* Visual Header */}
            <div className="h-44 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
              <AnimatedImage 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full"
                hoverZoom={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-950/80 text-[10px] text-white border border-white/10 uppercase tracking-widest font-semibold z-20">
                {post.category}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold dark:text-white light:text-slate-800 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
                  {post.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t dark:border-zinc-800/40 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs dark:text-zinc-500 light:text-slate-400 font-body">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>
                <button className="flex items-center gap-1 hover:text-accent-violet cursor-pointer font-semibold text-accent-violet transition-colors">
                  <span>Read More</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
