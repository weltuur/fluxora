import { NavLink } from 'react-router-dom';
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

export function Sidebar() {
  const { profile, isAdmin, subscription, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-slate-200">
        <NavLink to="/app">
          <Logo size="md" />
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {isAdmin && (
        <div className="px-3 pb-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-1">Admin</div>
          <NavLink
            to="/app/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Shield size={18} className="shrink-0" />
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
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
