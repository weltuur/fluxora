import { type ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'teal' | 'blue' | 'amber' | 'green';
  empty?: boolean;
}

const accentStyles = {
  teal: 'bg-teal-50 text-teal-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
};

export function StatCard({ label, value, icon, accent = 'teal', empty }: StatCardProps) {
  return (
    <Card hover className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accentStyles[accent])}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', empty ? 'text-slate-300' : 'text-slate-900')}>
        {value}
      </p>
    </Card>
  );
}
