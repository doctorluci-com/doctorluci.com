import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BookOpen, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export function BookPromo() {
  const { t } = useTranslation();
  const { addItem } = useCartStore();

  const [bookType, setBookType] = useState<'digital' | 'physical'>('digital');

  const handleAddToCart = () => {
    addItem({
      id: bookType === 'digital' ? 'book-ent-health-digital' : 'book-ent-health-physical',
      nameKey: "bookPromo.title",
      type: bookType,
      price: bookType === 'digital' ? 1800 : 2500,
      quantity: 1,
    });
  };

  return (
    <section className="relative py-24 overflow-hidden bg-muted/30" aria-label="Book Promo">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-60" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl opacity-60" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid gap-12 lg:grid-cols-2 items-center rounded-[2.5rem] bg-card p-8 md:p-14 shadow-xl border border-primary/10"
        >
          {/* Content Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex h-12 px-4 items-center justify-center rounded-full bg-primary/10 text-primary font-medium tracking-wide text-sm">
                <BookOpen className="mr-2 h-4 w-4" />
                {t("bookPromo.eyebrow")}
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                {t("bookPromo.title")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t("bookPromo.subtitle")}
              </p>
            </div>

            <div className="space-y-6 max-w-md">
              {/* Type Selection */}
              <div className="flex gap-4">
                <div 
                  onClick={() => setBookType('digital')}
                  className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${bookType === 'digital' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background hover:border-primary/50'}`}
                >
                  <div className="font-semibold text-sm mb-1">{t("bookPromo.digitalEdition", "E-Book")}</div>
                  <div className="text-xl font-bold text-primary">$18.00</div>
                </div>
                <div 
                  onClick={() => setBookType('physical')}
                  className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${bookType === 'physical' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background hover:border-primary/50'}`}
                >
                  <div className="font-semibold text-sm mb-1">{t("bookPromo.physicalEdition", "Physical Book")}</div>
                  <div className="text-xl font-bold text-primary">$25.00</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="h-14 rounded-2xl px-8 font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 cursor-pointer flex-1"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t("cart.addToCart")}
                </Button>
              </div>
            </div>
          </div>

          {/* Image/Mockup Column */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none perspective-1000">
            <motion.div 
              className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/80 to-primary flex flex-col items-center justify-center p-8 text-center"
              whileHover={{ y: -10, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {/* Fallback book design if no image is available */}
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
              <div className="relative z-10 border border-white/20 p-8 rounded-xl h-full w-full flex flex-col justify-between backdrop-blur-md bg-white/5">
                <div className="text-white/80 font-medium tracking-widest text-sm uppercase">Ediție Digitală</div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-serif text-white font-bold mb-4">{t("bookPromo.title")}</h3>
                  <div className="h-1 w-12 bg-emerald-400 mx-auto" />
                </div>
                <div className="text-white font-serif text-lg">Dr. Lucia Gariuc</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
