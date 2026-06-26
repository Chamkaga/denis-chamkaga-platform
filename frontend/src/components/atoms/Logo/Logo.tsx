import React from 'react';
import { cn } from '../../../lib/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'monochrome';
  hideText?: boolean;
}

/**
 * LogoIcon — Clean geometric SVG logo.
 * Combines a hexagon (trust/SaaS), interlocking curves forming D & C (Denis Chamkaga),
 * and an upward-pointing arrow on the top-right edge (growth/innovation).
 */
export const LogoIcon: React.FC<{ className?: string; sizeClass?: string }> = ({ className, sizeClass = 'h-8 w-8' }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={cn(sizeClass, className)}
  >
    {/* Hexagon Outline (SaaS and Trust) */}
    <path 
      d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />
    {/* Monogram "D" curve (left-hand curve linking with center stem) */}
    <path 
      d="M16 9.5 V22.5 M16 9.5 H12 C9.5 9.5 9.5 16 12 16 H16" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    {/* Monogram "C" curve (right-hand curve mapping back to stem) */}
    <path 
      d="M16 16 H20 C22.5 16 22.5 22.5 20 22.5 H16" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    {/* Growth Trend Arrow (Technology, Innovation, Upward Progress) */}
    <path 
      d="M23 10.5 L27.5 6 M27.5 6 H23.5 M27.5 6 V10" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  variant = 'default',
  hideText = false 
}) => {
  const iconDimensions = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textDimensions = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className={cn("flex items-center gap-2.5 select-none group", className)}>
      {/* Premium Geometric Icon */}
      <div className={cn(
        "transition-transform duration-300 group-hover:scale-105",
        {
          "text-accent-violet dark:text-accent-violet light:text-light-accent": variant === 'default',
          "text-currentColor": variant === 'monochrome'
        }
      )}>
        <LogoIcon sizeClass={iconDimensions[size]} />
      </div>

      {/* Brand Text */}
      {!hideText && (
        <span className={cn(
          "font-display font-extrabold tracking-tight transition-colors duration-300",
          textDimensions[size],
          {
            "dark:text-white light:text-slate-800": variant === 'default',
            "text-currentColor": variant === 'monochrome'
          }
        )}>
          Denis Chamkaga
        </span>
      )}
    </div>
  );
};

export default Logo;
