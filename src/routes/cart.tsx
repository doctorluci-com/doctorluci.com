import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, CreditCard, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { t, i18n } = useTranslation();
  const { items, removeItem } = useCartStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Shipping Address State
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const hasPhysical = items.some(item => item.type === "physical");

  const total = items.reduce((acc, item) => acc + item.price, 0);

  const onCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/stripe/create-book-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          lang: i18n.language || "ro",
          items: items.map(item => ({ id: item.id, type: item.type, quantity: item.quantity })),
          ...(hasPhysical && {
            shippingAddress: { name, line1, line2, postalCode, city, country: 'MD' }
          })
        }),
      });

      if (!res.ok) {
        throw new Error("Payment initialization failed");
      }

      const { url } = await res.json();
      toast.success(t("bookPromo.success") || "Redirecting to checkout...");
      window.location.href = url;
    } catch (err: any) {
      toast.error(t("newsletter.error") || "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("cart.continueShopping")}
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-12">
          {t("cart.yourCart")}
        </h1>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-3xl bg-muted/30"
          >
            <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">{t("cart.empty")}</h2>
            <Link to="/">
              <Button size="lg" className="rounded-xl mt-4">
                {t("cart.continueShopping")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Cart Items (Left/Top) */}
            <div className="lg:col-span-7 space-y-6">
              {items.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={item.id} 
                  className="flex gap-6 p-6 rounded-3xl bg-card border shadow-sm relative group"
                >
                  <div className="h-32 w-24 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                    <BookOpen className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-1">
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-2 ${item.type === 'physical' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {item.type === 'physical' ? t("bookPromo.physicalEdition", "Physical Book") : t("bookPromo.digitalEdition", "Digital Edition")}
                      </div>
                      <h3 className="text-xl font-semibold leading-tight">{t(item.nameKey)}</h3>
                      <p className="text-muted-foreground text-sm">Dr. Lucia Gariuc</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-semibold">${(item.price / 100).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("cart.remove")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Checkout Form (Right/Bottom) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="rounded-[2.5rem] bg-muted/40 p-8 border shadow-sm sticky top-32">
                <h3 className="text-xl font-semibold mb-6 pb-6 border-b">
                  {t("cart.total")}: ${(total / 100).toFixed(2)}
                </h3>
                
                <form onSubmit={onCheckout} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      {t("cart.emailPlaceholder")}
                    </label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      type="email"
                      placeholder="nume@exemplu.com"
                      className="h-14 rounded-xl bg-background border-border px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {hasPhysical && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <label className="text-sm font-medium">{t("cart.shippingAddress", "Adresa de expediere")}</label>
                      
                      <div className="space-y-3">
                        <Input
                          placeholder={t("cart.fullName", "Nume complet")}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={loading}
                          className="h-12 bg-background"
                        />
                        <Input
                          value="Republica Moldova"
                          disabled
                          className="h-12 bg-muted text-muted-foreground opacity-100"
                        />
                        <Input
                          placeholder={t("cart.addressLine1", "Rândul 1 pentru adresă")}
                          value={line1}
                          onChange={(e) => setLine1(e.target.value)}
                          required
                          disabled={loading}
                          className="h-12 bg-background"
                        />
                        <Input
                          placeholder={t("cart.addressLine2", "Rândul 2 pentru adresă (opțional)")}
                          value={line2}
                          onChange={(e) => setLine2(e.target.value)}
                          disabled={loading}
                          className="h-12 bg-background"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder={t("cart.postalCode", "Cod poștal")}
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                            disabled={loading}
                            className="h-12 bg-background"
                          />
                          <Input
                            placeholder={t("cart.city", "Oraș")}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            disabled={loading}
                            className="h-12 bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-14 rounded-xl text-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-6 w-6" />
                        {t("cart.checkout")}
                      </>
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Secured by Stripe
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
