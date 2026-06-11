import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Check, X, Trash2, Phone, Mail, Eye,
  Calendar, Clock, MessageSquare, User,
} from 'lucide-react';
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

/* ─── Helpers ─── */

function formatDate(iso: string | null): string {
  if (!iso) return 'No Date';
  const [y, m, d] = iso.substring(0, 10).split('-');
  return format(new Date(+y, +m - 1, +d), 'MMM do, yyyy');
}

const statusColors: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

/* ─── Detail Sheet / Modal ─── */

function DetailSheet({
  appointment,
  onClose,
  onConfirm,
  onCancel,
  onDelete,
}: {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const apt = appointment;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{apt.name}</h3>
            <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[apt.status]}`}>
              {apt.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <DetailField icon={Calendar} label="Date" value={formatDate(apt.preferredDate)} />
            <DetailField icon={Clock} label="Time" value={apt.slot} />
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <DetailField icon={Phone} label="Phone" value={apt.phone} href={`tel:${apt.phone}`} />
            <DetailField icon={Mail} label="Email" value={apt.email} href={`mailto:${apt.email}`} />
          </div>

          {/* Message */}
          <div className="rounded-xl bg-secondary/50 border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Patient Notes
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {apt.message || '—  No message provided'}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <DetailField icon={User} label="Submitted" value={format(new Date(apt.createdAt), 'MMM do, yyyy HH:mm')} />
            <DetailField icon={Clock} label="Booking ID" value={apt.id.substring(0, 8) + '…'} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 pt-3 border-t border-border flex flex-wrap gap-2">
          {apt.status === 'PENDING' && (
            <>
              <button
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
              <button
                onClick={onCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-muted-foreground rounded-xl text-sm font-semibold hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/60">
      <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
        {href ? (
          <a href={href} className="text-sm font-medium text-primary underline underline-offset-2 break-all">{value}</a>
        ) : (
          <div className="text-sm font-medium text-foreground break-all">{value}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Mobile Card ─── */

function AppointmentCard({
  apt,
  onDetails,
  onConfirm,
  onCancel,
  onDelete,
}: {
  apt: Appointment;
  onDetails: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{apt.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{apt.phone}</div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[apt.status]}`}>
          {apt.status}
        </span>
      </div>

      {/* Date & slot */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-primary font-medium">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(apt.preferredDate)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {apt.slot}
        </span>
      </div>

      {/* Message preview */}
      {apt.message && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-secondary/40 rounded-lg px-3 py-2">
          {apt.message}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
        <button
          onClick={onDetails}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </button>
        {apt.status === 'PENDING' && (
          <>
            <button onClick={onConfirm} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirm">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={onCancel} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */

export function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailApt, setDetailApt] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await api.request('/appointments?limit=100');
      setAppointments(data.items || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.request(`/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Appointment marked as ${status}`);
      setDetailApt(null);
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
      setDetailApt(null);
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-serif text-primary">Appointments</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full font-medium">
          {appointments.length} total
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading…</div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">No appointments found.</div>
      ) : (
        <>
          {/* ── Mobile: Card Layout (< lg) ── */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                onDetails={() => setDetailApt(apt)}
                onConfirm={() => updateStatus(apt.id, 'CONFIRMED')}
                onCancel={() => updateStatus(apt.id, 'CANCELLED')}
                onDelete={() => deleteAppointment(apt.id)}
              />
            ))}
          </div>

          {/* ── Desktop: Table Layout (lg+) ── */}
          <div className="hidden lg:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Patient</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Date &amp; Time</th>
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
                          {formatDate(apt.preferredDate)}
                        </div>
                        <div className="text-muted-foreground">{apt.slot}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[apt.status]}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetailApt(apt)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          {apt.status === 'PENDING' && (
                            <>
                              <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirm">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => deleteAppointment(apt.id)} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Detail Sheet Modal ── */}
      {detailApt && (
        <DetailSheet
          appointment={detailApt}
          onClose={() => setDetailApt(null)}
          onConfirm={() => updateStatus(detailApt.id, 'CONFIRMED')}
          onCancel={() => updateStatus(detailApt.id, 'CANCELLED')}
          onDelete={() => deleteAppointment(detailApt.id)}
        />
      )}
    </div>
  );
}
