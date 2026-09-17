import { useEffect, useState, type FormEvent } from 'react';
import {
  PenLine,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Save,
  Trash2,
  X,
  AlertCircle,
  Lock,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  generateContent,
  checkContentLimit,
  saveContent,
  loadContentHistory,
  deleteContent,
  LimitReachedError,
} from '@/services/contentService';
import { formatDate, cn } from '@/lib/utils';
import type { GeneratedContent, ContentGenerationInput, Content, ContentLimitInfo } from '@/types/database';

const goalOptions = [
  'Atrair atenção',
  'Gerar comentários',
  'Gerar seguidores',
  'Gerar leads',
  'Gerar conversas no WhatsApp',
  'Fazer vendas',
  'Educar',
  'Criar autoridade',
];

const styleOptions = [
  'Cinematográfico',
  'Educativo',
  'Storytelling',
  'Direto e persuasivo',
  'Polêmico',
  'Curiosidade',
  'Tutorial',
  'Problema → solução',
  'Prova social',
];

const toneOptions = ['Natural', 'Profissional', 'Amigável', 'Urgente', 'Inspirador', 'Provocador'];
const durationOptions = ['15 segundos', '30 segundos', '45 segundos', '60 segundos'];

interface ContentSectionProps {
  icon: string;
  title: string;
  content: string;
  onCopy: (text: string, section: string) => void;
  copiedSection: string | null;
}

function ContentSection({ icon, title, content, onCopy, copiedSection }: ContentSectionProps) {
  const isCopied = copiedSection === title;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span>{icon}</span>
          {title}
        </h4>
        <button
          onClick={() => onCopy(content, title)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-[0.98]',
            isCopied
              ? 'bg-teal-50 text-teal-600'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          )}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  );
}

