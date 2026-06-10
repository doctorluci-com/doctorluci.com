import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Trash2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

type Appointment = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  slot: string;
  preferredDate: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
};

export function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await api.request('/appointments?limit=100');
      setAppointments(data.items || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.request(`/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await api.request(`/appointments/${id}`, { method: 'DELETE' });
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-primary">Appointments</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Patient</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{apt.name}</div>
                      {apt.message && <div className="text-xs text-muted-foreground mt-1 line-clamp-1" title={apt.message}>{apt.message}</div>}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" /> {apt.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" /> {apt.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary">
                        {apt.preferredDate ? format(new Date(apt.preferredDate), 'MMM do, yyyy') : 'No Date'}
                      </div>
                      <div className="text-muted-foreground">{apt.slot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${apt.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
                        ${apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${apt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : ''}
                        ${apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {apt.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirm">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteAppointment(apt.id)} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
