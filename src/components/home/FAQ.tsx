import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { HashLink } from "react-router-hash-link";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

export default function FrequentlyAskedQuestions() {
  const faqs: FAQItem[] = [
    {
      question: "Is Skedlii available now?",
      answer: (
        <>
          Yes — Skedlii is live. You can start a free trial today and explore
          the full product. Visit{" "}
          <HashLink
            to="/"
            elementId="pricing"
            className="text-primary hover:underline"
          >
            Pricing
          </HashLink>{" "}
          to get started.
        </>
      ),
    },
    {
      question: "Do I need a credit card to start the trial?",
      answer: (
        <>
          Yes. A valid payment method is required to begin the free trial. The
          trial lasts 7 days, and you won’t be charged until it ends. You can
          cancel anytime from Billing.
        </>
      ),
    },
    {
      question: "Which social platforms are supported?",
      answer: (
        <>
          Skedlii supports Instagram, Threads, LinkedIn, Facebook, TikTok, and
          YouTube. We continuously expand integrations based on demand. Learn
          more in the {" "}
          <Link to="/help" className="text-primary hover:underline">
            Help Center
          </Link>
          .
        </>
      ),
    },
    {
      question: "Where can I find platform-specific guidelines?",
      answer: (
        <>
          Visit the {" "}
          <Link to="/help" className="text-primary hover:underline">
            Help Center
          </Link>{" "}
          for tips, limits, and best practices. Quick links: {" "}
          <Link to="/help/instagram" className="text-primary hover:underline">
            Instagram
          </Link>
          , {" "}
          <Link to="/help/twitter" className="text-primary hover:underline">
            Twitter
          </Link>
          , {" "}
          <Link to="/help/linkedin" className="text-primary hover:underline">
            LinkedIn
          </Link>
          , {" "}
          <Link to="/help/facebook" className="text-primary hover:underline">
            Facebook
          </Link>
          , {" "}
          <Link to="/help/threads" className="text-primary hover:underline">
            Threads
          </Link>
          , {" "}
          <Link to="/help/tiktok" className="text-primary hover:underline">
            TikTok
          </Link>
          , {" "}
          <Link to="/help/youtube" className="text-primary hover:underline">
            YouTube
          </Link>
          .
        </>
      ),
    },
    {
      question: "Can I publish to multiple platforms at once?",
      answer: (
        <>
          Yes. When composing, select multiple connected accounts. Skedlii
          automatically applies platform-specific constraints (character limits,
          media requirements, etc.) when scheduling.
        </>
      ),
    },
    {
      question: "How does scheduling work?",
      answer: (
        <>
          Scheduled posts are queued and dispatched by background workers at the
          selected time. If a post can’t publish (for example, an expired token
          or invalid media), you’ll see the status in the dashboard and can
          reauthorize the account from{" "}
          <span className="font-medium">Social Accounts</span>.
        </>
      ),
    },
    {
      question: "Why is my post stuck in “Scheduled”?",
      answer: (
        <>
          This usually means a connected account needs to be reauthorized. Open
          <span className="font-medium"> Social Accounts</span> and click
          “Reauthorize” for the affected account. See the{" "}
          <Link to="/help" className="text-primary hover:underline">
            Help Center
          </Link>{" "}
          for platform-specific guidance.
        </>
      ),
    },
    {
      question: "Can my team use Skedlii?",
      answer: (
        <>
          Yes. Skedlii supports organization workspaces and member
          invitations/roles. Advanced collaboration features are part of our
          Team plan rollout. If you need early access, contact{" "}
          <a
            href="mailto:hello@skedlii.xyz"
            className="text-primary hover:underline"
          >
            hello@skedlii.xyz
          </a>
          .
        </>
      ),
    },
    {
      question: "How does pricing work?",
      answer: (
        <>
          Simple, transparent plans billed monthly or yearly. Trials are free,
          and upgrades are prorated when applicable. See the{" "}
          <Link to="/pricing" className="text-primary hover:underline">
            Pricing
          </Link>{" "}
          page for details.
        </>
      ),
    },
    {
      question: "What happens after my trial ends?",
      answer: (
        <>
          Your selected subscription begins automatically unless you cancel
          before the trial ends. Manage your subscription in Dashboard →
          <span className="font-medium"> Billing</span>.
        </>
      ),
    },
    {
      question: "How do you handle security and privacy?",
      answer: (
        <>
          We use OAuth for social connections and never store your social media
          passwords. You can revoke access anytime from your social network
          settings or from Skedlii by disconnecting an account.
        </>
      ),
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about Skedlii.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={`${faq.question}-${index}`}
                value={`item-${index}`}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-6"
              >
                <AccordionTrigger className="text-xl font-bold font-heading py-4 dark:text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