export function ContentGenerator() {
  const [form, setForm] = useState<ContentGenerationInput>({
    product: '',
    audience: '',
    niche: '',
    goal: 'Atrair atenção',
    style: 'Direto e persuasivo',
    tone: 'Natural',
    duration: '30 segundos',
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<ContentLimitInfo | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // History
  const [history, setHistory] = useState<Content[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [viewingContent, setViewingContent] = useState<Content | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Show form on desktop, results below; on mobile they stack
  const [showResults, setShowResults] = useState(false);

  async function loadLimit() {
    const info = await checkContentLimit();
    setLimitInfo(info);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const items = await loadContentHistory();
    setHistory(items);
    setHistoryLoading(false);
  }

  useEffect(() => {
    loadLimit();
    loadHistory();
  }, []);

  async function handleGenerate(e?: FormEvent) {
    e?.preventDefault();
    if (!form.product.trim()) {
      setError('Informe o produto ou serviço.');
      return;
    }

    setError('');
    setLimitReached(false);
    setGenerating(true);
    setSaved(false);

    try {
      const content = await generateContent(form);
      setResult(content);
      setShowResults(true);
      await loadLimit();
    } catch (err) {
      if (err instanceof LimitReachedError) {
        setLimitReached(true);
        setError(err.message);
      } else {
        setError('Não foi possível gerar o conteúdo agora. Tente novamente.');
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy(text: string, section: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  function handleCopyAll() {
    if (!result) return;
    const fullText = [
      `GANCHO\n${result.hook}`,
      `TEXTO NA TELA\n${result.on_screen_text}`,
      `NARRAÇÃO\n${result.script}`,
      `CENAS\n${result.visual_structure}`,
      `CTA\n${result.cta}`,
      `LEGENDA\n${result.caption}`,
      `HASHTAGS\n${result.hashtags}`,
    ].join('\n\n--------------------------------\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedSection('all');
    setTimeout(() => setCopiedSection(null), 2500);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    const saved = await saveContent(form, result);
    setSaving(false);
    if (saved) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      loadHistory();
    } else {
      setError('Não foi possível salvar o conteúdo. Tente novamente.');
    }
  }

  async function handleDelete(id: string) {
    const success = await deleteContent(id);
    if (success) {
      setHistory((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      setViewingContent(null);
    }
  }

  const selectClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <PenLine size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gerador de Conteúdo</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Crie conteúdos estratégicos para atrair atenção e transformar visualizações em oportunidades de venda.
            </p>
          </div>
        </div>
      </div>

      {/* Limit banner */}
      {limitInfo && !limitInfo.is_admin_user && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm text-slate-600">
            {limitInfo.allowed ? (
              <>
               <span className="font-semibold text-slate-900">
  {limitInfo.remaining}
</span>{' '}
gerações restantes
<span className="text-slate-400"> de {limitInfo.limit_value}</span>
</>
) : (
  <span className="text-amber-600 font-medium">
    {limitInfo.limit_value === 0
      ? 'Recurso disponível para assinantes'
      : 'Limite de gerações atingido'}
  </span>
)}
</span>
<div className="h-1.5 w-24 rounded-xl bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all"
              style={{
                width: limitInfo.limit_value > 0
                  ? `${(limitInfo.remaining / limitInfo.limit_value) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      )}
      {limitInfo?.is_admin_user && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Sparkles size={16} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-600">Modo Admin — gerações ilimitadas</span>
        </div>
      )}

      {/* Limit reached */}
      {limitReached && (
        <Card className="p-6 mb-5 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Lock size={24} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">
  {limitInfo?.limit_value === 0
    ? 'Recurso disponível para assinantes'
    : 'Limite atingido'}
</h3>
              <p className="text-sm text-slate-600 mb-4">{error}</p>
              <a
                href="/app/assinatura"
                className="inline-flex items-center justify-center rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-all active:scale-[0.98]"
              >
                Fazer upgrade
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && !limitReached && (
        <Card className="p-4 mb-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className={cn('lg:col-span-2', showResults && 'hidden lg:block')}>
          <Card className="p-5 sm:p-6">
            <form onSubmit={handleGenerate} className="space-y-4">
              <Input
                label="Produto ou serviço"
                placeholder="Ex: Ebook sobre como vender no TikTok"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                required
              />
              <Input
                label="Público-alvo"
                placeholder="Ex: jovens que querem começar a vender online"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              />
              <Input
                label="Nicho"
                placeholder="Ex: renda extra, marketing digital"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Objetivo do conteúdo</label>
                <select
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className={selectClass}
                >
                  {goalOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estilo do conteúdo</label>
                <select
                  value={form.style}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                  className={selectClass}
                >
                  {styleOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tom</label>
                <select
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  className={selectClass}
                >
                  {toneOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Duração</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className={selectClass}
                >
                  {durationOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" fullWidth size="lg" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Criando seu conteúdo...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Gerar conteúdo
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results */}
        <div className={cn('lg:col-span-3', !showResults && 'hidden lg:block')}>
          {!result && !generating ? (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-4">
                <PenLine size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Seu conteúdo aparecerá aqui</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Preencha o formulário e clique em "Gerar conteúdo" para criar seu roteiro completo para TikTok.
              </p>
            </Card>
          ) : generating ? (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-teal-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Criando seu conteúdo...</h3>
              <p className="text-sm text-slate-500">Aguarde alguns segundos.</p>
            </Card>
          ) : result ? (
            <div className="space-y-4">
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyAll}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]',
                    copiedSection === 'all'
                      ? 'bg-teal-50 text-teal-600'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  )}
                >
                  {copiedSection === 'all' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedSection === 'all' ? 'Tudo copiado!' : 'Copiar tudo'}
                </button>
                <button
                  onClick={() => handleGenerate()}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Gerar novamente
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]',
                    saved
                      ? 'border-teal-200 bg-teal-50 text-teal-600'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                  {saved ? 'Salvo!' : 'Salvar conteúdo'}
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] ml-auto"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              </div>

              {/* Content sections */}
              <div className="space-y-3">
                <ContentSection icon="🎯" title="Gancho" content={result.hook} onCopy={handleCopy} copiedSection={copiedSection} />
                <ContentSection icon="📝" title="Texto na tela" content={result.on_screen_text} onCopy={handleCopy} copiedSection={copiedSection} />
                <ContentSection icon="🎙️" title="Narração" content={result.script} onCopy={handleCopy} copiedSection={copiedSection} />
                <ContentSection icon="🎬" title="Cenas" content={result.visual_structure} onCopy={handleCopy} copiedSection={copiedSection} />
                <ContentSection icon="🔥" title="CTA" content={result.cta} onCopy={handleCopy} copiedSection={copiedSection} />
                <ContentSection icon="📱" title="Legenda" content={result.caption} onCopy={handleCopy} copiedSection={copiedSection} />
                <ContentSection icon="#️⃣" title="Hashtags" content={result.hashtags} onCopy={handleCopy} copiedSection={copiedSection} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* History */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Meus conteúdos</h2>

        {historyLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-teal-500" />
          </div>
        ) : history.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-400">Nenhum conteúdo salvo ainda. Gere e salve seu primeiro conteúdo!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => (
              <Card key={item.id} hover className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate text-sm">{item.product}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(item.created_at)}</p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.goal && (
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">{item.goal}</span>
                  )}
                  {item.style && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item.style}</span>
                  )}
                </div>
                {item.hook && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.hook}</p>
                )}
                <button
                  onClick={() => setViewingContent(item)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  <Eye size={14} />
                  Visualizar
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View content modal */}
      {viewingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setViewingContent(null)}
          />
          <Card className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 truncate">{viewingContent.product}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(viewingContent.created_at)}</p>
              </div>
              <button
                onClick={() => setViewingContent(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {viewingContent.hook && (
                <ContentSection icon="🎯" title="Gancho" content={viewingContent.hook} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
              {viewingContent.on_screen_text && (
                <ContentSection icon="📝" title="Texto na tela" content={viewingContent.on_screen_text} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
              {viewingContent.script && (
                <ContentSection icon="🎙️" title="Narração" content={viewingContent.script} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
              {viewingContent.visual_structure && (
                <ContentSection icon="🎬" title="Cenas" content={viewingContent.visual_structure} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
              {viewingContent.cta && (
                <ContentSection icon="🔥" title="CTA" content={viewingContent.cta} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
              {viewingContent.caption && (
                <ContentSection icon="📱" title="Legenda" content={viewingContent.caption} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
              {viewingContent.hashtags && (
                <ContentSection icon="#️⃣" title="Hashtags" content={viewingContent.hashtags} onCopy={handleCopy} copiedSection={copiedSection} />
              )}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(viewingContent.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all active:scale-[0.98]"
              >
                <Trash2 size={16} />
                Excluir conteúdo
              </button>
              <button
                onClick={() => setViewingContent(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Fechar
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <Card className="relative w-full max-w-sm p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Excluir conteúdo?</h3>
            <p className="text-sm text-slate-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-all active:scale-[0.98]"
              >
                Excluir
              </button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
