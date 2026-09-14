import { supabase } from '@/lib/supabase';
import type { Hook, GeneratedHooks, HookGenerationInput, HookLimitInfo } from '@/types/database';

function getFunctionUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/functions/v1/generate-hooks`;
}

export async function generateHooks(input: HookGenerationInput): Promise<GeneratedHooks> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(getFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': key,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.limit_reached) {
      throw new HookLimitReachedError(errorData.error || 'Limite atingido');
    }
    throw new Error(errorData.error || 'Não foi possível gerar os hooks agora. Tente novamente.');
  }

  const data = await response.json();
  return data as GeneratedHooks;
}

export class HookLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HookLimitReachedError';
  }
}

export async function checkHookLimit(): Promise<HookLimitInfo> {
  const { data, error } = await supabase.rpc('check_hook_generation_allowed');
  if (error || !data || data.length === 0) {
    return { allowed: false, remaining: 0, limit_value: 0, is_admin_user: false };
  }
  const row = data[0];
  return {
    allowed: row.allowed,
    remaining: row.remaining,
    limit_value: row.limit_value,
    is_admin_user: row.is_admin_user,
  };
}

export async function saveHooks(input: HookGenerationInput, generated: GeneratedHooks): Promise<Hook | null> {
  const { data, error } = await supabase
    .from('hooks')
    .insert({
      niche: input.niche,
      topic: input.topic,
      audience: input.audience,
      goal: input.goal,
      hooks: {
        curiosidade: generated.curiosidade,
        polemica: generated.polemica,
        problema: generated.problema,
        beneficio: generated.beneficio,
        historia: generated.historia,
        autoridade: generated.autoridade,
        urgencia: generated.urgencia,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving hooks:', error);
    return null;
  }

  return data as Hook;
}

export async function loadHookHistory(): Promise<Hook[]> {
  const { data, error } = await supabase
    .from('hooks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error loading hook history:', error);
    return [];
  }

  return (data as Hook[]) ?? [];
}

export async function deleteHook(id: string): Promise<boolean> {
  const { error } = await supabase.from('hooks').delete().eq('id', id);
  return !error;
}
