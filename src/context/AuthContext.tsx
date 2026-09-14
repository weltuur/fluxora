import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Subscription } from '@/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    const p = data as Profile | null;
    setIsAdmin(p?.is_admin ?? false);
    return p;
  }

  async function fetchSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
      return;
    }

    setSubscription((data as Subscription) ?? null);
  }

  async function refreshProfile() {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
      await fetchSubscription(user.id);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: 'Não autenticado' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) return { error: error.message };

    await refreshProfile();
    return { error: null };
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          if (mounted) {
            setProfile(p);
          }
          return fetchSubscription(session.user.id);
        }).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        setIsAdmin(false);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Erro ao criar conta' };

    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSubscription(null);
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider
      value={{ session, user, profile, subscription, isAdmin, loading, signUp, signIn, signOut, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
