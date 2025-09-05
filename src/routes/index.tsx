import * as React from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "../components/ui/toaster";
// import { Analytics } from "@vercel/analytics/react";

import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import ProgressProvider from "../components/providers/ProgressProvider";
import Contact from "../pages/Contact";
import Pricing from "../pages/Pricing";
import Roadmap from "../pages/Roadmap";
import Help from "../pages/Help";

const HomePage = React.lazy(() => import("../pages"));
const WaitlistPage = React.lazy(() => import("../pages/waitlist"));
const ForgotPasswordPage = React.lazy(() => import("../pages/forgot-password"));
const DashboardPage = React.lazy(() => import("../components/dashboard"));
const NotFound = React.lazy(() => import("../pages/not-found"));

const LoginPage = React.lazy(() => import("../pages/Login"));
const RegisterPage = React.lazy(() => import("../pages/Register"));
const TermsOfService = React.lazy(() => import("../pages/TermsOfService"));
const PrivacyPolicy = React.lazy(() => import("../pages/PrivacyPolicy"));
const About = React.lazy(() => import("../pages/About"));

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
const PostFlow = React.lazy(
  () => import("../components/posts/post-flow/PostFlow")
);
const Billing = React.lazy(() => import("../components/billing"));
const HelpSupport = React.lazy(() => import("../components/help-support"));
const PostCreate = React.lazy(
  () => import("../components/posts/post-create/PostCreate")
);
const UserSettings = React.lazy(() => import("../components/settings"));
const ResetPasswordPage = React.lazy(() => import("../pages/reset-password"));
const Collection = React.lazy(
  () => import("../components/collections/Collection")
);
const HelpArticlePage = React.lazy(
  () => import("../components/help-support/platform/HelpArticlePage")
);
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
const ToastDemo = React.lazy(() => import("../components/ui/toast-demo"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ProgressProvider>
            <Toaster />
            {/* <Analytics /> */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/help-center" element={<Help />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
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
                <Route path="scheduled" element={<ScheduledPosts />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="billing" element={<Billing />} />
                <Route path="help" element={<HelpSupport />} />
                <Route path="help/:articleId" element={<HelpArticlePage />} />
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
                {/* Development/Testing Routes */}
                {import.meta.env.DEV && (
                  <Route path="dev/toast-demo" element={<ToastDemo />} />
                )}
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
