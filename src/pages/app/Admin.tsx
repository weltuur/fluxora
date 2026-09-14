import { useEffect, useState } from 'react';
import { Shield, Users, ShoppingCart, Wallet, Package, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Profile, PlatformStats } from '@/types/database';

export function AdminPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statsRes, profilesRes] = await Promise.all([
        supabase.rpc('get_platform_stats'),
        supabase.rpc('get_all_profiles'),
      ]);

      if (statsRes.data) setStats(statsRes.data as PlatformStats);
      if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Painel Admin</h1>
            <p className="text-sm text-slate-500">Visão geral da plataforma Fluxora</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Usuários"
          value={stats?.total_users ?? 0}
          icon={<Users size={20} />}
          accent="teal"
        />
        <StatCard
          label="Leads"
          value={stats?.total_leads ?? 0}
          icon={<Users size={20} />}
          accent="blue"
        />
        <StatCard
          label="Vendas"
          value={stats?.total_sales ?? 0}
          icon={<ShoppingCart size={20} />}
          accent="green"
        />
        <StatCard
          label="Receita total"
          value={formatCurrency(stats?.total_revenue ?? 0)}
          icon={<Wallet size={20} />}
          accent="green"
        />
        <StatCard
          label="Produtos"
          value={stats?.total_products ?? 0}
          icon={<Package size={20} />}
          accent="amber"
        />
        <StatCard
          label="Assinaturas ativas"
          value={stats?.active_subscriptions ?? 0}
          icon={<CreditCard size={20} />}
          accent="teal"
        />
      </div>

      {/* Users table */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Usuários cadastrados</h2>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Nome</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Negócio</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Objetivo</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">Onboarding</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-xs font-bold text-white">
                        {p.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{p.name || 'Sem nome'}</p>
                        {p.is_admin && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">
                            <Shield size={10} /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-600">{p.business_type || '—'}</td>
                  <td className="py-3 pr-4 text-sm text-slate-600">{p.goal || '—'}</td>
                  <td className="py-3 pr-4">
                    {p.onboarding_completed ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Completo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-sm text-slate-500">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {profiles.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">Nenhum usuário cadastrado.</p>
        )}
      </Card>

      <div className="mt-6">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}
