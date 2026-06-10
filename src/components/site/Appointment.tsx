import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import { ro, enUS, ru, es } from "date-fns/locale";

const generateTimeSlots = (startH: number, startM: number, endH: number, endM: number, intervalMinutes: number = 20) => {
  const slots = [];
  let h = startH;
  let m = startM;
  
  while (h < endH || (h === endH && m <= endM)) {
    const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    slots.push({
      time: timeString,
      available: true,
    });
    
    m += intervalMinutes;
    while (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return slots;
};

const PHYSICAL_SLOTS = generateTimeSlots(10, 0, 15, 40);
const ONLINE_SLOTS = generateTimeSlots(11, 0, 16, 0, 60);

export function Appointment() {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState<"physical" | "online">("physical");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  import.meta.env.VITE_API_URL; // just reference
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Fetch blocked days on mount
  useEffect(() => {
    fetch(`${apiUrl}/api/availability/blocked-days`)
      .then((res) => res.json())
      .then((data: string[]) => setBlockedDays(data.map(d => new Date(d))))
      .catch((err) => console.error("Failed to fetch blocked days:", err));
  }, [apiUrl]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!date) {
      setBookedSlots([]);
      return;
    }
    const controller = new AbortController();
    fetch(`${apiUrl}/api/availability/booked-slots?date=${format(date, "yyyy-MM-dd")}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: string[]) => setBookedSlots(data))
      .catch((err) => { if (err.name !== 'AbortError') console.error("Failed to fetch slots:", err) });
    return () => controller.abort();
  }, [date, apiUrl]);

  const getLocale = () => {
    switch (i18n.language) {
      case "ro": return ro;
      case "ru": return ru;
      case "es": return es;
      default: return enUS;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error(t("appointment.pickDate", "Please select a date first"));
      return;
    }
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
        body: JSON.stringify({ ...form, slot, preferredDate: date.toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Appointment submission error:", err.error);
        throw new Error(err.error || "error");
      }
      toast.success(t("appointment.success"));
      setForm({ name: "", phone: "", email: "", message: "" });
      setSlot(null);
      setDate(undefined);
    } catch {
      toast.error(t("appointment.error"));
    } finally {
      setLoading(false);
    }
  };

  const renderSlotButton = (s: { time: string; available: boolean }) => {
    const isBooked = bookedSlots.includes(s.time);
    const actuallyAvailable = s.available && !isBooked;
    const active = slot === s.time;
    return (
      <button
        key={s.time}
        type="button"
        disabled={!actuallyAvailable}
        onClick={() => setSlot(s.time)}
        aria-label={`${s.time} ${actuallyAvailable ? t("appointment.available") : t("appointment.unavailable")}`}
        className={cn(
          "rounded-full border px-3 py-2.5 text-sm font-semibold transition-all",
          !actuallyAvailable && "cursor-not-allowed border-border/50 bg-muted text-muted-foreground line-through opacity-50",
          actuallyAvailable && !active && "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
          active && "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
        )}
      >
        {s.time}
      </button>
    );
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

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] h-full flex flex-col">
              <div className="flex bg-muted/50 p-1 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => { 
                    setType("physical"); 
                    setSlot(null); 
                    if (date && ![1, 3, 5].includes(date.getDay())) setDate(undefined);
                  }}
                  className={cn("flex-1 text-sm font-medium py-2 rounded-md transition-all", type === "physical" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {t("appointment.physical")}
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setType("online"); 
                    setSlot(null); 
                    if (date && ![2, 4].includes(date.getDay())) setDate(undefined);
                  }}
                  className={cn("flex-1 text-sm font-medium py-2 rounded-md transition-all", type === "online" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {t("appointment.online")}
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setSlot(null);
                  }}
                  locale={getLocale()}
                  disabled={(day) => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isBlocked = blockedDays.some(b => b.getTime() === startOfDay(day).getTime());
                    
                    const dayOfWeek = day.getDay();
                    let isOffDay = false;
                    
                    if (type === "physical") {
                      isOffDay = ![1, 3, 5].includes(dayOfWeek);
                    } else {
                      isOffDay = ![2, 4].includes(dayOfWeek);
                    }
                    
                    return isPast || isOffDay || isBlocked;
                  }}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] h-full flex flex-col">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                {t("appointment.selectTime")} {date && <span className="text-primary font-normal">{t("appointment.for")} {format(date, "MMM do, yyyy")}</span>}
              </div>
              
              {!date ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50 py-12">
                  <CalendarClock className="mb-3 h-8 w-8 opacity-20" />
                  <p>{t("appointment.pickDateFirst")}</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {(type === "physical" ? PHYSICAL_SLOTS : ONLINE_SLOTS).map(renderSlotButton)}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 mt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />{t("appointment.available")}</span>
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />{t("appointment.unavailable")}</span>
                    </div>
                    {slot && (
                      <p className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-in zoom-in duration-200">
                        {t("appointment.selected")}: <strong>{slot}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-12 mt-4 animate-in fade-in duration-500">
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
                disabled={loading}
                className="h-12 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {t("appointment.submit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}