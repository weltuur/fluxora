import { supabase } from '@/lib/supabase';
import type { Content, GeneratedContent, ContentGenerationInput, ContentLimitInfo } from '@/types/database';

function getFunctionUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/functions/v1/generate-content`;
}

export async function generateContent(input: ContentGenerationInput): Promise<GeneratedContent> {
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
      throw new LimitReachedError(errorData.error || 'Limite atingido');
    }
    throw new Error(errorData.error || 'Não foi possível gerar o conteúdo agora. Tente novamente.');
  }

  const data = await response.json();
  return data as GeneratedContent;
}

export class LimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LimitReachedError';
  }
}

export async function checkContentLimit(): Promise<ContentLimitInfo> {
  const { data, error } = await supabase.rpc('check_content_generation_allowed');
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

export async function saveContent(input: ContentGenerationInput, generated: GeneratedContent): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .insert({
      product: input.product,
      audience: input.audience,
      niche: input.niche,
      goal: input.goal,
      style: input.style,
      tone: input.tone,
      duration: input.duration,
      hook: generated.hook,
      on_screen_text: generated.on_screen_text,
      script: generated.script,
      visual_structure: generated.visual_structure,
      cta: generated.cta,
      caption: generated.caption,
      hashtags: generated.hashtags,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving content:', error);
    return null;
  }

  return data as Content;
}

export async function loadContentHistory(): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error loading content history:', error);
    return [];
  }

  return (data as Content[]) ?? [];
}

export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabase.from('content').delete().eq('id', id);
  return !error;
}
