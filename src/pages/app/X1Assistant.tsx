import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  History,
  Loader2,
  Lock,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  analyzeConversation,
  getHistory,
  saveConversation,
  X1LimitReachedError,
} from '@/services/x1Service';
import { cn } from '@/lib/utils';
import type { X1Analysis, X1Conversation, X1ConversationInput } from '@/types/database';

const goals = [
  'Primeiro contato',
  'Descobrir interesse',
  'Responder pergunta',
  'Superar objeção',
  'Apresentar oferta',
  'Enviar checkout',
  'Recuperar cliente',
  'Fechar venda',
];

const tones = ['Natural', 'Amigável', 'Profissional', 'Persuasivo', 'Direto', 'Casual'];
const selectClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all';

function CopyButton({ text, id, copied, onCopy }: { text: string; id: string; copied: string | null; onCopy: (text: string, id: string) => void }) {
  const isCopied = copied === id;
  return (
    <button
      type="button"
      onClick={() => onCopy(text, id)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-[0.98]',
        isCopied ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
      )}
    >
      {isCopied ? <Check size={14} /> : <Copy size={14} />}
      {isCopied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}

function ResultBlock({ title, text, action, copied, onCopy }: { title: string; text: string; action?: string; copied: string | null; onCopy: (text: string, id: string) => void }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {action && <CopyButton text={text} id={action} copied={copied} onCopy={onCopy} />}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{text}</p>
    </Card>
  );
}

