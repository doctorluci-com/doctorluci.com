import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

const COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-yellow-100 text-yellow-800",
  "bg-teal-100 text-teal-700"
];

export function Testimonials() {
  const { t } = useTranslation();
  const items = (t("testimonials.items", { returnObjects: true }) as any[]) || [];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="testimonials" className="relative py-20 md:py-28 bg-[#f8fafc] overflow-hidden" aria-label="Testimonials">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {t("testimonials.title")} <span className="italic">{t("testimonials.titleItalic")}</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-2 font-medium">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="relative mt-12 group/slider">
          <button 
            onClick={() => scroll('left')} 
            className="absolute -left-6 top-1/2 z-10 hidden -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm transition-all hover:bg-accent hover:text-accent-foreground md:flex opacity-0 group-hover/slider:opacity-100"
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-5 w-5 text-foreground/70" />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((it, i) => {
              const initials = it.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
              const colorClass = COLORS[i % COLORS.length];

              return (
                <div 
                  key={i}
                  className="w-[85vw] max-w-md shrink-0 snap-center sm:w-[400px]"
                >
                  <div className="flex h-full flex-col rounded-[24px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-sm ${colorClass}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-base">{it.name}</div>
                        <div className="flex gap-[2px] mt-0.5 text-[#F5C518]">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="h-[14px] w-[14px] fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <blockquote className="mt-6 flex-1 text-[15px] leading-relaxed text-foreground/80 font-medium">
                      {it.text}
                    </blockquote>
                    <div className="mt-8 text-sm text-muted-foreground font-medium">
                      {it.source} • {it.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => scroll('right')} 
            className="absolute -right-6 top-1/2 z-10 hidden -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm transition-all hover:bg-accent hover:text-accent-foreground md:flex opacity-0 group-hover/slider:opacity-100"
            aria-label="Scroll right"
          >
            <ArrowRight className="h-5 w-5 text-foreground/70" />
          </button>
        </div>
      </div>
    </section>
  );
}