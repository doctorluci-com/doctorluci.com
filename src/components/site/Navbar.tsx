import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";

const SECTIONS = ["about", "services", "steps", "testimonials", "appointment", "contact"] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), 50);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_2px_24px_-12px_oklch(0.255_0.018_240/0.15)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <button
          onClick={() => handleNav("hero")}
          className="flex items-center gap-2.5 text-left"
          aria-label="Dr. Lucia Gariuc — home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold text-foreground">
              Dr. Lucia Gariuc
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Medic ORL
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleNav(s)}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {t(`nav.${s}`)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <Button
            onClick={() => handleNav("appointment")}
            className="hidden rounded-full bg-primary px-5 text-primary-foreground shadow-sm hover:bg-primary/90 md:inline-flex"
          >
            {t("nav.book")}
          </Button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-4 mb-4 rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-xl">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleNav(s)}
                  className="rounded-lg px-3 py-2.5 text-left text-base font-medium text-foreground hover:bg-muted"
                >
                  {t(`nav.${s}`)}
                </button>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <LanguageSwitcher />
              <Button
                onClick={() => handleNav("appointment")}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("nav.book")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}