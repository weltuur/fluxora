import { useEffect, useState } from 'react';
import { CreditCard, Check, Loader2, Crown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { Plan, Subscription } from '@/types/database';

const badges: Record<string, string> = {
  avancado: 'MAIS POPULAR',
  premium: 'MELHOR CUSTO-BENEFÍCIO',
};

const billingPeriodLabels: Record<Plan['billing_period'], string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

export function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [plansRes, subRes] = await Promise.all([
        supabase.from('plans').select('*').eq('active', true).neq('slug', 'admin').order('sort_order'),
        supabase
          .from('subscriptions')
          .select('*, plan:plans(*)')
          .eq('status', 'active')
          .maybeSingle(),
      ]);
      setPlans((plansRes.data as Plan[]) ?? []);
      setSubscription((subRes.data as Subscription) ?? null);
      setLoading(false);
    }
    load();
  }, []);

  function handleSubscribe(plan: Plan) {
    if (plan.checkout_url && !plan.checkout_url.startsWith('MONTHLY_') && !plan.checkout_url.startsWith('TRIMESTER_') && !plan.checkout_url.startsWith('YEARLY_')) {
      window.open(plan.checkout_url, '_blank');
    } else {
      window.alert(`O checkout para o plano ${plan.name} será configurado em breve via EscalePay.`);
    }
  }

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Assinatura</h1>
        <p className="mt-1 text-slate-500">Gerencie seu plano e pagamento</p>
      </div>

      {/* Current plan */}
      {subscription ? (
        <Card className="p-6 mb-6 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white">
              <Crown size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Plano {subscription.plan?.name}</h2>
              <p className="text-sm text-slate-600">
                {subscription.plan?.content_limit === null &&
                subscription.plan?.hook_limit === null &&
                subscription.plan?.x1_limit === null
                  ? 'Acesso completo e ilimitado'
                  : 'Sua assinatura está ativa'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mb-6 border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Nenhum plano ativo</h2>
              <p className="text-sm text-slate-600">Escolha um plano abaixo para começar</p>
            </div>
          </div>
        </Card>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const badge = badges[plan.slug];
          const isCurrent = subscription?.plan_id === plan.id;
          const isPopular = plan.slug === 'avancado';
          const isBestValue = plan.slug === 'premium';

          return (
            <Card
              key={plan.id}
              className={`p-6 relative transition-all duration-300 hover:-translate-y-1 ${
                isPopular ? 'border-teal-500 border-2 shadow-lg shadow-teal-500/10' : ''
              } ${isBestValue ? 'border-slate-900 border-2' : ''}`}
            >
              {badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold whitespace-nowrap ${
                    isPopular ? 'bg-teal-500 text-white' : 'bg-slate-900 text-white'
                  }`}
                >
                  {badge}
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{billingPeriodLabels[plan.billing_period]}</p>
              <div className="mt-4 mb-4">
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(plan.price)}</span>
              </div>
              {isCurrent ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700">
                  <Check size={16} />
                  Plano atual
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                    isPopular
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : isBestValue
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Assinar
                </button>
              )}
              <div className="mt-5 space-y-2.5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={15} className="shrink-0 mt-0.5 text-teal-600" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-slate-400 text-center">
        Pagamentos processados via EscalePay. Sem formulário de cartão no Fluxora.
      </p>
    </DashboardLayout>
  );
}
