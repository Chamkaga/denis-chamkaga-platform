import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { Button } from '../../../components/atoms/Button';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useUIStore } from '../../../store/useUIStore';
import { BUSINESS_GUIDES_TOPICS, type BusinessGuideTopic } from '../../../../../shared/src/constants/businessGuides';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const BusinessGuidesPage: React.FC = () => {
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';
  const [selectedTopic, setSelectedTopic] = useState<BusinessGuideTopic | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTopics = activeCategory === 'all'
    ? BUSINESS_GUIDES_TOPICS
    : BUSINESS_GUIDES_TOPICS.filter((t: BusinessGuideTopic) => t.category === activeCategory);

  const handleDiscussWithMary = (_topic?: BusinessGuideTopic) => {
    useUIStore.getState().toggleChat(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12 font-body">
      <PageTitle
        title={isSwahili ? "Miongozo ya Kidijitali & Ukuaji wa Biashara | Denis Chamkaga" : "Digital Transformation & SME Business Guides | Denis Chamkaga"}
        description="Elimu ya bure ya kusaidia wamiliki wa biashara nchini Tanzania kuondokana na daftari za mkono na kuongeza faida kupitia mifumo."
      />

      {/* Hero Section */}
      <motion.div
        className="space-y-6 text-center max-w-3xl mx-auto"
        variants={heroStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={fadeUpVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-display"
        >
          <Sparkles size={14} />
          {isSwahili ? 'Kituo cha Elimu ya Biashara' : 'SME Knowledge Hub'}
        </motion.span>

        <motion.h1
          variants={fadeUpVariants}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight dark:text-white light:text-slate-800 leading-tight"
        >
          {isSwahili ? 'Miongozo ya Kidijitali & Ukuaji wa Biashara' : 'Digital Growth Guides for Tanzanian SMEs'}
        </motion.h1>

        <motion.p
          variants={fadeUpVariants}
          className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed"
        >
          {isSwahili 
            ? 'Jifunze jinsi ya kutatua changamoto za stoki kupotea, madeni kusahaulika, na kuchat masaa mengi WhatsApp. Elimu ya bure iliyotengenezwa kwa ajili ya biashara nchini Tanzania.'
            : 'Learn how to eliminate stock theft, uncollected customer debt, and manual order bottlenecks. Practical digital playbooks tailored for Tanzanian enterprises.'}
        </motion.p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-b dark:border-zinc-800 pb-4">
        {[
          { id: 'all', label: isSwahili ? 'Makala Yote' : 'All Guides' },
          { id: 'growth', label: isSwahili ? 'Ukuaji wa Biashara' : 'Business Growth' },
          { id: 'automation', label: isSwahili ? 'WhatsApp & Automation' : 'Automation' },
          { id: 'systems', label: isSwahili ? 'Mifumo & Database' : 'Systems' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-accent-violet text-white shadow-md'
                : 'dark:text-zinc-400 light:text-slate-600 hover:dark:text-white hover:light:text-slate-900 bg-zinc-800/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTopics.map((topic: BusinessGuideTopic, index: number) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col justify-between p-6 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white hover:border-accent-violet/50 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-accent-violet/10 text-accent-violet">
                  <BookOpen size={13} />
                  {topic.category.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-xs dark:text-zinc-500 light:text-slate-400">
                  <Clock size={12} />
                  {topic.readTimeMinutes} {isSwahili ? 'dak' : 'min'}
                </span>
              </div>

              <h3 className="text-xl font-bold dark:text-white light:text-slate-900 group-hover:text-accent-violet transition-colors">
                {isSwahili ? topic.swahiliTitle : topic.title}
              </h3>

              <p className="text-sm dark:text-zinc-400 light:text-slate-600 line-clamp-3 leading-relaxed">
                {isSwahili ? topic.swahiliSummary : topic.summary}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t dark:border-zinc-800/80 light:border-slate-100 flex flex-col gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setSelectedTopic(topic)}
                rightIcon={<ArrowRight size={16} />}
              >
                {isSwahili ? 'Soma Makala Hii' : 'Read Full Guide'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center gap-2 bg-gradient-to-r from-accent-violet to-purple-600"
                onClick={() => handleDiscussWithMary(topic)}
              >
                <MessageSquare size={16} />
                {isSwahili ? 'Zungumza na Mary Kuhusu Hii' : 'Discuss This with Mary'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl dark:bg-zinc-900 light:bg-white border dark:border-zinc-800 shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-violet/10 text-accent-violet uppercase">
                  {selectedTopic.category}
                </span>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white light:text-slate-900">
                {isSwahili ? selectedTopic.swahiliTitle : selectedTopic.title}
              </h2>

              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line dark:text-zinc-300 light:text-slate-700">
                {isSwahili ? selectedTopic.swahiliContentMarkdown : selectedTopic.contentMarkdown}
              </div>

              <div className="pt-6 border-t dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-end">
                <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                  {isSwahili ? 'Funga' : 'Close'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const t = selectedTopic;
                    setSelectedTopic(null);
                    handleDiscussWithMary(t);
                  }}
                  className="bg-accent-violet"
                  leftIcon={<MessageSquare size={18} />}
                >
                  {isSwahili ? 'Uliza Mary (AI Growth Partner) Swali' : 'Ask Mary (AI Growth Partner) About This'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessGuidesPage;
