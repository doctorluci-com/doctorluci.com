import { useTranslation } from "react-i18next";
import { Ear, HeartHandshake, GraduationCap, Compass, type LucideIcon } from "lucide-react";

const ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: "consult", icon: Ear },
  { key: "kids", icon: HeartHandshake },
  { key: "edu", icon: GraduationCap },
  { key: "mentor", icon: Compass },
];

export function Highlights() {
  const { t } = useTranslation();
  return (
    <section id="services" className="relative py-20 md:py-28" aria-label="Services">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("highlights.title")}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl">
            {t("highlights.subtitle")}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, icon: Icon }, i) => (
            <article
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 transition-all duration-500 group-hover:bg-primary/10" aria-hidden />
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 font-serif text-xl font-semibold text-foreground">
                {t(`highlights.items.${key}.title`)}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`highlights.items.${key}.desc`)}
              </p>
              <span className="relative mt-5 inline-block text-xs font-semibold tracking-widest text-accent">
                0{i + 1}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}