import { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  platform: string | null;
  scheduled_at: string;
  status: string;
  created_at: string;
};

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error(error);
      setEvents([]);
    } else {
      setEvents((data as CalendarEvent[]) || []);
    }

    setLoading(false);
  }

  async function createEvent() {
    if (!title.trim() || !scheduledAt) {
      alert('Preencha o título e a data.');
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Você precisa estar conectado.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim() || null,
        platform,
        scheduled_at: new Date(scheduledAt).toISOString(),
        status: 'scheduled',
      });

    if (error) {
      console.error(error);
      alert('Não foi possível salvar o conteúdo.');
      setSaving(false);
      return;
    }

    setTitle('');
    setContent('');
    setPlatform('TikTok');
    setScheduledAt('');
    setShowForm(false);
    setSaving(false);

    await loadEvents();
  }

  function previousMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function getEventsForDay(day: Date) {
    return events.filter((event) => {
      const eventDate = new Date(event.scheduled_at);

      return (
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate()
      );
    });
  }

  function isToday(day: Date) {
    const today = new Date();

    return (
      today.getFullYear() === day.getFullYear() &&
      today.getMonth() === day.getMonth() &&
      today.getDate() === day.getDate()
    );
  }

  const monthName = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const days = getDaysInMonth();

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Calendário
            </h1>

            <p className="text-sm text-muted-foreground">
              Planeje seus conteúdos e acompanhe seu cronograma.
            </p>
          </div>

          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} />
            Novo conteúdo
          </Button>
        </div>

        {showForm && (
          <Card>
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">
                Novo conteúdo
              </h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-2 hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-4">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Título
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Vídeo sobre renda extra"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Conteúdo / legenda
                </label>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva a legenda ou descreva o conteúdo..."
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Plataforma
                  </label>

                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Data e hora
                  </label>

                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2">

                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>

                <Button
                  onClick={createEvent}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar conteúdo'}
                </Button>

              </div>

            </div>
          </Card>
        )}

        <Card>

          <div className="flex items-center justify-between border-b p-4">

            <Button
              variant="outline"
              onClick={previousMonth}
            >
              <ChevronLeft size={18} />
            </Button>

            <h2 className="text-lg font-semibold capitalize">
              {monthName}
            </h2>

            <Button
              variant="outline"
              onClick={nextMonth}
            >
              <ChevronRight size={18} />
            </Button>

          </div>

          {loading ? (
            <div className="p-8 text-center">
              Carregando calendário...
            </div>
          ) : (

            <div className="overflow-x-auto">

              <div className="min-w-[700px]">

                <div className="grid grid-cols-7 border-b">

                  {weekdays.map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}

                </div>

                <div className="grid grid-cols-7">

                  {days.map((day, index) => {

                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[120px] border-b border-r bg-muted/20"
                        />
                      );
                    }

                    const dayEvents = getEventsForDay(day);

                    return (
                      <div
                        key={day.toISOString()}
                        className="min-h-[120px] border-b border-r p-2"
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                              isToday(day)
                                ? 'bg-primary text-primary-foreground'
                                : ''
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setShowForm(true);

                              const year = day.getFullYear();
                              const month = String(
                                day.getMonth() + 1
                              ).padStart(2, '0');
                              const date = String(
                                day.getDate()
                              ).padStart(2, '0');

                              setScheduledAt(
                                `${year}-${month}-${date}T12:00`
                              );
                            }}
                            className="rounded-md p-1 hover:bg-muted"
                            title="Adicionar conteúdo"
                          >
                            <Plus size={15} />
                          </button>

                        </div>

                        <div className="space-y-1">

                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="rounded-md bg-primary/10 p-2 text-xs"
                            >
                              <div className="font-medium">
                                {event.title}
                              </div>

                              <div className="mt-1 text-muted-foreground">
                                {new Date(
                                  event.scheduled_at
                                ).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          ))}

                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>

            </div>
          )}

        </Card>

      </div>
    </DashboardLayout>
  );
}