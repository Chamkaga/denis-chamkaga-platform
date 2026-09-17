import React from 'react';
import {
  ShieldAlert, Cpu, Database, Network, ArrowRight
} from 'lucide-react';
import { MotionCard } from '../atoms/MotionCard/MotionCard';

interface InnovationLabSectionProps {
  isSwahili: boolean;
}

export const InnovationLabSection: React.FC<InnovationLabSectionProps> = ({ isSwahili }) => {
  const experiments = isSwahili
    ? [
        { title: "RAG BM25 Schema Mapping", desc: "Majaribio ya kuhifadhi na kuuliza indexed documents kupitia schemas za database bila ucheleweshaji.", status: "Active Experiment" },
        { title: "Usimamizi wa E-waste Barcode Logs", desc: "Mfumo wa kufuatilia bidhaa zilizochapwa chapa kiotomatiki wakati wa ukaguzi wa stoo.", status: "Internal MVP" },
        { title: "Automated SMS milestone hooks", desc: "Programu inayotuma alerts wakati payouts za micro-investment zinafanyika nchini.", status: "Testing Phase" }
      ]
    : [
        { title: "BM25 Document RAG Schema", desc: "Locating database models dynamically using lightweight BM25 indices without vector search overhead.", status: "Active Experiment" },
        { title: "E-waste Barcode sorting pipeline", desc: "Sorting barcode scan logs to optimize recycling batch classification.", status: "Internal MVP" },
        { title: "Agribusiness payout triggers", desc: "Testing SMS notifications linked to payout milestone events.", status: "Testing Phase" }
      ];

  const focusAreas = isSwahili
    ? [
        { title: "Hifadhidata (Databases)", desc: "Normalization, optimization ya PostgreSQL & MySQL, partitioning na replication.", icon: <Database size={18} /> },
        { title: "Mifumo Iliyopachikwa (Embedded APIs)", desc: "Mifumo ya SMS, mifumo ya malipo (M-Pesa/Tigo Pesa), ufuatiliaji wa bidhaa.", icon: <Cpu size={18} /> },
        { title: "Ujasusi wa Kibiashara (Business Intelligence)", desc: "Kuchakata data kupata insights za uendeshaji ili kuondoa makosa ya stoo.", icon: <Network size={18} /> }
      ]
    : [
        { title: "Relational Architecture", desc: "Advanced database normalization, query profiling, and multi-tenant scaling.", icon: <Database size={18} /> },
        { title: "Hardware & SMS integrations", desc: "Mobile money webhooks, barcode log trackers, and Twilio alert triggers.", icon: <Cpu size={18} /> },
        { title: "Operational Insights", desc: "Transforming log data into actionable alerts to stop sales leakages.", icon: <Network size={18} /> }
      ];

  return (
    <section id="innovation-lab" className="space-y-12 pt-12 border-t dark:border-zinc-800/60 light:border-slate-100 relative">
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent-violet/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="space-y-4 max-w-3xl text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-zinc-900 light:bg-slate-100 border dark:border-zinc-800 light:border-slate-200 text-xs font-semibold text-accent-violet uppercase tracking-wider font-display">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
          {isSwahili ? "Utafiti na Maendeleo" : "Research & Sandbox"}
        </div>
        <h2 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
          {isSwahili ? "Maabara ya Majaribio" : "Innovation Lab"}
        </h2>
        <p className="text-sm dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
          {isSwahili
            ? "Innovation Lab ni chumba changu cha majaribio. Hapa nafanya utafiti wa mifumo mipya kabla ya kuipeleka kwa wateja au kuitumia kwenye Terrasafi. Majaribio haya yanahusisha algoriti za utafutaji (RAG), uandishi wa data kiotomatiki, na mifumo ya upokeaji wa taarifa bila mtandao wa intaneti kukatiza."
            : "Before scaling software to clients or launching products in Terrasafi, I build sandboxed configurations to examine reliability under high-load stress, RAG latency parameters, and database query optimizations. This laboratory keeps the production platforms stable and secure."}
        </p>
      </div>

      {/* Focus areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {focusAreas.map((f, idx) => (
          <div key={idx} className="p-6 rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-950/20 light:bg-white space-y-3 hover:border-accent-violet/40 light:shadow-sm transition-colors">
            <div className="p-2.5 rounded-lg bg-accent-violet/10 text-accent-violet w-fit ring-1 ring-accent-violet/10">{f.icon}</div>
            <h3 className="font-bold text-sm dark:text-white light:text-slate-900 leading-tight font-display">{f.title}</h3>
            <p className="text-xs dark:text-zinc-500 light:text-slate-600 leading-normal font-body">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* R&D disclaimer block */}
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex gap-3 text-left">
        <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold dark:text-white light:text-slate-900 font-display">
            {isSwahili ? "Taarifa ya Innovation Lab" : "Innovation Lab Notice"}
          </h4>
          <p className="text-[10px] sm:text-xs dark:text-zinc-500 light:text-slate-600 leading-normal font-body">
            {isSwahili
              ? "Hapa ninajaribu prototypes katika mazingira yaliyotengwa kabla ya kuzitumia kwa wateja au kwenye bidhaa za Terrasafi. Vipengele vinaweza kubadilika kadiri usalama, utendaji na matumizi vinavyothibitishwa."
              : "Prototypes are evaluated in isolated environments before they are introduced into client work or Terrasafi products. Features may evolve as security, performance and usability are validated."}
          </p>
        </div>
      </div>

      {/* Current experiments */}
      <div className="space-y-6 text-left">
        <h3 className="text-lg font-bold dark:text-white light:text-slate-900 font-display">
          {isSwahili ? "Majaribio ya Sasa ya Mifumo (MVPs)" : "Active Experiments & Prototypes"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiments.map((exp, idx) => (
            <MotionCard 
              key={idx} 
              delay={idx * 0.08}
              className="p-6 flex flex-col justify-between border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-white shadow-md hover:border-accent-violet/50 transition-colors"
            >
              <div className="space-y-3">
                <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-display">
                  {exp.status}
                </span>
                <h3 className="font-bold text-sm dark:text-white light:text-slate-900 pt-1 font-display">{exp.title}</h3>
                <p className="text-xs dark:text-zinc-500 light:text-slate-600 leading-relaxed font-body">{exp.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-accent-violet uppercase tracking-wider pt-6 cursor-pointer">
                <span>{isSwahili ? "Kagua Msimbo" : "Review Code Architecture"}</span>
                <ArrowRight size={12} />
              </div>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
};
export default InnovationLabSection;
