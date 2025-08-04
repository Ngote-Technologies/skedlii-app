# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite development server with HMR
- **Build**: `npm run build` - TypeScript compilation + Vite production build
- **Lint**: `npm run lint` - Run ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally

## Architecture Overview

This is a React + TypeScript social media management application built with Vite. The app follows a feature-based architecture with clear separation of concerns.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Radix UI components + shadcn/ui
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query (TanStack Query) with Axios
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Build Tool**: Vite

### Key Architecture Patterns

**State Management**:
- Zustand stores in `src/store/` for global state (auth, teams, theme, layout)
- React Query for server state management and caching
- Local component state with React hooks

**Authentication Flow**:
- JWT tokens stored in localStorage
- Axios interceptors handle token attachment and 401/403 responses
- Auth store (`authStore.ts`) manages user state and authentication actions
- Protected/Public route components control access

**API Layer**:
- Centralized Axios instance in `src/api/axios.ts` with request/response interceptors
- Feature-based API modules in `src/api/` (auth, billing, teams, etc.)
- React Query integration through `src/lib/queryClient.ts`

**Component Organization**:
- UI components in `src/components/ui/` (shadcn/ui based)
- Feature components grouped by domain (billing, posts, social-accounts, etc.)
- Layout components in `src/layouts/`
- Page components in `src/pages/`

**Routing Structure**:
- Public routes: landing page, auth pages, marketing pages
- Protected dashboard routes under `/dashboard` with nested routing
- Route definitions centralized in `src/routes/index.tsx`

### Key Directories

- `src/components/` - Feature components organized by domain
- `src/api/` - API client modules and type definitions  
- `src/store/` - Zustand stores for global state
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and configurations
- `src/types/` - TypeScript type definitions
- `src/layouts/` - Layout wrapper components
- `src/pages/` - Route page components

### Environment Variables

The app expects `VITE_API_URL` environment variable for the backend API base URL.

### Important Notes

- Uses Radix UI primitives with custom styling via TailwindCSS
- Form validation handled with Zod schemas
- Image compression for uploads via browser-image-compression
- Analytics integration with Vercel Analytics
- Date handling with date-fns-tz for timezone support