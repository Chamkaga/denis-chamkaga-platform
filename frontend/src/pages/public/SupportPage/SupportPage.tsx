import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, Mail, User, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/atoms/Button';
import { publicApi } from '../../../services/api';
import { motion } from 'framer-motion';
import { ROUTES } from '../../../config/routes';
import { useLanguageStore } from '../../../store/useLanguageStore';

// Import config and telemetry modules dynamically
import {
  visionPillars,
  currentFocus,
  communityRoles,
  waysToContribute,
  supporterTiers,
  trackPageView,
  trackScroll,
  trackTierSelected,
  trackCheckoutStarted,
  trackCheckoutCompleted,
  trackCollaboratorClicked,
  trackPartnerClicked,
  trackContactClicked,
  trackCommunityJoinClicked
} from '../../../config/supportConfig';

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';

  // Track Page View on mount
  useEffect(() => {
    trackPageView();
    
    // Scroll tracking setup
    let scrolled50 = false;
    let scrolled100 = false;
    
    const handleScroll = () => {
      const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPct >= 0.5 && !scrolled50) {
        scrolled50 = true;
        trackScroll(50);
      }
      if (scrollPct >= 0.95 && !scrolled100) {
        scrolled100 = true;
        trackScroll(100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch site settings
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => publicApi.getSettings(),
  });

  const isEnabled = settings?.support_enabled !== 'false';

  const [selectedTier, setSelectedTier] = useState<string>('seed');
  const [currency, setCurrency] = useState<'TZS' | 'USD'>('TZS');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkoutMutation = useMutation({
    mutationFn: (payload: { amount: number; currency: string; email: string; name?: string }) =>
      publicApi.initiateSupportCheckout(payload),
    onSuccess: (data) => {
      trackCheckoutCompleted({ currency, email });
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setErrorMessage('Failed to resolve secure redirect URL from payment partner.');
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Payment partner session failed.');
    }
  });

  const getTierAmount = (tierId: string) => {
    const tier = supporterTiers.find(t => t.id === tierId);
    if (!tier) return 5000;
    return currency === 'USD' ? tier.amountUsd : tier.amountTzs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    let finalAmount = 0;
    if (isCustomSelected) {
      finalAmount = parseFloat(customAmount);
    } else {
      finalAmount = getTierAmount(selectedTier);
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMessage(isSwahili ? 'Tafadhali chagua au weka kiwango halali.' : 'Please select or specify a valid contribution amount.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage(isSwahili ? 'Barua pepe inahitajika.' : 'Email address is required.');
      return;
    }

    trackCheckoutStarted({
      tier: isCustomSelected ? 'custom' : selectedTier,
      amount: finalAmount,
      currency
    });

    checkoutMutation.mutate({
      amount: finalAmount,
      currency,
      email,
      name: name.trim() || undefined
    });
  };

  if (!isEnabled) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 font-body">
        <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500">
          <Info size={32} />
        </div>
        <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">{isSwahili ? "Ukurasa Haufanyi Kazi" : "Ecosystem Portal Offline"}</h1>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          {isSwahili ? "Ukurasa huu haupokei michango kwa sasa." : "This ecosystem section is currently offline. Please check back later."}
        </p>
        <Link to="/" className="text-xs text-accent-violet font-semibold hover:underline">{isSwahili ? "Rudi Nyumbani" : "Return Home"}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 text-left font-body relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-accent-violet/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-accent-violet/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Title Section */}
      <motion.section 
        className="space-y-6 max-w-3xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-zinc-900 light:bg-slate-100 border dark:border-zinc-800 light:border-slate-200 text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
          <Heart size={12} className="fill-accent-violet" />
          {isSwahili ? "Tujenge Mbeleni Pamoja" : "Build the Future Together"}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display leading-tight">
          {isSwahili ? "Jenga Baadaye Pamoja na Denis" : "Build the Future Together"}
        </h1>
        <p className="text-base sm:text-lg dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
          {isSwahili
            ? "Hili ni zaidi ya mtu mmoja. Pamoja tunajenga teknolojia ya vitendo, tunashiriki maarifa ya uhandisi, na kuweka mifumo inayasaidia biashara na jamii kukua kote Tanzania na Afrika."
            : "This is bigger than one person. Together we are building practical technology, sharing systems engineering knowledge, and creating tools that help communities and businesses grow across Tanzania and Africa."}
        </p>

        {/* Top Mission Buttons */}
        <div className="flex flex-wrap gap-3.5 pt-4">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              trackCollaboratorClicked();
              navigate(ROUTES.CONTACT);
            }}
            className="cursor-pointer font-bold shadow-md shadow-accent-violet/10"
          >
            <span>{isSwahili ? "Kuwa Collaborator" : "Become a Collaborator"}</span>
            <ArrowRight size={14} />
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              trackPartnerClicked();
              navigate(ROUTES.PARTNER);
            }}
            className="cursor-pointer border-accent-violet/60 text-accent-violet hover:bg-accent-violet/10 font-bold"
          >
            <span>{isSwahili ? "Shirikiana Nami / Partner" : "Partner With Me"}</span>
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              trackContactClicked();
              navigate(ROUTES.CONTACT);
            }}
            className="cursor-pointer font-semibold text-zinc-500 hover:text-zinc-300"
          >
            <span>{isSwahili ? "Wasiliana Nami" : "Contact Me"}</span>
          </Button>
        </div>
      </motion.section>

      {/* 1. What We're Building Together (Vision Pillars) */}
      <section className="space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold dark:text-white font-display">
            {isSwahili ? "Tunachojenga Pamoja" : "What We're Building Together"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-body">
            {isSwahili ? "Kila mchango au ushirikiano unasaidia kuimarisha nguzo hizi:" : "Every contribution and partnership helps strengthen these core values:"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visionPillars.map((p, idx) => (
            <div key={idx} className="p-6 rounded-2xl border dark:border-zinc-800 bg-zinc-950/20 space-y-2 hover:border-accent-violet/40 transition-colors text-left">
              <h3 className="font-extrabold text-sm dark:text-white leading-tight font-display">{p.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-body">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Current Focus & Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold dark:text-white font-display">
            {isSwahili ? "Muelekeo wa Sasa" : "Current Focus"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
            {isSwahili
              ? "Ubunifu unahitaji muelekeo thabiti. Huu ndio mpango wetu wa sasa wa maendeleo tunaoufanyia kazi kila siku."
              : "Technology milestones require dedicated execution. This is our active developmental focus mapping Denis's educational and technical work."}
          </p>
        </div>
        <div className="p-6 rounded-2xl border dark:border-zinc-800 bg-zinc-950/20 space-y-3.5">
          {currentFocus.map((f, idx) => (
            <div key={idx} className="flex gap-3 items-center text-xs">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${f.done ? 'bg-green-500/10 text-green-500' : 'bg-accent-violet/10 text-accent-violet animate-pulse'}`}>
                {f.done ? '✓' : '●'}
              </span>
              <span className={`font-semibold font-body ${f.done ? 'dark:text-zinc-400 line-through' : 'dark:text-white'}`}>
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. There is a Place for Everyone (Who Can Join) */}
      <section className="space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold dark:text-white font-display">
            {isSwahili ? "Kila Mtu Ana Nafasi Yake" : "There is a Place for Everyone"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-body">
            {isSwahili ? "Ecosystem yetu inakua kupitia michango ya kitaalamu ya wasifu tofauti:" : "Our digital sandbox ecosystem grows via specialized roles:"}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {communityRoles.map((r, idx) => (
            <div key={idx} className="p-4 rounded-xl border dark:border-zinc-850 bg-zinc-950/40 text-center space-y-2">
              <div className="text-2xl">{r.icon}</div>
              <h4 className="font-bold text-xs dark:text-white leading-tight font-display">{r.role}</h4>
              <p className="text-[10px] text-zinc-500 font-body">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Other Ways to Support (Categorized Actions) */}
      <section className="space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold dark:text-white font-display">
            {isSwahili ? "Njia Nyingine za Kusaidia" : "Other Ways to Help"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-body">
            {isSwahili ? "Kusaidia maono haimaanishi fedha pekee. Kuna njia nyingi za kuwa sehemu yetu:" : "Advocating for the vision goes beyond financial logs. Choose your collaboration path:"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Group 1: Collaborate */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 bg-zinc-950/20 space-y-4">
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">Collaborate</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {waysToContribute.collaborate.map((w, idx) => (
                <li key={idx} className="space-y-0.5">
                  <span className="font-bold block dark:text-white">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Group 2: Promote */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 bg-zinc-950/20 space-y-4">
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">Promote</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {waysToContribute.promote.map((w, idx) => (
                <li key={idx} className="space-y-0.5">
                  <span className="font-bold block dark:text-white">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 3: Partner */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 bg-zinc-950/20 space-y-4">
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">Partner</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {waysToContribute.partner.map((w, idx) => (
                <li key={idx} className="space-y-0.5">
                  <span className="font-bold block dark:text-white">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 4: Learn */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 bg-zinc-950/20 space-y-4">
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">Learn</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {waysToContribute.learn.map((w, idx) => (
                <li key={idx} className="space-y-0.5">
                  <span className="font-bold block dark:text-white">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Join the Ecosystem Panel */}
      <section className="p-8 sm:p-12 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-violet/5 rounded-full blur-[85px] -z-10" />
        <h2 className="text-xl sm:text-2xl font-extrabold dark:text-white font-display">
          {isSwahili ? "Jiunge na Ecosystem Yetu" : "Join the Ecosystem"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-body max-w-lg">
          {isSwahili
            ? "Safari hii ni kubwa kuliko mtu mmoja. Inahusu kujenga teknolojia, kushiriki maarifa, kuanzisha fursa mpya na kusaidia jamii kukua kwa pamoja."
            : "This mission is bigger than one person. It is about building technology, sharing knowledge, creating opportunities, and helping communities grow together."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              trackCommunityJoinClicked();
              navigate(ROUTES.CONTACT);
            }}
            className="cursor-pointer font-bold"
          >
            <span>{isSwahili ? "Kuwa Collaborator" : "Become a Collaborator"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trackPartnerClicked();
              navigate(ROUTES.PARTNER);
            }}
            className="cursor-pointer border-accent-violet/60 text-accent-violet hover:bg-accent-violet/10 font-bold"
          >
            <span>{isSwahili ? "Shirikiana Nami" : "Partner With Me"}</span>
          </Button>
        </div>
      </section>

      {/* 6. Become a Vision Supporter (Financial Checkout form) */}
      <section id="financial-support" className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start pt-12 border-t dark:border-zinc-800/60">
        
        {/* Left Side Tiers Info */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold dark:text-white font-display">
              {isSwahili ? "Kuwa Vision Supporter" : "Become a Vision Supporter"}
            </h2>
            <p className="text-xs sm:text-sm dark:text-zinc-400 font-body">
              {isSwahili
                ? "Chagua ngazi inayofaa kufadhili miundombinu yetu, zana huru za watengenezaji programu na miradi ya R&D."
                : "Choose a tier to directly fuel our server infrastructure, free developer tooling, and database optimization pilots."}
            </p>
          </div>

          {/* Tier Selections (Impact-First Cards) */}
          <div className="space-y-3">
            {supporterTiers.map((tier) => {
              const displayVal = currency === 'USD' ? `$${tier.amountUsd}` : `${tier.amountTzs.toLocaleString()} TZS`;
              const isSelected = !isCustomSelected && selectedTier === tier.id;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    trackTierSelected(tier.id);
                    setIsCustomSelected(false);
                    setSelectedTier(tier.id);
                  }}
                  className={`w-full p-4 rounded-xl border text-left flex justify-between items-start gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-accent-violet bg-accent-violet/10 text-accent-violet shadow-sm'
                      : 'dark:border-zinc-800 bg-zinc-950/20 text-zinc-500 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm dark:text-white">
                      <span>{tier.badge}</span>
                      <span>{tier.name}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs leading-normal dark:text-zinc-500 font-body">{tier.impact}</p>
                  </div>
                  <div className="text-xs font-bold font-mono text-accent-violet whitespace-nowrap pt-0.5">
                    {isSwahili ? 'Kuanzia' : 'From'} {displayVal}
                  </div>
                </button>
              );
            })}

            {/* Custom Option Card */}
            <button
              type="button"
              onClick={() => {
                trackTierSelected('custom');
                setIsCustomSelected(true);
              }}
              className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                isCustomSelected
                  ? 'border-accent-violet bg-accent-violet/10 text-accent-violet shadow-sm'
                  : 'dark:border-zinc-800 bg-zinc-950/20 text-zinc-500 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm dark:text-white">
                <span>❤️</span>
                <span>{isSwahili ? "Mchango Maalum" : "Custom Support"}</span>
              </div>
              <div className="text-xs font-bold text-accent-violet font-display">
                {isSwahili ? "Weka Kiasi Chako" : "Choose Custom"}
              </div>
            </button>
          </div>
        </div>

        {/* Right Side Form (Checkout Entry) */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl border dark:border-zinc-800/80 bg-zinc-900/30 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Currency Select & Custom Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold dark:text-zinc-300 uppercase tracking-wider">{isSwahili ? "Kiasi Kinalipwa" : "Contribution Currency"}</label>
                <div className="flex bg-zinc-950/40 p-0.5 rounded-lg border dark:border-zinc-800/80 text-[10px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => setCurrency('TZS')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${currency === 'TZS' ? 'bg-accent-violet text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    TZS
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${currency === 'USD' ? 'bg-accent-violet text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    USD
                  </button>
                </div>
              </div>

              {isCustomSelected && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-wider">{isSwahili ? "Kiwango Maalum" : "Custom Amount"} ({currency})</label>
                  <div className="relative rounded-xl border dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden flex items-center">
                    <div className="pl-3.5 pr-2 dark:text-zinc-500 text-xs font-semibold">{currency === 'TZS' ? 'TZS' : '$'}</div>
                    <input
                      type="number"
                      min="100"
                      placeholder={isSwahili ? "Mfano: 25,000" : "Example: 25000"}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full py-2.5 text-xs text-white focus:outline-none placeholder:text-zinc-600 bg-transparent pr-4 font-mono font-bold"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Supporter Info fields */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-wider">{isSwahili ? "Barua Pepe" : "Email Address"}</label>
                <div className="relative rounded-xl border dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden flex items-center">
                  <div className="px-3 text-zinc-500"><Mail size={13} /></div>
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 text-xs focus:outline-none placeholder:text-zinc-600 bg-transparent pr-4 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-wider">{isSwahili ? "Jina Kamili (Hiari)" : "Full Name (Optional)"}</label>
                <div className="relative rounded-xl border dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden flex items-center">
                  <div className="px-3 text-zinc-500"><User size={13} /></div>
                  <input
                    type="text"
                    placeholder={isSwahili ? "Mfano: Denis Chamkaga" : "Example: Denis Chamkaga"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 text-xs focus:outline-none placeholder:text-zinc-600 bg-transparent pr-4 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 text-xs text-red-500 font-semibold bg-red-500/10 rounded-xl border border-red-500/20 leading-snug">
                {errorMessage}
              </div>
            )}

            {/* Secure Checkout Note & Button */}
            <div className="space-y-4 pt-2 text-center">
              <p className="text-[11px] sm:text-xs text-zinc-500 leading-normal font-body">
                {isSwahili
                  ? "Kila mchango ni muhimu sana. Iwe unasaidia kwa ushirikiano wa msimbo, ushauri, advocacy au mchango wa kifedha, unaleta athari chanya ya kujenga teknolojia itakayasaidia watu na biashara za ndani."
                  : "Every contribution matters. Whether you contribute through collaboration, mentorship, partnerships, sharing ideas, or financial support, you are helping build technology that empowers people, businesses, and future innovators."}
              </p>

              <div className="p-3.5 rounded-2xl bg-zinc-950/20 border dark:border-zinc-900 text-left flex gap-2.5 items-start">
                <ShieldCheck size={18} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 leading-normal font-body">
                  {isSwahili
                    ? "Miamala yote inachakatwa kwa usalama wa hali ya juu kupitia mshirika wetu salama wa malipo. Hatuhifadhi taarifa zako za kifedha."
                    : "Your payment is processed securely through our trusted payment partner. We never store your payment information."}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent-violet/25 font-bold"
                isLoading={checkoutMutation.isPending}
              >
                <span>{isSwahili ? "Endelea kwa Usalama" : "Continue Securely"}</span>
                <ArrowRight size={14} />
              </Button>
            </div>

          </form>
        </div>

      </section>

    </div>
  );
};

export default SupportPage;
