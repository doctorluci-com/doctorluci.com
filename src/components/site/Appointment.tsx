import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SLOTS = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "12:00", available: false },
  { time: "13:00", available: true },
];

export function Appointment() {
  const { t } = useTranslation();
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) {
      toast.error(t("appointment.pickTime"));
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slot }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Appointment submission error:", err.error);
        throw new Error(err.error || "error");
      }
      toast.success(t("appointment.success"));
      setForm({ name: "", phone: "", email: "", message: "" });
      setSlot(null);
    } catch {
      toast.error(t("appointment.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="appointment" className="relative bg-secondary/40 py-20 md:py-28" aria-label="Appointment">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("appointment.eyebrow")}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl">
            {t("appointment.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            {t("appointment.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" />
                {t("appointment.selectTime")}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {SLOTS.map((s) => {
                  const active = slot === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSlot(s.time)}
                      aria-label={`${s.time} ${s.available ? t("appointment.available") : t("appointment.unavailable")}`}
                      className={cn(
                        "rounded-full border px-3 py-2.5 text-sm font-semibold transition-all",
                        !s.available && "cursor-not-allowed border-border/50 bg-muted text-muted-foreground line-through",
                        s.available && !active && "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
                        active && "border-primary bg-primary text-primary-foreground shadow-sm"
                      )}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />{t("appointment.available")}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />{t("appointment.unavailable")}</span>
              </div>
              {slot && (
                <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                  {t("appointment.selected")}: <strong>{slot}</strong>
                </p>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-3">
            <div className="grid gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  required
                  placeholder={t("appointment.name")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 bg-background"
                />
                <Input
                  required
                  placeholder={t("appointment.phone")}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-12 bg-background"
                />
              </div>
              <Input
                required
                type="email"
                placeholder={t("appointment.email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 bg-background"
              />
              <Textarea
                placeholder={t("appointment.message")}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="min-h-32 bg-background"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("appointment.submit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}