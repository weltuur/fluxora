import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/app');
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Bem-vindo de volta ao Fluxora"
      footerText="Ainda não tem conta?"
      footerLink="/cadastro"
      footerLinkText="Criar conta"
    >
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
          autoComplete="email"
          icon={<Mail size={18} />}
        />
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Senha
            </label>
            <Link to="/recuperar-senha" className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            icon={<Lock size={18} />}
          />
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
