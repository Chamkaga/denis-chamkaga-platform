# Denis Business Platform — Component Library Reference

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Lead Frontend Architect
Reviewed By: Denis Chamkaga Frontend Engineering Team
Approval Status: APPROVED (Official Project Standard)
Related Documents: [DESIGN_SYSTEM.md](file:///d:/Projects/denis-chamkaga-platform/docs/DESIGN_SYSTEM.md), [CHAT_WIDGET_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/CHAT_WIDGET_ARCHITECTURE.md), [README.md](file:///d:/Projects/denis-chamkaga-platform/docs/README.md)
```

---

## 1. Overview & Architecture

The **Component Library** documents all atomic, molecular, and organism-level UI components used across the public portfolio and Admin Console. All components adhere strictly to the tokens established in [DESIGN_SYSTEM.md](file:///d:/Projects/denis-chamkaga-platform/docs/DESIGN_SYSTEM.md).

---

## 2. Core Components Catalog

### 2.1 Button Component

- **Purpose:** Primary trigger for user actions, form submissions, and modal toggles.
- **Props:** `variant` ('primary' | 'secondary' | 'ghost' | 'danger'), `size` ('sm' | 'md' | 'lg'), `icon`, `disabled`, `onClick`.
- **Variants:**
  - **Primary:** `bg-accent-violet hover:bg-accent-violet-hover text-white rounded-xl shadow-lg`
  - **Secondary:** `border border-accent-violet/30 bg-zinc-900 text-zinc-100 hover:bg-zinc-800`
  - **Ghost:** `hover:bg-zinc-800 text-zinc-400 hover:text-white`
  - **Danger:** `bg-rose-600 hover:bg-rose-700 text-white`
- **Responsive Rules:** Full width on mobile (`w-full`), inline width on desktop (`w-auto`).
- **Accessibility:** Includes focus ring `focus-visible:ring-2 focus-visible:ring-accent-violet`.
- **Do:** Use primary variant for main call to action only once per view.
- **Don't:** Stack multiple primary buttons side by side.

```
Wireframe:
┌─────────────────────────┐
│  [Icon] Action Text ──► │  ◄─ Primary Button (accent-violet)
└─────────────────────────┘
```

---

### 2.2 Card Component

- **Purpose:** Container for grouping related content, features, analytics, or services.
- **Variants:** Glassmorphic card, solid dark panel, border-highlighted active card.
- **Responsive Rules:** Spans 1 column on mobile, 2 columns on tablet, 3-4 columns on desktop grid.
- **Do:** Keep internal padding consistent (`p-5` or `p-6`).

```
Wireframe:
┌─────────────────────────────────────────┐
│ [Icon] Card Title                       │
│ Secondary metadata or badge description │
│ ─────────────────────────────────────── │
│ Card body content or actionable grid... │
└─────────────────────────────────────────┘
```

---

### 2.3 Badge Component

- **Purpose:** Status visualizer for leads, session indicators, active calls, and steps.
- **Variants:**
  - **Success / Online:** `bg-green-500/10 text-green-400 border border-green-500/20`
  - **Warning / Pending:** `bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`
  - **Accent / Step:** `bg-accent-violet/10 text-accent-violet border border-accent-violet/20`
- **Accessibility:** Includes aria label for screen readers.

---

### 2.4 Modal & Dialog Components

- **Purpose:** Overlay dialogs for confirm actions, detailed views, and onboarding steps.
- **Layout:** Backdrop overlay (`bg-black/80 backdrop-blur-md`), centered container (`max-w-lg rounded-2xl glass-panel shadow-2xl`).
- **Interaction:** Closing on backdrop click or `Escape` key press.

---

### 2.5 Table Component (Admin Console)

- **Purpose:** Displays structured tabular data (Leads, Quotations, Invoices, Audit Logs).
- **Features:** Header columns, sorting indicators, hoverable rows (`hover:bg-zinc-800/50`), action menu dropdowns.
- **Responsive Rules:** Horizontal scroll wrapper (`overflow-x-auto`) on mobile viewports.

---

### 2.6 Form & Input Components

- **Purpose:** Captures visitor and administrator input (Text, Email, Phone, Select, Textarea).
- **Validation:** Displays real-time error banner (`bg-red-500/10 text-red-400 border border-red-500/30`).
- **Real-Time Masking:** Automatically strips prohibited characters (e.g., numbers in names, letters in phone numbers).

---

### 2.7 Hero Component

- **Purpose:** Top-of-page introduction on public landing pages.
- **Structure:** Headline badge, H1 Display headline, lead paragraph, dual CTA buttons, background ambient glow.

---

### 2.8 KPI Card Component

- **Purpose:** Displays metrics in Admin Dashboard (Total Leads, Revenue, Active Sessions, Conversion Rate).
- **Layout:** Icon container top-left, numerical value (`text-2xl font-extrabold`), trend indicator (% increase/decrease).

---

### 2.9 Charts Component

- **Purpose:** Visualizes analytics trends over time using Recharts / SVG wrappers.
- **Variants:** Area chart (Visitor trends), Bar chart (Lead conversion), Pie chart (Service popularity).

---

### 2.10 Timeline Component

- **Purpose:** Displays sequential project milestones, career experience, and business activity logs.
- **Layout:** Vertical connector line (`w-0.5 bg-accent-violet/30`), milestone node dots (`w-3 h-3 rounded-full bg-accent-violet`).

---

### 2.11 Navigation Component

- **Purpose:** Top header navbar for public pages and collapsible sidebar for Admin Console.
- **States:** Fixed header with glassmorphism blur on scroll.

---

### 2.12 Footer Component

- **Purpose:** Platform bottom footer with quick navigation links, copyright, social channels, and brand motto.
