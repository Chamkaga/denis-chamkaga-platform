import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import {
  Globe, Landmark, GraduationCap, Laptop, CheckCircle, ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';

export const PartnerPage: React.FC = () => {
  const { language } = useLanguageStore();
  const isSwahili = language === 'sw';
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    role: '',
    email: '',
    phone: '',
    area: 'Technology',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    // Simulate submission
    setSubmitted(true);
    setFormData({
      name: '',
      organization: '',
      role: '',
      email: '',
      phone: '',
      area: 'Technology',
      message: ''
    });
  };

  const areas = isSwahili
    ? [
        { title: "Universities & Colleges", desc: "Kutoa mafunzo na semina maalum kwa wanafunzi wa IT na Biashara.", icon: <GraduationCap size={20} /> },
        { title: "Mashirika yasiyo ya Kiserikali (NGOs)", desc: "Kujenga mifumo ya kuratibu miradi ya kijamii na e-waste logistics.", icon: <Landmark size={20} /> },
        { title: "Makampuni ya Teknolojia", desc: "Ushirikiano wa kiufundi katika kuunganisha API na database.", icon: <Laptop size={20} /> },
        { title: "Wafadhili & Wawekezaji", desc: "Kusaidia maendeleo ya kijamii kupitia micro-investments na agribusiness.", icon: <Globe size={20} /> }
      ]
    : [
        { title: "Universities & Institutes", desc: "Collaborate on lectures, technical internships, and curriculum guidance.", icon: <GraduationCap size={20} /> },
        { title: "NGOs & Non-Profits", desc: "Partner on eco-waste tracking systems and rural agribusiness apps.", icon: <Landmark size={20} /> },
        { title: "Technology Teams", desc: "Integrate APIs, scale PostgreSQL databases, and build dashboards.", icon: <Laptop size={20} /> },
        { title: "Sponsors & Investors", desc: "Fuel agribusiness micro-investments and environmental recycling models.", icon: <Globe size={20} /> }
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 text-left font-body relative overflow-hidden">
      <PageTitle
        title={isSwahili ? "Shirikiana Nami" : "Partner With Me"}
        description={isSwahili ? "Kujenga uhusiano wa kimkakati na taasisi, NGOs, na makampuni kuendesha miradi thabiti." : "Building strategic alliances with institutes, businesses, and organizations to scale social and technological impact."}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Why Partner & Areas of Collaboration */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold dark:text-white font-display">
              {isSwahili ? "Kwa Nini Ushirikiane Nami?" : "Why Collaborate?"}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed font-body">
              {isSwahili
                ? "Naleta uzoefu wa miaka mingi katika kuunganisha mifumo, uundaji wa database thabiti, na kuelewa mahitaji ya kipekee ya biashara ndogo na za kati nchini Tanzania. Ushirikiano huu unalenga kutengeneza mifumo inayoweza kubadilisha jamii kiuchumi na kulinda mazingira."
                : "Collaborating with me bridges the gap between academic theory, corporate processes, and localized social enterprise engines. I bring database expertise, technical operations focus, and Tanzanian logistics pipeline execution."}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold dark:text-white text-sm uppercase tracking-wider dark:text-zinc-400">
              {isSwahili ? "Maeneo ya Ushirikiano" : "Alliances & Collaboration Areas"}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {areas.map((a, idx) => (
                <div key={idx} className="p-4 rounded-xl border dark:border-zinc-800 bg-zinc-950/20 flex gap-3.5 items-start">
                  <div className="p-2.5 rounded-lg bg-accent-violet/10 text-accent-violet shrink-0">{a.icon}</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm dark:text-white">{a.title}</h4>
                    <p className="text-[11px] sm:text-xs text-zinc-500">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Request Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-white shadow-xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold dark:text-white font-display">
                {isSwahili ? "Tuma Ombi la Ushirikiano" : "Collaboration Request Form"}
              </h2>
              <p className="text-xs text-zinc-500 font-body">
                {isSwahili ? "Weka taarifa zako hapa chini na Denis atawasiliana nawe kufanya mazungumzo." : "Complete the fields below to initiate alliance scope discussions."}
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/5 text-center space-y-3">
                <CheckCircle size={32} className="text-green-500 mx-auto" />
                <h3 className="font-bold dark:text-white text-base">{isSwahili ? "Ombi Limepokelewa!" : "Alliance Scope Received!"}</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {isSwahili
                    ? "Asante kwa kuonyesha nia ya kushirikiana nami. Denis atapitia maombi yako na kuwasiliana nawe hivi karibuni."
                    : "Thank you for reaching out. Denis will review your organization's proposal details and get back to you shortly."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Jina Kamili" : "Full Name"} *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Barua Pepe" : "Email Address"} *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. partner@org.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Taasisi / Kampuni" : "Organization"}</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. University of Dar es Salaam"
                      className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Nafasi yako" : "Your Role"}</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Head of Research"
                      className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Namba ya Simu" : "Phone Number"}</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +255 620 XXX XXX"
                      className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Eneo la Ushirikiano" : "Area of Collaboration"}</label>
                    <select
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet select-none"
                    >
                      <option value="Technology">{isSwahili ? "Teknolojia & Mifumo" : "Technology & Systems"}</option>
                      <option value="Innovation">{isSwahili ? "Majaribio (Innovation)" : "Innovation & Research"}</option>
                      <option value="Investment">{isSwahili ? "Uwekezaji & Ufadhili" : "Investment & Funding"}</option>
                      <option value="Academic">{isSwahili ? "Mafunzo ya Vyuo" : "Academic Programs"}</option>
                      <option value="Other">{isSwahili ? "Nyinginezo" : "Other Collaboration"}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-400 light:text-slate-600">{isSwahili ? "Ujumbe / Maelezo" : "Collaboration Details"} *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={isSwahili ? "Eleza kwa kifupi malengo ya ushirikiano..." : "Detail your proposed collaboration scope..."}
                    className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:text-zinc-500 font-body"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full">
                  <span>{isSwahili ? "Tuma Ombi" : "Submit Request"}</span>
                  <ArrowRight size={14} />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPage;
