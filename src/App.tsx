// import * as Sentry from "@sentry/react";
import AppRoutes from "./routes";
import "react-day-picker/dist/style.css";

// Sentry
// const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Sentry.init({
//   dsn: SENTRY_DSN,
//   // Setting this option to true will send default PII data to Sentry.
//   // For example, automatic IP address collection on events
//   sendDefaultPii: true,
//   integrations: [
//     // Sentry.replayIntegration(),
//     Sentry.browserTracingIntegration(),
//   ],
//   // Session replay
//   // replaysSessionSampleRate: 1.0,
//   // replaysOnErrorSampleRate: 1.0,
//   tracesSampleRate: 1.0,
//   tracePropagationTargets: [
//     "localhost",
//     /^https:\/\/dev\.skedlii\.xyz\/api/,
//     /^https:\/\/staging\.skedlii\.xyz\/api/,
//     /^https:\/\/api\.skedlii\.xyz/,
//   ],
// });

function App() {
  return (
    // <Sentry.ErrorBoundary
    //   fallback={<p>Something went wrong! Please try again later.</p>}
    // >
    // </Sentry.ErrorBoundary>
    <AppRoutes />
  );
}

export default App;
