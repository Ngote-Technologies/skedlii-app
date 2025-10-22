import * as React from "react";

import {
  BrowserRouter,
  Route,
  Routes,
  // Navigate,
  // useParams,
} from "react-router-dom";
// import Header from "../components/layout/Header";
// import Footer from "../components/layout/Footer";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "../components/ui/toaster";
// import { Analytics } from "@vercel/analytics/react";

import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import ProgressProvider from "../components/providers/ProgressProvider";
// import Contact from "../pages/Contact";
// import Pricing from "../pages/Pricing";
// import Roadmap from "../pages/Roadmap";
// import Help from "../pages/Help";

// const HomePage = React.lazy(() => import("../pages"));
// const WaitlistPage = React.lazy(() => import("../pages/waitlist"));
const ForgotPasswordPage = React.lazy(() => import("../pages/forgot-password"));
const DashboardPage = React.lazy(() => import("../components/dashboard"));
const NotFound = React.lazy(() => import("../pages/not-found"));

const LoginPage = React.lazy(() => import("../pages/Login"));
const RegisterPage = React.lazy(() => import("../pages/Register"));
// const TermsOfService = React.lazy(() => import("../pages/TermsOfService"));
// const PrivacyPolicy = React.lazy(() => import("../pages/PrivacyPolicy"));
// const About = React.lazy(() => import("../pages/About"));
// const RefundPolicy = React.lazy(() => import("../pages/RefundPolicy"));

const DashboardLayout = React.lazy(() => import("../layouts/DashboardLayout"));
const SocialAccounts = React.lazy(
  () => import("../components/social-accounts")
);
const AnalyticsDashboard = React.lazy(() => import("../components/analytics"));
const TeamManagement = React.lazy(
  () => import("../components/team-management")
);
const Collections = React.lazy(
  () => import("../components/collections/Collections")
);
const Posts = React.lazy(() => import("../components/posts"));
const ScheduledPosts = React.lazy(
  () => import("../components/posts/scheduled-posts/ScheduledPosts")
);
const ScheduledPostDetail = React.lazy(
  () => import("../components/posts/scheduled-posts/ScheduledPostDetail")
);
const PostFlow = React.lazy(
  () => import("../components/posts/post-flow/PostFlow")
);
const DraftsList = React.lazy(
  () => import("../components/posts/drafts/DraftsList")
);
const DraftDetail = React.lazy(
  () => import("../components/posts/drafts/DraftDetail")
);
const SocialPostDetail = React.lazy(
  () => import("../components/posts/SocialPostDetail")
);
const Billing = React.lazy(() => import("../components/billing"));
// const HelpSupport = React.lazy(() => import("../components/help-support"));
const PostCreate = React.lazy(
  () => import("../components/posts/post-create/PostCreate")
);
const UserSettings = React.lazy(() => import("../components/settings"));
const ResetPasswordPage = React.lazy(() => import("../pages/reset-password"));
const Collection = React.lazy(
  () => import("../components/collections/Collection")
);
// const HelpArticlePage = React.lazy(
//   () => import("../components/help-support/platform/HelpArticlePage")
// );
const OrganizationDashboard = React.lazy(
  () => import("../components/organization/OrganizationDashboard")
);
const OrganizationSettings = React.lazy(
  () => import("../components/organization/OrganizationSettings")
);
const OrganizationMembers = React.lazy(
  () => import("../components/organization/OrganizationMembers")
);
const AcceptInvitation = React.lazy(() => import("../pages/AcceptInvitation"));
// const ToastDemo = React.lazy(() => import("../components/ui/toast-demo"));
const AdminJobsDashboard = React.lazy(() => import("../components/admin/jobs"));

// Redirect helpers to keep backward compatibility for old dashboard help routes
// const RedirectDashboardHelp = () => <Navigate to="/help" replace />;
// const RedirectDashboardHelpArticle = () => {
//   const { articleId } = useParams();
//   return <Navigate to={`/help/${articleId}`} replace />;
// };

// Public wrappers for Help pages (with marketing header/footer)
// const HelpPublic = () => (
//   <div className="min-h-screen flex flex-col">
//     <Header />
//     <main className="flex-grow container mx-auto px-4 py-10">
//       <HelpSupport />
//     </main>
//     <Footer />
//   </div>
// );

// const HelpArticlePublic = () => (
//   <div className="min-h-screen flex flex-col">
//     <Header />
//     <main className="flex-grow container mx-auto px-4 py-10">
//       <HelpArticlePage />
//     </main>
//     <Footer />
//   </div>
// );

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ProgressProvider>
            <Toaster />
            {/* <Analytics /> */}
            <Routes>
              {/* <Route path="/" element={<HomePage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/help-center" element={<Help />} />
              <Route path="/help" element={<HelpPublic />} />
              <Route path="/help/:articleId" element={<HelpArticlePublic />} />
              <Route path="/waitlist" element={<WaitlistPage />} /> */}
              {/* Base route: show login for unauthenticated users, redirect to dashboard if authenticated */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="create-post" element={<PostCreate />} />
                <Route path="accounts" element={<SocialAccounts />} />
                <Route path="collections" element={<Collections />} />
                <Route
                  path="collections/:collectionId"
                  element={<Collection />}
                />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="post-flow" element={<PostFlow />} />
                <Route path="posts" element={<Posts />} />
                <Route path="posts/:postId" element={<SocialPostDetail />} />
                <Route path="scheduled" element={<ScheduledPosts />} />
                <Route
                  path="scheduled/:scheduledId"
                  element={<ScheduledPostDetail />}
                />
                <Route path="drafts" element={<DraftsList />} />
                <Route path="drafts/:draftId" element={<DraftDetail />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="billing" element={<Billing />} />
                {/* Back-compat redirects to new public help routes */}
                {/* <Route path="help" element={<RedirectDashboardHelp />} /> */}
                {/* <Route
                  path="help/:articleId"
                  element={<RedirectDashboardHelpArticle />}
                /> */}
                <Route
                  path="organizations"
                  element={<OrganizationDashboard />}
                />
                <Route
                  path="organizations/settings"
                  element={<OrganizationSettings />}
                />
                <Route
                  path="organizations/members"
                  element={<OrganizationMembers />}
                />
                <Route
                  path="organizations/teams"
                  element={<TeamManagement />}
                />
                <Route path="admin/jobs" element={<AdminJobsDashboard />} />
                {/* Development/Testing Routes */}
                {/* {import.meta.env.DEV && (
                  <Route path="dev/toast-demo" element={<ToastDemo />} />
                )} */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProgressProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
