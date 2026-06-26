import React from 'react';
import { Briefcase, Code, Database, Cpu, HelpCircle, CheckSquare, TrendingUp, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../../../constants/images';
import { Button } from '../../../components/atoms/Button';
import { ROUTES } from '../../../config/routes';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Business Consultation',
      icon: <Briefcase size={22} className="text-accent-violet" />,
      image: IMAGES.services.consultation,
      desc: 'Formulating robust systems requirements, mapping operational business workflows, and identifying technology gaps for start-ups and SMEs.',
      benefits: 'Reduces developmental waste, optimizes operational speed, and establishes clear development roadmaps.',
      tech: ['Business Systems Mapping', 'SOP Requirements Documentation'],
      ctaLabel: 'Book Technology Consultation'
    },
    {
      title: 'Software & Web Development',
      icon: <Code size={22} className="text-accent-violet" />,
      image: IMAGES.services.webDev,
      desc: 'Developing fast, premium web applications using React, Vite, TypeScript, Node.js, Express, and PHP.',
      benefits: 'Delivers professional brand visibility, robust customer portals, and seamless layout performance.',
      tech: ['React / Vite', 'TypeScript', 'PHP', 'Zustand state management'],
      ctaLabel: 'Inquire For Custom Software'
    },
    {
      title: 'Database Design & Systems Analysis',
      icon: <Database size={22} className="text-accent-violet" />,
      image: IMAGES.services.databaseDesign,
      desc: 'Creating relational database structures using PostgreSQL and MySQL with strict index rules and high-integrity relationships.',
      benefits: 'Guarantees transaction security, prevents data duplication, and enables fast query analytics.',
      tech: ['PostgreSQL', 'MySQL', 'Prisma ORM mapping', 'SQL Tuning'],
      ctaLabel: 'Request Database Audit'
    },
    {
      title: 'Business Automation & CRM Integration',
      icon: <Cpu size={22} className="text-accent-violet" />,
      image: IMAGES.services.automation,
      desc: 'Replacing manual spreadsheet tasks with automated workflows, CRM configurations, ticket systems, and dashboard tracking.',
      benefits: 'Eliminates human ledger errors, enforces customer support SLAs, and unlocks live metric tracking.',
      tech: ['CRM configuration', 'WhatsApp API workflows', 'Webhook automations'],
      ctaLabel: 'Request Automation Review'
    },
    {
      title: 'Customer Support Strategy & SLA Design',
      icon: <HelpCircle size={22} className="text-accent-violet" />,
      image: IMAGES.services.customerSupport,
      desc: 'Formulating customer service standards, channel strategies, ticket routing rules, and support metrics leveraging 8+ years of customer service experience.',
      benefits: 'Mitigates customer churn, minimizes queue response delays, and builds team performance metrics.',
      tech: ['Ticketing systems', 'SLA rules configuration', 'Escalation design'],
      ctaLabel: 'Inquire For Service Strategy'
    },
    {
      title: 'Training & Capacity Building',
      icon: <CheckSquare size={22} className="text-accent-violet" />,
      image: IMAGES.services.training,
      desc: 'Conducting technical system guides, usage guidelines, and accounting/finance automation training for staff.',
      benefits: 'Accelerates staff onboarding adoption, minimizes database user entry errors, and preserves operational integrity.',
      tech: ['User manuals drafting', 'Interactive workspace training'],
      ctaLabel: 'Inquire For Staff Training'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <PageTitle
        title="Business Technology Services | Denis Chamkaga"
        description="Custom software, database design, CRM automation, and customer support strategy services from Denis Chamkaga in Tanzania."
      />

      {/* Page Header — staggered entrance */}
      <motion.div
        className="space-y-4 max-w-3xl"
        variants={heroStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span variants={fadeUpVariants} custom={0} className="text-xs font-semibold text-accent-violet uppercase tracking-wider font-display block">What I Offer</motion.span>
        <motion.h1 variants={fadeUpVariants} custom={0.1} className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight">
          Business Technology Solutions
        </motion.h1>
        <motion.p variants={fadeUpVariants} custom={0.2} className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
          I bridge the gap between operational workflows and modern code. Every service is designed to solve real business issues, increase data integrity, and support scaling structures.
        </motion.p>
      </motion.div>

      {/* Services Grid — MotionCards with stagger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc, i) => (
          <MotionCard
            key={i}
            delay={i * 0.07}
            className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-colors duration-300 flex flex-col justify-between overflow-hidden shadow-lg"
          >
            {/* Image header */}
            <div className="h-44 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
              <AnimatedImage src={svc.image} alt={svc.title} className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/95 border shadow shadow-zinc-800 pointer-events-none">
                {svc.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-xl dark:text-white light:text-slate-800">{svc.title}</h3>
                <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 font-body leading-relaxed">{svc.desc}</p>
              </div>
              <div className="p-3.5 rounded-xl dark:bg-zinc-950/40 light:bg-slate-50 border dark:border-zinc-800/80 light:border-slate-200/80 space-y-1 text-[11px] font-body">
                <span className="font-semibold dark:text-zinc-300 light:text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <TrendingUp size={12} className="text-accent-violet" />
                  Business Benefit:
                </span>
                <p className="dark:text-zinc-400 light:text-slate-500 leading-normal">{svc.benefits}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold dark:text-zinc-500 light:text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                  <Layers size={10} /> Scope/Tools:
                </span>
                <div className="flex flex-wrap gap-1">
                  {svc.tech.map((t) => (
                    <span key={t} className="text-[9px] font-semibold font-body py-0.5 px-2 rounded-lg dark:bg-zinc-800 dark:text-zinc-300 light:bg-slate-100 light:text-slate-600">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(ROUTES.CONTACT)}>{svc.ctaLabel}</Button>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
};
export default ServicesPage;
