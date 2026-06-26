import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, ExternalLink, CheckCircle } from 'lucide-react';
import { IMAGES } from '../../../constants/images';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { AnimatedImage } from '../../../components/atoms/AnimatedImage/AnimatedImage';
import { MotionCard } from '../../../components/atoms/MotionCard/MotionCard';
import { heroStaggerContainer, fadeUpVariants } from '../../../lib/motion';

export const CertificatesPage: React.FC = () => {
  const credentials = [
    {
      title: 'Diploma in Business Information Technology',
      institution: 'University of Dar es Salaam Computing Centre (UDCC)',
      year: '2025',
      image: IMAGES.certificates.udccDiploma,
      desc: 'Comprehensive study including Database Management, Systems Analysis, Accounting, Finance, and Web Programming.',
      issuer: 'UDSM',
      issuerUrl: 'https://www.ucc.co.tz',
      skills: ['Relational Database design', 'Systems Analysis workflows', 'Information Systems management']
    },
    {
      title: 'Customer Experience Operations & Standards',
      institution: 'PCCI Group Training Division',
      year: '2019',
      image: IMAGES.certificates.customerServiceCert,
      desc: 'Customer Relationship Management systems, SLA rules compliance, ticket lifecycle operations, and communication standards.',
      issuer: 'PCCI Group',
      issuerUrl: 'https://pcci-group.com',
      skills: ['SLA escalation rules', 'CRM ticketing systems', 'Conflict resolution']
    },
    {
      title: 'Security Operations & Incident Audit',
      institution: 'Securex Training Academy',
      year: '2015',
      image: IMAGES.certificates.securityCert,
      desc: 'Risk calculations, physical patrol audit guidelines, security procedures, and emergency operations management.',
      issuer: 'Securex Ltd',
      issuerUrl: 'https://securexafrica.com',
      skills: ['Incident log audit', 'Procedural discipline', 'Risk assessment rules']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <PageTitle
        title="Certificates & Qualifications | Denis Chamkaga"
        description="Verify the professional credentials, business IT diplomas, customer service operations training, and security audit certifications held by Denis Chamkaga."
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
          My Credentials
        </motion.span>
        <motion.h1 
          variants={fadeUpVariants}
          custom={0.1}
          className="text-4xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display"
        >
          Certificates & Qualifications
        </motion.h1>
        <motion.p 
          variants={fadeUpVariants}
          custom={0.2}
          className="text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body"
        >
          Academic diplomas and professional certificates that validate my skill sets in business information systems and operations.
        </motion.p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {credentials.map((cert, i) => (
          <MotionCard
            key={i}
            delay={i * 0.08}
            className="rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white overflow-hidden shadow-lg hover:border-accent-violet transition-colors duration-300 flex flex-col justify-between"
          >
            {/* Visual block */}
            <div className="h-48 bg-zinc-950 overflow-hidden relative border-b dark:border-zinc-800 light:border-slate-200">
              <AnimatedImage 
                src={cert.image} 
                alt={cert.title} 
                className="w-full h-full"
                hoverZoom={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
              <div className="absolute top-4 left-4 p-2 rounded-lg bg-white/95 border shadow-sm flex items-center justify-center z-20">
                <Award size={18} className="text-accent-violet" />
              </div>
            </div>

            {/* Content area */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-accent-violet uppercase tracking-wide font-display flex items-center gap-1">
                  <Calendar size={12} />
                  {cert.year}
                </span>
                <h3 className="font-bold text-lg dark:text-white light:text-slate-800 leading-snug">
                  {cert.title}
                </h3>
                <h4 className="text-xs font-semibold dark:text-zinc-400 light:text-slate-500 font-body uppercase tracking-wide flex flex-wrap items-center gap-2">
                  <span>{cert.institution}</span>
                  {cert.issuerUrl && (
                    <a 
                      href={cert.issuerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-accent-violet hover:underline text-[9px] lowercase flex items-center gap-0.5 inline-flex"
                      aria-label={`Visit ${cert.institution} website`}
                    >
                      (Visit Site <ExternalLink size={8} />)
                    </a>
                  )}
                </h4>
                <p className="text-xs dark:text-zinc-500 light:text-slate-500 leading-relaxed font-body">
                  {cert.desc}
                </p>
              </div>

              {/* Skills checklist */}
              <div className="pt-4 border-t dark:border-zinc-850 light:border-slate-100 space-y-2">
                <span className="text-[10px] font-bold dark:text-zinc-400 light:text-slate-600 uppercase tracking-widest block font-display">
                  Skills Confirmed:
                </span>
                <ul className="space-y-1 text-xs">
                  {cert.skills.map((skill) => (
                    <li key={skill} className="flex items-start gap-1.5 dark:text-zinc-400 light:text-slate-600 font-body">
                      <CheckCircle size={12} className="text-accent-violet shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
};

export default CertificatesPage;
