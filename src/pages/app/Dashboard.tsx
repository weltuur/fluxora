import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, Wallet, Percent, PenLine, Anchor, MessageCircle, UserPlus, Target, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types/database';

export function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ leadsCount: 0, salesCount: 0, revenue: 0, conversionRate: 0 });
  const [chartData, setchartData] = useState<
  { day: string; leads: number; sales: number }[]
>([]);
  const [loading, setLoading] = useState(true);
  const [weeklySalesGoal, setWeeklySalesGoal] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      const { data: profileData } = await supabase
  .from('profiles')
  .select('weekly_sales_goal')
  .eq('id', profile?.id)
  .maybeSingle();

setWeeklySalesGoal(profileData?.weekly_sales_goal ?? null);
  const { data: leads } = await supabase.from('leads').select('id, created_at');
  const { data: sales } = await supabase.from('sales').select('amount, sold_at, created_at');

    const leadsCount = leads?.length ?? 0;
    const salesCount = sales?.length ?? 0;

const chartDataRows = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayLeads = leads?.filter((lead) => {
    const createdAt = new Date(lead.created_at);
    return createdAt >= dayStart && createdAt <= dayEnd;
  }).length ?? 0;

  const daySales = sales?.filter((sale) => {
    const saleDate = sale.sold_at || sale.created_at;
    if (!saleDate) return false;

    const createdAt = new Date(saleDate);
    return createdAt >= dayStart && createdAt <= dayEnd;
  }).length ?? 0;
  
  return {
    day: date.toLocaleDateString('pt-MZ', { weekday: 'short' }).replace('.', ''),
    leads: dayLeads,
    sales: daySales,
  };
});
setchartData(chartDataRows);
      const revenue = sales?.reduce((sum, s) => sum + Number(s.amount), 0) ?? 0;
    const conversionRate = leadsCount > 0 ? Math.min((salesCount / leadsCount) * 100, 100) : 0;  

      setStats({ leadsCount, salesCount, revenue, conversionRate });
      setLoading(false);
    }
    loadStats();
  }, []);

  const quickActions = [
    { label: 'Criar conteúdo', icon: PenLine, to: '/app/conteudo' },
    { label: 'Gerar Hook', icon: Anchor, to: '/app/hooks' },
    { label: 'Responder cliente', icon: MessageCircle, to: '/app/x1' },
    { label: 'Adicionar Lead', icon: UserPlus, to: '/app/leads' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-600">Visão geral</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Olá, {profile?.full_name?.split(' ')[0] || 'usuário'} <span className="text-slate-400">👋</span>
        </h1>
        <p className="mt-2 text-slate-500">Vamos transformar atenção em vendas hoje?</p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Seu desempenho</h2>
          <span className="text-xs text-slate-400">Resumo atual</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Leads"
          value={loading ? '—' : stats.leadsCount}
          icon={<Users size={20} />}
          accent="teal"
          empty={stats.leadsCount === 0}
        />
        <StatCard
          label="Vendas"
          value={loading ? '—' : stats.salesCount}
          icon={<ShoppingCart size={20} />}
          accent="blue"
          empty={stats.salesCount === 0}
        />
        <StatCard
          label="Receita"
          value={loading ? '—' : formatCurrency(stats.revenue)}
          icon={<Wallet size={20} />}
          accent="green"
          empty={stats.revenue === 0}
        />
        <StatCard
          label="Conversão"
          value={loading ? '—' : `${stats.conversionRate.toFixed(1)}%`}
          icon={<Percent size={20} />}
          accent="amber"
          empty={stats.conversionRate === 0}
        />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Ações rápidas</h2>
          <p className="mt-1 text-sm text-slate-500">Comece pelo próximo passo mais importante.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="group flex min-h-[116px] flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 text-left transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-200 group-hover:bg-teal-50 group-hover:text-teal-600">
                  <Icon size={20} />
                </div>
                <span className="text-sm font-semibold leading-snug text-slate-800">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Performance + Weekly Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1">
          <PerformanceChart data={chartData} />
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Meta da semana</h3>
              <p className="mt-0.5 text-xs text-slate-400">Acompanhe seu próximo objetivo</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm leading-relaxed text-slate-500 mb-3">Defina sua meta de vendas semanais</p>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
                <Sparkles size={22} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">
  {weeklySalesGoal
    ? `Meta de ${weeklySalesGoal} vendas nesta semana`
    : 'Nenhuma meta definida'}
</p>
  </div>
    </div>
  <button
  onClick={async () => {
    const value = window.prompt('Qual é sua meta de vendas para esta semana?');

    if (value === null) return;

    const goal = Number(value);

    if (!Number.isInteger(goal) || goal < 1) {
      window.alert('Digite um número inteiro maior que zero.');
      return;
    }

    if (!user?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ weekly_sales_goal: goal })
      .eq('id', user.id);

    if (error) {
      console.error('Erro ao salvar meta semanal:', error);
      window.alert('Não foi possível salvar sua meta.');
      return;
    }

    window.location.reload();
  }}
  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 active:scale-[0.99]"
>
  Definir meta
</button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
