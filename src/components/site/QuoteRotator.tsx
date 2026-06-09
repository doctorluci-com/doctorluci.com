import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Quote } from "lucide-react";
import quoteBg from "@/assets/img/quote-bg.jpg";
import i18n from "@/i18n";

function quoteItemsFromTranslation(raw: unknown): string[] {
  if (Array.isArray(raw) && raw.every((x) => typeof x === "string")) {
    return raw;
  }
  if (raw && typeof raw === "object" && !(raw instanceof Function)) {
    return Object.values(raw as Record<string, unknown>).filter(
      (x): x is string => typeof x === "string",
    );
  }
  return [];
}

function subscribeI18nLang(cb: () => void) {
  i18n.on("languageChanged", cb);
  return () => {
    i18n.off("languageChanged", cb);
  };
}

function getI18nLangSnapshot() {
  return i18n.resolvedLanguage || i18n.language || "ro";
}

export function QuoteRotator() {
  const lang = useSyncExternalStore(subscribeI18nLang, getI18nLangSnapshot, getI18nLangSnapshot);
  const t = useMemo(() => i18n.getFixedT(lang), [lang]);
  const quotes = useMemo(
    () => quoteItemsFromTranslation(t("quotes.items", { returnObjects: true })),
    [t, lang],
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [lang]);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, [quotes.length]);

  return (
    <section
      className="relative isolate overflow-hidden py-24 md:py-36"
      aria-label={t("quotes.title")}
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        <img
          src={quoteBg}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/85 via-foreground/75 to-foreground/85" />
      </div>

      <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
        <Quote className="mx-auto h-10 w-10 text-accent" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent/90">
          {t("quotes.title")}
        </p>
        <div className="relative mt-8 min-h-[6.5rem] md:min-h-[8rem]">
          {quotes.map((q, i) => (
            <p
              key={`${lang}-${i}`}
              aria-hidden={i !== idx}
              className={`absolute inset-x-0 font-serif text-2xl italic leading-snug text-background transition-opacity duration-1000 md:text-4xl ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
            >
              “{q}”
            </p>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {quotes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Quote ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-8 bg-accent" : "w-1.5 bg-background/40 hover:bg-background/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
