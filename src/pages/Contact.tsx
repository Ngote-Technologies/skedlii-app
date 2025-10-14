import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col" id="contact">
      <Header />
      <main className="flex-grow bg-background px-4 py-24">
        <section className="max-w-2xl mx-auto text-center">
          <div className="inline-block mb-4">
            <div className="badge badge-secondary px-4 py-1.5 text-sm">
              Get in Touch
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            We’d love to hear from you — whether it’s a question, feature
            request, partnership idea, or a simple hello 👋
          </p>
          <a
            href="mailto:hello@skedlii.xyz"
            className="inline-block bg-primary-600 text-white hover:bg-primary-700 transition-colors px-6 py-3 rounded-lg text-lg font-medium shadow"
          >
            hello@skedlii.xyz
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            We typically respond within 1 business day.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
