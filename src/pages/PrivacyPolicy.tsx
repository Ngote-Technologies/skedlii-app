import ScrollToTop from "../components/layout/ScrollToTop";
import { HashLink } from "react-router-hash-link";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-base text-gray-800 dark:text-gray-200 leading-relaxed">
      <ScrollToTop />
      <h1 className="text-4xl font-bold mb-3 text-primary-700 dark:text-primary-400">
        Privacy Policy
      </h1>
      <p className="text-sm mb-8 text-gray-600 dark:text-gray-400">
        Effective Date: May 29, 2025 &nbsp;•&nbsp; Last Reviewed: October 2025
      </p>

      {/* INTRO */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        Introduction
      </h2>
      <p className="mb-4">
        Welcome to Skedlii ("we", "us", "our"). We respect your privacy and are
        committed to protecting your personal data. This Privacy Policy explains
        how <strong>Ngote LLC</strong> collects, uses, and shares information
        when you use Skedlii and related services (the "Service"). It also
        describes your rights under privacy laws such as the EU General Data
        Protection Regulation (GDPR) and the California Consumer Privacy Act
        (CCPA) as amended by the CPRA.
      </p>
      <p className="mb-4">
        By using the Service, you agree to this Policy. If you disagree, please
        discontinue use of the Service.
      </p>

      {/* CONTROLLER */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        1. Data Controller
      </h2>
      <p className="mb-4">
        <strong>Ngote LLC</strong>
        <br />
        Incorporated in the State of Delaware, USA
        <br />
        Website:{" "}
        <a
          href="https://ngote.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          https://ngote.xyz
        </a>
      </p>

      {/* COLLECTION */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        2. Information We Collect
      </h2>
      <p className="mb-4">
        We collect information you provide, information automatically generated
        through your use of the Service, and information received from connected
        platforms. Typical examples include account details, scheduled content,
        usage analytics, cookies, and data received through API connections with
        platforms such as Facebook, Instagram, X/Twitter, LinkedIn, Threads,
        TikTok, and YouTube.
      </p>

      {/* USE */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        3. How We Use Information
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>To provide, operate, and improve the Service.</li>
        <li>To authenticate you and connect your social accounts.</li>
        <li>To communicate with you about updates, security, and support.</li>
        <li>To monitor usage and improve performance and reliability.</li>
        <li>To comply with legal obligations and enforce our Terms.</li>
      </ul>
      <p className="mb-4">
        We rely on legal bases such as contract performance, legitimate
        interests, consent (where required), and legal obligation. Skedlii does
        not use automated decision-making or profiling that produces legal or
        similarly significant effects.
      </p>

      {/* SHARING */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        4. How We Share Information
      </h2>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>
          <strong>Connected Platforms:</strong> We share your scheduled content
          and instructions with the social platforms you connect solely to
          execute posts you authorize. For each platform’s terms, permissions,
          and revoke instructions, see our{" "}
          <HashLink
            smooth
            to="/help"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Help Center
          </HashLink>
          .
        </li>
        <li>
          <strong>Service Providers:</strong> We use trusted vendors such as
          Vercel (frontend hosting), Railway (API infrastructure), MongoDB Atlas
          (database), and Cloudinary (media delivery). These providers act under
          strict data-processing agreements.
        </li>
        <li>
          <strong>Payments:</strong> Payments are processed by{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Stripe
          </a>{" "}
          in compliance with PCI-DSS. Skedlii never stores full card data.
        </li>
        <li>
          <strong>Legal Requirements or Business Transfers:</strong> We may
          disclose data if required by law, or as part of a merger, acquisition,
          or sale.
        </li>
      </ul>

      {/* TRANSFERS */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        5. International Data Transfers
      </h2>
      <p className="mb-4">
        Your information may be processed in the United States or other
        countries with different privacy laws. When transferring data from the
        EEA or UK, we rely on Standard Contractual Clauses or other lawful
        safeguards to ensure an equivalent level of protection.
      </p>

      {/* COOKIES */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        6. Cookies and Tracking
      </h2>
      <p className="mb-4">
        We use essential and analytics cookies to operate and improve the
        Service. Where required, we display a consent banner allowing you to
        accept, reject, or customize non-essential cookies. You can also manage
        cookies in your browser.
      </p>

      {/* RETENTION */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        7. Data Retention
      </h2>
      <p className="mb-4">
        We retain data only as long as necessary to deliver the Service and meet
        legal or accounting obligations. Once no longer needed, data is deleted
        or anonymized.
      </p>

      {/* RIGHTS */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        8. Your Data Protection Rights
      </h2>
      <p className="mb-4">
        Depending on your location, you may have rights to access, correct,
        delete, or export your data; to restrict or object to processing; and to
        withdraw consent. You may also opt out of any sale or sharing of
        personal information. Skedlii will not discriminate against you for
        exercising these rights.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-2 pl-4">
        <li>
          Manage your data directly from <strong>Dashboard → Settings</strong>.
        </li>
        <li>
          Disconnect social accounts under{" "}
          <strong>Dashboard → Social Accounts</strong>.
        </li>
        <li>
          To delete your account permanently, use{" "}
          <strong>Dashboard → Settings → Security → “Delete My Account”</strong>
          .
        </li>
        <li>
          If you cannot access these tools, email{" "}
          <a
            href="mailto:hello@skedlii.xyz"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            hello@skedlii.xyz
          </a>{" "}
          with subject <em>“Data Deletion Request.”</em> We acknowledge within 7
          business days and complete eligible deletions within 30 days.
        </li>
      </ul>

      {/* SECURITY */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        9. Data Security
      </h2>
      <p className="mb-4">
        We use TLS encryption for data in transit and AES-256-GCM encryption for
        connected- account tokens at rest. Access is limited through role-based
        controls and audited regularly. While no system is perfectly secure, we
        take reasonable steps to prevent unauthorized access, use, or
        disclosure.
      </p>
      <p className="mb-4">
        In the unlikely event of a data breach posing a significant risk to your
        rights, we will notify you and relevant authorities as required by law.
      </p>

      {/* CHILDREN */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        10. Children’s Privacy
      </h2>
      <p className="mb-4">
        Our Service does not address anyone under the age of 18 ("Children").
      </p>
      <p className="mb-4">
        We do not knowingly collect personally identifiable information from
        anyone under the age of 18. If you are a parent or guardian and you are
        aware that your Child has provided us with Personal Data, please contact
        us. If we become aware that we have collected Personal Data from
        children without verification of parental consent, we take steps to
        remove that information from our servers.
      </p>

      {/* CHANGES */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        11. Changes to This Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy periodically. Material updates will be
        announced in-app or by email. The “Effective Date” reflects the latest
        version.
      </p>

      {/* CONTACT */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        12. Contact Us
      </h2>
      <p className="mb-4">
        Questions or concerns? Contact{" "}
        <a
          href="mailto:hello@skedlii.xyz"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          hello@skedlii.xyz
        </a>{" "}
        with subject “Privacy Policy Inquiry.”
      </p>

      {/* ADDITIONAL */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">
        13. Additional Legal Information
      </h2>
      <p className="mb-4">
        For business customers requiring a Data Processing Addendum (DPA),
        Skedlii provides one upon request. If required by law, we will appoint
        EU and/or UK representatives and update this Policy accordingly.
      </p>

      <div className="mt-12 border-t pt-6 border-gray-300 dark:border-gray-700">
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

export default PrivacyPolicy;
