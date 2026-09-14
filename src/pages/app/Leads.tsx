import { useEffect, useState, type FormEvent } from 'react';
import { Users, Plus, X, Trash2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/database';

const statusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  conversando: 'Conversando',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

const statusColors: Record<LeadStatus, string> = {
  novo: 'bg-blue-100 text-blue-700',
  contatado: 'bg-amber-100 text-amber-700',
  conversando: 'bg-purple-100 text-purple-700',
  ganho: 'bg-green-100 text-green-700',
  perdido: 'bg-red-100 text-red-700',
};

const platforms = ['TikTok', 'WhatsApp', 'Instagram', 'Facebook', 'Outros'];
const statuses = Object.keys(statusLabels) as LeadStatus[];

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('WhatsApp');
  const [notes, setNotes] = useState('');
  const [potentialValue, setPotentialValue] = useState('');

  async function loadLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    await supabase.from('leads').insert({
      name: name.trim(),
      username: username.trim() || null,
      platform,
      notes: notes.trim() || null,
      potential_value: parseFloat(potentialValue) || 0,
    });

    setSubmitting(false);
    setShowForm(false);
    setName('');
    setUsername('');
    setNotes('');
    setPotentialValue('');
    loadLeads();
  }

  async function updateStatus(id: string, status: LeadStatus) {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function deleteLead(id: string) {
    await supabase.from('leads').delete().eq('id', id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Meus Leads</h1>
          <p className="mt-1 text-slate-500">Acompanhe cada potencial comprador</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={18} />
          Adicionar
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <Card className="relative w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Adicionar Lead</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do lead" required />
              <Input label="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@usuario (opcional)" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Plataforma</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Valor potencial (MT)"
                type="number"
                value={potentialValue}
                onChange={(e) => setPotentialValue(e.target.value)}
                placeholder="0"
                min="0"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre o lead..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                />
              </div>
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Lead'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Leads list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-500" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-4">
            <Users size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Nenhum lead ainda</h2>
          <p className="text-sm text-slate-500 mb-5">Comece adicionando seu primeiro potencial cliente.</p>
          <Button onClick={() => setShowForm(true)} size="md">
            <Plus size={18} />
            Adicionar Lead
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-4 sm:p-5" hover>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{lead.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {lead.platform && <span>{lead.platform}</span>}
                      {lead.username && <span>· {lead.username}</span>}
                      {lead.potential_value > 0 && <span>· {formatCurrency(lead.potential_value)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold border-0 cursor-pointer transition-colors',
                      statusColors[lead.status]
                    )}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {formatDate(lead.created_at)}
                  </span>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {lead.notes && (
                <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{lead.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
