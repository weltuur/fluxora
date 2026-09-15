import { useEffect, useMemo, useState } from 'react';
import { BarChart3, FileText, Loader2, MessageCircle, ShoppingCart, TrendingUp, Users, Wallet, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const periods = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
] as const;

type PeriodDays = (typeof periods)[number]['value'];

type SaleRow = { amount: number | string; sold_at: string };
type DatedRow = { created_at: string };

type AnalyticsData = {
  leads: DatedRow[];
  sales: SaleRow[];
  content: DatedRow[];
  hooks: DatedRow[];
  x1: DatedRow[];
};

function toDateKey(value: string): string {
  const date = new Date(value);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatChartDate(value: string): string {
  return new Intl.DateTimeFormat('pt-MZ', { day: '2-digit', month: '2-digit' }).format(new Date(`${value}T00:00:00`));
}

export function Analytics() {
 const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodDays>(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      setLoading(true);
      setError('');

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - (period - 1));
      const startIso = startDate.toISOString();

     const [leadsResult, salesResult, contentResult, hooksResult, x1Result] = await Promise.all([
  supabase
    .from('leads')
    .select('id, created_at')
    .eq('user_id', user?.id)
    .gte('created_at', startIso),

  supabase
    .from('sales')
    .select('amount, sold_at, created_at')
    .eq('user_id', user?.id)
    .gte('sold_at', startIso),

  supabase
    .from('generated_content')
    .select('created_at')
    .eq('user_id', user?.id)
    .gte('created_at', startIso),

  supabase
    .from('generated_hooks')
    .select('created_at')
    .eq('user_id', user?.id)
    .gte('created_at', startIso),

  supabase
    .from('x1_conversations')
    .select('created_at')
    .eq('user_id', user?.id)
    .gte('created_at', startIso),
]); 

      if (contentResult.error) console.error('[Analytics] content error', {
        code: contentResult.error.code,
        message: contentResult.error.message,
        details: contentResult.error.details,
        hint: contentResult.error.hint,
      });
      if (hooksResult.error) console.error('[Analytics] hooks error', {
        code: hooksResult.error.code,
        message: hooksResult.error.message,
        details: hooksResult.error.details,
        hint: hooksResult.error.hint,
      });
      if (x1Result.error) console.error('[Analytics] x1_conversations error', {
        code: x1Result.error.code,
        message: x1Result.error.message,
        details: x1Result.error.details,
        hint: x1Result.error.hint,
      });

      const queryError = contentResult.error || hooksResult.error || x1Result.error;
      if (queryError) {
        if (mounted) {
          setError('Não foi possível carregar os dados de Analytics. Tente novamente.');
          setData(null);
          setLoading(false);
        }
        return;
      }

 
   if (mounted) {
        setData({
          leads: (leadsResult.data as DatedRow[]) ?? [],
          sales: (salesResult.data as SaleRow[]) ?? [],
          content: (contentResult.data as DatedRow[]) ?? [],
          hooks: (hooksResult.data as DatedRow[]) ?? [],
          x1: (x1Result.data as DatedRow[]) ?? [],
        });
        setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [period]);

   
  const metrics = useMemo(() => {
    const leads = data?.leads.length ?? 0;
    const sales = data?.sales.length ?? 0;
    const revenue = data?.sales.reduce((sum, sale) => sum + Number(sale.amount), 0) ?? 0;
    return {
      leads,
      sales,
      revenue,
      conversionRate: leads > 0 ? Math.min((sales / leads) * 100, 100) : 0,
      content: data?.content.length ?? 0,
      hooks: data?.hooks.length ?? 0,
      x1: data?.x1.length ?? 0,
    };
  }, [data]);

  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: period }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (period - 1 - index));
    return [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');
    });

    const salesByDate = new Map<string, { count: number; revenue: number }>();
   data?.sales.forEach((sale) => {
  const saleDate = sale.sold_at || sale.created_at;
  if (!saleDate) return;

  const key = toDateKey(saleDate);
  const current = salesByDate.get(key) ?? { count: 0, revenue: 0 };

  salesByDate.set(key, {
    count: current.count + 1,
    revenue: current.revenue + Number(sale.amount),
  });
}); 

    return days.map((date) => ({ date, ...(salesByDate.get(date) ?? { count: 0, revenue: 0 }) }));
  }, [data, period]);

  const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1);
  const maxSales = Math.max(...chartData.map((item) => item.count), 1);
  const hasData = metrics.leads + metrics.sales + metrics.content + metrics.hooks + metrics.x1 > 0;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Veja o desempenho do seu negócio no período selecionado.</p>
          </div>
        </div>
        <select
          value={period}
          onChange={(event) => setPeriod(Number(event.target.value) as PeriodDays)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
          aria-label="Período do Analytics"
        >
          {periods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center"><Loader2 size={32} className="animate-spin text-teal-500" /></div>
      )}

      {!loading && error && (
        <Card className="p-6 border-red-200 bg-red-50 text-center">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            <StatCard label="Leads" value={metrics.leads} icon={<Users size={20} />} accent="teal" empty={metrics.leads === 0} />
            <StatCard label="Vendas" value={metrics.sales} icon={<ShoppingCart size={20} />} accent="blue" empty={metrics.sales === 0} />
            <StatCard label="Receita total" value={formatCurrency(metrics.revenue)} icon={<Wallet size={20} />} accent="green" empty={metrics.revenue === 0} />
            <StatCard label="Taxa de conversão" value={`${metrics.conversionRate.toFixed(1)}%`} icon={<TrendingUp size={20} />} accent="amber" empty={metrics.conversionRate === 0} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
            <StatCard label="Conteúdos gerados" value={metrics.content} icon={<FileText size={20} />} accent="teal" empty={metrics.content === 0} />
            <StatCard label="Hooks gerados" value={metrics.hooks} icon={<Zap size={20} />} accent="blue" empty={metrics.hooks === 0} />
            <StatCard label="Análises X1" value={metrics.x1} icon={<MessageCircle size={20} />} accent="green" empty={metrics.x1 === 0} />
          </div>

          {!hasData ? (
            <Card className="p-12 text-center">
              <BarChart3 size={36} className="mx-auto mb-3 text-slate-300" />
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Sem dados neste período</h2>
              <p className="text-sm text-slate-500">Crie leads, registre vendas ou use as ferramentas do Fluxora para acompanhar seu desempenho.</p>
            </Card>
          ) : (
<Card className="p-5 sm:p-6">
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h2 className="text-base font-semibold text-slate-900">
        Vendas e receita
      </h2>
      <p className="text-sm text-slate-500 mt-0.5">
        Evolução diária no período selecionado
      </p>
    </div>

    <div className="text-right">
      <p className="text-xs text-slate-400">Receita</p>
      <p className="text-sm font-semibold text-teal-600">
        {formatCurrency(metrics.revenue)}
      </p>
    </div>
  </div>

  <div className="relative h-56 overflow-x-auto">
    <div className="flex h-48 min-w-max items-end gap-4 px-2">
      {chartData.map((item) => {
        const revenueHeight =
          item.revenue > 0
            ? Math.max((item.revenue / maxRevenue) * 170, 10)
            : 4;

        const salesHeight =
          item.count > 0
            ? Math.max((item.count / maxSales) * 170, 10)
            : 4;

        return (
          <div
            key={item.date}
            className="flex h-full w-12 flex-col items-center justify-end"
          >
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-5 rounded-t-md bg-teal-400 transition-all hover:bg-teal-500"
                style={{ height: `${revenueHeight}px` }}
                title={`${formatChartDate(item.date)}: ${formatCurrency(
                  item.revenue
                )}`}
              />

              <div
                className="w-5 rounded-t-md bg-blue-400 transition-all hover:bg-blue-500"
                style={{ height: `${salesHeight}px` }}
                title={`${formatChartDate(item.date)}: ${item.count} ${
                  item.count === 1 ? 'venda' : 'vendas'
                }`}
              />
            </div>

            <span className="mt-2 whitespace-nowrap text-[10px] text-slate-400">
              {formatChartDate(item.date)}
            </span>
          </div>
        );
      })}
    </div>
  </div>

  <div className="mt-4 flex items-center justify-center gap-5">
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
      <span className="text-xs text-slate-500">Receita</span>
    </div>

    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
      <span className="text-xs text-slate-500">Vendas</span>
    </div>
  </div>
</Card>       
          )}
        </>
      )}
    </DashboardLayout>
  );
}
