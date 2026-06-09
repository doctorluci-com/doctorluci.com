import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { BookPromo } from "@/components/site/BookPromo";
import { Highlights } from "@/components/site/Highlights";
import { About } from "@/components/site/About";
import { QuoteRotator } from "@/components/site/QuoteRotator";
import { Steps } from "@/components/site/Steps";
import { Newsletter } from "@/components/site/Newsletter";
import { Appointment } from "@/components/site/Appointment";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <BookPromo />
      <Highlights />
      <About />
      <QuoteRotator />
      <Steps />
      <Newsletter />
      <Appointment />
      <Testimonials />
      <Footer />
    </main>
  );
}
