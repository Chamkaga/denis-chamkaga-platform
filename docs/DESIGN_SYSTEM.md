# Denis Business Platform — Design System Specification (The UI Bible)

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Lead UI/UX Systems Architect
Reviewed By: Denis Chamkaga Frontend Engineering Team
Approval Status: APPROVED (Official Project Standard)
Related Documents: [COMPONENT_LIBRARY.md](file:///d:/Projects/denis-chamkaga-platform/docs/COMPONENT_LIBRARY.md), [CHAT_WIDGET_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/CHAT_WIDGET_ARCHITECTURE.md), [README.md](file:///d:/Projects/denis-chamkaga-platform/docs/README.md)
```

---

## 1. Purpose & Scope

The **Denis Business Platform Design System** serves as the authoritative visual blueprint ("UI Bible") for all frontend applications, public portfolio pages, floating widgets, and admin consoles. It guarantees a state-of-the-art, premium enterprise aesthetic characterized by vibrant color harmony, custom glassmorphic panels, micro-animations, and strict dark/light mode parity.

---

## 2. Brand Identity

The brand identity conveys innovation, technological mastery, enterprise reliability, and AI leadership. 
- **Core Visual Vibe:** Dark-mode primary, glassmorphic translucency, rich violet accents, high-contrast typography.
- **Logo Icon:** Clean geometric platform mark rendered in `#8B5CF6` with glow highlights ([Logo.tsx](file:///d:/Projects/denis-chamkaga-platform/frontend/src/components/atoms/Logo/Logo.tsx)).

---

## 3. Color System

### 3.1 Primary & Accent Tokens

| Token Name | Hex Code | HSL Value | Usage Description |
| :--- | :--- | :--- | :--- |
| `accent-violet` | `#8B5CF6` | `hsl(258, 90%, 66%)` | Primary brand accent, primary CTA buttons, active state highlights |
| `accent-violet-hover` | `#7C3AED` | `hsl(258, 84%, 58%)` | Hover state for primary buttons & interactive elements |
| `accent-violet-light` | `#A78BFA` | `hsl(258, 90%, 76%)` | Secondary focus rings, light mode subtle highlights |
| `accent-violet-glow` | `rgba(139,92,246,0.25)` | - | Ambient card backdrops & glowing borders |

### 3.2 Neutral Palette (Dark & Light Modes)

| Token Name | Dark Mode Hex | Light Mode Hex | Purpose |
| :--- | :--- | :--- | :--- |
| `bg-main` | `#0c0c0e` | `#F8FAFC` | Platform application background |
| `bg-panel` | `#121215` / `#18181b` | `#FFFFFF` | Card & modal panel surface |
| `border-subtle` | `rgba(255,255,255,0.08)` | `#E2E8F0` | Subtle divider lines & borders |
| `border-accent` | `rgba(139,92,246,0.4)` | `rgba(139,92,246,0.3)` | Branded container borders |
| `text-primary` | `#FFFFFF` | `#0F172A` | Primary body text & headings |
| `text-muted` | `#A1A1AA` | `#64748B` | Labels, placeholders, secondary text |

---

## 4. Typography

### 4.1 Typeface Families
- **Display Font (`font-display`):** `Outfit`, `sans-serif` — Used for titles, brand headers, hero sections, and card headings.
- **Body Font (`font-body`):** `Inter`, `sans-serif` — Used for body text, chat bubbles, form inputs, and system logs.

### 4.2 Type Scale

| Utility Class | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | `0.75rem` (12px) | `1rem` (16px) | Regular / Bold | Micro-labels, metadata, timestamps |
| `text-sm` | `0.875rem` (14px) | `1.25rem` (20px) | Medium / Bold | Body text, chat bubbles, buttons |
| `text-base` | `1rem` (16px) | `1.5rem` (24px) | Medium / SemiBold | Subtitles, card headings |
| `text-lg` | `1.125rem` (18px) | `1.75rem` (28px) | Extrabold | Section titles, modal headers |
| `text-2xl` | `1.5rem` (24px) | `2rem` (32px) | Extrabold | Hero subheadings, KPI numbers |
| `text-4xl` | `2.25rem` (36px) | `2.5rem` (40px) | Black | Primary landing page headlines |

---

## 5. Spacing Scale & Radius

### 5.1 4px Spacing Grid
The design system enforces a strict 4px / 8px spacing multiplier:
- `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px), `p-12` (48px).

### 5.2 Border Radius Tokens
- `rounded-lg` (8px): Inputs, small buttons, notification pills.
- `rounded-xl` (12px): Standard CTA buttons, card sub-containers, dropdown menus.
- `rounded-2xl` (16px): Main cards, floating chat widget window, modal dialogs.
- `rounded-full` (9999px): Avatars, floating trigger buttons, status indicators.

---

## 6. Glassmorphism & Elevation

### 6.1 Glassmorphism Utilities
```css
/* Custom Glass Panel Class */
.glass-panel {
  background: rgba(12, 12, 14, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.4);
}
```

### 6.2 Elevation & Shadow Levels
- **Level 1 (`shadow-sm`):** Micro-cards & button resting states.
- **Level 2 (`shadow-lg`):** Hovered buttons & active dropdowns.
- **Level 3 (`shadow-xl`):** Onboarding step cards & floating popups.
- **Level 4 (`shadow-2xl`):** Floating Chat Widget & modal overlays.

---

## 7. Icons & Motion Systems

### 7.1 Lucide Icon Rules
- Standard icon set: `lucide-react`.
- Default sizing: `14px` (micro), `16px` (button inline), `20px` (header/navigation), `24px` (floating trigger).
- Stroke width: `2px` standard.

### 7.2 Framer Motion Timing & Easing
- **Widget Scale/Slide:** Duration `250ms`, Easing `[0.16, 1, 0.3, 1]`.
- **AnimatePresence Fade:** Duration `150ms`, opacity `0` to `1`.
- **Button Hover Scale:** Scale `1.02`, transition duration `150ms`.

---

## 8. Responsive Breakpoints

| Breakpoint Name | Min Width | Max Width | Target Layout Behavior |
| :--- | :--- | :--- | :--- |
| **Mobile (`sm`)** | `0px` | `639px` | Full viewport overlay widgets, single-column grids |
| **Tablet (`md`)** | `640px` | `767px` | Fixed floating widget (`420px`), 2-column cards |
| **Laptop (`lg`)** | `768px` | `1023px` | Standard dashboard sidebar, multi-column forms |
| **Desktop (`xl`)** | `1024px` | `1279px` | Full multi-panel layout, expanded navigation |
| **Ultra-Wide (`2xl`)**| `1280px`+ | - | Centered max-width containers (`max-w-7xl`) |

---

## 9. Accessibility Rules (WCAG AA)

1. **Color Contrast:** All body text must maintain a minimum contrast ratio of `4.5:1` against container backgrounds.
2. **Keyboard Focus:** Every interactive button and input must exhibit an explicit focus ring (`focus-visible:ring-2 focus-visible:ring-accent-violet`).
3. **ARIA Labels:** Icon-only buttons must provide explicit `aria-label` tags (e.g., `aria-label="Close Chat Window"`).

---

## 10. Do / Don't Rules

### ✅ DO:
- Use `accent-violet` (`#8B5CF6`) for primary action buttons and active indicators.
- Use `glass-panel` with `backdrop-blur-xl` for modern floating popups and modals.
- Ensure all interactive buttons include hover scale or color transition effects.

### ❌ DON'T:
- Use generic unstyled browser red/blue/green colors.
- Mix arbitrary font families outside `Outfit` and `Inter`.
- Remove focus outlines from interactive inputs.
- Create hard-coded non-responsive pixel offsets.
