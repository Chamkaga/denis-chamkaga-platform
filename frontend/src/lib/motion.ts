/**
 * motion.ts — Shared animation variants for the Denis Chamkaga Platform
 *
 * Design language: Linear · Stripe · Vercel · Notion
 * Philosophy: Purposeful, premium, subtle. Never flashy.
 */
import type { Variants } from 'framer-motion';

// ─── Easing presets ───────────────────────────────────────────────────────────

export const ease = {
  smooth:  [0.25, 0.46, 0.45, 0.94] as const,
  spring:  { type: 'spring', stiffness: 300, damping: 30 },
  snappy:  [0.16, 1, 0.3, 1] as const,
};

// ─── Page transition ─────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.28, ease: ease.smooth } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: ease.smooth } },
};

// ─── Fade up (general sections, hero children) ───────────────────────────────

export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay, ease: ease.smooth },
  }),
};

// ─── Fade in (images, overlays) ──────────────────────────────────────────────

export const fadeInVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.28, delay, ease: ease.smooth },
  }),
};

// ─── Scale-fade (images on load) ─────────────────────────────────────────────

export const imageVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: ease.smooth },
  },
};

// ─── Stagger container ───────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const heroStaggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// ─── Slide from left / right (Timeline alternating) ──────────────────────────

export const slideLeftVariants: Variants = {
  hidden:  { opacity: 0, x: -48 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, delay, ease: ease.smooth },
  }),
};

export const slideRightVariants: Variants = {
  hidden:  { opacity: 0, x: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, delay, ease: ease.smooth },
  }),
};

// ─── Card hover (reusable hover state) ───────────────────────────────────────

export const cardHoverVariants = {
  rest:  { y: 0,  boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
  hover: { y: -6, boxShadow: '0 20px 40px rgba(139,92,246,0.12)', transition: { duration: 0.25, ease: ease.smooth } },
};

// ─── Scale-in (badges, circles, icons) ───────────────────────────────────────

export const scaleInVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.7 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, delay, ease: ease.snappy },
  }),
};

// ─── Vertical line growth (Timeline) ─────────────────────────────────────────

export const lineGrowVariants: Variants = {
  hidden:  { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.35, ease: ease.smooth },
  },
};

// ─── Skill bar (width 0 → value) ─────────────────────────────────────────────

export const skillBarVariants = (pct: number): Variants => ({
  hidden:  { width: '0%' },
  visible: {
    width: `${pct}%`,
    transition: { duration: 0.35, ease: ease.smooth, delay: 0.1 },
  },
});

// ─── FAQ accordion panel ─────────────────────────────────────────────────────

export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded:  { height: 'auto', opacity: 1, transition: { duration: 0.28, ease: ease.smooth } },
};

// ─── Step/pipeline sequential ────────────────────────────────────────────────

export const stepVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: ease.smooth },
  }),
};

// ─── Notification ping ───────────────────────────────────────────────────────

export const pingVariants: Variants = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [1, 0, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};
