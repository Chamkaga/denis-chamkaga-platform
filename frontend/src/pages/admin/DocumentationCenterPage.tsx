import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronRight
} from 'lucide-react';

export const DocumentationCenterPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('SOPs');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    {
      id: 'doc-1',
      category: 'SOPs',
      title: 'Standard Operating Procedure: Owner Disaster Recovery & System Restore',
      description: 'Step-by-step procedure for executing point-in-time PostgreSQL snapshot restores and cold backups.',
      content: `## Owner Disaster Recovery SOP

### 1. Pre-requisites
- Access credentials for **Owner (Denis Chamkaga)** account.
- PostgreSQL database backup snapshot file located in \`cold-storage/backups/\`.

### 2. Execution Command
Run the disaster recovery verification script:
\`\`\`bash
npx tsx backend/src/scripts/disaster-recovery.ts --restore --file snapshot_2026-07-30.sql.gz
\`\`\`

### 3. Verification
Verify API health via NOC dashboard at \`/admin/operations\`.`
    },
    {
      id: 'doc-2',
      category: 'Architecture',
      title: 'Enterprise BOS Platform 4-Layer System Architecture',
      description: 'System architectural blueprint covering Business Layer, Content Layer, AI Layer, and Platform Operations Layer.',
      content: `## Platform Architecture Blueprint

### 1. Business Layer
Handles CRM, Sales, Marketing, Finance, Projects, Customers, Consultations, Quotations, and Invoices.

### 2. Content Layer
Manages Website CMS, Portfolio, Blog, Testimonials, Knowledge Base, and Media Assets.

### 3. AI Layer
Orchestrates Mary AI Assistant, RAG retrieval, the OpenAI provider, and prompt versioning.

### 4. Platform Technical OS Layer
Provides NOC monitoring, SIEM SOC security logs, infrastructure telemetry, backups, and feature flags.`
    },
    {
      id: 'doc-3',
      category: 'API Docs',
      title: 'REST & SSE WebRTC Signaling API Specification',
      description: 'Comprehensive API endpoints reference for Admin endpoints, AI Chat streaming, and WebRTC voice calls.',
      content: `## Admin API Specification

### Authentication
All requests require JWT Bearer header:
\`Authorization: Bearer <token>\`

### Endpoints
- \`GET /api/admin/dashboard\` - Executive stats
- \`GET /api/admin/operations/audit-logs\` - SIEM security event logs
- \`POST /api/admin/ai-copilot/chat\` - SSE streaming AI Copilot`
    },
    {
      id: 'doc-4',
      category: 'Admin Manual',
      title: 'Administrator Operating Manual & Governance Boundaries',
      description: 'Responsibilities, monitoring tasks, and strict governance restrictions for the Technical Administrator role.',
      content: `## Administrator Operating Manual

### Core Responsibilities
- Monitor NOC infrastructure telemetry.
- Execute automated backup snapshots.
- Troubleshoot API latency issues.

### Governance Restrictions
- CANNOT delete or modify the Owner account.
- CANNOT transfer platform ownership.
- CANNOT purge audit logs or alter root security policies.`
    }
  ];

  const filtered = articles.filter(a =>
    (activeCategory === 'All' || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [activeDoc, setActiveDoc] = useState(articles[0]);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-body text-left max-w-7xl mx-auto dark:text-zinc-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
            <BookOpen size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold dark:text-white text-zinc-900 tracking-tight font-heading">
              Internal Documentation Center
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Searchable SOPs, system architecture, API specifications, and operational manuals
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs & SOPs..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {['All', 'SOPs', 'Architecture', 'API Docs', 'Admin Manual'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-accent-violet text-white font-bold'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map(doc => (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                  activeDoc?.id === doc.id
                    ? 'bg-accent-violet/10 border-accent-violet text-accent-violet font-semibold'
                    : 'bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 hover:border-accent-violet/40 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                    {doc.category}
                  </span>
                  <ChevronRight size={14} className={activeDoc?.id === doc.id ? 'opacity-100' : 'opacity-30'} />
                </div>
                <h4 className="font-bold text-xs leading-snug dark:text-white text-zinc-900">{doc.title}</h4>
                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{doc.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Article Reader Pane */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          {activeDoc ? (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-violet font-mono">{activeDoc.category}</span>
                <h2 className="text-xl font-extrabold dark:text-white text-zinc-900 mt-1 font-heading">{activeDoc.title}</h2>
                <p className="text-xs text-zinc-500 mt-1">{activeDoc.description}</p>
              </div>
              <div className="whitespace-pre-wrap font-sans dark:text-zinc-300 space-y-3">
                {activeDoc.content}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500">Select a document to read.</div>
          )}
        </div>

        {/* Right Enterprise Column: Quick Actions & Contextual Guidance */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Quick Actions Panel */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              SOP Quick Actions
            </h3>
            <div className="space-y-2 text-xs">
              <button 
                onClick={() => alert('Downloading official SOP PDF documentation package...')}
                className="w-full py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-accent-violet bg-zinc-50 dark:bg-zinc-950 font-semibold dark:text-zinc-200 flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <span>Export PDF Manual</span>
                <BookOpen size={14} className="text-accent-violet" />
              </button>
              <button 
                onClick={() => alert('Disaster Recovery Snapshot Verification Command generated.')}
                className="w-full py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 font-semibold dark:text-zinc-200 flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <span>Verify Backup Snapshot</span>
                <BookOpen size={14} className="text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Contextual Security & Governance Panel */}
          <div className="p-4 rounded-2xl bg-accent-violet/5 border border-accent-violet/20 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-violet font-mono flex items-center gap-1.5">
              <span>Governance Rules</span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Standard operating procedures are enforced by automated backend policies. Any unauthorized policy modification triggers an instant SIEM SOC audit alert.
            </p>
            <div className="pt-2 border-t border-accent-violet/10 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
              <span>Compliance: ISO 27001</span>
              <span className="text-emerald-500 font-bold">Audited</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DocumentationCenterPage;
