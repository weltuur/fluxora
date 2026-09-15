import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { BusinessType, SellingChannel, Goal } from '@/types/database';

const businessTypes: BusinessType[] = ['Produto digital', 'Produto físico', 'Serviço', 'Afiliado', 'Outro'];
const channels: SellingChannel[] = ['TikTok', 'WhatsApp', 'Instagram', 'Facebook', 'Outros'];
const goals: Goal[] = [
  'Fazer minha primeira venda',
  'Conseguir mais leads',
  'Aumentar minhas vendas',
  'Organizar meus clientes',
];

export function Onboarding() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<SellingChannel[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;
  const canProceed = step === 0 ? !!businessType : step === 1 ? selectedChannels.length > 0 : !!goal;

  function toggleChannel(ch: SellingChannel) {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  async function handleFinish() {
    if (!businessType || !goal) return;
    setLoading(true);
    const { error } = await updateProfile({
      business_type: businessType,
      selling_channels: selectedChannels,
      goal,
      onboarding_completed: true,
    });
    setLoading(false);

if (error) {
  console.error('Erro ao finalizar onboarding:', error);
  return;
}

navigate('/app');
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 py-5 border-b border-slate-200 bg-white">
        <Logo size="md" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-300',
                  i <= step ? 'bg-teal-500' : 'bg-slate-200'
                )}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Step 1: O que você vende? */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">O que você vende?</h2>
                <p className="text-sm text-slate-500 mb-6">Escolha a opção que melhor descreve seu negócio.</p>
                <div className="space-y-2.5">
                  {businessTypes.map((bt) => (
                    <button
                      key={bt}
                      onClick={() => setBusinessType(bt)}
                      className={cn(
                        'flex items-center justify-between w-full rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.99]',
                        businessType === bt
                          ? 'border-teal-500 bg-teal-50 text-teal-900'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <span className="font-medium">{bt}</span>
                      {businessType === bt && <Check size={20} className="text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Onde você vende? */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Onde você vende?</h2>
                <p className="text-sm text-slate-500 mb-6">Selecione todas as plataformas que você usa.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {channels.map((ch) => {
                    const selected = selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.99]',
                          selected
                            ? 'border-teal-500 bg-teal-50 text-teal-900'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <span className="font-medium">{ch}</span>
                        {selected && <Check size={20} className="text-teal-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Qual é seu principal objetivo? */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Qual é seu principal objetivo?</h2>
                <p className="text-sm text-slate-500 mb-6">Vamos personalizar sua experiência.</p>
                <div className="space-y-2.5">
                  {goals.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={cn(
                        'flex items-center justify-between w-full rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.99]',
                        goal === g
                          ? 'border-teal-500 bg-teal-50 text-teal-900'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <span className="font-medium">{g}</span>
                      {goal === g && <Check size={20} className="text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed || loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : step === totalSteps - 1 ? (
                  'Concluir'
                ) : (
                  <>
                    Continuar
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Olá, {profile?.full_name || 'usuário'}! Vamos configurar sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}
