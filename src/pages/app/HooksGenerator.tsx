import { useEffect, useState, type FormEvent } from 'react';
import {
  Anchor,
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
  Flame,
  HelpCircle,
  AlertTriangle,
  Target,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  generateHooks,
  checkHookLimit,
  saveHooks,
  loadHookHistory,
  deleteHook,
  HookLimitReachedError,
} from '@/services/hookService';
import { formatDate, cn } from '@/lib/utils';
import type { GeneratedHooks, HookGenerationInput, Hook, HookLimitInfo } from '@/types/database';

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

const categoryMeta: Record<string, { icon: typeof Flame; label: string; color: string }> = {
  curiosidade: { icon: HelpCircle, label: 'Curiosidade', color: 'bg-blue-50 text-blue-600' },
  polemica: { icon: Flame, label: 'Polêmica', color: 'bg-orange-50 text-orange-600' },
  problema: { icon: AlertTriangle, label: 'Problema', color: 'bg-red-50 text-red-600' },
  beneficio: { icon: Target, label: 'Benefício', color: 'bg-green-50 text-green-600' },
  historia: { icon: BookOpen, label: 'História', color: 'bg-purple-50 text-purple-600' },
  autoridade: { icon: Award, label: 'Autoridade', color: 'bg-amber-50 text-amber-600' },
  urgencia: { icon: Zap, label: 'Urgência', color: 'bg-pink-50 text-pink-600' },
};

const categoryOrder = ['curiosidade', 'polemica', 'problema', 'beneficio', 'historia', 'autoridade', 'urgencia'];

