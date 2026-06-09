import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/img/hero.jpg";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
      aria-label="Hero"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[var(--gradient-soft)]" />
        <div className="absolute -top-32 -right-24 h-[40rem] w-[40rem] rounded-full bg-primary/15 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.eyebrow")}
          </span>
          <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => scrollToId("appointment")}
              className="rounded-full bg-primary px-7 py-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] hover:bg-primary/90"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => scrollToId("about")}
              className="rounded-full border border-border bg-background/40 px-7 py-6 text-base font-semibold text-foreground hover:bg-muted"
            >
              {t("hero.ctaSecondary")}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[var(--shadow-elevated)]">
              <img
                src={heroImg}
                alt={t("hero.imageAlt")}
                width={1024}
                height={1024}
                className="aspect-[556/936] w-full h-auto object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-background/85 p-3 backdrop-blur-md">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  LG
                </span>
                <div className="leading-tight">
                  <p className="font-serif text-base font-semibold">Dr. Lucia Gariuc</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Doctor în Științe Medicale
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}