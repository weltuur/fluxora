import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: 'h-7 w-7', text: 'text-lg', icon: 14 },
  md: { box: 'h-9 w-9', text: 'text-xl', icon: 18 },
  lg: { box: 'h-12 w-12', text: 'text-2xl', icon: 24 },
};

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20',
          s.box
        )}
      >
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 12L8 7L13 12L8 17L3 12Z"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 12L16 7L21 12L16 17L11 12Z"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-slate-900', s.text)}>
          FLUXORA
        </span>
      )}
    </div>
  );
}
