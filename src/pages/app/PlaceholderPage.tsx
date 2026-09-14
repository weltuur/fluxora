import { type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  badge?: string;
}

export function PlaceholderPage({ title, description, icon, badge }: PlaceholderPageProps) {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            {icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
            {badge && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-50 rounded-full px-2 py-0.5 mt-1">
                <Sparkles size={12} />
                {badge}
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-slate-500">{description}</p>
      </div>

      <Card className="p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-4">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Em breve</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Esta funcionalidade está sendo preparada. Em breve você poderá usar todas as ferramentas
          do Fluxora.
        </p>
      </Card>
    </DashboardLayout>
  );
}
