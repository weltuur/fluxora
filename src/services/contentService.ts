import { supabase } from '@/lib/supabase';
import type {
  Content,
  GeneratedContent,
  ContentGenerationInput,
  ContentLimitInfo,
} from '@/types/database';

function getFunctionUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/functions/v1/generate-content`;
}

export async function generateContent(
  input: ContentGenerationInput
): Promise<GeneratedContent> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(getFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: key,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

   if (errorData.limit_reached || errorData.subscription_required) {
  throw new LimitReachedError(
    errorData.error || 'Não foi possível continuar.',
    Boolean(errorData.subscription_required)
  );
}

    throw new Error(
      errorData.error ||
        'Não foi possível gerar o conteúdo agora. Tente novamente.'
    );
  }

  const data = await response.json();
  return data as GeneratedContent;
}

export class LimitReachedError extends Error {
  subscriptionRequired: boolean;

  constructor(message: string, subscriptionRequired = false) {
    super(message);
    this.name = 'LimitReachedError';
    this.subscriptionRequired = subscriptionRequired;
  }
}

export async function checkContentLimit(): Promise<ContentLimitInfo> {
  const { data, error } = await supabase.rpc(
    'check_content_generation_allowed'
  );

  if (error || !data || data.length === 0) {
    return {
      allowed: false,
      remaining: 0,
      limit_value: 0,
      is_admin_user: false,
    };
  }

  const row = data[0];

  return {
    allowed: row.allowed,
    remaining: row.remaining,
    limit_value: row.limit_value,
    is_admin_user: row.is_admin_user,
  };
}

export async function saveContent(
  input: ContentGenerationInput,
  generated: GeneratedContent
): Promise<Content | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('Usuário não autenticado.');
    return null;
  }

  const generatedText = JSON.stringify({
    hook: generated.hook,
    on_screen_text: generated.on_screen_text,
    script: generated.script,
    visual_structure: generated.visual_structure,
    cta: generated.cta,
    caption: generated.caption,
    hashtags: generated.hashtags,
  });

  const { data, error } = await supabase
    .from('generated_content')
    .insert({
  user_id: user.id,
  niche: input.niche,
  topic: input.product,
  content_type: input.goal,
  tone: input.tone,
  platform: 'TikTok',
  generated_text: generatedText,
 })
    .select()
    .single();

  if (error) {
  console.error('Error saving content:', JSON.stringify(error, null, 2));
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    product: input.product,
    audience: input.audience,
    niche: data.niche,
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
    created_at: data.created_at,
  } as Content;
}

export async function loadContentHistory(): Promise<Content[]> {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error loading content history:', error);
    return [];
  }

  return (data ?? []).map((item) => {
    let generated: Partial<GeneratedContent> = {};

    try {
      generated = item.generated_text
        ? JSON.parse(item.generated_text)
        : {};
    } catch {
      generated = {
        script: item.generated_text || '',
      };
    }

    return {
      id: item.id,
      user_id: item.user_id,
      product: item.topic || '',
      audience: null,
      niche: item.niche || null,
      goal: item.content_type || null,
      style: null,
      tone: item.tone || null,
      duration: null,
      hook: generated.hook || null,
      on_screen_text: generated.on_screen_text || null,
      script: generated.script || null,
      visual_structure: generated.visual_structure || null,
      cta: generated.cta || null,
      caption: generated.caption || null,
      hashtags: generated.hashtags || null,
      created_at: item.created_at,
    } as Content;
  });
}

export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('generated_content')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content:', error);
    return false;
  }

  return true;
}