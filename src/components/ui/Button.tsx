import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-sm shadow-teal-500/30',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  outline:
    'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-500/30',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
