import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../services/api';

export const BlogPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: blogResponse } = useQuery({
    queryKey: ['public-blog-posts'],
    queryFn: () => publicApi.getBlogPosts(),
  });

  const dbPosts = blogResponse?.data;

  const isSwahili = i18n.language === 'sw';

  const fallbackPosts = [
    {
      title: isSwahili ? 'Kwa Nini Mitandao ya Kijamii Pekee Haitoshi kwa Ukuaji wa Biashara' : 'Why Social Media Alone Is Not Enough for Business Growth',
      desc: isSwahili 
        ? 'Biashara nyingi ndogo zinategemea kabisa Facebook, Instagram au WhatsApp kuwahudumia wateja. Katika makala hii, ninaeleza kwa nini kuwa na tovuti ya kitaalamu au mfumo wa biashara kunaweza kuongeza uaminifu kwa wateja, mpangilio mzuri na ukuaji wa muda mrefu.'
        : 'Many small businesses rely entirely on Facebook, Instagram or WhatsApp to serve customers. In this article, I explain why having a professional website or business system can improve customer trust, organization and long-term growth.',
      date: isSwahili ? 'Juni 24, 2026' : 'June 24, 2026',
      readTime: isSwahili ? 'Dakika 5 kusoma' : '5 min read',
      category: isSwahili ? 'Mkakati wa IT' : 'IT Strategy',
      image: IMAGES.about.consulting
    },
    {
      title: isSwahili ? 'Yale Ambayo Huduma kwa Wateja Imenifundisha Kuhusu Kujenga Mifumo Bora' : 'What Customer Service Has Taught Me About Building Better Systems',
      desc: isSwahili
        ? 'Baada ya miaka mingi ya kufanya kazi katika huduma kwa wateja, nimejifunza kwamba programu nzuri sio tu kuhusu teknolojia—inapaswa pia kurahisisha watu kuwasiliana, kutatua changamoto na kupokea huduma bora.'
        : "After years of working in customer service, I've learned that great software is not just about technology—it should also make it easier for people to communicate, solve problems and receive better service.",
      date: isSwahili ? 'Mei 12, 2026' : 'May 12, 2026',
      readTime: isSwahili ? 'Dakika 6 kusoma' : '6 min read',
      category: isSwahili ? 'Mkakati wa Wateja' : 'Customer Strategy',
      image: IMAGES.services.customerSupport
    },
    {
      title: isSwahili ? 'Kwa Nini Kila Biashara Inahitaji Kanzidata (Database) Iliyopangwa Vizuri' : 'Why Every Business Needs a Well-Organized Database',
      desc: isSwahili
        ? 'Kanzidata nzuri husaidia biashara kuweka kumbukumbu zikiwa zimepangwa, kupunguza urudufishaji wa taarifa na kufanya habari kupatikana kwa urahisi. Makala hii inaeleza umuhimu wa usimamizi sahihi wa data kwa lugha rahisi.'
        : 'A good database helps businesses keep records organized, reduce duplication and make information easier to find. This article explains the importance of proper data management in simple language.',
      date: isSwahili ? 'Machi 18, 2026' : 'March 18, 2026',
      readTime: isSwahili ? 'Dakika 7 kusoma' : '7 min read',
      category: isSwahili ? 'Muundo wa Database' : 'Database Design',
      image: IMAGES.services.databaseDesign
    }
  ];

  const posts = (dbPosts && dbPosts.length > 0)
    ? dbPosts.map((p: any) => ({
        slug: p.slug,
        title: p.title,
        desc: p.excerpt,
        date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft',
        readTime: p.readingTime ? `${p.readingTime} min read` : '5 min read',
        category: p.category?.name || 'Uncategorized',
        image: p.coverImageUrl || IMAGES.about.consulting,
      }))
    : fallbackPosts.map(p => ({
        ...p,
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <PageTitle
        title={isSwahili ? "Mawazo na Maarifa | Denis Chamkaga" : "Insights for Better Business & Technology | Denis Chamkaga"}
        description={isSwahili 
          ? "Makala za kiutendaji ambapo ninashiriki mawazo, mafunzo na uzoefu kuhusu teknolojia ya biashara, uundaji wa programu na mabadiliko ya kidijitali." 
          : "Practical articles where I share ideas, lessons and experiences about business technology, software development and digital transformation for small and growing businesses."}
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
          {t('blog.badge')}
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          {t('blog.title')}
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          {t('blog.description')}
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {posts.map((post: any, i: number) => (
          <MotionCard
            key={i}
            delay={i * 0.08}
            className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg hover:border-accent-violet transition-colors duration-300 flex flex-col justify-between animate-fade-in"
          >
            {/* Visual Header */}
            <div className="h-44 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
              <Link to={`/blog/${post.slug}`} className="block w-full h-full">
                <AnimatedImage 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full"
                  hoverZoom={true}
                />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-950/80 text-[10px] text-white border border-white/10 uppercase tracking-widest font-semibold z-20 font-display">
                {post.category}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <Link to={`/blog/${post.slug}`} className="block group">
                  <h3 className="text-xl font-bold dark:text-white light:text-slate-800 leading-snug group-hover:text-accent-violet transition-colors duration-300 font-display">
                    {post.title}
                  </h3>
                </Link>
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
                <Link 
                  to={`/blog/${post.slug}`}
                  className="flex items-center gap-1 hover:text-accent-violet-hover cursor-pointer font-semibold text-accent-violet transition-colors duration-300"
                >
                  <span>{t('blog.readMore')}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
