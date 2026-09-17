import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useQuery } from '@tanstack/react-query';
import {
  Video, BookOpen, Mail, ArrowRight,
  CheckCircle, Lightbulb, Play, X, FileText, Heart
} from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { ROUTES } from '../../../config/routes';
import { SOCIALS } from '../../../constants/socials';
import { publicApi } from '../../../services/api';
import { InnovationLabSection } from '../../../components/creator/InnovationLabSection';

export const CreatorPage: React.FC = () => {
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  // Fetch real database tutorials
  const { data: dbTutorials, isLoading } = useQuery({
    queryKey: ['public-tutorials'],
    queryFn: () => publicApi.getTutorials(),
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
  };

  const topics = isSwahili
    ? [
        { title: "Uundaji Mifumo", desc: "Jinsi ya kubuni database na mifumo ya CRM/POS.", icon: <BookOpen size={20} /> },
        { title: "Mageuzi ya Kidijitali", desc: "Mwongozo wa kuachana na makaratasi.", icon: <Video size={20} /> },
        { title: "Ushauri wa IT", desc: "Mbinu za kupata mifumo sahihi ya biashara.", icon: <Play size={20} /> }
      ]
    : [
        { title: "Systems Engineering", desc: "How to design database schema and custom CRM/POS setups.", icon: <BookOpen size={20} /> },
        { title: "Digital Transformation", desc: "Actionable roadmap to phase out paperwork lists.", icon: <Video size={20} /> },
        { title: "Technology Consulting", desc: "Expert tips on selecting the right business software.", icon: <Play size={20} /> }
      ];

  const tutorials = dbTutorials || [];

  // Extract YouTube ID helper
  const getEmbedUrl = (video: any) => {
    if (video.provider === 'youtube') {
      const url = video.videoUrl;
      // If it is just an ID, use it. Otherwise try to extract it
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : url;
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (video.provider === 'vimeo') {
      const url = video.videoUrl;
      const match = url.match(/vimeo\.com\/(\d+)/);
      const videoId = match ? match[1] : url;
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 text-left font-body relative overflow-hidden">
      <PageTitle
        title={isSwahili ? "Mbunifu & Mkufunzi" : "Founder as a Creator"}
        description={isSwahili ? "Kuelimisha biashara kuhusu mifumo ya kidijitali, uundaji wa database, na uboreshaji wa kiutendaji." : "Educating the next generation of business builders on systems development, database normalization, and digital operations."}
      />

      {/* 1. Mission Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white light:text-slate-800 font-display">
            {isSwahili ? "Dhamira Yangu Kama Mbunifu" : "The Educational Mission"}
          </h2>
          <p className="text-sm sm:text-base dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
            {isSwahili
              ? "Lengo langu kuu ni kuondoa makosa ya mikono kwenye biashara. Kupitia video, makala, na nyenzo za kupakua, natoa mwongozo wa jinsi mifumo sahihi ya teknolojia inavyozuia upotevu wa fedha na kuongeza ufanisi katika stoo na mauzo."
              : "I believe that every growing business deserves robust internal tools. Through deep-dive tutorials, checklists, and guides, I share practical insights that bridge the gap between manual workflows and structured enterprise systems."}
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = document.getElementById('innovation-lab');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.hash = 'innovation-lab';
              }}
              className="inline-flex items-center gap-1.5 border-accent-violet/60 text-accent-violet hover:bg-accent-violet/10 cursor-pointer"
            >
              <Lightbulb size={16} />
              <span>{isSwahili ? "Kagua Maabara ya Majaribio" : "Explore Innovation Lab"}</span>
            </Button>
          </div>
        </div>
        <div className="p-6 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/20 light:bg-slate-50 flex flex-col justify-center space-y-4">
          <h3 className="font-bold dark:text-white text-base">{isSwahili ? "Mada Ninazofunza" : "Core Content Focus"}</h3>
          <div className="space-y-4">
            {topics.map((t, idx) => (
              <div key={idx} className="flex gap-3 items-start animate-fade-in">
                <div className="p-2 rounded-lg bg-accent-violet/10 text-accent-violet shrink-0">{t.icon}</div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm dark:text-white">{t.title}</h4>
                  <p className="text-[11px] sm:text-xs text-zinc-500">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Educational Videos */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-extrabold dark:text-white light:text-slate-800 font-display">
          {isSwahili ? "Video za Hivi Karibuni za Mafunzo" : "Recent Tutorials & Masterclasses"}
        </h2>
        {isLoading ? null : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tutorials.map((vid: any) => (
              <MotionCard key={vid.id} className="p-5 flex flex-col justify-between border dark:border-zinc-800/80 bg-zinc-950/20 shadow-md">
                <div className="space-y-2">
                  <div 
                    onClick={() => setActiveVideo(vid)}
                    className="h-40 rounded-xl bg-zinc-900 border dark:border-zinc-800 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                  >
                    <div className="p-3.5 rounded-full bg-accent-violet/20 text-accent-violet group-hover:scale-110 transition-transform duration-300">
                      <Play size={20} />
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black text-white">{vid.durationMin} mins</span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm dark:text-white pt-2 leading-tight">{vid.title}</h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">{vid.description || ''}</p>
                </div>
                
                {/* PDF and learning attachments support */}
                {vid.resources && (
                  <div className="mt-3 pt-3 border-t dark:border-zinc-800 flex flex-col gap-1.5">
                    {Array.isArray(vid.resources) && vid.resources.map((res: any, rIdx: number) => (
                      <a 
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[10px] text-accent-violet hover:underline"
                      >
                        <FileText size={10} />
                        <span>{res.label || 'Download Resource'}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider pt-4">
                  Provider: {vid.provider.toUpperCase()}
                </div>
              </MotionCard>
            ))}
          </div>
        )}
      </section>

      {/* Media Player Modal Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-zinc-950 border dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-xl dark:bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
            >
              <X size={18} />
            </button>
            <div className="aspect-video w-full bg-black">
              {activeVideo.provider === 'self-hosted' ? (
                <video 
                  controls 
                  src={activeVideo.videoUrl} 
                  autoPlay 
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  title={activeVideo.title}
                  src={getEmbedUrl(activeVideo)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="p-6 space-y-2 text-left">
              <h3 className="text-sm font-bold dark:text-white">{activeVideo.title}</h3>
              <p className="text-xs dark:text-zinc-400">{activeVideo.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 Innovation Lab Section */}
      <InnovationLabSection isSwahili={isSwahili} />

      {/* 3. Newsletter Subscription */}
      <section className="p-8 sm:p-12 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-violet/5 rounded-full blur-[80px] -z-10" />
        <Mail size={32} className="text-accent-violet" />
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl sm:text-2xl font-extrabold dark:text-white font-display">
            {isSwahili ? "Jiunge na Jarida la Kila Wiki" : "Join the Weekly Newsletter"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-body">
            {isSwahili
              ? "Pata miongozo na mbinu za kuboresha taratibu za biashara yako moja kwa moja kwenye barua pepe yako kila wiki."
              : "Get technical advice, CRM setup templates, and business automation advice delivered straight to your inbox."}
          </p>
        </div>

        {submitted ? (
          <div className="text-sm font-semibold text-green-500 flex items-center gap-1.5 py-2">
            <CheckCircle size={16} />
            <span>{isSwahili ? "Asante kwa kujiunga!" : "Thank you for subscribing!"}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isSwahili ? "Weka barua pepe yako..." : "Enter your email address..."}
              required
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500"
            />
            <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap cursor-pointer">
              <span>{isSwahili ? "Jiunge Sasa" : "Subscribe Now"}</span>
              <ArrowRight size={14} />
            </Button>
          </form>
        )}
      </section>

      {/* 3.5 Support the Vision Section */}
      <section className="p-8 sm:p-12 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/10 light:bg-slate-50 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 animate-fade-in shadow-xl">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-violet/5 rounded-full blur-[80px] -z-10" />
        
        {/* Left Side: Supporting Illustration / Icon */}
        <div className="relative shrink-0 flex items-center justify-center p-5 rounded-2xl dark:bg-zinc-950/40 light:bg-white border dark:border-zinc-800 light:border-slate-200" aria-label="Support Illustration">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-accent-violet"
          >
            <Heart size={48} className="fill-accent-violet/20" aria-hidden="true" />
          </motion.div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-violet animate-ping" aria-hidden="true" />
        </div>

        {/* Right Side: Copy & CTA */}
        <div className="space-y-6 flex-1 text-left">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-accent-violet uppercase tracking-widest font-display">
              {isSwahili ? "Mchango kwa Jamii" : "Ecosystem & Growth"}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold dark:text-white light:text-slate-800 font-display">
              {isSwahili ? "Saidia Maono Yangu" : "Support the Vision"}
            </h2>
            <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
              {isSwahili
                ? "Ungana nami kujenga mifumo na suluhisho za kiubunifu zinazoleta fursa, kurahisisha elimu, na kusaidia biashara ndogo kukua kidijitali kote Tanzania na Afrika."
                : "Join me in building innovative technology, educational platforms, and open-source systems that empower local developers and businesses across Tanzania and Africa."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(ROUTES.SUPPORT)}
              className="cursor-pointer font-bold shadow-md shadow-accent-violet/10"
            >
              <span>{isSwahili ? "Jiunge na Safari" : "Join the Mission"}</span>
              <ArrowRight size={14} />
            </Button>
            
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(ROUTES.CONTACT)}
              className="cursor-pointer border-accent-violet/60 text-accent-violet hover:bg-accent-violet/10 font-bold"
            >
              <span>{isSwahili ? "Wasiliana Nami" : "Contact Me"}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Social Follow Me */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t dark:border-zinc-800/80">
        <div className="text-center sm:text-left">
          <h3 className="font-bold dark:text-white text-sm">{isSwahili ? "Nifuatilie Kijamii" : "Follow My Journey"}</h3>
          <p className="text-xs text-zinc-500">{isSwahili ? "Nyenzo za kila siku na sasisho za mifumo." : "Daily system tips and digitalization updates."}</p>
        </div>
        <div className="flex gap-3">
          <a href={SOCIALS.linkedIn.url} target="_blank" rel="noopener noreferrer" className="p-3 border dark:border-zinc-800 rounded-xl dark:bg-zinc-900/30 text-zinc-400 hover:text-accent-violet transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox={SOCIALS.linkedIn.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
              <path d={SOCIALS.linkedIn.svgPath} />
            </svg>
          </a>
          <a href={SOCIALS.gitHub.url} target="_blank" rel="noopener noreferrer" className="p-3 border dark:border-zinc-800 rounded-xl dark:bg-zinc-900/30 text-zinc-400 hover:text-accent-violet transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox={SOCIALS.gitHub.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
              <path d={SOCIALS.gitHub.svgPath} />
            </svg>
          </a>
          <a href={SOCIALS.instagram.url} target="_blank" rel="noopener noreferrer" className="p-3 border dark:border-zinc-800 rounded-xl dark:bg-zinc-900/30 text-zinc-400 hover:text-accent-violet transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox={SOCIALS.instagram.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
              <path d={SOCIALS.instagram.svgPath} />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default CreatorPage;
