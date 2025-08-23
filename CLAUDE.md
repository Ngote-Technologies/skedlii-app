# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the frontend React application for Skedlii, an AI-powered social media management platform. The application is built with modern web technologies and provides a comprehensive dashboard for managing social media accounts, creating content, and scheduling posts.

## Tech Stack & Architecture

### Core Technologies
- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6.0+ with hot module replacement (HMR)
- **Styling**: TailwindCSS 3.4+ with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: Zustand with persistence middleware
- **Data Fetching**: TanStack Query (React Query) 5.x with Axios
- **Routing**: React Router v7 with nested routing
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion + TailwindCSS Animate
- **Icons**: Lucide React + React Icons
- **Analytics**: Vercel Analytics integration
- **Error Tracking**: Sentry with React error boundaries

### Key Dependencies
- **UI Libraries**: @radix-ui/* components, @headlessui/react, @mui/material
- **Development Tools**: TypeScript 5.6+, ESLint, Playwright (testing)
- **Media Handling**: browser-image-compression for image optimization
- **Date Handling**: date-fns-tz for timezone support
- **Drag & Drop**: @dnd-kit for sortable interfaces
- **Charts**: Recharts for analytics visualizations

## Development Commands

- **Development server**: `npm run dev` - Starts Vite development server with HMR at http://localhost:5173
- **Build**: `npm run build` - TypeScript compilation + Vite production build
- **Lint**: `npm run lint` - Run ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally

## Architecture Patterns

### Project Structure
```
src/
├── components/           # Feature components organized by domain
│   ├── ui/              # Reusable UI components (shadcn/ui based)
│   ├── auth/            # Authentication forms and modals
│   ├── dashboard/       # Dashboard overview components
│   ├── posts/           # Post creation and management
│   ├── social-accounts/ # Social platform integrations
│   ├── billing/         # Subscription and billing
│   ├── settings/        # User and app settings
│   └── [domain]/        # Other feature domains
├── layouts/             # Layout wrapper components
├── pages/               # Route page components
├── routes/              # Routing configuration and guards
├── store/               # Zustand stores for global state
├── api/                 # API client modules and types
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── types/               # TypeScript type definitions
├── utils/               # Helper utilities
└── constants/           # App-wide constants
```

### State Management Architecture

**Zustand Stores** (Global State):
- `authStore.ts` - Authentication, user permissions, subscription info
- `organizationStore.ts` - Multi-organization management
- `teamStore.ts` - Team management and switching
- `themeStore.ts` - Theme preferences (light/dark/system)
- `layoutStore.ts` - UI layout preferences (sidebar collapsed, etc.)
- `progressStore.ts` - Global loading states and progress indicators

**React Query** (Server State):
- Centralized in `lib/queryClient.ts` with custom configuration
- Feature-based API modules in `api/` directory
- Automatic request/response interceptors with auth token handling
- Optimistic updates and error handling patterns

### Authentication & Authorization

**Authentication Flow**:
- JWT tokens stored in localStorage with automatic refresh
- Axios interceptors handle token attachment and 401/403 responses
- Auth store manages user state, roles, and computed permissions
- Protected/Public route components control access

**Role-Based Access Control (RBAC)**:
- Backend-computed permissions (single source of truth)
- Role hierarchy: `super_admin` > `org_owner` > `admin` > `member` > `viewer`
- Subscription-aware permissions with feature gating
- Organization-scoped access control with inheritance

**Permission System**:
```typescript
interface AuthState {
  // Core permissions computed by backend
  isAdmin: boolean;
  canManageOrganization: boolean;
  canManageBilling: boolean;
  canConnectSocialAccounts: boolean;
  canCreateTeams: boolean;
  
  // Context
  userRole: UserRole;
  userType: "individual" | "organization";
  subscriptionInfo: SubscriptionInfo;
}
```

### API Architecture

**Centralized HTTP Client**:
```typescript
// src/api/axios.ts - Main Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" }
});
```

**Request/Response Interceptors**:
- Automatic JWT token attachment
- Request timestamp headers for debugging
- 401/403 error handling with user logout
- Organization context handling (when needed)

**API Module Pattern**:
```typescript
// Example: src/api/posts.ts
export const postsApi = {
  getPosts: (): Promise<Post[]> => apiRequest('GET', '/posts'),
  createPost: (data: CreatePostData): Promise<Post> => 
    apiRequest('POST', '/posts', data),
  // ... other methods
};
```

### Component Architecture

**UI Component System**:
- Built on Radix UI primitives with custom styling
- Comprehensive design system with consistent variants
- Component variants using `class-variance-authority` (cva)
- TailwindCSS utilities with custom design tokens

**Feature Component Organization**:
- Domain-driven component structure
- Co-located hooks, utilities, and types
- Lazy loading with React.lazy() and Suspense
- Consistent prop interfaces and TypeScript types

**Enhanced UI Components** (Recent Improvements):
- Modern theme system with glass morphism effects
- Button variants: gradient, loading states, icon buttons
- Enhanced forms with floating labels, validation styling
- Card variants: elevated, outline, glass, gradient
- Advanced data tables with sorting, filtering, search
- Modal/Dialog system with backdrop effects

### Routing Architecture

**Route Structure**:
```typescript
// Public routes
/ (landing), /login, /register, /pricing, etc.

// Protected dashboard routes (nested under /dashboard)
/dashboard               - Overview
/dashboard/accounts      - Social accounts management
/dashboard/posts         - Content creation and management
/dashboard/scheduled     - Scheduled posts calendar
/dashboard/analytics     - Performance analytics
/dashboard/teams         - Team management
/dashboard/organizations - Organization management
/dashboard/billing       - Subscription and billing
/dashboard/settings      - User settings
```

**Route Guards**:
- `ProtectedRoute` - Requires authentication
- `PublicRoute` - Redirects authenticated users
- Role-based route protection with permission checks

### Form Architecture

**Form Handling Pattern**:
```typescript
// React Hook Form + Zod validation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
});

const onSubmit = async (data: FormData) => {
  try {
    await api.submitForm(data);
    toast({ title: "Success" });
  } catch (error) {
    toast({ title: "Error", variant: "destructive" });
  }
};
```

**Validation Schemas**:
- Zod schemas for type-safe validation
- Real-time validation feedback
- Custom error handling with toast notifications

## Current Development Focus

### Active Features
- **Multi-Organization Management**: Organization switching, member management, role-based access
- **Enhanced Post Creation**: Step-by-step flow with media upload, platform-specific captions
- **Social Account Integration**: OAuth flows for Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube, Threads
- **Advanced Analytics**: Performance tracking, engagement metrics, growth insights
- **Team Collaboration**: Team creation, member invitations, role management

### Recent UI/UX Enhancements
Following the comprehensive **UI Enhancement Roadmap** (see `docs/UI_ENHANCEMENT_ROADMAP.md`):

**Completed Phases** (✅):
1. **Foundation & Core UI Components** - Enhanced buttons, inputs, cards, badges, dialogs
2. **Landing Page & Marketing** - Modern hero, features, testimonials, pricing sections
3. **Authentication & Onboarding** - Glass morphism auth modals, password strength indicators
4. **Dashboard & Navigation** - Collapsible sidebar, breadcrumbs, search, analytics widgets
5. **Post Creation & Management** - Step progress, character counting, drag-and-drop media
6. **Social Accounts & Integrations** - Account cards, platform selector, health indicators
7. **Settings & Profile** - Modern settings interface, avatar upload, security features
8. **Billing & Subscription** - Usage meters, pricing cards, invoice management
9. **Mobile Responsiveness** - Touch navigation, camera integration, swipe gestures
10. **Advanced Features & Polish** - Animations, accessibility, micro-interactions

**Design System Features**:
- Glass morphism effects and gradient backgrounds
- Comprehensive animation system with Framer Motion
- Mobile-first responsive design patterns
- Dark/light theme support with system preference detection
- WCAG 2.1 AA accessibility compliance
- Advanced loading states and skeleton screens

### Environment Configuration

**Environment Variables**:
```env
VITE_API_URL=<backend_api_url>          # Backend API base URL
VITE_SENTRY_DSN=<sentry_dsn>           # Error tracking (optional)
```

**Development Features**:
- Eruda mobile debugging (enabled with `?debug` URL parameter)
- Bundle analysis with rollup-plugin-visualizer
- Mobile LAN IP detection for device testing
- Proxy configuration for local backend development

## Development Guidelines

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration with React and TypeScript rules
- Consistent naming conventions (camelCase, PascalCase)
- Component props interfaces with proper TypeScript types
- Error boundaries and graceful error handling

### Performance Optimization
- Lazy loading with React.lazy() and Suspense
- React Query for efficient data fetching and caching
- Image optimization with browser-image-compression
- Vite's built-in code splitting and optimization
- Minimal bundle size with tree shaking

### Testing Strategy
- Component testing with Playwright
- Cross-browser compatibility testing
- Mobile device testing with LAN IP configuration
- Theme testing (light/dark/system modes)
- Accessibility testing with screen readers

### Security Practices
- Secure token storage and automatic cleanup
- XSS prevention with proper data sanitization
- CSRF protection with request headers
- Secure file upload handling
- Environment variable security

## Integration Points

### Backend API Integration
- RESTful API with consistent response patterns
- Multi-tenancy support with organization context
- Real-time features (where applicable)
- File upload endpoints for media content
- Webhook integrations for external platforms

### Third-Party Services
- **Social Platforms**: OAuth integration for major social networks
- **Payment Processing**: Stripe integration for subscriptions
- **Analytics**: Vercel Analytics for usage tracking
- **Error Tracking**: Sentry for error monitoring and debugging
- **CDN**: Asset delivery and optimization

### Mobile Integration
- Progressive Web App (PWA) capabilities
- Camera access for content creation
- Touch-optimized navigation patterns
- Responsive image handling
- Offline capability (future enhancement)

## Deployment & Hosting

### Build Configuration
- Vite production build with TypeScript compilation
- Asset optimization and compression
- Source map generation for debugging
- Environment-specific configuration

### Hosting Platform
- Optimized for Vercel deployment
- Static site generation where applicable
- API route proxying and redirects
- Performance monitoring integration

This architecture provides a solid foundation for a modern, scalable social media management platform with excellent user experience, comprehensive feature set, and maintainable codebase.