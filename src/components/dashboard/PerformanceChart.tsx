import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PerformanceData {
  day: string;
  leads: number;
  sales: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.leads, item.sales)),
    1
  );

  const chartHeight = 140;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Desempenho
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Leads e vendas nos últimos 7 dias
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <TrendingUp size={16} className="text-teal-500" />
          <span>Últimos 7 dias</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 sm:gap-4">
        {data.map((item, index) => {
          const leadHeight =
            item.leads > 0
              ? Math.max((item.leads / maxValue) * chartHeight, 8)
              : 0;

          const salesHeight =
            item.sales > 0
              ? Math.max((item.sales / maxValue) * chartHeight, 8)
              : 0;

          return (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="w-full flex items-end justify-center gap-1"
                style={{ height: `${chartHeight}px` }}
              >
                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-teal-100 to-teal-200 transition-all"
                  style={{ height: `${leadHeight}px` }}
                  title={`${item.leads} leads`}
                />

                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-300 to-emerald-400 transition-all"
                  style={{ height: `${salesHeight}px` }}
                  title={`${item.sales} vendas`}
                />
              </div>

              <span className="text-xs font-medium text-slate-400">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-5 mt-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-200" />
          <span className="text-xs text-slate-500">Leads</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-500">Vendas</span>
        </div>
      </div>
    </Card>
  );
}