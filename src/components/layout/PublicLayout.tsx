import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/precos"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Preços
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              Começar agora
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
