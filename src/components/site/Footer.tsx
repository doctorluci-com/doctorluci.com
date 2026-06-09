import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Send, Mail, Phone, MapPin, Stethoscope } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const SECTIONS = ["about", "services", "steps", "testimonials", "appointment"] as const;
const SOCIALS = [
  { Icon: Facebook, href: "https://www.facebook.com/lucia.gariuc", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com/doctor.luci/", label: "Instagram" },
  { Icon: Send, href: "https://t.me/kidsoflucia", label: "Telegram" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer id="contact" className="relative mt-12 bg-foreground text-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10 text-accent">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <div className="font-serif text-lg font-semibold">Dr. Lucia Gariuc</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-background/60">Medic ORL</div>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-background/70">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {t("footer.quickLinks")}
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {SECTIONS.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => scrollToId(s)}
                    className="text-background/75 transition-colors hover:text-accent"
                  >
                    {t(`nav.${s}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {t("footer.contact")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-background/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {t("footer.address")}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href="mailto:contact@doctorluci.com" className="hover:text-accent">contact@doctorluci.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href="tel:+37369408822" className="hover:text-accent">+373 69 408 822</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {t("footer.follow")}
            </h3>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-background/10 text-background/80 transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                {t("footer.language")}
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-background/15 pt-6 text-xs text-background/60 md:flex-row">
          <p>{t("footer.rights")}</p>
          <p className="font-serif italic">Medicina simțului · Kids of Lucia</p>
        </div>
      </div>
    </footer>
  );
}