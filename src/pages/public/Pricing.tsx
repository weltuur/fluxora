import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Logo } from '@/components/ui/Logo';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { Plan } from '@/types/database';

export function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setPlans(data as Plan[]);
        setLoading(false);
      });
  }, []);

  const badges: Record<string, string> = {
    avancado: 'MAIS POPULAR',
    premium: 'PLANO COMPLETO',
  };

  const billingPeriodLabels: Record<Plan['billing_period'], string> = {
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    yearly: 'Anual',
  };

  return (
    <PublicLayout>
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6">
              <Sparkles size={14} />
              Planos simples e transparentes
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
              Escolha seu plano
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
              Comece a transformar atenção em vendas. Cancele quando quiser.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const badge = badges[plan.slug];
                const isPopular = plan.slug === 'avancado';
                const isBestValue = plan.slug === 'premium';
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border-2 bg-white p-7 transition-all duration-300 hover:-translate-y-1 ${
                      isPopular
                        ? 'border-teal-500 shadow-xl shadow-teal-500/10 md:scale-105'
                        : isBestValue
                        ? 'border-slate-900 shadow-xl shadow-slate-900/5'
                        : 'border-slate-200 hover:shadow-lg'
                    }`}
                  >
                    {badge && (
                      <div
                        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold tracking-wide whitespace-nowrap ${
                          isPopular
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {badge}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{billingPeriodLabels[plan.billing_period]}</p>
                    <div className="mt-5 mb-5">
                      <span className="text-4xl font-bold text-slate-900">
                        {formatCurrency(plan.price)}
                      </span>
                    </div>
                    <Link
                      to={`/cadastro?plan=${plan.slug}`}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                        isPopular
                          ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/25'
                          : isBestValue
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Assinar {plan.name}
                      <ArrowRight size={16} />
                    </Link>
                    <div className="mt-6 space-y-3">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <Check size={16} className="shrink-0 mt-0.5 text-teal-600" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-10 text-center text-sm text-slate-500">
            Pagamentos processados via EscalePay. Sem formulário de cartão no Fluxora.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-slate-500">
            © 2026 Fluxora. Transforme atenção em vendas.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link to="/precos" className="hover:text-slate-900 transition-colors">Preços</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
}
