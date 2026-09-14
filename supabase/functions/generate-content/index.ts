// Edge function: generate-content
// Generates TikTok marketing content based on user inputs.
// Uses an AI provider if AI_API_KEY is configured, otherwise generates
// coherent mock content so the platform works for development/testing.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  product: string;
  audience: string;
  niche: string;
  goal: string;
  style: string;
  tone: string;
  duration: string;
}

interface GeneratedContent {
  hook: string;
  on_screen_text: string;
  script: string;
  visual_structure: string;
  cta: string;
  caption: string;
  hashtags: string;
}

function generateMockContent(req: GenerateRequest): GeneratedContent {
  const { product, audience, niche, goal, style, tone, duration } = req;

  const durationSeconds = parseInt(duration) || 30;

  const hooksByGoal: Record<string, string[]> = {
    "Atrair atenção": [
      `Ninguém te conta isso sobre ${product}...`,
      `Se você é ${audience}, para tudo e vê isso.`,
      `Eu descobri algo sobre ${product} que vai mudar como você vende.`,
    ],
    "Gerar comentários": [
      `Comenta "EU QUERO" se você também quer ${goal.toLowerCase()} com ${product}.`,
      `Qual dessas estratégias para ${product} você já tentou? Comenta aqui!`,
      `Você concorda com isso sobre ${niche}? Comenta sua opinião.`,
    ],
    "Gerar seguidores": [
      `Se você é ${audience}, segue agora porque vou publicar muito sobre ${niche}.`,
      `Salva este vídeo sobre ${product} e segue para mais dicas como essa.`,
      `Seguidores novos: bem-vindos! Aqui é tudo sobre ${niche}.`,
    ],
    "Gerar leads": [
      `Quero te mostrar como ${product} pode te ajudar. Comenta "QUERO" que eu te chamo.`,
      `Recebi muitas mensagens sobre ${product}. Vou abrir algumas vagas. Comenta "EU QUERO".`,
      `Se você é ${audience} e quer aprender sobre ${niche}, deixa seu comentário.`,
    ],
    "Gerar conversas no WhatsApp": [
      `Me chama no WhatsApp que eu te explico como ${product} funciona.`,
      `Quer saber mais sobre ${product}? Me manda mensagem agora.`,
      `O link do meu WhatsApp está na bio. Vamos conversar sobre ${niche}.`,
    ],
    "Fazer vendas": [
      `Se você é ${audience}, isso sobre ${product} é exatamente o que você precisa.`,
      `Eu perdi muito tempo até descobrir isso sobre ${niche}. Não cometa meu erro.`,
      `Vou te mostrar por que ${product} vale cada centavo.`,
    ],
    "Educar": [
      `Hoje vou te ensinar algo sobre ${product} que ninguém te explicou.`,
      `Se você é ${audience} e quer aprender sobre ${niche}, presta atenção.`,
      `3 coisas sobre ${product} que todo ${audience} precisa saber.`,
    ],
    "Criar autoridade": [
      `Depois de anos trabalhando com ${niche}, posso te afirmar isso sobre ${product}.`,
      `Aqui vai uma verdade sobre ${product} que separa iniciantes de profissionais.`,
      `Se você quer ser referência em ${niche}, precisa entender isso.`,
    ],
  };

  const ctasByGoal: Record<string, string[]> = {
    "Atrair atenção": "Comenta o que achou e compartilha com alguém que precisa ver isso!",
    "Gerar comentários": "Comenta sua opinião abaixo! Quero saber o que você acha.",
    "Gerar seguidores": "Segue a página para mais conteúdos como esse!",
    "Gerar leads": "Comenta QUERO e eu te explico como funciona.",
    "Gerar conversas no WhatsApp": "Me chama no WhatsApp — o link está na bio!",
    "Fazer vendas": "Entra no link da bio e garante o seu agora!",
    "Educar": "Salva esse vídeo para revisar depois e segue para mais dicas!",
    "Criar autoridade": "Segue se você quer aprender mais sobre isso comigo!",
  };

  const hooks = hooksByGoal[goal] || hooksByGoal["Atrair atenção"];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const cta = ctasByGoal[goal] || ctasByGoal["Atrair atenção"];

  const styleIntro: Record<string, string> = {
    "Cinematográfico": "Com imagens impactantes e música marcante",
    "Educativo": "De forma clara e didática",
    "Storytelling": "Contando uma história real",
    "Direto e persuasivo": "Direto ao ponto, sem enrolação",
    "Polêmico": "Provocando reflexão",
    "Curiosidade": "Despertando curiosidade",
    "Tutorial": "Passo a passo",
    "Problema → solução": "Mostrando o problema e a solução",
    "Prova social": "Com base em resultados reais",
  };

  const toneIntro: Record<string, string> = {
    "Natural": "de forma natural e autêntica",
    "Profissional": "com tom profissional",
    "Amigável": "de forma amigável e próxima",
    "Urgente": "com senso de urgência",
    "Inspirador": "de forma inspiradora",
    "Provocador": "de forma provocativa",
  };

  const styleText = styleIntro[style] || "";
  const toneText = toneIntro[tone] || "de forma natural";

  const onScreenTexts = [
    `"${product}"`,
    `"Para ${audience}"`,
    `"${goal}"`,
    `"${niche}"`,
  ];
  const onScreenText = onScreenTexts.join("\n");

  const scenesCount = Math.max(4, Math.ceil(durationSeconds / 10));
  const scenes: string[] = [];
  const sceneTemplates = [
    `Cena 1 — ${audience} em situação comum enfrentando o problema`,
    `Cena 2 — Apresentação do gancho: "${hook}"`,
    `Cena 3 — Explicação sobre ${product} ${toneText}`,
    `Cena 4 — Demonstração prática de como ${product} resolve o problema`,
    `Cena 5 — Prova social: resultados reais com ${product}`,
    `Cena 6 — CTA: "${cta}"`,
    `Cena 7 — Encerramento com convite para ação`,
  ];
  for (let i = 0; i < scenesCount && i < sceneTemplates.length; i++) {
    scenes.push(sceneTemplates[i]);
  }
  const visualStructure = scenes.join("\n\n");

  const scriptIntro = `[${durationSeconds}s — ${style}] ${hook}\n\n`;
  const scriptBody = `Se você é ${audience}, preste atenção.\n\nEu sei exatamente como você se sente. ${styleText}, ${toneText}, vamos falar sobre ${product}.\n\nO problema é que a maioria das pessoas em ${niche} tenta de tudo sem resultado. Mas ${product} muda o jogo porque resolve exatamente isso.\n\nVeja como funciona: em vez de fazer o que todos fazem, você foca no que realmente importa. ${product} te dá exatamente isso.\n\n${cta}`;

  const script = scriptIntro + scriptBody;

  const caption = `${hook}\n\nSe você é ${audience}, isso vai fazer toda a diferença no seu ${niche}. ${product} é a ferramenta que faltava para você ${goal.toLowerCase()}.\n\n${cta}\n\nSalva e compartilha com quem precisa ver isso!`;

  const hashtagBase = niche
    .toLowerCase()
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, ""));

  const baseTags = ["tiktok", "venderonline", "marketingdigital", "rendaextra", "mozambique"];
  const productTag = product.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);

  const allTags = [...new Set([`#${productTag}`, ...hashtagBase.map((h) => `#${h}`), ...baseTags.map((t) => `#${t}`)])];
  const hashtags = allTags.slice(0, 15).join(" ");

  return {
    hook,
    on_screen_text: onScreenText,
    script,
    visual_structure: visualStructure,
    cta,
    caption,
    hashtags,
  };
}

