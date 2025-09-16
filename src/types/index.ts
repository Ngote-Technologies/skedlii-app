export interface Organization {
  _id: string;
  name: string;
  description?: string;
  role?: "owner" | "admin" | "member" | "viewer";
  logo?: string;
  status: "active" | "inactive" | "suspended";
  type: "enterprise" | "business" | "startup";
  settings: {
    permissions: string[];
    maxTeams: number;
    maxUsers: number;
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
  memberIds: string[];
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  memberIds: string[];
  settings: {
    permissions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "individual" | "organization";
  organizationId?: string; // Optional for individual users
  role?: "super_admin" | "org_owner" | "team_manager" | "user"; // Optional for individual users
  teamIds?: string[]; // Optional for individual users
  status: "pending" | "active" | "inactive";
  invitationToken?: string;
  settings: {
    permissions: string[];
    theme: "light" | "dark";
    notifications: any[];
    personalPreferences?: Record<string, any>; // For individual user preferences
  };
  createdAt: string;
  updatedAt: string;
  timezone?: string;
  avatar?: string;
  username?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: "paid" | "trialing" | "cancelled" | "inactive";
  subscriptionTier?:
    | "free"
    | "creator"
    | "team"
    | "enterprise"
    | "trial"
    | "basic"
    | "business";
  subscriptionRenewalDate?: string;
  invoices?: any[];
  renewalDate?: string;
  paymentDescription?: string;
  productId?: string;
  paymentStatus:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "expired"
    | "none";
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  teams: Team[];
  loading: boolean;
}

export interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  type: "article" | "social_post" | "video" | "image" | "document";
  url?: string;
  content: string;
  version: number;

  metadata: {
    source: "ai_generated" | "manual" | "imported";
    sourceDetails?: {
      aiModel?: string;
      importSource?: string;
      prompt?: string;
    };
    language: string;
    tags: string[];
    collections: string[]; // Collection IDs this content belongs to
    visibility: "private" | "team" | "organization" | "public";
    customFields: Record<string, any>;
  };

  status: "draft" | "published" | "archived" | "pending_review" | "rejected";
  statusHistory: Array<{
    status: ContentItem["status"];
    timestamp: string;
    updatedBy: string;
    comment?: string;
  }>;

  versionHistory: Array<{
    version: number;
    content: string;
    timestamp: string;
    updatedBy: string;
    comment?: string;
  }>;

  review?: {
    requestedBy: string;
    requestedAt: string;
    reviewers: Array<{
      userId: string;
      status: "pending" | "approved" | "rejected";
      comment?: string;
      timestamp?: string;
    }>;
    requiredApprovals: number;
  };

  publishing: {
    firstPublishedAt?: string;
    lastPublishedAt?: string;
    publishedBy?: string;
    scheduledPublishDate?: string;
    expiryDate?: string;
  };

  analysis: {
    sentiment?: number;
    keywords?: string[];
    categories?: string[];
    entities?: Array<{
      name: string;
      type: string;
      sentiment?: number;
    }>;
    customAnalytics?: Record<string, any>;
  };

  // Organization context
  teamId?: string; // Optional for individual users
  organizationId?: string; // Optional for individual users

  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  analyzedAt?: string;
}

export interface ContentCollection {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  organizationId: string;
  contentIds: string[];
  metadata: {
    tags: string[];
    customFields: Record<string, any>;
  };
  settings: {
    permissions: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  description?: string;
  type: "sentiment" | "classification" | "extraction" | "custom";
  config: {
    models: string[];
    parameters: Record<string, any>;
    preprocessors?: string[];
    postprocessors?: string[];
  };
  teamId: string;
  organizationId: string;
  settings: {
    permissions: string[];
    autoApply: boolean;
    contentTypes: ContentItem["type"][];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Component Props
export interface AccountSelectionProps {
  accounts: any[];
  selectedAccounts: string[];
  onSelectionChange: (accountIds: string[]) => void;
}
