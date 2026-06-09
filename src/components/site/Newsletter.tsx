import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function Newsletter() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, lang: i18n.language || "ro" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "error");
      }

      setIsSubmitted(true);
      toast.success(t("newsletter.success"));
      setName("");
      setEmail("");
    } catch (err: any) {
      if (err.message === "TooManyRequests") {
        toast.error(t("newsletter.tooManyRequests") || "Too many requests. Please try again after 15 minutes.");
      } else {
        toast.error(t("newsletter.error") || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" aria-label="Newsletter">
      {/* Premium glowing background blobs */}
      <div 
        className="absolute -right-20 top-1/4 h-[350px] w-[350px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -left-20 bottom-1/4 h-[300px] w-[300px] rounded-full bg-accent/8 blur-3xl animate-float-slow" 
        aria-hidden="true" 
      />

      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-primary/10 bg-card/60 backdrop-blur-xl p-8 shadow-[var(--shadow-soft)] md:p-14 dark:bg-card/40"
        >
          {/* Subtle inner card decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
          
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="newsletter-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative text-center"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {t("newsletter.title")}
                </h2>
                
                <p className="mx-auto mt-4 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
                  {t("newsletter.subtitle")}
                </p>

                <form onSubmit={onSubmit} className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-[1.2fr_1.2fr_1fr]">
                  <div className="relative group">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      placeholder={t("newsletter.name")}
                      className="h-13 rounded-xl bg-background/50 border-border/70 px-5 shadow-sm transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary group-hover:border-primary/40"
                    />
                  </div>
                  
                  <div className="relative group">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      type="email"
                      placeholder={t("newsletter.email")}
                      className="h-13 rounded-xl bg-background/50 border-border/70 px-5 shadow-sm transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary group-hover:border-primary/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-13 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/95 hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        {t("newsletter.submit")}
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="newsletter-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>

                <h3 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {t("newsletter.successTitle") || "Request Sent!"}
                </h3>
                
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
                  {t("newsletter.success")}
                </p>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    {t("newsletter.requestAnother") || "Request another guide"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}