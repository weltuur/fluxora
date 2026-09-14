// Edge function: analyze-x1
// Analyzes a sales conversation without exposing the provider API key.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const interestLevels = ["Baixo", "Médio", "Alto", "Muito alto"] as const;
const conversationStages = ["Primeiro contato", "Descoberta", "Interesse", "Objeção", "Oferta", "Checkout", "Pós-oferta"] as const;
const objections = ["Preço", "Confiança", "Tempo", "Necessidade", "Dúvida", "Comparação", "Nenhuma"] as const;

type X1Analysis = {
  interestLevel: (typeof interestLevels)[number];
  conversationStage: (typeof conversationStages)[number];
  objection: (typeof objections)[number];
  diagnosis: string;
  recommendation: string;
  suggestedReply: string;
  alternativeReplyNatural: string;
  alternativeReplyPersuasive: string;
  alternativeReplyShort: string;
  nextStep: string;
};

type AnalyzeRequest = {
  conversationText: string;
  product?: string;
  goal: string;
  tone: string;
};

function pickAllowed<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;
}

function normalizeAnalysis(value: Partial<X1Analysis>): X1Analysis {
  return {
    interestLevel: pickAllowed(value.interestLevel, interestLevels, "Médio"),
    conversationStage: pickAllowed(value.conversationStage, conversationStages, "Descoberta"),
    objection: pickAllowed(value.objection, objections, "Nenhuma"),
    diagnosis: typeof value.diagnosis === "string" ? value.diagnosis.trim() : "A conversa precisa de mais contexto para identificar o momento de compra.",
    recommendation: typeof value.recommendation === "string" ? value.recommendation.trim() : "Faça uma pergunta aberta e confirme a necessidade do cliente.",
    suggestedReply: typeof value.suggestedReply === "string" ? value.suggestedReply.trim() : "Entendi. Pode me contar um pouco mais sobre o que você procura?",
    alternativeReplyNatural: typeof value.alternativeReplyNatural === "string" ? value.alternativeReplyNatural.trim() : "Claro, me explica melhor o que você precisa para eu te orientar.",
    alternativeReplyPersuasive: typeof value.alternativeReplyPersuasive === "string" ? value.alternativeReplyPersuasive.trim() : "Pelo que você me contou, esta pode ser uma boa opção. Quer que eu te mostre como funciona?",
    alternativeReplyShort: typeof value.alternativeReplyShort === "string" ? value.alternativeReplyShort.trim() : "Quer que eu te explique melhor?",
    nextStep: typeof value.nextStep === "string" ? value.nextStep.trim() : "Responda à dúvida principal e combine um próximo contato.",
  };
}

function generateMockAnalysis(req: AnalyzeRequest): X1Analysis {
  const lowerText = req.conversationText.toLowerCase();
  const hasObjection = /caro|preço|preco|confio|confiança|tempo|dúvida|duvida|comparar/.test(lowerText);
  const isCheckout = /checkout|pagamento|pagar|pix|link/.test(lowerText);
  const isOffer = /oferta|valor|preço|preco|comprar/.test(lowerText);

  return normalizeAnalysis({
    interestLevel: isCheckout ? "Muito alto" : isOffer ? "Alto" : hasObjection ? "Médio" : "Baixo",
    conversationStage: isCheckout ? "Checkout" : isOffer ? "Oferta" : hasObjection ? "Objeção" : "Descoberta",
    objection: /caro|preço|preco/.test(lowerText) ? "Preço" : /confio|confiança/.test(lowerText) ? "Confiança" : /tempo/.test(lowerText) ? "Tempo" : /dúvida|duvida/.test(lowerText) ? "Dúvida" : /comparar/.test(lowerText) ? "Comparação" : "Nenhuma",
    diagnosis: `O cliente demonstra ${isCheckout ? "forte intenção de avançar" : isOffer ? "interesse na oferta" : "interesse ainda em construção"}. A principal oportunidade é responder ao contexto apresentado sem pressionar.`,
    recommendation: `Use um tom ${req.tone.toLowerCase()}, confirme a necessidade e conduza a conversa para ${req.goal.toLowerCase()}.`,
    suggestedReply: `Entendi o que você procura${req.product ? ` sobre ${req.product}` : ""}. Posso te explicar o próximo passo e responder qualquer dúvida antes de você decidir.`,
    alternativeReplyNatural: "Entendi. Me conta um pouco mais do que você precisa e eu te ajudo a encontrar o melhor caminho.",
    alternativeReplyPersuasive: "Pelo que você descreveu, esta solução pode fazer sentido. Quer que eu te mostre os detalhes para avaliar com calma?",
    alternativeReplyShort: "Quer que eu te mostre como funciona?",
    nextStep: "Responder à mensagem do cliente e fazer uma pergunta objetiva para confirmar o interesse.",
  });
}

async function callAIProvider(req: AnalyzeRequest, apiKey: string): Promise<X1Analysis> {
  const prompt = `Você é um assistente de vendas ético para o Fluxora. Analise a conversa abaixo com foco em clareza, respeito e entendimento da necessidade do cliente. Não invente fatos, depoimentos, garantias de resultado ou urgência artificial. Não recomende pressão, manipulação ou insistência abusiva.

Conversa: ${req.conversationText}
Produto/serviço: ${req.product || "Não informado"}
Objetivo: ${req.goal}
Tom desejado: ${req.tone}

Responda APENAS com JSON válido usando exatamente estas chaves:
{
  "interestLevel": "Baixo | Médio | Alto | Muito alto",
  "conversationStage": "Primeiro contato | Descoberta | Interesse | Objeção | Oferta | Checkout | Pós-oferta",
  "objection": "Preço | Confiança | Tempo | Necessidade | Dúvida | Comparação | Nenhuma",
  "diagnosis": "...",
  "recommendation": "...",
  "suggestedReply": "...",
  "alternativeReplyNatural": "...",
  "alternativeReplyPersuasive": "...",
  "alternativeReplyShort": "...",
  "nextStep": "..."
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) throw new Error(`AI provider error: ${response.status}`);
  const data = await response.json();
  return normalizeAnalysis(JSON.parse(data.choices[0].message.content));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: limitCheck, error: limitError } = await supabase.rpc("check_x1_analysis_allowed");
    if (limitError) {
      console.error("X1 limit RPC error", {
        code: limitError.code,
        message: limitError.message,
        details: limitError.details,
        hint: limitError.hint,
      });
      return new Response(JSON.stringify({ error: "Erro ao verificar limite de uso" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const check = limitCheck?.[0];
    if (!check?.allowed) {
      return new Response(JSON.stringify({ error: "Você atingiu o limite de análises do seu plano. Faça upgrade para continuar.", limit_reached: true }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json() as AnalyzeRequest;
    if (!body.conversationText || body.conversationText.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Cole uma conversa para analisar" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (body.conversationText.length > 12000) {
      return new Response(JSON.stringify({ error: "A conversa é muito longa" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiApiKey = Deno.env.get("AI_API_KEY");
    let analysis: X1Analysis;
    if (aiApiKey) {
      try {
        analysis = await callAIProvider(body, aiApiKey);
      } catch {
        analysis = generateMockAnalysis(body);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      analysis = generateMockAnalysis(body);
    }

    return new Response(JSON.stringify({ ...analysis, remaining: check.remaining, is_admin: check.is_admin_user }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Não foi possível analisar a conversa agora. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
