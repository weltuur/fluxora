import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboarding && profile?.onboarding_completed) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
