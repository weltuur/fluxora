import { useState, useEffect, type FormEvent } from 'react';
import { Settings as SettingsIcon, User, Save, Loader2, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { BusinessType, SellingChannel, Goal, Subscription } from '@/types/database';
import { supabase } from '@/lib/supabase';
const businessTypes: BusinessType[] = ['Produto digital', 'Produto físico', 'Serviço', 'Afiliado', 'Outro'];
const channels: SellingChannel[] = ['TikTok', 'WhatsApp', 'Instagram', 'Facebook', 'Outros'];
const goals: Goal[] = [
  'Fazer minha primeira venda',
  'Conseguir mais leads',
  'Aumentar minhas vendas',
  'Organizar meus clientes',
];

export function SettingsPage() {
  const { profile, updateProfile, user } = useAuth();
const [subscription, setSubscription] = useState<Subscription | null>(null);
const [subscriptionLoading, setSubscriptionLoading] = useState(true);  
  const [name, setName] = useState(profile?.full_name?? '');
  const [businessType, setBusinessType] = useState<BusinessType | ''>(profile?.business_type ?? '');
  const [goal, setGoal] = useState<Goal | ''>(profile?.goal ?? '');
  const [weeklySalesGoal, setWeeklySalesGoal] = useState(
  profile?.weekly_sales_goal?.toString() ?? ''
);
  const [selectedChannels, setSelectedChannels] = useState<SellingChannel[]>(profile?.selling_channels ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const subscriptionExpiration = subscription?.expires_at
    ? new Date(subscription.expires_at)
    : null;

  const subscriptionDaysRemaining = subscriptionExpiration
    ? Math.max(
        0,
        Math.ceil(
          (subscriptionExpiration.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;  

   useEffect(() => {
    async function loadSubscription() {
      if (!user?.id) {
        setSubscriptionLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!error) {
        setSubscription((data as Subscription) ?? null);
      }

      setSubscriptionLoading(false);
    }

    loadSubscription();
  }, [user?.id]);

  function toggleChannel(ch: SellingChannel) {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setSaving(true);
  setSaved(false);

  const { error } = await updateProfile({
  full_name: name,
  business_type: businessType || null,
  goal: goal || null,
  selling_channels: selectedChannels,
  weekly_sales_goal: weeklySalesGoal ? Number(weeklySalesGoal) : null,
});

  setSaving(false);

  if (error) {
    console.error('Erro ao salvar perfil:', error);
    return;
  }

  setSaved(true);
  setTimeout(() => setSaved(false), 2500);

  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="mt-1 text-slate-500">Gerencie suas informações pessoais</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Account */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <User size={20} className="text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Conta</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="Email"
              value={user?.email ?? ''}
              disabled
              className="bg-slate-50"
            />
          </div>
        </Card>

        {/* Business profile */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <SettingsIcon size={20} className="text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Perfil de negócio</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">O que você vende</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
              >
                <option value="">Selecione...</option>
                {businessTypes.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Onde você vende</label>
              <div className="flex flex-wrap gap-2">
                {channels.map((ch) => {
                  const selected = selectedChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] ${
                        selected
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Seu principal objetivo</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
              >
                <option value="">Selecione...</option>
                {goals.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
  <label className="block text-sm font-medium text-slate-700 mb-1.5">
    Meta de vendas por semana
  </label>

  <Input
    type="number"
    min="1"
    value={weeklySalesGoal}
    onChange={(e) => setWeeklySalesGoal(e.target.value)}
    placeholder="Ex.: 10"
  />

  <p className="mt-1.5 text-xs text-slate-500">
    Defina quantas vendas você deseja alcançar por semana.
  </p>
</div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar alterações
          </Button>
          {saved && (
            <span className="text-sm font-medium text-teal-600 animate-in fade-in duration-300">
              Alterações salvas!
            </span>
          )}
        </div>
                <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <CreditCard size={20} className="text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Conta e assinatura
            </h2>
          </div>

          {subscriptionLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Carregando assinatura...
            </div>
          ) : subscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Plano atual</span>
                <span className="text-sm font-semibold text-slate-900">
                  {subscription.plan?.name ?? 'Plano'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className="text-sm font-semibold text-teal-600">
                  Ativo
                </span>
              </div>

              {subscriptionExpiration && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Expira em
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {subscriptionExpiration.toLocaleDateString('pt-MZ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Dias restantes
                    </span>
                    <span className="text-sm font-semibold text-teal-700">
                      {subscriptionDaysRemaining === 0
                        ? 'Expira hoje'
                        : `${subscriptionDaysRemaining} ${
                            subscriptionDaysRemaining === 1
                              ? 'dia'
                              : 'dias'
                          }`}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Você não possui uma assinatura ativa.
            </p>
          )}
        </Card>
      </form>
    </DashboardLayout>
  );
}
