import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      supabase.rpc('is_current_user_admin').then(({ data }) => {
        setAdmin(!!data);
        setChecking(false);
      });
    } else if (!loading && !session) {
      setChecking(false);
    }
  }, [loading, session]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!admin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
