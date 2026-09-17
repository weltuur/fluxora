import { supabase } from '@/lib/supabase';
import type { X1Analysis, X1Conversation, X1ConversationInput } from '@/types/database';

function getFunctionUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/functions/v1/analyze-x1`;
}

const interestLevels = ['Baixo', 'Médio', 'Alto', 'Muito alto'];
const conversationStages = ['Primeiro contato', 'Descoberta', 'Interesse', 'Objeção', 'Oferta', 'Checkout', 'Pós-oferta'];
const objections = ['Preço', 'Confiança', 'Tempo', 'Necessidade', 'Dúvida', 'Comparação', 'Nenhuma'];

function isValidAnalysis(value: unknown): value is X1Analysis {
  if (!value || typeof value !== 'object') return false;
  const analysis = value as Record<string, unknown>;
  return (
    interestLevels.includes(analysis.interestLevel as string) &&
    conversationStages.includes(analysis.conversationStage as string) &&
    objections.includes(analysis.objection as string) &&
    ['diagnosis', 'recommendation', 'suggestedReply', 'alternativeReplyNatural', 'alternativeReplyPersuasive', 'alternativeReplyShort', 'nextStep']
      .every((key) => typeof analysis[key] === 'string' && Boolean((analysis[key] as string).trim()))
  );
}

export async function analyzeConversation(input: X1ConversationInput): Promise<X1Analysis> {
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (data.limit_reached) {
  throw new X1LimitReachedError(
    data.error || 'Limite de análises atingido',
    data.subscription_required === true
  );
}
    throw new Error(data.error || 'Não foi possível analisar a conversa agora. Tente novamente.');
  }

  if (!isValidAnalysis(data)) {
    throw new Error('A resposta da análise veio em um formato inválido. Tente novamente.');
  }

  return data;
}

export class X1LimitReachedError extends Error {
  subscriptionRequired: boolean;

  constructor(message: string, subscriptionRequired = false) {
    super(message);
    this.name = 'X1LimitReachedError';
    this.subscriptionRequired = subscriptionRequired;
  }
}

export async function saveConversation(
  input: X1ConversationInput,
  analysis: X1Analysis,
): Promise<X1Conversation | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    const error = new Error('Usuário não autenticado. Faça login novamente para salvar o histórico.');
    console.error('Error saving X1 conversation: authentication required', {
      code: userError?.code,
      message: userError?.message ?? error.message,
      details: userError?.details,
      hint: userError?.hint,
    });
    throw error;
  }

  const { data, error } = await supabase
    .from('x1_conversations')
    .insert({
      user_id: user.id,
      conversation_text: input.conversationText,
      product: input.product || null,
      goal: input.goal,
      tone: input.tone,
      interest_level: analysis.interestLevel,
      conversation_stage: analysis.conversationStage,
      objection: analysis.objection,
      diagnosis: analysis.diagnosis,
      recommendation: analysis.recommendation,
      suggested_reply: analysis.suggestedReply,
      alternative_reply_natural: analysis.alternativeReplyNatural,
      alternative_reply_persuasive: analysis.alternativeReplyPersuasive,
      alternative_reply_short: analysis.alternativeReplyShort,
      next_step: analysis.nextStep,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving X1 conversation:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  return mapConversation(data);
}

export async function getHistory(): Promise<X1Conversation[]> {
  const { data, error } = await supabase
    .from('x1_conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error loading X1 history:', error);
    return [];
  }

  return (data ?? []).map(mapConversation);
}

function mapConversation(row: Record<string, unknown>): X1Conversation {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    conversation_text: row.conversation_text as string,
    product: row.product as string | null,
    goal: row.goal as string,
    tone: row.tone as string,
    interestLevel: row.interest_level as X1Analysis['interestLevel'],
    conversationStage: row.conversation_stage as X1Analysis['conversationStage'],
    objection: row.objection as X1Analysis['objection'],
    diagnosis: row.diagnosis as string,
    recommendation: row.recommendation as string,
    suggestedReply: row.suggested_reply as string,
    alternativeReplyNatural: row.alternative_reply_natural as string,
    alternativeReplyPersuasive: row.alternative_reply_persuasive as string,
    alternativeReplyShort: row.alternative_reply_short as string,
    nextStep: row.next_step as string,
    created_at: row.created_at as string,
  };
}
