import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Hero from "../components/home/Hero";
import Integrations from "../components/home/Integrations";
import Features from "../components/home/Features";
// import Solutions from "../components/home/Solutions";
import Testimonials from "../components/home/Testimonials";
import FrequentlyAskedQuestions from "../components/home/FAQ";
import CallToAction from "../components/home/CTA";
import { Button } from "../components/ui/button";
// import { useQuery } from "@tanstack/react-query";
import Pricing from "./Pricing";

export default function HomePage() {
  // const { data: plans = [], isLoading: plansLoading } = useQuery({
  //   queryKey: [`/plans`],
  // }) as { data: any[]; isLoading: boolean };

  return (
    <div className="min-h-screen flex flex-col" id="home">
      <Header />

      <main className="flex-1">
        <Hero />
        <Integrations />
        <Features />
        <Pricing />
        {/* <Solutions skedliiPlans={plans} loading={plansLoading} /> */}
        <Testimonials />

        <section
          id="trial-cta"
          className="py-16 bg-primary-600 text-white dark:bg-primary-900"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Start Your Free Trial
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Full access for 7 days. Card required. Cancel anytime during
              trial.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>

        <FrequentlyAskedQuestions />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
