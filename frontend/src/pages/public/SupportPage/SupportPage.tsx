import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, Mail, User, Info, ShieldCheck, ArrowRight, BriefcaseBusiness, Store, GraduationCap, Workflow, Building2, Users, Code2, Megaphone, Handshake, BookOpen, Palette, Lightbulb, Sprout, Rocket, Star } from 'lucide-react';
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
  const displayVisionPillars = isSwahili
    ? [
        { title: 'Teknolojia ya Biashara kwa Vitendo', desc: 'Kujenga tovuti na mifumo inayotatua changamoto halisi za wateja, mauzo, kumbukumbu, fedha na utoaji wa huduma.' },
        { title: 'Mabadiliko ya Kidijitali kwa SME', desc: 'Kusaidia biashara ndogo na zinazokua kuhama kutoka karatasi, Excel na zana zilizotengana kwenda kwenye mtiririko salama wa kidijitali.' },
        { title: 'Ujuzi na Maarifa', desc: 'Kutoa mafunzo na mwongozo wa vitendo unaowasaidia watu kutumia teknolojia kwa ujasiri na kuboresha kazi za kila siku.' },
        { title: 'Utoaji wa Huduma Unaoaminika', desc: 'Kuunganisha ushauri, quotation, malipo, utekelezaji wa mradi, mafunzo na support katika safari moja ya mteja.' },
        { title: 'Ukuaji wa Terrasafi', desc: 'Kukuza huduma za teknolojia, uchapishaji, design, network, stationery na electronics kupitia ushirikiano endelevu.' },
        { title: 'Ushirikiano na Jamii', desc: 'Kuunganisha wateja, wataalamu, suppliers, mentors na collaborators ili kujenga suluhisho zenye manufaa.' },
      ]
    : visionPillars;

  const pillarIcons = [BriefcaseBusiness, Store, GraduationCap, Workflow, Building2, Users];
  const displayCurrentFocus = isSwahili
    ? [
        { title: 'Kukamilisha Diploma ya Business Information Technology', done: true },
        { title: 'Kujenga na kuhakiki marketplace ya FODS', done: true },
        { title: 'Kujenga Denis Chamkaga business platform', done: true },
        { title: 'Kuandaa huduma na taratibu za Terrasafi', done: false },
        { title: 'Kuunganisha malipo ya DPO baada ya kupata production credentials', done: false },
        { title: 'Kukuza mafunzo, ushirikiano na huduma kwa wateja', done: false },
      ]
    : currentFocus;
  const displayCommunityRoles = isSwahili
    ? [
        { role: 'Developers', icon: '👨‍💻', desc: 'Kushirikiana kujenga tovuti, integrations na mifumo salama ya biashara.' },
        { role: 'Designers', icon: '🎨', desc: 'Kuboresha brand, interface na uzoefu wa mteja.' },
        { role: 'Wajasiriamali', icon: '💼', desc: 'Kushiriki changamoto halisi na kujenga suluhisho zinazofaa.' },
        { role: 'Wanafunzi', icon: '🎓', desc: 'Kujifunza kupitia miradi ya vitendo na mentorship.' },
        { role: 'Kampuni', icon: '🏢', desc: 'Kushirikiana kwenye huduma, suppliers na suluhisho za biashara.' },
        { role: 'Mentors', icon: '💡', desc: 'Kutoa uzoefu, mwongozo na maarifa ya kitaalamu.' },
      ]
    : communityRoles;
  const communityIcons = [Code2, Palette, BriefcaseBusiness, GraduationCap, Building2, Lightbulb];
  const supporterIcons = [Sprout, Rocket, Star, Heart];
  const displayWays = isSwahili
    ? {
        collaborate: [
          { title: 'Kuwa Collaborator', desc: 'Changia ujuzi unaofaa kwenye miradi na huduma.' },
          { title: 'Jaribu Mfumo', desc: 'Pima customer journeys na toa feedback inayoeleweka.' },
          { title: 'Shiriki Changamoto', desc: 'Eleza tatizo halisi la biashara linaloweza kutatuliwa.' },
        ],
        promote: [
          { title: 'Shiriki Kazi Zetu', desc: 'Fikisha miradi na huduma kwa watu wanaozihitaji.' },
          { title: 'Pendekeza Platform', desc: 'Unganisha SME na suluhisho zinazofaa.' },
          { title: 'Shiriki Maarifa', desc: 'Saidia mafunzo yenye manufaa kuwafikia watu wengi.' },
        ],
        partner: [
          { title: 'Ushirikiano wa Biashara', desc: 'Shirikiana kwenye delivery, referrals au huduma kwa wateja.' },
          { title: 'Supplier Partnership', desc: 'Shirikiana kwenye printing, stationery, network au electronics.' },
          { title: 'Technology Partnership', desc: 'Jenga integrations na mifumo maalum ya biashara.' },
        ],
        learn: [
          { title: 'Soma Makala', desc: 'Jifunze dhana za biashara na teknolojia kwa vitendo.' },
          { title: 'Jiunge na Mafunzo', desc: 'Shiriki kwenye workshops za ujuzi wa kidijitali.' },
          { title: 'Chunguza Miradi', desc: 'Soma case studies, maamuzi na matokeo ya miradi.' },
        ],
      }
    : waysToContribute;
  const displaySupporterTiers = supporterTiers.map((tier) => {
    if (!isSwahili) return tier;
    const translations: Record<string, { name: string; impact: string }> = {
      seed: { name: 'Msaidizi wa Mwanzo', impact: 'Husaidia kuandaa mafunzo ya vitendo na mwongozo kwa jamii.' },
      growth: { name: 'Msaidizi wa Ukuaji', impact: 'Husaidia hosting ya portfolio, demonstrations na miundombinu ya platform.' },
      vision: { name: 'Mjenzi wa Maono', impact: 'Husaidia maandalizi ya huduma za Terrasafi, utafiti wa wateja na zana za biashara.' },
      champion: { name: 'Balozi wa Maono', impact: 'Husaidia kukuza mafunzo, partnerships na teknolojia yenye manufaa kwa jamii.' },
    };
    return { ...tier, ...translations[tier.id] };
  });

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
    mutationFn: (payload: { amount: number; currency: string; email: string; name?: string; tier: string }) =>
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
    
    let finalAmount: number;
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
      name: name.trim() || undefined,
      tier: isCustomSelected ? 'custom' : selectedTier,
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
      <section className="space-y-6">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 font-display">
            {isSwahili ? "Tunachojenga Pamoja" : "What We're Building Together"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-body">
            {isSwahili ? "Ushirikiano wako unasaidia kujenga huduma halisi, ujuzi na mifumo inayoboresha biashara na jamii." : "Your collaboration helps build practical services, skills, and systems that improve businesses and communities."}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayVisionPillars.map((p, idx) => {
            const PillarIcon = pillarIcons[idx];
            return (
            <div key={p.title} className="p-5 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/35 light:bg-white space-y-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-violet/45 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet">
                  <PillarIcon size={20} strokeWidth={1.9} />
                </span>
                <span className="text-[10px] font-bold font-mono text-accent-violet/70">0{idx + 1}</span>
              </div>
              <h3 className="font-extrabold text-sm dark:text-white light:text-slate-900 leading-tight font-display">{p.title}</h3>
              <p className="text-xs dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">{p.desc}</p>
            </div>
          )})}
        </div>
      </section>

      {/* 2. Current Focus & Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-2 space-y-3 p-6 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/30 light:bg-slate-50">
          <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 font-display">
            {isSwahili ? "Muelekeo wa Sasa" : "Current Focus"}
          </h2>
          <p className="text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed font-body">
            {isSwahili
              ? "Ubunifu unahitaji muelekeo thabiti. Huu ndio mpango wetu wa sasa wa maendeleo tunaoufanyia kazi kila siku."
              : "This roadmap shows completed foundations and the next practical milestones for Terrasafi, payments, training, partnerships, and customer service."}
          </p>
        </div>
        <div className="lg:col-span-3 p-5 sm:p-6 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white shadow-sm space-y-2">
          {displayCurrentFocus.map((f) => (
            <div key={f.title} className="flex gap-3 items-center rounded-xl px-3 py-2.5 text-xs dark:bg-zinc-900/35 light:bg-slate-50">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${f.done ? 'bg-green-500/10 text-green-500' : 'bg-accent-violet/10 text-accent-violet animate-pulse'}`}>
                {f.done ? '✓' : '●'}
              </span>
              <span className={`font-semibold font-body ${f.done ? 'dark:text-zinc-400 light:text-slate-500' : 'dark:text-white light:text-slate-800'}`}>
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. There is a Place for Everyone (Who Can Join) */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 font-display">
            {isSwahili ? "Kila Mtu Ana Nafasi Yake" : "There is a Place for Everyone"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-body">
            {isSwahili ? "Wateja, wataalamu na washirika tofauti wanaweza kushiriki kwa njia inayoendana na uzoefu wao." : "Clients, professionals, and partners can contribute in ways that match their experience and capacity."}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCommunityRoles.map((r, idx) => {
            const RoleIcon = communityIcons[idx];
            return (
            <div key={r.role} className="p-4 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/40 light:bg-white text-center space-y-2 shadow-sm hover:border-accent-violet/40 transition-colors">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet"><RoleIcon size={18} strokeWidth={1.9} /></div>
              <h4 className="font-bold text-xs dark:text-white light:text-slate-900 leading-tight font-display">{r.role}</h4>
              <p className="text-[10px] dark:text-zinc-500 light:text-slate-600 font-body leading-relaxed">{r.desc}</p>
            </div>
          )})}
        </div>
      </section>

      {/* 4. Other Ways to Support (Categorized Actions) */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 font-display">
            {isSwahili ? "Njia Nyingine za Kusaidia" : "Other Ways to Help"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-body">
            {isSwahili ? "Mchango si fedha pekee. Chagua njia ya kushirikiana inayokufaa." : "Support is broader than money. Choose the collaboration path that fits you."}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Group 1: Collaborate */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white space-y-4 shadow-sm hover:border-accent-violet/45 transition-colors">
            <div className="grid h-10 w-10 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet"><Code2 size={19} /></div>
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">{isSwahili ? 'Shirikiana' : 'Collaborate'}</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {displayWays.collaborate.map((w) => (
                <li key={w.title} className="space-y-0.5">
                  <span className="font-bold block dark:text-white light:text-slate-900">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Group 2: Promote */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white space-y-4 shadow-sm hover:border-accent-violet/45 transition-colors">
            <div className="grid h-10 w-10 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet"><Megaphone size={19} /></div>
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">{isSwahili ? 'Tangaza' : 'Promote'}</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {displayWays.promote.map((w) => (
                <li key={w.title} className="space-y-0.5">
                  <span className="font-bold block dark:text-white light:text-slate-900">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 3: Partner */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white space-y-4 shadow-sm hover:border-accent-violet/45 transition-colors">
            <div className="grid h-10 w-10 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet"><Handshake size={19} /></div>
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">{isSwahili ? 'Ubia' : 'Partner'}</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {displayWays.partner.map((w) => (
                <li key={w.title} className="space-y-0.5">
                  <span className="font-bold block dark:text-white light:text-slate-900">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 4: Learn */}
          <div className="p-5 rounded-2xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/30 light:bg-white space-y-4 shadow-sm hover:border-accent-violet/45 transition-colors">
            <div className="grid h-10 w-10 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet"><BookOpen size={19} /></div>
            <h3 className="font-extrabold text-xs text-accent-violet uppercase tracking-wider font-display">{isSwahili ? 'Jifunze' : 'Learn'}</h3>
            <ul className="space-y-2.5 text-xs text-left">
              {displayWays.learn.map((w) => (
                <li key={w.title} className="space-y-0.5">
                  <span className="font-bold block dark:text-white light:text-slate-900">{w.title}</span>
                  <span className="text-[10px] text-zinc-500 font-body block">{w.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Join the Ecosystem Panel */}
      <section className="p-7 sm:p-9 rounded-3xl border border-accent-violet/20 dark:bg-zinc-950/40 light:bg-gradient-to-br light:from-violet-50 light:to-white flex flex-col items-center text-center space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-violet/5 rounded-full blur-[85px] -z-10" />
        <h2 className="text-xl sm:text-2xl font-extrabold dark:text-white light:text-slate-900 font-display">
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

      {/* 6. Optional support for the work (financial checkout form) */}
      <section id="financial-support" className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start pt-10 border-t dark:border-zinc-800/60 light:border-slate-200">
        
        {/* Left Side Tiers Info */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent-violet font-display">
              <Heart size={13} />
              {isSwahili ? 'Mchango wa Hiari' : 'Optional Community Support'}
            </span>
            <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 font-display">
              {isSwahili ? "Saidia Kazi Hii kwa Hiari" : "Support the Work Voluntarily"}
            </h2>
            <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 font-body leading-relaxed">
              {isSwahili
                ? "Huu ni mchango wa hiari kwa mafunzo, demonstrations, hosting na ukuaji wa huduma. Malipo ya huduma za mteja hufanywa kupitia quotation na invoice rasmi."
                : "This is an optional contribution toward learning resources, demonstrations, hosting, and service growth. Client service payments follow an approved quotation and official invoice."}
            </p>
          </div>

          {/* Tier Selections (Impact-First Cards) */}
          <div className="space-y-3">
            {displaySupporterTiers.map((tier, idx) => {
              const displayVal = currency === 'USD' ? `$${tier.amountUsd}` : `${tier.amountTzs.toLocaleString()} TZS`;
              const isSelected = !isCustomSelected && selectedTier === tier.id;
              const TierIcon = supporterIcons[idx];

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
                      : 'dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/20 light:bg-white text-zinc-500 dark:hover:border-zinc-700 light:hover:border-violet-300'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isSelected ? 'bg-accent-violet/15' : 'dark:bg-zinc-900 light:bg-slate-100'} text-accent-violet`}><TierIcon size={17} /></span>
                    <div className="space-y-1">
                    <div className="font-bold text-xs sm:text-sm dark:text-white light:text-slate-900">
                      {tier.name}
                    </div>
                    <p className="text-[10px] sm:text-xs leading-normal dark:text-zinc-500 light:text-slate-600 font-body">{tier.impact}</p>
                    </div>
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
                  : 'dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/20 light:bg-white text-zinc-500 dark:hover:border-zinc-700 light:hover:border-violet-300'
              }`}
            >
              <div className="flex items-center gap-3 font-bold text-xs sm:text-sm dark:text-white light:text-slate-900">
                <span className="grid h-9 w-9 place-items-center rounded-xl dark:bg-zinc-900 light:bg-slate-100 text-accent-violet"><Heart size={17} /></span>
                <span>{isSwahili ? "Mchango Maalum" : "Custom Contribution"}</span>
              </div>
              <div className="text-xs font-bold text-accent-violet font-display">
                {isSwahili ? "Weka Kiasi" : "Choose amount"}
              </div>
            </button>
          </div>
        </div>

        {/* Right Side Form (Checkout Entry) */}
        <div className="lg:col-span-3 p-6 sm:p-7 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/30 light:bg-white shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Currency Select & Custom Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold dark:text-zinc-300 light:text-slate-700 uppercase tracking-wider">{isSwahili ? "Sarafu ya Mchango" : "Contribution Currency"}</label>
                <div className="flex dark:bg-zinc-950/40 light:bg-slate-100 p-0.5 rounded-lg border dark:border-zinc-800/80 light:border-slate-200 text-[10px] font-bold">
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
                  <label className="text-[10px] font-bold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">{isSwahili ? "Kiwango Maalum" : "Custom Amount"} ({currency})</label>
                  <div className="relative rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 overflow-hidden flex items-center">
                    <div className="pl-3.5 pr-2 dark:text-zinc-500 text-xs font-semibold">{currency === 'TZS' ? 'TZS' : '$'}</div>
                    <input
                      type="number"
                      min="100"
                      placeholder={isSwahili ? "Mfano: 25,000" : "Example: 25000"}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full py-2.5 text-xs dark:text-white light:text-slate-900 focus:outline-none placeholder:text-zinc-500 bg-transparent pr-4 font-mono font-bold"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Supporter Info fields */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">{isSwahili ? "Barua Pepe" : "Email Address"}</label>
                <div className="relative rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 overflow-hidden flex items-center">
                  <div className="px-3 text-zinc-500"><Mail size={13} /></div>
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 text-xs focus:outline-none placeholder:text-zinc-500 bg-transparent pr-4 dark:text-white light:text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">{isSwahili ? "Jina Kamili (Hiari)" : "Full Name (Optional)"}</label>
                <div className="relative rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 overflow-hidden flex items-center">
                  <div className="px-3 text-zinc-500"><User size={13} /></div>
                  <input
                    type="text"
                    placeholder={isSwahili ? "Mfano: Denis Chamkaga" : "Example: Denis Chamkaga"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 text-xs focus:outline-none placeholder:text-zinc-500 bg-transparent pr-4 dark:text-white light:text-slate-900"
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

              <div className="p-3.5 rounded-2xl dark:bg-zinc-950/20 light:bg-emerald-50 border dark:border-zinc-900 light:border-emerald-200 text-left flex gap-2.5 items-start">
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
