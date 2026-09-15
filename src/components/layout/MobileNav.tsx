import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  PenLine,
  Anchor,
  MessageCircle,
  Users,
  ShoppingCart,
  BarChart3,
  Calendar,
  Sparkles,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/conteudo', label: 'Criar Conteúdo', icon: PenLine },
  { to: '/app/hooks', label: 'Hooks', icon: Anchor },
  { to: '/app/x1', label: 'Assistente X1', icon: MessageCircle },
  { to: '/app/leads', label: 'Meus Leads', icon: Users },
  { to: '/app/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/calendario', label: 'Calendário', icon: Calendar },
  { to: '/app/fluxora-ai', label: 'Fluxora AI', icon: Sparkles },
  { to: '/app/assinatura', label: 'Assinatura', icon: CreditCard },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { profile, isAdmin, subscription, signOut } = useAuth();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3">
        <NavLink to="/app" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </NavLink>
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <Logo size="sm" />
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )
                    }
                  >
                    <Icon size={20} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {isAdmin && (
              <div className="px-3 pb-2 border-t border-slate-200 pt-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-1">Admin</div>
                <NavLink
                  to="/app/admin"
                  end={false}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <Shield size={20} className="shrink-0" />
                  <span className="truncate">Painel Admin</span>
                </NavLink>
              </div>
            )}

            <div className="border-t border-slate-200 p-3">
              <div className="flex items-center gap-3 px-2 py-2 mb-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {subscription?.plan?.name ? `Plano ${subscription.plan.name}` : 'Sem plano'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
