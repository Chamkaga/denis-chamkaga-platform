import React from 'react';
import { cn } from '../../../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          // Variants
          {
            // Dark Mode Variants
            "dark:bg-accent-violet dark:text-white dark:hover:bg-accent-violet-hover dark:focus:ring-accent-violet": variant === 'primary',
            "dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-zinc-600": variant === 'secondary',
            "dark:bg-transparent dark:text-zinc-200 dark:border dark:border-zinc-700 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700": variant === 'outline',
            "dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:focus:ring-zinc-800": variant === 'ghost',
            "dark:bg-red-600 dark:text-white dark:hover:bg-red-700 dark:focus:ring-red-500": variant === 'danger',
            
            // Light Mode Variants
            "light:bg-light-accent light:text-white light:hover:bg-opacity-90 light:focus:ring-light-accent": variant === 'primary',
            "light:bg-slate-200 light:text-slate-800 light:hover:bg-slate-300 light:focus:ring-slate-400": variant === 'secondary',
            "light:bg-transparent light:text-slate-700 light:border light:border-slate-300 light:hover:bg-slate-100 light:focus:ring-slate-300": variant === 'outline',
            "light:bg-transparent light:text-slate-600 light:hover:bg-slate-100 light:focus:ring-slate-100": variant === 'ghost',
            "light:bg-red-600 light:text-white light:hover:bg-red-700 light:focus:ring-red-500": variant === 'danger',
          },
          // Sizes
          {
            "px-2.5 py-1 text-xs": size === 'xs',
            "px-3 py-1.5 text-sm": size === 'sm',
            "px-4 py-2.5 text-base": size === 'md',
            "px-6 py-3.5 text-lg": size === 'lg',
          },
          // Layout
          fullWidth ? "w-full" : "",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
