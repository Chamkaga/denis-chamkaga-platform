import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { SOCIALS } from '../../../constants/socials';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { heroStaggerContainer, fadeUpVariants, staggerContainer } from '../../../lib/motion';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../services/api';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInput>();
  const [submitted, setSubmitted] = useState(false);

  const { data: siteSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => publicApi.getSettings(),
  });

  const contactPhone = siteSettings?.contact_phone || '+255 745 123 456';
  const contactEmail = siteSettings?.contact_email || 'denischamkaga@gmail.com';
  const contactLocation = siteSettings?.contact_location || 'Dar es Salaam, Tanzania';
  const whatsappUrl = siteSettings?.social_whatsapp
    ? (siteSettings.social_whatsapp.startsWith('http') ? siteSettings.social_whatsapp : `https://wa.me/${siteSettings.social_whatsapp.replace(/[^0-9]/g, '')}`)
    : SOCIALS.whatsApp.url;

  const onSubmit = (_data: ContactFormInput) => {
    setSubmitted(true);
    reset();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <PageTitle
        title={isSwahili ? "Mawasiliano | Denis Chamkaga" : "Contact | Denis Chamkaga"}
        description={isSwahili ? "Wasiliana nami kwa ushauri wa mifumo, uundaji wa database na mikataba ya SLA." : "Get in touch for database systems, custom CRM digitalization, and SLA support inquiries."}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Left Column: Contact details */}
        <motion.div 
          className="lg:col-span-5 space-y-8"
          variants={heroStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold dark:text-white light:text-slate-800 font-display">
              {isSwahili ? "Tupange Kazi" : "Let's Coordinate"}
            </h3>
            <p className="text-base dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
              {isSwahili 
                ? "Uko tayari kuweka mifumo ya kiotomatiki, kujenga mfumo maalum, au kushauriana kuhusu mwelekeo wa kiufundi wa biashara yako? Nitumie ujumbe hapa."
                : "Ready to automate your operations, build a custom database system, or consult on a technical roadmap? Send me a message directly."}
            </p>
          </div>

          <motion.div
            variants={fadeUpVariants}
            custom={0.3}
            className="space-y-6 font-body"
          >
            {/* Phone Card (WhatsApp Link) */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 items-start p-4 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/20 light:bg-slate-50/50 hover:border-accent-violet transition-colors group focus:outline-none focus:ring-2 focus:ring-accent-violet block"
            >
              <div className="p-3 rounded-lg bg-accent-violet/10 group-hover:bg-accent-violet/20 transition-colors shrink-0">
                <Phone className="text-accent-violet" size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-sm dark:text-white light:text-slate-800 flex items-center gap-1 font-display">
                  {isSwahili ? "WhatsApp (Njia Kuu)" : "WhatsApp (Primary)"}
                  <ExternalLink size={12} className="text-zinc-400" />
                </h4>
                <p className="text-sm dark:text-zinc-400 light:text-slate-500">{contactPhone}</p>
              </div>
            </a>

            {/* Email Card */}
            <a 
              href={`mailto:${contactEmail}`}
              className="flex gap-4 items-start p-4 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/20 light:bg-slate-50/50 hover:border-accent-violet transition-colors group focus:outline-none focus:ring-2 focus:ring-accent-violet block"
            >
              <div className="p-3 rounded-lg bg-accent-violet/10 group-hover:bg-accent-violet/20 transition-colors shrink-0">
                <Mail className="text-accent-violet" size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-sm dark:text-white light:text-slate-800 font-display">Email</h4>
                <p className="text-sm dark:text-zinc-400 light:text-slate-500">{contactEmail}</p>
              </div>
            </a>

            {/* Location Card */}
            <div className="flex gap-4 items-start p-4 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/20 light:bg-slate-50/50">
              <div className="p-3 rounded-lg bg-accent-violet/10 shrink-0">
                <MapPin className="text-accent-violet" size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-sm dark:text-white light:text-slate-800 font-display">
                  {isSwahili ? "Ofisi / Eneo" : "Office Location"}
                </h4>
                <p className="text-sm dark:text-zinc-400 light:text-slate-500 font-body">{contactLocation}</p>
              </div>
            </div>

            {/* Connect Channels Section */}
            <div className="pt-6 border-t dark:border-zinc-800/60 light:border-slate-100 space-y-3">
              <h4 className="text-xs font-semibold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider font-display">
                {isSwahili ? "Fuatilia Sasisho zangu za Kiufundi" : "Follow My Technical updates"}
              </h4>
              <div className="flex items-center gap-3">
                {Object.values(SOCIALS).map((soc) => (
                  <a
                    key={soc.name}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 py-3 px-2 rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white text-zinc-400 transition-all duration-300 ${soc.colorClass} focus:outline-none focus:ring-2 focus:ring-accent-violet flex flex-col items-center justify-center gap-1.5 shadow-sm`}
                    aria-label={`Connect on ${soc.name}`}
                  >
                    <svg 
                      className="w-4 h-4 fill-current" 
                      viewBox={soc.viewBox || '0 0 24 24'} 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d={soc.svgPath} />
                    </svg>
                    <span className="text-[10px] font-semibold">{soc.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </motion.div>
        </motion.div>

        {/* Contact Form Box */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border glass-panel shadow-lg">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4 flex flex-col items-center justify-center font-body"
            >
              <CheckCircle2 size={48} className="text-green-500 animate-pulse" />
              <h2 className="text-2xl font-bold dark:text-white light:text-slate-800">
                {isSwahili ? "Ujumbe Umepokelewa!" : "Message Received!"}
              </h2>
              <p className="text-sm dark:text-zinc-400 light:text-slate-500 max-w-sm leading-relaxed">
                {isSwahili 
                  ? "Asante. Ujumbe wako umetumwa kwa Denis Chamkaga. Ataikagua na kukujibu ndani ya saa 24."
                  : "Thank you. Your inquiry has been sent to Denis. He will review your operational requirements and reach out to you within 24 hours."}
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="mt-4 cursor-pointer">
                {isSwahili ? "Tuma Ujumbe Mwingine" : "Send Another Message"}
              </Button>
            </motion.div>
          ) : (
            <motion.form 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6 font-body"
            >
              <motion.div variants={fadeUpVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2 text-left">
                  <label htmlFor="name" className="text-xs font-semibold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider">
                    {isSwahili ? "Jina Kamili *" : "Full Name *"}
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: isSwahili ? 'Jina linahitajika' : 'Name is required' })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                  {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                </div>

                {/* Email */}
                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="text-xs font-semibold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider">
                    {isSwahili ? "Barua Pepe *" : "Email Address *"}
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: isSwahili ? 'Barua pepe inahitajika' : 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: isSwahili ? 'Barua pepe sio sahihi' : 'Invalid email address' }
                    })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                  {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                </div>

              </motion.div>

              <motion.div variants={fadeUpVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Phone */}
                <div className="space-y-2 text-left">
                  <label htmlFor="phone" className="text-xs font-semibold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider">
                    {isSwahili ? "Simu (Sio Lazima)" : "Phone (Optional)"}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2 text-left">
                  <label htmlFor="subject" className="text-xs font-semibold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider">
                    {isSwahili ? "Mada (Sio Lazima)" : "Inquiry Subject (Optional)"}
                  </label>
                  <input
                    id="subject"
                    type="text"
                    {...register('subject')}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>

              </motion.div>

              {/* Message */}
              <motion.div variants={fadeUpVariants} className="space-y-2 text-left">
                <label htmlFor="message" className="text-xs font-semibold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider">
                  {isSwahili ? "Ujumbe / Mahitaji ya Mfumo *" : "Message / Project Requirements *"}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register('message', { required: isSwahili ? 'Ujumbe unahitajika' : 'Message is required' })}
                  placeholder={isSwahili ? "Eleza changamoto ya biashara yako au mahitaji ya mfumo..." : "Explain your business challenge, desired system features, budget limits, or timeline..."}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                />
                {errors.message && <span className="text-xs text-red-500">{errors.message.message}</span>}
              </motion.div>

              <motion.div variants={fadeUpVariants}>
                <Button
                  variant="primary"
                  type="submit"
                  fullWidth
                  rightIcon={<Send size={16} />}
                  className="cursor-pointer"
                >
                  {isSwahili ? "Tuma Ujumbe" : "Send Message"}
                </Button>
              </motion.div>
            </motion.form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
