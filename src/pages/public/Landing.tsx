import { Link } from 'react-router-dom';
import {
  PenLine,
  MessageCircle,
  Users,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Logo } from '@/components/ui/Logo';

const features = [
  {
    icon: PenLine,
    title: 'Crie conteúdos com IA',
    desc: 'Gere ideias, hooks, roteiros, CTAs e legendas.',
  },
  {
    icon: MessageCircle,
    title: 'Transforme conversas em oportunidades',
    desc: 'Use inteligência artificial para melhorar suas conversas com potenciais clientes.',
  },
  {
    icon: Users,
    title: 'Organize seus leads',
    desc: 'Acompanhe cada potencial comprador até a venda.',
  },
  {
    icon: TrendingUp,
    title: 'Acompanhe seus resultados',
    desc: 'Veja leads, vendas, receita e conversão.',
  },
];

const steps = [
  { number: '01', title: 'Criar', desc: 'Crie conteúdos melhores.', icon: PenLine },
  { number: '02', title: 'Atrair', desc: 'Conquiste atenção e leads.', icon: Sparkles },
  { number: '03', title: 'Conversar', desc: 'Conduza potenciais clientes.', icon: MessageCircle },
  { number: '04', title: 'Vender', desc: 'Transforme oportunidades em vendas.', icon: ShoppingBag },
];

export function Landing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-white to-white" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles size={14} />
            Plataforma SaaS para vendedores e criadores
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-3 duration-600">
            Transforme atenção em vendas.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
            Crie conteúdo melhor, transforme seguidores em leads e organize suas vendas em um só lugar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-800">
            <Link
              to="/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-7 py-3.5 text-base font-semibold text-white hover:bg-teal-600 transition-all active:scale-[0.98] shadow-lg shadow-teal-500/25"
            >
              Começar agora
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/precos"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Tudo o que você precisa para vender online
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 transition-all duration-300 hover:shadow-lg hover:border-teal-200/60 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{f.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feito para quem quer vender online */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Feito para quem quer vender online
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            O Fluxora foi pensado para afiliados, criadores e pequenos negócios que querem
            transformar conteúdo em receita.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 sm:py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Como funciona</h2>
            <p className="mt-4 text-lg text-slate-400">Do conteúdo à venda em 4 passos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 transition-all duration-300 hover:bg-slate-800/70 hover:border-teal-500/40"
                >
                  <div className="text-3xl font-bold text-teal-400/70 mb-3">{step.number}</div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 p-8 sm:p-12 text-center shadow-xl shadow-teal-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto para transformar atenção em vendas?
            </h2>
            <p className="text-teal-50 text-lg mb-8 max-w-xl mx-auto">
              Comece grátis hoje e veja como o Fluxora pode ajudar seu negócio a crescer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-teal-700 hover:bg-teal-50 transition-all active:scale-[0.98]"
              >
                Começar agora
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/precos"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