export function HooksGenerator() {
  const [form, setForm] = useState<HookGenerationInput>({
    niche: '',
    topic: '',
    audience: '',
    goal: 'Atrair atenção',
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedHooks | null>(null);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<HookLimitInfo | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState<Hook[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [viewingHook, setViewingHook] = useState<Hook | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  async function loadLimit() {
    const info = await checkHookLimit();
    setLimitInfo(info);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const items = await loadHookHistory();
    setHistory(items);
    setHistoryLoading(false);
  }

  useEffect(() => {
    loadLimit();
    loadHistory();
  }, []);

  async function handleGenerate(e?: FormEvent) {
    e?.preventDefault();
    if (!form.topic.trim()) {
      setError('Informe o tema do vídeo.');
      return;
    }

    setError('');
    setLimitReached(false);
    setGenerating(true);
    setSaved(false);

    try {
      const hooks = await generateHooks(form);
      setResult(hooks);
      setShowResults(true);
      await loadLimit();
    } catch (err) {
      if (err instanceof HookLimitReachedError) {
        setLimitReached(true);
        setError(err.message);
      } else {
        setError('Não foi possível gerar os hooks agora. Tente novamente.');
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  }

  function handleCopyAll() {
    if (!result) return;
    const parts: string[] = [];
    for (const cat of categoryOrder) {
      const meta = categoryMeta[cat];
      const hooks = result[cat as keyof GeneratedHooks] as string[];
      if (hooks?.length) {
        parts.push(`${meta.label.toUpperCase()}\n${hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}`);
      }
    }
    navigator.clipboard.writeText(parts.join('\n\n--------------------------------\n\n'));
    setCopiedItem('all');
    setTimeout(() => setCopiedItem(null), 2500);
  }

  function handleCopyCategory(cat: string) {
    if (!result) return;
    const hooks = result[cat as keyof GeneratedHooks] as string[];
    const meta = categoryMeta[cat];
    const text = hooks.map((h, i) => `${i + 1}. ${h}`).join('\n');
    navigator.clipboard.writeText(`${meta.label}\n${text}`);
    setCopiedItem(`cat-${cat}`);
    setTimeout(() => setCopiedItem(null), 2000);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    const savedHook = await saveHooks(form, result);
    setSaving(false);
    if (savedHook) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      loadHistory();
    } else {
      setError('Não foi possível salvar os hooks. Tente novamente.');
    }
  }

  async function handleDelete(id: string) {
    const success = await deleteHook(id);
    if (success) {
      setHistory((prev) => prev.filter((h) => h.id !== id));
      setDeleteConfirm(null);
      setViewingHook(null);
    }
  }

  const selectClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Anchor size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gerador de Hooks</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Crie ganchos que prendem a atenção nos primeiros segundos do seu vídeo.
            </p>
          </div>
        </div>
      </div>

      {limitInfo && !limitInfo.is_admin_user && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm text-slate-600">
            {limitInfo.allowed ? (
              <>
                <span className="font-semibold text-slate-900">{limitInfo.remaining}</span> gerações restantes
                <span className="text-slate-400"> de {limitInfo.limit_value}</span>
              </>
            ) : (
              <span className="text-amber-600 font-medium">Limite de gerações atingido</span>
            )}
          </span>
          <div className="h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden">
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

      {limitReached && (
        <Card className="p-6 mb-5 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Lock size={24} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Limite atingido</h3>
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

      {error && !limitReached && (
        <Card className="p-4 mb-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className={cn('lg:col-span-2', showResults && 'hidden lg:block')}>
          <Card className="p-5 sm:p-6">
            <form onSubmit={handleGenerate} className="space-y-4">
              <Input
                label="Nicho"
                placeholder="Ex: renda extra, marketing digital"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
              <Input
                label="Tema do vídeo"
                placeholder="Ex: como vender pelo TikTok"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                required
              />
              <Input
                label="Público-alvo"
                placeholder="Ex: jovens que querem começar a vender online"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Objetivo do vídeo</label>
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
              <Button type="submit" fullWidth size="lg" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Criando seus hooks...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Gerar hooks
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className={cn('lg:col-span-3', !showResults && 'hidden lg:block')}>
          {!result && !generating ? (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-4">
                <Anchor size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Seus hooks aparecerão aqui</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Preencha o formulário e clique em "Gerar hooks" para criar ganchos organizados por categoria.
              </p>
            </Card>
          ) : generating ? (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-teal-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Criando seus hooks...</h3>
              <p className="text-sm text-slate-500">Aguarde alguns segundos.</p>
            </Card>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyAll}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]',
                    copiedItem === 'all'
                      ? 'bg-teal-50 text-teal-600'
                      : 'bg-slate-900 text-white hover:bg-slate-800',
                  )}
                >
                  {copiedItem === 'all' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedItem === 'all' ? 'Tudo copiado!' : 'Copiar tudo'}
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
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                  {saved ? 'Salvo!' : 'Salvar hooks'}
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] ml-auto"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              </div>

              <div className="space-y-3">
                {categoryOrder.map((cat) => {
                  const meta = categoryMeta[cat];
                  const hooks = result[cat as keyof GeneratedHooks] as string[];
                  if (!hooks?.length) return null;
                  const Icon = meta.icon;
                  const catCopied = copiedItem === `cat-${cat}`;
                  return (
                    <div key={cat} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', meta.color)}>
                            <Icon size={15} />
                          </span>
                          {meta.label}
                        </h4>
                        <button
                          onClick={() => handleCopyCategory(cat)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-[0.98]',
                            catCopied
                              ? 'bg-teal-50 text-teal-600'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                          )}
                        >
                          {catCopied ? <Check size={14} /> : <Copy size={14} />}
                          {catCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {hooks.map((hook, i) => {
                          const itemCopied = copiedItem === `${cat}-${i}`;
                          return (
                            <div
                              key={i}
                              className="group flex items-start gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition-colors"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                                {i + 1}
                              </span>
                              <p className="flex-1 text-sm text-slate-700 leading-relaxed">{hook}</p>
                              <button
                                onClick={() => handleCopy(hook, `${cat}-${i}`)}
                                className={cn(
                                  'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                                  itemCopied ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600',
                                )}
                              >
                                {itemCopied ? <Check size={15} /> : <Copy size={15} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Meus hooks salvos</h2>

        {historyLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-teal-500" />
          </div>
        ) : history.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-400">Nenhum hook salvo ainda. Gere e salve seus primeiros hooks!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => {
              const totalHooks = Object.values(item.hooks || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
              return (
                <Card key={item.id} hover className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate text-sm">{item.topic || 'Sem tema'}</p>
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
                    {item.niche && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item.niche}</span>
                    )}
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {totalHooks} hooks
                    </span>
                  </div>
                  {item.hooks?.curiosidade?.[0] && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.hooks.curiosidade[0]}</p>
                  )}
                  <button
                    onClick={() => setViewingHook(item)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    <Eye size={14} />
                    Visualizar
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {viewingHook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingHook(null)} />
          <Card className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 truncate">{viewingHook.topic || 'Hooks'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(viewingHook.created_at)}</p>
              </div>
              <button
                onClick={() => setViewingHook(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {categoryOrder.map((cat) => {
                const meta = categoryMeta[cat];
                const hooks = viewingHook.hooks?.[cat];
                if (!hooks?.length) return null;
                const Icon = meta.icon;
                return (
                  <div key={cat} className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                      <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', meta.color)}>
                        <Icon size={15} />
                      </span>
                      {meta.label}
                    </h4>
                    <div className="space-y-2">
                      {hooks.map((hook, i) => (
                        <div key={i} className="group flex items-start gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition-colors">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                            {i + 1}
                          </span>
                          <p className="flex-1 text-sm text-slate-700 leading-relaxed">{hook}</p>
                          <button
                            onClick={() => handleCopy(hook, `view-${cat}-${i}`)}
                            className={cn(
                              'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                              copiedItem === `view-${cat}-${i}` ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600',
                            )}
                          >
                            {copiedItem === `view-${cat}-${i}` ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(viewingHook.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all active:scale-[0.98]"
              >
                <Trash2 size={16} />
                Excluir hooks
              </button>
              <button
                onClick={() => setViewingHook(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Fechar
              </button>
            </div>
          </Card>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <Card className="relative w-full max-w-sm p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Excluir hooks?</h3>
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
