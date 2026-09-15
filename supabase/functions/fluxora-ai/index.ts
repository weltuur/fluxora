import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

Deno.serve(async (req) => {
 if (req.method === 'OPTIONS') {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
} 

  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado.' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase ausente.');
    }

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada.');
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Sessão inválida ou expirada.' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body = await req.json();

    const messages: Message[] = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma mensagem foi enviada.' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const contents = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: message.text,
        },
      ],
    }));

    const systemInstruction = {
      parts: [
        {
          text: `Você é o Fluxora AI, um assistente inteligente especializado em vendas, marketing digital e estratégia para pequenos negócios.

Seu objetivo é ajudar o usuário a vender mais, principalmente através do TikTok, WhatsApp, Instagram e outros canais digitais.

Você deve:
- Entender o contexto da conversa antes de responder.
- Manter continuidade entre as mensagens.
- Fazer perguntas quando faltar informação importante.
- Dar respostas práticas e específicas, evitando respostas genéricas.
- Adaptar suas sugestões ao produto, público, objetivo e situação mencionados pelo usuário.
- Ajudar com estratégia de vendas, ofertas, conteúdo, posicionamento, leads, conversão e atendimento.
- Quando fizer sentido, apresentar passos claros e exemplos.
- Não repetir a mesma resposta apenas porque o usuário fez uma pergunta semelhante.
- Responder em português.
- Usar linguagem simples, natural e profissional.
- Não inventar informações sobre o negócio do usuário.
- Se o usuário já forneceu uma informação anteriormente na conversa, use essa informação em vez de perguntar novamente.

Você é diferente do Gerador de Conteúdo, do Gerador de Hooks e do Assistente X1. Sua função principal é atuar como um consultor geral de vendas e estratégia.`,
        },
      ],
    };
console.log('Fluxora AI: iniciando chamada ao Gemini');

const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 30000);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction,
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );
clearTimeout(timeout);

console.log('Fluxora AI: Gemini respondeu', response.status);
    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);

      return new Response(
        JSON.stringify({
          error: 'Não foi possível obter uma resposta da IA.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || '')
        .join('') || '';

    if (!text) {
      throw new Error('A IA não retornou uma resposta.');
    }

    return new Response(
      JSON.stringify({
        response: text,
        user_id: user.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Fluxora AI error:', error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Erro interno do servidor.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});