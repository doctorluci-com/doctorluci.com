import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, startOfDay } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import 'react-day-picker/dist/style.css';

type BlockedDay = {
  id: string;
  date: string;
  reason: string | null;
};

export function CalendarSettings() {
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBlockedDays = async () => {
    try {
      const data = await api.request('/blocked-days');
      setBlockedDays(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchBlockedDays();
  }, []);

  const blockDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return toast.error('Select a date first');
    
    setLoading(true);
    try {
      await api.request('/blocked-days', {
        method: 'POST',
        body: JSON.stringify({
          date: startOfDay(selectedDate).toISOString(),
          reason: reason || undefined,
        }),
      });
      toast.success('Day blocked successfully');
      setSelectedDate(undefined);
      setReason('');
      fetchBlockedDays();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unblockDay = async (id: string) => {
    try {
      await api.request(`/blocked-days/${id}`, { method: 'DELETE' });
      toast.success('Day unblocked');
      fetchBlockedDays();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const blockedDates = blockedDays.map(b => new Date(b.date));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-primary">Calendar Settings</h2>
        <p className="text-muted-foreground mt-2">Mark days when you are not working to prevent appointments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ blocked: blockedDates }}
            modifiersStyles={{ blocked: { color: 'red', textDecoration: 'line-through' } }}
            className="border-none"
          />

          {selectedDate && (
            <form onSubmit={blockDay} className="w-full mt-8 space-y-4 max-w-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                <p className="font-medium text-center">
                  Block <span className="text-primary">{format(selectedDate, 'MMM do, yyyy')}</span>
                </p>
                <input
                  type="text"
                  placeholder="Reason (Optional, e.g. Vacation)"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full mt-4 rounded-lg border border-border px-3 py-2 text-sm bg-background"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-all"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 border-b border-border pb-4">Blocked Days List</h3>
          {blockedDays.length === 0 ? (
            <p className="text-muted-foreground text-sm">No blocked days.</p>
          ) : (
            <div className="space-y-3">
              {blockedDays.map(day => (
                <div key={day.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                  <div>
                    <p className="font-medium text-primary">{format(new Date(day.date), 'MMMM do, yyyy')}</p>
                    {day.reason && <p className="text-xs text-muted-foreground mt-1">{day.reason}</p>}
                  </div>
                  <button
                    onClick={() => unblockDay(day.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Unblock"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
