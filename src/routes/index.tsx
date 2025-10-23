import * as React from "react";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "../components/ui/toaster";

import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import ProgressProvider from "../components/providers/ProgressProvider";
import ErrorBoundary, {
  AppErrorFallback,
} from "../components/common/ErrorBoundary";

const ForgotPasswordPage = React.lazy(() => import("../pages/forgot-password"));
const DashboardPage = React.lazy(() => import("../components/dashboard"));
const NotFound = React.lazy(() => import("../pages/not-found"));

const LoginPage = React.lazy(() => import("../pages/Login"));
const RegisterPage = React.lazy(() => import("../pages/Register"));

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
const UserSettings = React.lazy(() => import("../components/settings"));
const ResetPasswordPage = React.lazy(() => import("../pages/reset-password"));
const Collection = React.lazy(
  () => import("../components/collections/Collection")
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
const AdminJobsDashboard = React.lazy(() => import("../components/admin/jobs"));

const InnerApp = () => {
  const location = useLocation();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProgressProvider>
          <Toaster />
          <ErrorBoundary
            key={location.key}
            fallbackRender={({ error, reset }) => (
              <AppErrorFallback error={error} reset={reset} />
            )}
          >
            <Routes>
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
                {/* Catch-all inside dashboard ensures 404 renders within layout */}
                <Route path="*" element={<NotFound />} />
                {/* Development/Testing Routes */}
                {/* {import.meta.env.DEV && (
                  <Route path="dev/toast-demo" element={<ToastDemo />} />
                )} */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </ProgressProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
};

export default AppRoutes;
