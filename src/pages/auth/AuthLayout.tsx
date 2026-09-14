import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/">
            <Logo size="md" className="[&_*]:!text-white" />
          </Link>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Transforme atenção em vendas.
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Crie conteúdo melhor, transforme seguidores em leads e organize suas vendas
              em um só lugar.
            </p>
            <div className="mt-8 space-y-3">
              {['Conteúdo com IA', 'Gestão de leads', 'Dashboard completo'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-500">© 2026 Fluxora</p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-slate-500">
            {footerText}{' '}
            <Link to={footerLink} className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
