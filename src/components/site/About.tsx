import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import authorImg from "@/assets/img/author.jpg";

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="relative bg-secondary/40 py-20 md:py-32" aria-label="About">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="relative lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] border border-accent/40" aria-hidden />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/15 blur-2xl" aria-hidden />
            <img
              src={authorImg}
              alt={t("about.name")}
              loading="lazy"
              width={1024}
              height={1024}
              className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-elevated)]"
            />
            <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
              {t("about.title")}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("about.eyebrow")}
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-5xl">
            {t("about.name")}
            <span className="block text-xl font-normal italic text-muted-foreground md:text-2xl">
              {t("about.title")}
            </span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-foreground/80 md:text-lg">
            {t("about.bio")}
          </p>

          <a
            href="#about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
          >
            {t("about.more")}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}