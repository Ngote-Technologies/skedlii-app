import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Hero from "../components/home/Hero";
import Integrations from "../components/home/Integrations";
import Features from "../components/home/Features";
import FrequentlyAskedQuestions from "../components/home/FAQ";
import Pricing from "./Pricing";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" id="home">
      <Header />

      <main className="flex-1">
        <Hero />
        <Integrations />
        <Features />
        <Pricing />
        {/* <Testimonials /> */}

        <FrequentlyAskedQuestions />
      </main>

      <Footer />
    </div>
  );
}
