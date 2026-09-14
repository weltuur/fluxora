import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function PerformanceChart() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Desempenho</h3>
          <p className="text-sm text-slate-500 mt-0.5">Leads e vendas nos últimos 7 dias</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <TrendingUp size={16} className="text-teal-500" />
          <span>Em breve</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 sm:gap-4 h-40">
        {days.map((day, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-teal-100 to-teal-200"
                style={{ height: `${10 + ((i * 13) % 60)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-400">{day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
