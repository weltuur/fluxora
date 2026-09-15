import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, Send, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}


export function FluxoraAI() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    if (!user) {
      window.alert('Sua sessão expirou. Faça login novamente.');
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setQuestion('');
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Sessão não encontrada.');
      }

      const { data, error } = await supabase.functions.invoke('fluxora-ai', {
        body: {
          messages: updatedMessages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        },
      });

      if (error) {
        console.error('Erro ao chamar Fluxora AI:', error);
        throw new Error('Não foi possível conectar à Fluxora AI.');
      }

      if (!data?.response) {
        throw new Error('A IA não retornou uma resposta.');
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.response,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error('Fluxora AI error:', error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Não consegui responder agora. Verifique sua conexão e tente novamente.',
      };

      setMessages((current) => [...current, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([]);
    setQuestion('');
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Sparkles size={24} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Fluxora AI
            </h1>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-50 rounded-full px-2 py-0.5 mt-1">
              <Sparkles size={12} />
              IA
            </span>
          </div>
        </div>

        <p className="mt-3 text-slate-500">
          Sua assistente inteligente para vender online.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Como posso ajudar?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Converse comigo sobre vendas, TikTok, clientes, ofertas ou estratégias.
            </p>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Nova conversa
            </button>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <Sparkles size={28} className="mx-auto mb-3 text-teal-600" />

            <p className="text-sm text-slate-500">
              Faça sua primeira pergunta para começar uma conversa.
            </p>
          </div>
        ) : (
          <div className="mb-6 max-h-[500px] space-y-4 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
                      <Sparkles size={15} className="text-teal-600" />
                      Fluxora AI
                    </div>
                  )}

                  <p className="whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                  Fluxora AI está pensando...
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite sua próxima pergunta..."
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}