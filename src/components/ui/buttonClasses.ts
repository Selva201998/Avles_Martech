import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary: 'border border-line bg-surface text-ink-secondary shadow-card hover:border-line-strong hover:text-ink',
  ghost: 'text-ink-secondary hover:bg-slate-100 hover:text-ink',
  danger: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 [&>svg]:h-3.5 [&>svg]:w-3.5',
  md: 'h-9 px-3.5 text-sm gap-2 [&>svg]:h-4 [&>svg]:w-4',
};

/** Shared button styling, also used for <a> elements that look like buttons. */
export const buttonClasses = (variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string) =>
  cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
