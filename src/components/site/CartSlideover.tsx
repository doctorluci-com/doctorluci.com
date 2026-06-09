import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { X, ShoppingCart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export function CartSlideover() {
  const { t } = useTranslation();
  const { isOpen, setIsOpen, items, removeItem } = useCartStore();

  // Prevent background scrolling when slide-over is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const total = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-over */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[110] w-full max-w-md border-l bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t("cart.yourCart")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 opacity-20" />
                  <p className="text-lg">{t("cart.empty")}</p>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    {t("cart.continueShopping")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                      <div className="h-24 w-16 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-2">{t(item.nameKey)}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.type === 'physical' ? t("bookPromo.physicalEdition", "Physical Book") : t("bookPromo.digitalEdition", "Digital Edition")}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-medium">${(item.price / 100).toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                            onClick={() => removeItem(item.id)}
                          >
                            {t("cart.remove")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 bg-muted/10 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>{t("cart.total")}</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full h-12 text-base font-semibold shadow-md active:scale-[0.98] transition-transform">
                      {t("cart.viewCart")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("cart.continueShopping")}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
