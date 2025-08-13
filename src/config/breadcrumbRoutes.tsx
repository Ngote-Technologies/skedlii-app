import React from "react";
import {
  Home,
  Settings,
  Calendar,
  Plus,
  HelpCircle,
  Users,
  FolderOpen,
  BarChart3,
  CreditCard,
  FileText,
} from "lucide-react";

export interface BreadcrumbSegment {
  label: string | ((data: any) => string);
  href?: string | ((params: any) => string);
  icon?: React.ReactNode;
  queryKey?: (params: any) => string[];
  dataPath?: string; // path to extract name from API response
  fallback?: (param: string) => string;
  isLoading?: boolean;
}

export interface BreadcrumbRoute {
  pattern: RegExp;
  segments: BreadcrumbSegment[];
}

export const breadcrumbRoutes: BreadcrumbRoute[] = [
  // Collections detail route: /dashboard/collections/:collectionId
  {
    pattern: /^\/dashboard\/collections\/([^\/]+)$/,
    segments: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Home className="w-4 h-4" />,
      },
      {
        label: "Collections",
        href: "/dashboard/collections",
        icon: <FolderOpen className="w-4 h-4" />,
      },
      {
        label: (data) => {
          if (!data) return "Loading...";
          return data.name || "Untitled Collection";
        },
        queryKey: (params) => [`/collections/collection/${params[0]}`],
        dataPath: "name",
        fallback: (id) => `Collection ${id.slice(0, 8)}...`,
        icon: <FolderOpen className="w-4 h-4" />,
      },
    ],
  },

  // Help articles: /dashboard/help/:articleId or any help sub-routes
  {
    pattern: /^\/dashboard\/help\/([^\/]+)$/,
    segments: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Home className="w-4 h-4" />,
      },
      {
        label: "Help & Support",
        href: "/dashboard/help",
        icon: <HelpCircle className="w-4 h-4" />,
      },
      {
        label: (data) => {
          if (!data) return "Loading...";
          return data.title || data.name || "Help Article";
        },
        queryKey: (params) => [`/help/articles/${params[0]}`],
        dataPath: "title",
        fallback: (id) => {
          // Handle common help page routes with readable names
          // const helpPageNames: Record<string, string> = {
          //   'getting-started': 'Getting Started',
          //   'account-setup': 'Account Setup',
          //   'social-accounts': 'Social Accounts',
          //   'posting': 'Posting Content',
          //   'scheduling': 'Scheduling Posts',
          //   'analytics': 'Analytics',
          //   'billing': 'Billing & Plans',
          //   'troubleshooting': 'Troubleshooting',
          //   'api': 'API Documentation',
          //   'privacy': 'Privacy Policy',
          //   'terms': 'Terms of Service',
          // };

          return `Help: ${
            id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ")
          }`;
        },
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },

  // Future route examples (commented for now, easy to enable later):

  // Teams detail route: /dashboard/teams/:teamId
  // {
  //   pattern: /^\/dashboard\/teams\/([^\/]+)$/,
  //   segments: [
  //     {
  //       label: 'Dashboard',
  //       href: '/dashboard',
  //       icon: <Home className="w-4 h-4" />,
  //     },
  //     {
  //       label: 'Teams',
  //       href: '/dashboard/teams',
  //       icon: <Users className="w-4 h-4" />,
  //     },
  //     {
  //       label: (data) => data?.name || 'Loading...',
  //       queryKey: (params) => [`/teams/${params[0]}`],
  //       dataPath: 'name',
  //       fallback: (id) => `Team ${id.slice(0, 8)}...`,
  //       icon: <Users className="w-4 h-4" />,
  //     },
  //   ],
  // },
];

// Static breadcrumb mapping for non-dynamic routes
export const staticBreadcrumbMap: Record<
  string,
  { label: string; icon?: React.ReactNode }
> = {
  accounts: {
    label: "Social Accounts",
    icon: <Settings className="w-4 h-4" />,
  },
  scheduled: {
    label: "Scheduled Posts",
    icon: <Calendar className="w-4 h-4" />,
  },
  posts: {
    label: "Published Posts",
    icon: <Calendar className="w-4 h-4" />,
  },
  "post-flow": {
    label: "Create Post",
    icon: <Plus className="w-4 h-4" />,
  },
  "create-post": {
    label: "Create Post",
    icon: <Plus className="w-4 h-4" />,
  },
  collections: {
    label: "Collections",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  teams: {
    label: "Team Management",
    icon: <Users className="w-4 h-4" />,
  },
  analytics: {
    label: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  settings: {
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
  billing: {
    label: "Billing",
    icon: <CreditCard className="w-4 h-4" />,
  },
  help: {
    label: "Help & Support",
    icon: <HelpCircle className="w-4 h-4" />,
  },
};
