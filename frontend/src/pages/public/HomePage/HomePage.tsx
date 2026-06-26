import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Server, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/atoms/Button';
import { ROUTES } from '../../../config/routes';
import { IMAGES } from '../../../constants/images';
import { SOCIALS } from '../../../constants/socials';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { useCountUp } from '../../../hooks/useCountUp';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { heroStaggerContainer, fadeUpVariants, staggerContainer } from '../../../lib/motion';

// ── Animated stat item ────────────────────────────────────────────────────────
const StatItem: React.FC<{ target: number; suffix: string; label: string; delay?: number }> = ({
  target, suffix, label, delay = 0
}) => {
  const { display, ref } = useCountUp({ target, suffix, duration: 1.6 });
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={fadeUpVariants}
      custom={delay}
      className="text-center space-y-2 border-r last:border-0 dark:border-zinc-800 light:border-slate-200"
    >
      <span className="block text-3xl sm:text-4xl font-extrabold dark:text-white light:text-slate-800">{display}</span>
      <span className="block text-xs sm:text-sm dark:text-zinc-500 light:text-slate-500 font-medium">{label}</span>
    </motion.div>
  );
};

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref: statsRef, isInView: statsInView } = useScrollReveal({ threshold: 0.2 });
  const { ref: pillarsRef, isInView: pillarsInView } = useScrollReveal({ threshold: 0.1 });

  const socialLinks = [
    ...Object.values(SOCIALS).map((soc) => ({
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox={soc.viewBox || '0 0 24 24'} xmlns="http://www.w3.org/2000/svg">
          <path d={soc.svgPath} />
        </svg>
      ),
      href: soc.url,
      label: soc.name,
      colorClass: soc.colorClass,
    })),
    {
      icon: <Mail size={20} />,
      href: 'mailto:denischamkaga@gmail.com',
      label: 'Email',
      colorClass: 'hover:text-accent-violet',
    },
  ];

  const statsData = [
    { target: 8,   suffix: '+',  labelKey: 'hero.expYears' },
    { target: 20,  suffix: '+',  labelKey: 'hero.projectsCompleted' },
    { target: 50,  suffix: '+',  labelKey: 'hero.happyClients' },
    { target: 100, suffix: '+',  labelKey: 'hero.systemsTrained' },
  ];

  const businessPillars = [
    { title: t('businessModel.softwareDev'),     desc: t('businessModel.softwareDevDesc'),     icon: <Server className="text-accent-violet shrink-0" size={24} /> },
    { title: t('businessModel.businessSystems'), desc: t('businessModel.businessSystemsDesc'), icon: <Briefcase className="text-accent-violet shrink-0" size={24} /> },
    { title: t('businessModel.training'),        desc: t('businessModel.trainingDesc'),        icon: <GraduationCap className="text-accent-violet shrink-0" size={24} /> },
    { title: t('businessModel.consulting'),      desc: t('businessModel.consultingDesc'),      icon: <CheckCircle2 className="text-accent-violet shrink-0" size={24} /> },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      <PageTitle
        title="Denis Chamkaga | Business Technology Consultant"
        description="Business IT Professional helping SMEs automate operations, build CRM systems, and digitize workflows from Dar es Salaam, Tanzania."
      />

      {/* ── 1. Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left — staggered text entrance */}
          <motion.div
            className="lg:col-span-7 text-left space-y-6"
            variants={heroStaggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.span
              variants={fadeUpVariants}
              custom={0}
              className="inline-block text-sm font-semibold tracking-wider uppercase text-accent-violet light:text-light-accent font-display"
            >
              {t('hero.subtitle')}
            </motion.span>

            {/* Heading */}
            <motion.h1
              variants={fadeUpVariants}
              custom={0.1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight dark:text-white light:text-slate-800 leading-tight"
            >
              {t('hero.titlePrefix')}{' '}
              <span className="block dark:text-transparent bg-clip-text bg-gradient-to-r dark:from-accent-violet dark:to-purple-400 light:text-light-accent">
                {t('hero.name')}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUpVariants}
              custom={0.2}
              className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 max-w-xl font-body leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUpVariants} custom={0.3} className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.CONTACT)} rightIcon={<ArrowRight size={18} />}>
                {t('hero.ctaPrimary')}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate(ROUTES.DENIS_ASSISTANT)}>
                {t('hero.ctaSecondary')}
              </Button>
            </motion.div>

            {/* Social icons */}
            <motion.div
              variants={fadeUpVariants}
              custom={0.4}
              className="flex items-center gap-3 pt-4 border-t dark:border-zinc-800/80 light:border-slate-200 w-fit"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg dark:bg-zinc-900/60 light:bg-slate-100 dark:text-zinc-400 light:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-violet ${social.colorClass}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — portrait with fade-in */}
          <motion.div
            className="lg:col-span-5 flex justify-center items-center relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 rounded-full dark:bg-accent-violet/20 blur-3xl" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dashed dark:border-accent-violet/40 light:border-light-accent/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 dark:border-zinc-800 light:border-white shadow-2xl bg-zinc-950">
                <AnimatedImage src={IMAGES.hero.portrait} alt="Denis Chamkaga Portrait" className="w-full h-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Animated Stats Row ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={statsRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={statsInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl border glass-panel shadow-lg"
        >
          {statsData.map((s, i) => (
            <StatItem key={i} target={s.target} suffix={s.suffix} label={t(s.labelKey)} delay={i * 0.1} />
          ))}
        </motion.div>
      </section>

      {/* ── 3. Business Model Pillars ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold dark:text-white light:text-slate-800">{t('businessModel.title')}</h2>
          <p className="text-sm sm:text-base dark:text-zinc-400 light:text-slate-500 max-w-2xl leading-relaxed">
            I help modern companies transition away from basic tools (social media alone is not a business system) and build robust web software, automations, finance systems, and CRM workflows to scale operations.
          </p>
        </div>

        <motion.div
          ref={pillarsRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={pillarsInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {businessPillars.map((pillar, i) => (
            <MotionCard
              key={i}
              delay={i * 0.08}
              className="p-6 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white hover:border-accent-violet transition-colors duration-300 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="p-3 w-fit rounded-lg bg-accent-violet/10"
                >
                  {pillar.icon}
                </motion.div>
                <h3 className="font-semibold text-base dark:text-white light:text-slate-800">{pillar.title}</h3>
              </div>
              <p className="text-xs dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">{pillar.desc}</p>
            </MotionCard>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
