export type BusinessType = 'Produto digital' | 'Produto físico' | 'Serviço' | 'Afiliado' | 'Outro';

export type SellingChannel = 'TikTok' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'Outros';

export type Goal = 'Fazer minha primeira venda' | 'Conseguir mais leads' | 'Aumentar minhas vendas' | 'Organizar meus clientes';

export type LeadStatus = 'novo' | 'contatado' | 'conversando' | 'ganho' | 'perdido';

export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  business_type: BusinessType | null;
  selling_channels: SellingChannel[];
  goal: Goal | null;
  onboarding_completed: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface PlatformStats {
  total_users: number;
  total_leads: number;
  total_sales: number;
  total_revenue: number;
  total_products: number;
  active_subscriptions: number;
}

export interface Plan {
  id: string;
  name: string;
  slug: 'basico' | 'avancado' | 'premium';
  price: number;
  billing_period: 'monthly' | 'quarterly' | 'yearly';
  content_limit: number | null;
  hook_limit: number | null;
  x1_limit: number | null;
  features: string[];
  checkout_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  external_customer_id: string | null;
  external_subscription_id: string | null;
  created_at: string;
  plan?: Plan;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  username: string | null;
  platform: string | null;
  product_id: string | null;
  status: LeadStatus;
  potential_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Sale {
  id: string;
  user_id: string;
  lead_id: string | null;
  product_id: string | null;
  amount: number;
  source: string | null;
  sold_at: string;
  created_at: string;
  product?: Product;
  lead?: Lead;
}

export interface Usage {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  content_generations: number;
  hook_generations: number;
  x1_analyses: number;
}

export interface DashboardStats {
  leadsCount: number;
  salesCount: number;
  revenue: number;
  conversionRate: number;
}

export interface Content {
  id: string;
  user_id: string;
  product: string;
  audience: string | null;
  niche: string | null;
  goal: string | null;
  style: string | null;
  tone: string | null;
  duration: string | null;
  hook: string | null;
  on_screen_text: string | null;
  script: string | null;
  visual_structure: string | null;
  cta: string | null;
  caption: string | null;
  hashtags: string | null;
  created_at: string;
}

export interface GeneratedContent {
  hook: string;
  on_screen_text: string;
  script: string;
  visual_structure: string;
  cta: string;
  caption: string;
  hashtags: string;
  remaining?: number;
  is_admin?: boolean;
}

export interface ContentGenerationInput {
  product: string;
  audience: string;
  niche: string;
  goal: string;
  style: string;
  tone: string;
  duration: string;
}

export interface ContentLimitInfo {
  allowed: boolean;
  remaining: number;
  limit_value: number;
  is_admin_user: boolean;
}

export interface Hook {
  id: string;
  user_id: string;
  niche: string | null;
  topic: string | null;
  audience: string | null;
  goal: string | null;
  hooks: Record<string, string[]>;
  created_at: string;
}

export interface GeneratedHooks {
  curiosidade: string[];
  polemica: string[];
  problema: string[];
  beneficio: string[];
  historia: string[];
  autoridade: string[];
  urgencia: string[];
  remaining?: number;
  is_admin?: boolean;
}

export interface HookGenerationInput {
  niche: string;
  topic: string;
  audience: string;
  goal: string;
}

export interface HookLimitInfo {
  allowed: boolean;
  remaining: number;
  limit_value: number;
  is_admin_user: boolean;
}

export interface X1ConversationInput {
  conversationText: string;
  product: string;
  goal: string;
  tone: string;
}

export interface X1Analysis {
  interestLevel: 'Baixo' | 'Médio' | 'Alto' | 'Muito alto';
  conversationStage: 'Primeiro contato' | 'Descoberta' | 'Interesse' | 'Objeção' | 'Oferta' | 'Checkout' | 'Pós-oferta';
  objection: 'Preço' | 'Confiança' | 'Tempo' | 'Necessidade' | 'Dúvida' | 'Comparação' | 'Nenhuma';
  diagnosis: string;
  recommendation: string;
  suggestedReply: string;
  alternativeReplyNatural: string;
  alternativeReplyPersuasive: string;
  alternativeReplyShort: string;
  nextStep: string;
}

export interface X1Conversation extends X1Analysis {
  id: string;
  user_id: string;
  conversation_text: string;
  product: string | null;
  goal: string;
  tone: string;
  created_at: string;
}
