import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const BusinessCheckerPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      q: 'How do you handle customer communications and orders?',
      options: [
        { text: 'Completely manually (personal notebook or memory)', score: 10 },
        { text: 'Social media messages (WhatsApp, Instagram DM) only', score: 20 },
        { text: 'Simple spreadsheet tracking (Excel / Google Sheets)', score: 30 },
        { text: 'Unified CRM and database backend system', score: 50 }
      ]
    },
    {
      q: 'How is stock level or services availability managed?',
      options: [
        { text: 'We do not track it or only check when stock runs out', score: 10 },
        { text: 'Manual inventory notebook sheets', score: 20 },
        { text: 'Basic spreadsheet lists updated weekly', score: 35 },
        { text: 'Automated inventory database with threshold alerts', score: 50 }
      ]
    },
    {
      q: 'How do you track sales reports and monthly profits?',
      options: [
        { text: 'Omitted or tracked by counting cash at end of day', score: 10 },
        { text: 'Sales ledger receipt book records', score: 25 },
        { text: 'Manual spreadsheets compiled monthly', score: 35 },
        { text: 'Automated sales dashboard updated dynamically', score: 50 }
      ]
    }
  ];

  const handleOptionSelect = (score: number) => {
    const nextAnswers = [...answers, score];
    setAnswers(nextAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const resetChecker = () => {
    setStep(0);
    setAnswers([]);
    setFinished(false);
  };

  const calculateResult = () => {
    const total = answers.reduce((a, b) => a + b, 0);
    const maxPossible = questions.length * 50;
    const percentage = Math.round((total / maxPossible) * 100);

    let status = 'Critical Automation Gaps';
    let advice = 'Your operations rely heavily on manual entries. This causes inventory mismatch, delayed response metrics, and sales leaks. You should look into database systems and automation solutions.';
    let icon = <AlertTriangle size={48} className="text-red-500" />;

    if (percentage >= 70) {
      status = 'Strong Tech Foundation';
      advice = 'Your business has healthy database systems configured. To scale further, evaluate RAG AI Assistant routing tools and forecasting models.';
      icon = <ShieldCheck size={48} className="text-green-500" />;
    } else if (percentage >= 40) {
      status = 'Moderate Automation';
      advice = 'You use basic tracking tools but lack centralized workflows. Automating email notifications, customer bookings, and SLA logs will scale operations.';
      icon = <CheckCircle2 size={48} className="text-amber-500" />;
    }

    return { percentage, status, advice, icon };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12 font-body">
      <PageTitle
        title="Business Automation Diagnostics | Denis Chamkaga"
        description="Diagnose manual bottlenecks, spreadsheet vulnerabilities, and operational leaks in your business systems."
      />
      
      {/* Header */}
      <motion.div 
        className="space-y-4"
        variants={heroStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span 
          variants={fadeUpVariants}
          custom={0}
          className="inline-block text-xs font-semibold text-accent-violet uppercase tracking-wider font-display"
        >
          IT Diagnostics
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          Business Automation Diagnostics
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-sm sm:text-base dark:text-zinc-400 light:text-slate-600 leading-relaxed max-w-3xl"
        >
          Answer 3 brief questions to assess your company's technology bottlenecks and evaluate your digital readiness.
        </motion.p>
      </motion.div>

      {/* Grid Layout: Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Infographic card */}
        <MotionCard 
          delay={0.1}
          enableHover={false}
          className="lg:col-span-5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg flex flex-col justify-between"
        >
          <div className="h-48 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
            <AnimatedImage 
              src={IMAGES.assistant.analysis} 
              alt="Systems Diagnostics Analysis Mockup" 
              className="w-full h-full"
              hoverZoom={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
            <div className="absolute top-4 left-4 p-2.5 rounded-lg bg-white/95 border shadow flex items-center justify-center z-20">
              <Award size={18} className="text-accent-violet" />
            </div>
            <span className="absolute bottom-3 left-4 text-xs font-bold text-white uppercase tracking-wider drop-shadow z-20">Technology Readiness</span>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="font-extrabold text-lg dark:text-white light:text-slate-800 font-display">Operational Diagnostics</h3>
            <p className="text-xs dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
              This checker evaluates manual bookkeeping vulnerabilities, stock tracking issues, and sales reporting leaks. Central database scaling represents the baseline before RAG AI integrations.
            </p>
            <div className="pt-2 text-xs space-y-2 border-t dark:border-zinc-800/60 light:border-slate-100 font-body">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet shrink-0" />
                <span className="dark:text-zinc-400 light:text-slate-600"><strong>Relational Integrity:</strong> Strict primary/foreign keys</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet shrink-0" />
                <span className="dark:text-zinc-400 light:text-slate-600"><strong>Automated Alerts:</strong> Low-stock threshold checks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet shrink-0" />
                <span className="dark:text-zinc-400 light:text-slate-600"><strong>SLA Compliance:</strong> Automated support ticketing</span>
              </div>
            </div>
          </div>
        </MotionCard>

        {/* Right Column: Diagnostic Quiz Console */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border glass-panel shadow-lg min-h-[320px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {finished ? (
              (() => {
                const res = calculateResult();
                return (
                  <motion.div 
                    key="finished"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="space-y-6 text-center flex flex-col items-center justify-center"
                  >
                    {res.icon}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold dark:text-white light:text-slate-800 font-display">
                        {res.status}
                      </h2>
                      <span className="block text-4xl font-extrabold text-accent-violet">
                        {res.percentage}% Ready
                      </span>
                    </div>
                    <p className="text-sm dark:text-zinc-400 light:text-slate-600 max-w-md leading-relaxed font-body">
                      {res.advice}
                    </p>
                    <div className="flex gap-4 pt-4 relative z-10">
                      <Button variant="primary" onClick={() => resetChecker()} leftIcon={<RotateCcw size={16} />}>
                        Test Again
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/contact'} rightIcon={<ArrowRight size={16} />}>
                        Book Tech Consult
                      </Button>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between text-xs dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Question {step + 1} of {questions.length}</span>
                  <span>Progress: {Math.round((step / questions.length) * 100)}%</span>
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold dark:text-white light:text-slate-800 leading-snug font-display">
                  {questions[step].q}
                </h2>

                <div className="flex flex-col gap-3">
                  {questions[step].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(opt.score)}
                      className="w-full p-4 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-slate-50 dark:hover:bg-zinc-800/80 light:hover:bg-slate-100 dark:text-zinc-200 light:text-slate-700 hover:border-accent-violet transition-all text-left cursor-pointer text-sm font-medium font-body focus:outline-none focus:ring-1 focus:ring-accent-violet"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default BusinessCheckerPage;
