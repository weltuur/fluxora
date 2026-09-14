import { useState, type FormEvent } from 'react';
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha"
      footerText="Lembrou a senha?"
      footerLink="/login"
      footerLinkText="Entrar"
    >
      {sent ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
          <CheckCircle size={40} className="mx-auto text-teal-600 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">Email enviado</h3>
          <p className="text-sm text-slate-600">
            Verifique sua caixa de entrada em {email} para redefinir sua senha.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail size={18} />}
          />
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
