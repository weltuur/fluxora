// Edge function: generate-hooks
// Generates categorized TikTok hooks based on user inputs.
// Uses an AI provider if AI_API_KEY is configured, otherwise generates
// coherent mock hooks so the platform works for development/testing.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HookRequest {
  niche: string;
  topic: string;
  audience: string;
  goal: string;
}

interface GeneratedHooks {
  curiosidade: string[];
  polemica: string[];
  problema: string[];
  beneficio: string[];
  historia: string[];
  autoridade: string[];
  urgencia: string[];
}

function generateMockHooks(req: HookRequest): GeneratedHooks {
  const { niche, topic, audience, goal } = req;

  return {
    curiosidade: [
      `Ninguém te conta isso sobre ${topic}...`,
      `O que ninguém espera sobre ${niche} vai te surpreender`,
      `Eu descobri algo sobre ${topic} que mudou tudo para mim`,
      `Se você é ${audience}, precisa ver isso antes de continuar`,
      `Por que algumas pessoas em ${niche} crescem rápido e outras não?`,
    ],
    polemica: [
      `Vou dizer uma verdade incômoda sobre ${niche}...`,
      `A maioria dos ${audience} está fazendo ${topic} errado`,
      `Se você acha que ${topic} funciona do jeito que te ensinaram, está se enganando`,
      `${niche} não é para todos — e está tudo bem`,
      `O erro que 90% dos ${audience} cometem em ${topic}`,
    ],
    problema: [
      `Você está struggando com ${topic}? Eu também estava.`,
      `O maior problema de ${audience} em ${niche} não é o que você pensa`,
      `Pare de perder tempo com ${topic} se você não fez isso primeiro`,
      `Se ${topic} não está funcionando, é por causa disso`,
      `O que te impede de crescer em ${niche} (e como resolver)`,
    ],
    beneficio: [
      `Imagine transformar ${topic} em resultados reais em 7 dias`,
      `Se você é ${audience}, isto sobre ${topic} vai mudar seu jogo`,
      `O benefício de dominar ${topic} que ninguém te mostrou`,
      `Como ${topic} pode te ajudar a ${goal.toLowerCase()} mais rápido`,
      `${audience}: o que acontece quando você aplica ${topic} corretamente`,
    ],
    historia: [
      `Há 6 meses eu não sabia nada sobre ${topic}. Hoje é diferente.`,
      `Quando eu comecei em ${niche}, cometi um erro que custou caro...`,
      `Era um ${audience} comum até descobrir isso sobre ${topic}`,
      `A história de como ${topic} mudou meu negócio em ${niche}`,
      `Eu quase desisti de ${niche}. Foi isso que me fez continuar.`,
    ],
    autoridade: [
      `Depois de anos em ${niche}, posso afirmar: ${topic} é o que separa os melhores`,
      `Se você quer ser referência como ${audience}, precisa dominar ${topic}`,
      `Aqui vai o que eu aprendi sobre ${topic} em ${niche} que separa profissionais de iniciantes`,
      `${audience} de sucesso fazem isso com ${topic} — e você também deveria`,
      `O que os melhores em ${niche} sabem sobre ${topic} que você ainda não sabe`,
    ],
    urgencia: [
      `Se você é ${audience}, pare tudo e veja isso sobre ${topic} agora`,
      `A janela para aproveitar ${topic} em ${niche} está fechando`,
      `Não espere para começar com ${topic} — cada dia conta`,
      `Se você não fizer isso sobre ${topic} hoje, seu concorrente vai fazer`,
      `${audience}: o melhor momento para ${topic} era ontem. O segundo melhor é agora.`,
    ],
  };
}

async function callAIProvider(req: HookRequest, apiKey: string): Promise<GeneratedHooks> {
  const prompt = `Você é um especialista em marketing digital para TikTok focado no mercado de Moçambique.
Gere hooks (ganchos) para vídeos de TikTok com base nestas informações:

Nicho: ${req.niche}
Tema do vídeo: ${req.topic}
Público-alvo: ${req.audience}
Objetivo: ${req.goal}

Gere 5 hooks para cada uma destas categorias:
- curiosidade
- polemica
- problema
- beneficio
- historia
- autoridade
- urgencia

Responda em JSON com exatamente estas chaves, cada uma contendo um array de 5 strings:
{
  "curiosidade": [...],
  "polemica": [...],
  "problema": [...],
  "beneficio": [...],
  "historia": [...],
  "autoridade": [...],
  "urgencia": [...]
}

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
  const parsed = JSON.parse(data.choices[0].message.content);

  const categories: (keyof GeneratedHooks)[] = [
    "curiosidade", "polemica", "problema", "beneficio", "historia", "autoridade", "urgencia",
  ];

  const result: GeneratedHooks = {
    curiosidade: [], polemica: [], problema: [], beneficio: [], historia: [], autoridade: [], urgencia: [],
  };

  for (const cat of categories) {
    if (Array.isArray(parsed[cat])) {
      result[cat] = parsed[cat].slice(0, 5).map((s: unknown) => String(s));
    }
  }

  return result;
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: limitCheck, error: limitError } = await supabase.rpc("check_hook_generation_allowed");

    if (limitError) {
      return new Response(
        JSON.stringify({ error: "Erro ao verificar limite de uso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const check = limitCheck?.[0];
    if (!check?.allowed) {
      return new Response(
        JSON.stringify({
          error: "Você atingiu o limite de gerações de hooks do seu plano. Faça upgrade para continuar.",
          limit_reached: true,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: HookRequest = await req.json();

    if (!body.topic || body.topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Informe o tema do vídeo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (body.topic.length > 200) {
      return new Response(
        JSON.stringify({ error: "Texto muito longo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiApiKey = Deno.env.get("AI_API_KEY");
    let hooks: GeneratedHooks;

    if (aiApiKey) {
      try {
        hooks = await callAIProvider(body, aiApiKey);
      } catch {
        hooks = generateMockHooks(body);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      hooks = generateMockHooks(body);
    }

    return new Response(
      JSON.stringify({
        ...hooks,
        remaining: check.remaining,
        is_admin: check.is_admin_user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Não foi possível gerar os hooks agora. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