export function X1Assistant() {
  const [form, setForm] = useState<X1ConversationInput>({ conversationText: '', product: '', goal: goals[0], tone: tones[0] });
  const [analysis, setAnalysis] = useState<X1Analysis | null>(null);
  const [history, setHistory] = useState<X1Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false); 
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  async function loadHistory() {
    setHistoryLoading(true);
    setHistory(await getHistory());
    setHistoryLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleAnalyze(event: FormEvent) {
    event.preventDefault();
    if (!form.conversationText.trim()) {
      setError('Cole uma conversa para analisar.');
      return;
    }

    setError('');
    setLimitReached(false);
    setSubscriptionRequired(false);
    setAnalyzing(true);
    setSaved(false);
    try {
      const result = await analyzeConversation({ ...form, conversationText: form.conversationText.trim() });
      setAnalysis(result);
 setShowResults(true);

const savedConversation = await saveConversation(form, result);

if (savedConversation) {
  setSaved(true);
  await loadHistory();
} else {
  setError('A análise foi concluída, mas não foi possível salvar no histórico.');
}

 } catch (err) {

  if (err instanceof X1LimitReachedError) {

    setLimitReached(true);

    console.log('X1 subscriptionRequired:', err.subscriptionRequired);

    setSubscriptionRequired(err.subscriptionRequired);

    setError(err.message);

  } else {

    setError(
      err instanceof Error
        ? err.message
        : 'Não foi possível analisar agora.'
    );

  }

} finally {

  setAnalyzing(false);

}

}
  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function showConversation(item: X1Conversation) {
    setForm({ conversationText: item.conversation_text, product: item.product || '', goal: item.goal, tone: item.tone });
    setAnalysis({
      interestLevel: item.interestLevel,
      conversationStage: item.conversationStage,
      objection: item.objection,
      diagnosis: item.diagnosis,
      recommendation: item.recommendation,
      suggestedReply: item.suggestedReply,
      alternativeReplyNatural: item.alternativeReplyNatural,
      alternativeReplyPersuasive: item.alternativeReplyPersuasive,
      alternativeReplyShort: item.alternativeReplyShort,
      nextStep: item.nextStep,
    });
    setShowHistory(false);
    setShowResults(true);
  }

  async function handleSave() {
    if (!analysis) return;
    setSaving(true);
    const savedConversation = await saveConversation(form, analysis);
    setSaving(false);
    if (savedConversation) {
      setSaved(true);
      await loadHistory();
    } else {
      setError('Não foi possível salvar a conversa. Tente novamente.');
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <MessageCircle size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Assistente X1</h1>
            <p className="text-sm text-slate-500 mt-0.5">Transforme conversas com potenciais clientes em oportunidades de venda.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <History size={16} />
          Histórico
        </button>
      </div>

      {limitReached && (
        <Card className="p-5 mb-5 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Lock size={22} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
             <h2 className="font-semibold text-slate-900 mb-1">
  {subscriptionRequired
    ? 'Recurso disponível para assinantes'
    : 'Limite de análises atingido'}
</h2>
              <p className="text-sm text-slate-600 mb-3">{error}</p>
              <a href="/app/assinatura" className="inline-flex rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">Fazer upgrade</a>
            </div>
          </div>
        </Card>
      )}
      {error && !limitReached && (
        <Card className="p-4 mb-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-2.5"><AlertCircle size={19} className="text-red-500" /><span className="text-sm text-red-700">{error}</span></div>
        </Card>
      )}

      {showHistory ? (
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="text-lg font-semibold text-slate-900">Histórico</h2><p className="text-sm text-slate-500 mt-1">Suas últimas análises de conversa.</p></div>
            <button type="button" onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-700"><ArrowLeft size={20} /></button>
          </div>
          {historyLoading ? <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-teal-500" /></div> : history.length === 0 ? <p className="text-sm text-slate-500 py-8 text-center">Nenhuma análise salva ainda.</p> : <div className="space-y-3">{history.map((item) => <button type="button" key={item.id} onClick={() => showConversation(item)} className="w-full rounded-xl border border-slate-200 p-4 text-left hover:border-teal-300 hover:bg-teal-50/30 transition-colors"><div className="flex items-start justify-between gap-3"><p className="text-sm text-slate-700 line-clamp-2">{item.conversation_text}</p><Clock3 size={16} className="shrink-0 text-slate-400" /></div><div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500"><span>{item.interestLevel}</span><span>·</span><span>{item.conversationStage}</span><span>·</span><span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span></div></button>)}</div>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className={cn('lg:col-span-2', showResults && 'hidden lg:block')}>
            <Card className="p-5 sm:p-6">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Conversa com o cliente</label>
                  <textarea value={form.conversationText} onChange={(event) => setForm({ ...form, conversationText: event.target.value })} placeholder="Cole aqui a conversa que você teve com o cliente..." rows={10} required className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all" />
                </div>
                <Input label="Produto/serviço (opcional)" placeholder="Ex: Curso de vendas online" value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} />
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Objetivo da conversa</label><select value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} className={selectClass}>{goals.map((option) => <option key={option}>{option}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tom da resposta</label><select value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value })} className={selectClass}>{tones.map((option) => <option key={option}>{option}</option>)}</select></div>
                <Button type="submit" fullWidth size="lg" disabled={analyzing || !form.conversationText.trim()}>{analyzing ? <><Loader2 size={18} className="animate-spin" />Analisando conversa...</> : <><Sparkles size={18} />Analisar conversa</>}</Button>
              </form>
            </Card>
          </div>

          <div className={cn('lg:col-span-3', !showResults && 'hidden lg:block')}>
            {analyzing ? <Card className="p-12 text-center h-full flex flex-col items-center justify-center"><Loader2 size={40} className="animate-spin text-teal-500 mb-4" /><h2 className="text-lg font-semibold text-slate-900">Analisando conversa...</h2><p className="text-sm text-slate-500 mt-1">Aguarde alguns segundos.</p></Card> : !analysis ? <Card className="p-12 text-center h-full flex flex-col items-center justify-center"><MessageCircle size={38} className="text-slate-300 mb-4" /><h2 className="text-lg font-semibold text-slate-900 mb-2">Sua análise aparecerá aqui</h2><p className="text-sm text-slate-500 max-w-xs">Cole uma conversa e escolha o objetivo para receber uma orientação prática.</p></Card> : <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5"><button type="button" onClick={() => handleCopy(analysis.suggestedReply, 'suggested')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">{copied === 'suggested' ? <Check size={16} /> : <Copy size={16} />}{copied === 'suggested' ? 'Copiado!' : 'Copiar resposta'}</button><button type="button" onClick={handleSave} disabled={saving || saved} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <History size={16} />}{saved ? 'Salvo!' : 'Salvar análise'}</button><button type="button" onClick={() => setShowResults(false)} className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><ArrowLeft size={16} />Voltar</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Card className="p-4"><p className="text-xs text-slate-500 mb-1">Nível de interesse</p><p className="font-semibold text-slate-900">{analysis.interestLevel}</p></Card><Card className="p-4"><p className="text-xs text-slate-500 mb-1">Etapa da conversa</p><p className="font-semibold text-slate-900">{analysis.conversationStage}</p></Card><Card className="p-4"><p className="text-xs text-slate-500 mb-1">Objeção</p><p className="font-semibold text-slate-900">{analysis.objection}</p></Card></div>
              <ResultBlock title="Diagnóstico" text={analysis.diagnosis} copied={copied} onCopy={handleCopy} /><ResultBlock title="Recomendação" text={analysis.recommendation} copied={copied} onCopy={handleCopy} /><ResultBlock title="Resposta sugerida" text={analysis.suggestedReply} action="suggested-block" copied={copied} onCopy={handleCopy} /><ResultBlock title="Próximo passo recomendado" text={analysis.nextStep} copied={copied} onCopy={handleCopy} />
              <Card className="p-4 sm:p-5"><h3 className="text-sm font-semibold text-slate-900 mb-3">Alternativas de resposta</h3><div className="space-y-3"><div className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3 mb-1"><p className="text-sm font-medium text-slate-700">Resposta natural</p><CopyButton text={analysis.alternativeReplyNatural} id="natural" copied={copied} onCopy={handleCopy} /></div><p className="text-sm text-slate-600 leading-relaxed">{analysis.alternativeReplyNatural}</p></div><div className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3 mb-1"><p className="text-sm font-medium text-slate-700">Resposta persuasiva</p><CopyButton text={analysis.alternativeReplyPersuasive} id="persuasive" copied={copied} onCopy={handleCopy} /></div><p className="text-sm text-slate-600 leading-relaxed">{analysis.alternativeReplyPersuasive}</p></div><div className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3 mb-1"><p className="text-sm font-medium text-slate-700">Resposta curta</p><CopyButton text={analysis.alternativeReplyShort} id="short" copied={copied} onCopy={handleCopy} /></div><p className="text-sm text-slate-600 leading-relaxed">{analysis.alternativeReplyShort}</p></div></div></Card>
            </div>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
