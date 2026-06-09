import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Steps() {
  const { t } = useTranslation();
  const items = (t("steps.items", { returnObjects: true }) as { title: string; desc: string }[]) || [];

  return (
    <section id="steps" className="relative py-20 md:py-28" aria-label="Steps">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("steps.eyebrow")}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl">
            {t("steps.title")}
          </h2>
        </div>

        <ol className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-4">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:left-0 md:right-0 md:top-7 md:h-px md:w-full md:bg-gradient-to-r md:from-transparent md:via-primary/30 md:to-transparent" aria-hidden />
          {items.map((step, i) => (
            <li key={i} className="relative">
              <div className="relative flex md:block">
                <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-primary/30 bg-background font-serif text-lg font-bold text-primary shadow-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="ml-5 md:ml-0 md:mt-5">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 text-center">
          <Button
            size="lg"
            onClick={() => scrollToId("appointment")}
            className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] hover:bg-primary/90"
          >
            {t("steps.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}