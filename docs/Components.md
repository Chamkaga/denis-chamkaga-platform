# Components

> Denis Chamkaga Portfolio & AI Business Platform
> Atomic Design Component Architecture

---

## 1. Design Philosophy

This project follows **Atomic Design** methodology:

```
Atoms → Molecules → Organisms → Templates → Pages
```

Combined with **Feature-Based Organization** where complex features own their components internally.

---

## 2. Component Directory Structure

```
frontend/src/
├── components/
│   ├── atoms/              # Smallest reusable elements
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   ├── Icon/
│   │   ├── Logo/
│   │   ├── Spinner/
│   │   ├── Skeleton/
│   │   ├── Tag/
│   │   ├── Tooltip/
│   │   ├── Divider/
│   │   └── Text/
│   │
│   ├── molecules/          # Combinations of atoms
│   │   ├── Card/
│   │   ├── SearchBar/
│   │   ├── NavLink/
│   │   ├── FormField/
│   │   ├── StatCard/
│   │   ├── SocialLinks/
│   │   ├── ThemeToggle/
│   │   ├── LanguageSwitcher/
│   │   ├── RatingStars/
│   │   ├── Breadcrumb/
│   │   ├── Pagination/
│   │   ├── EmptyState/
│   │   └── ErrorMessage/
│   │
│   ├── organisms/          # Complex UI sections
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── Hero/
│   │   ├── ProjectCard/
│   │   ├── ServiceCard/
│   │   ├── TestimonialCard/
│   │   ├── TimelineEntry/
│   │   ├── CertificateCard/
│   │   ├── GalleryGrid/
│   │   ├── BlogPostCard/
│   │   ├── ContactForm/
│   │   ├── ChatWidget/
│   │   ├── ChatMessage/
│   │   ├── LeadTable/
│   │   ├── StatsGrid/
│   │   └── SectionHeader/
│   │
│   └── templates/          # Page layout structures
│       ├── PublicLayout/
│       ├── AdminLayout/
│       ├── AuthLayout/
│       └── SectionLayout/
│
├── features/               # Feature-specific components
│   ├── ai/
│   │   ├── ChatWidget/
│   │   ├── ChatWindow/
│   │   ├── ChatInput/
│   │   ├── ChatBubble/
│   │   └── SuggestedQuestions/
│   │
│   ├── admin/
│   │   ├── Sidebar/
│   │   ├── TopBar/
│   │   ├── DataTable/
│   │   ├── FormBuilder/
│   │   ├── MediaUploader/
│   │   └── DashboardWidgets/
│   │
│   └── portfolio/
│       ├── SkillsGrid/
│       ├── ProjectGallery/
│       └── Timeline/
```

---

## 3. Atoms

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'outline' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| isLoading | boolean | false | Show loading spinner |
| isDisabled | boolean | false | Disabled state |
| leftIcon | ReactNode | — | Icon before text |
| rightIcon | ReactNode | — | Icon after text |
| fullWidth | boolean | false | Full width button |
| as | 'button' \| 'a' \| 'link' | 'button' | Render element |

### Input

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'number' | 'text' | Input type |
| label | string | — | Field label |
| error | string | — | Error message |
| helperText | string | — | Help text |
| leftIcon | ReactNode | — | Leading icon |
| isRequired | boolean | false | Required field |

### Badge

| Prop | Type | Default |
|------|------|---------|
| variant | 'default' \| 'success' \| 'warning' \| 'danger' \| 'info' | 'default' |
| size | 'sm' \| 'md' | 'sm' |

### Avatar

| Prop | Type | Default |
|------|------|---------|
| src | string | — |
| alt | string | — |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' |
| fallback | string | — |

### Icon

Wraps icon library (lucide-react). Provides consistent sizing and color inheritance.

### Logo

DC monogram SVG with configurable size. Used in Navbar and Footer.

### Spinner

Loading indicator with size and color variants.

### Skeleton

Content placeholder for loading states. Supports text, circle, and rect variants.

### Tag

Small label for categories and tech stack display.

### Text

Typography component with semantic variants (h1-h6, p, span, label, caption).

---

## 4. Molecules

### Card

Generic card container with hover effects, optional image header, and glass morphism variant.

### FormField

Combines Label + Input + Error message. Integrates with React Hook Form.

### StatCard

Number + label + trend indicator. Used on dashboard and homepage.

### ThemeToggle

Sun/Moon icon button. Toggles dark/light mode via theme context.

### LanguageSwitcher

EN/SW dropdown selector. Updates i18n language.

### Pagination

Page navigation with previous/next and page numbers.

### SearchBar

Input with search icon and debounced onChange handler.

### Breadcrumb

Navigation trail component for deep pages.

---

## 5. Organisms

### Navbar

```
┌──────────────────────────────────────────────────────────┐
│ [DC Logo]  Home About Services Projects Experience Blog  │
│            AI Assistant Contact  [🌙] [EN▾] [Get In Touch]│
└──────────────────────────────────────────────────────────┘
```

- Sticky on scroll
- Mobile hamburger menu
- Active link highlighting
- Glass morphism background on scroll

### Footer

```
┌──────────────────────────────────────────────────────────┐
│  DC Logo          Quick Links     Services    Connect    │
│  Description      Home            Custom Dev  GitHub     │
│                   About           Business    LinkedIn   │
│                   Projects        Consulting  Twitter    │
│                   Contact         Training    Email      │
│─────────────────────────────────────────────────────────│
│  © 2025 Denis Chamkaga. All rights reserved.            │
└──────────────────────────────────────────────────────────┘
```

### Hero

Full-width hero section with profile photo, animated text, stats bar, and CTA buttons.

### ProjectCard

Card displaying project thumbnail, title, tech stack tags, description excerpt, and status badge.

### ServiceCard

Card with icon, title, description, and "Learn More" CTA.

### TestimonialCard

Client photo, name, company, rating stars, and testimonial text.

### TimelineEntry

Vertical timeline node with date, company logo, role, and description.

### ChatWidget

Floating AI chat bubble (bottom-right corner). Expands to chat window on click.

### ContactForm

Full contact form with validation, submission, and success/error states.

---

## 6. Templates

### PublicLayout

Wraps all public pages with Navbar, Footer, and ChatWidget.

```tsx
<PublicLayout>
  <Navbar />
  <main>{children}</main>
  <Footer />
  <ChatWidget />
</PublicLayout>
```

### AdminLayout

Wraps all admin pages with Sidebar, TopBar, and content area.

```tsx
<AdminLayout>
  <Sidebar />
  <div>
    <TopBar />
    <main>{children}</main>
  </div>
</AdminLayout>
```

### AuthLayout

Minimal centered layout for login page.

### SectionLayout

Reusable page section with max-width container, padding, and optional background.

---

## 7. Component Rules

1. **Every component lives in its own directory** with `ComponentName.tsx` and `index.ts`
2. **No hardcoded text** — all strings come from i18n translation keys
3. **No hardcoded colors** — all colors come from Tailwind theme tokens
4. **Props use TypeScript interfaces** — exported from the component file
5. **Accessibility first** — ARIA labels, keyboard handlers, focus management
6. **Responsive by default** — mobile-first with Tailwind breakpoints
7. **Animation via Framer Motion** — no raw CSS transitions for complex animations
8. **Loading states** — every data-dependent component has a skeleton/loading state
9. **Error states** — every data-dependent component has an error fallback
10. **Test file alongside** — `ComponentName.test.tsx` in same directory
