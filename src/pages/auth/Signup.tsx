import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate(selectedPlan ? `/app?plan=${encodeURIComponent(selectedPlan)}` : '/app');
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a transformar atenção em vendas"
      footerText="Já tem conta?"
      footerLink="/login"
      footerLinkText="Entrar"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <Input
          label="Nome"
          type="text"
          name="name"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          icon={<User size={18} />}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          icon={<Mail size={18} />}
        />
        <Input
          label="Senha"
          type="password"
          name="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          icon={<Lock size={18} />}
        />
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Criar conta'}
        </Button>
        <p className="text-xs text-slate-400 text-center">
          Ao criar conta, você concorda com os termos de uso e política de privacidade.
        </p>
      </form>
    </AuthLayout>
  );
}
