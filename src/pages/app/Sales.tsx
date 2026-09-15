import { useEffect, useState, type FormEvent } from 'react';
import { ShoppingCart, Plus, X, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale, Product, Lead } from '@/types/database';

export function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('TikTok');
  const [productId, setProductId] = useState('');
  const [leadId, setLeadId] = useState('');

  const sources = ['TikTok', 'WhatsApp', 'Instagram', 'Facebook', 'Outros'];

  async function loadData() {
    const [salesRes, productsRes, leadsRes] = await Promise.all([
      supabase.from('sales').select('*, product:products(*)').order('sold_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
    ]);
    setSales((salesRes.data as Sale[]) ?? []);
    setProducts((productsRes.data as Product[]) ?? []);
    setLeads((leadsRes.data as Lead[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  if (!user) {
    window.alert('Sua sessão expirou. Faça login novamente.');
    return;
  }

  setSubmitting(true);

  const { error } = await supabase.from('sales').insert({
    user_id: user.id,
    amount: parseFloat(amount) || 0,
    source,
    product_id: productId || null,
    lead_id: leadId || null,
  });

  if (error) {
    console.error('Erro ao registrar venda:', error);
    window.alert(`Não foi possível registrar a venda: ${error.message}`);
    setSubmitting(false);
    return;
  }

  setSubmitting(false);
  setShowForm(false);
  setAmount('');
  loadData();
}

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Vendas</h1>
          <p className="mt-1 text-slate-500">
            Total: <span className="font-semibold text-slate-700">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={18} />
          Registrar venda
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <Card className="relative w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Registrar Venda</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Valor (MT)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Origem</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                >
                  {sources.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {products.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Produto (opcional)</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                  >
                    <option value="">Nenhum</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {leads.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead (opcional)</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                  >
                    <option value="">Nenhum</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Registrar venda'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-500" />
        </div>
      ) : sales.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-4">
            <ShoppingCart size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Nenhuma venda ainda</h2>
          <p className="text-sm text-slate-500 mb-5">Registre sua primeira venda para acompanhar sua receita.</p>
          <Button onClick={() => setShowForm(true)} size="md">
            <Plus size={18} />
            Registrar venda
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <Card key={sale.id} className="p-4 sm:p-5" hover>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <ShoppingCart size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {sale.product?.name || 'Venda'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {sale.source && <span>{sale.source}</span>}
                      <span>· {formatDate(sale.sold_at)}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-green-600 shrink-0">
                  {formatCurrency(Number(sale.amount))}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
