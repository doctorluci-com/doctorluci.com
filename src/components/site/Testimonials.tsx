import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import p1 from "@/assets/img/person-01.jpg";
import p2 from "@/assets/img/person-02.jpg";
import p3 from "@/assets/img/person-03.jpg";
import p4 from "@/assets/img/person-04.jpg";

const PHOTOS = [p2, p1, p3, p4];

export function Testimonials() {
  const { t } = useTranslation();
  const items = (t("testimonials.items", { returnObjects: true }) as { name: string; text: string }[]) || [];

  return (
    <section id="testimonials" className="relative py-20 md:py-28" aria-label="Testimonials">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("testimonials.eyebrow")}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl">
            {t("testimonials.title")}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <figure
              key={i}
              className="group relative rounded-2xl border border-border/60 bg-card p-7 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 font-serif text-lg italic leading-snug text-foreground/90 md:text-xl">
                “{it.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <img
                  src={PHOTOS[i % PHOTOS.length]}
                  alt={it.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/15"
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">{it.name}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}