async function callAIProvider(req: GenerateRequest, apiKey: string): Promise<GeneratedContent> {
  const prompt = `Você é um especialista em marketing digital para TikTok focado no mercado de Moçambique.
Gere um conteúdo completo para TikTok com base nestas informações:

Produto/Serviço: ${req.product}
Público-alvo: ${req.audience}
Nicho: ${req.niche}
Objetivo: ${req.goal}
Estilo: ${req.style}
Tom: ${req.tone}
Duração: ${req.duration}

Responda em JSON com exatamente estas chaves:
- hook: gancho (primeira frase que prende atenção)
- on_screen_text: sugestões de textos curtos para aparecer na tela (separados por quebra de linha)
- script: roteiro de narração completo e natural, adequado à duração
- visual_structure: sugestões de cenas/imagens para cada parte (formato: "Cena 1 — descrição")
- cta: chamada para ação relacionada ao objetivo
- caption: legenda pronta para publicar no TikTok
- hashtags: hashtags relevantes separadas por espaço

Responda APENAS com o JSON, sem texto adicional.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider error: ${response.status}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return {
    hook: content.hook || "",
    on_screen_text: content.on_screen_text || "",
    script: content.script || "",
    visual_structure: content.visual_structure || "",
    cta: content.cta || "",
    caption: content.caption || "",
    hashtags: content.hashtags || "",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check generation limit (backend-enforced)
    const { data: limitCheck, error: limitError } = await supabase.rpc("check_content_generation_allowed");

    if (limitError) {
      return new Response(
        JSON.stringify({ error: "Erro ao verificar limite de uso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const check = limitCheck?.[0];
    if (!check?.allowed) {
      return new Response(
        JSON.stringify({
          error: "Você atingiu o limite de gerações do seu plano. Faça upgrade para continuar criando conteúdos.",
          limit_reached: true,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: GenerateRequest = await req.json();

    // Validate inputs
    if (!body.product || body.product.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Informe o produto ou serviço" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (body.product.length > 200) {
      return new Response(
        JSON.stringify({ error: "Texto muito longo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate content: use AI if key is configured, otherwise mock
    const aiApiKey = Deno.env.get("AI_API_KEY");
    let content: GeneratedContent;

    if (aiApiKey) {
      try {
        content = await callAIProvider(body, aiApiKey);
      } catch {
        content = generateMockContent(body);
      }
    } else {
      // Simulate processing delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 1500));
      content = generateMockContent(body);
    }

    return new Response(
      JSON.stringify({
        ...content,
        remaining: check.remaining,
        is_admin: check.is_admin_user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Não foi possível gerar o conteúdo agora. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
