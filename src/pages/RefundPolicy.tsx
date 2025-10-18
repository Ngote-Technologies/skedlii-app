import ScrollToTop from "../components/layout/ScrollToTop";
import { HashLink } from "react-router-hash-link";

const RefundPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-base text-gray-800 dark:text-gray-200 leading-relaxed">
      <ScrollToTop />
      <h1 className="text-4xl font-bold mb-3 text-primary-700 dark:text-primary-400">
        30-Day Money-Back Guarantee
      </h1>
      <p className="text-sm mb-8 text-gray-600 dark:text-gray-400">
        Effective Date: October 2025
      </p>

      <p className="mb-6">
        We want you to love Skedlii. If the product isn’t a fit, you can request
        a full refund within 30 days of your first charge. No hassle, no
        runaround.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
        Eligibility
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>Valid on your first subscription payment (monthly or annual).</li>
        <li>One refund per customer or organization.</li>
        <li>Request must be made within 30 days of the first charge.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
        What We Refund
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>The subscription fee from your first billing term.</li>
        <li>
          Taxes or third‑party fees may be excluded where non‑refundable by law
          or the payment processor.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
        How to Request
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        {/* <li>
          Use the in‑app <strong>Settings → Billing</strong> page and click
          “Request a refund,” or
        </li> */}
        <li>
          Email{" "}
          <a
            href="mailto:hello@skedlii.xyz"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            hello@skedlii.xyz
          </a>{" "}
          with subject <em>“Refund Request.”</em>
        </li>
      </ul>
      <p className="mb-4">
        We typically process refunds within 5–10 business days.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
        After Refund
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>Your subscription is canceled immediately.</li>
        <li>Access may be reduced or disabled following the refund.</li>
        <li>You can export your data before cancelation from Settings.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
        Anti‑Abuse & Exceptions
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>
          We may decline refunds for repeated or abusive use (e.g., dupe
          accounts).
        </li>
        <li>High‑value enterprise contracts may require separate terms.</li>
        <li>
          This policy doesn’t limit any rights you have under applicable law.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
        Questions?
      </h2>
      <p className="mb-8">
        We’re here to help. Contact{" "}
        <a
          href="mailto:hello@skedlii.xyz"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          hello@skedlii.xyz
        </a>{" "}
        and we’ll get back to you promptly.
      </p>

      <div className="mt-8 border-t pt-6 border-gray-300 dark:border-gray-700">
        <HashLink
          smooth
          to="/"
          elementId="home"
          className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
        >
          ← Back to Home
        </HashLink>
      </div>
    </div>
  );
};

export default RefundPolicy;
