# Desi Events Leeds

## Overview

Desi Events Leeds is a community-driven event discovery platform designed specifically for the Indian community in Leeds. The application enables users to discover local cultural events, festivals, workshops, and networking opportunities. Event organizers can create and manage their event listings, while the general public can browse and search for events of interest. The platform operates as a discovery and listing service without integrated ticketing or payment processing—users contact event organizers directly through provided contact information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS for styling with CSS variables for theming

**Component Structure:**
- Page components handle routing and high-level state (`landing.tsx`, `home.tsx`, `event-detail.tsx`, `my-events.tsx`, `event-form.tsx`, `admin-dashboard.tsx`)
- Reusable UI components from Shadcn library provide consistent design system
- Custom components include `event-card`, `navbar`, `footer`, and `search-filters`
- Form validation using React Hook Form with Zod schema validation

**State Management Strategy:**
- Server state managed through TanStack Query with query key-based caching
- Authentication state accessed via `useAuth` hook
- Session-based authentication with automatic redirect on unauthorized access
- Query invalidation used to keep UI synchronized after mutations

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety across the stack
- Drizzle ORM for type-safe database queries
- Neon serverless PostgreSQL as the database provider
- Passport.js with OpenID Connect for Replit Auth integration
- Express sessions stored in PostgreSQL for persistence

**API Design:**
- RESTful endpoints organized in `routes.ts`
- Public routes for event browsing and searching (no authentication required)
- Protected routes for event creation, editing, and deletion (authentication required)
- Admin routes with separate credential validation for analytics access
- Middleware-based analytics logging for tracking user interactions

**Authentication Flow:**
- Replit Auth using OpenID Connect protocol for user authentication
- Session management via `express-session` with PostgreSQL store
- User information stored in `users` table with automatic provisioning on first login
- Admin access controlled separately via credential validation, not integrated with Replit Auth

### Database Schema

**Tables:**
- `users`: Stores user profiles with Replit Auth integration (mandatory for Replit Auth)
- `sessions`: Session storage table (mandatory for Replit Auth)
- `events`: Event listings with user relationship and all event metadata
- `analytics`: Tracks user interactions (home visits, event views, event creation, logins)

**Key Relationships:**
- Events belong to users through `userId` foreign key with cascade delete
- Analytics optionally references users and events for tracking

**Data Validation:**
- Schema defined using Drizzle ORM with TypeScript types
- Zod schemas generated from Drizzle schema for runtime validation
- Insert schemas used for form validation on both client and server

### External Dependencies

**Authentication:**
- Replit Auth (OpenID Connect) for user authentication
- Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables
- Session store uses PostgreSQL connection for persistence

**Database:**
- Neon serverless PostgreSQL accessed via `@neondatabase/serverless`
- WebSocket connection using `ws` package for serverless compatibility
- Connection string provided via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations and database management

**UI Components:**
- Shadcn UI component library (not a package dependency, code is copied into project)
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling
- Lucide React for icons

**Development Tools:**
- Replit-specific plugins for Vite (cartographer, dev banner, runtime error overlay)
- TSX for running TypeScript in development
- ESBuild for production server bundling

**Third-Party Services:**
- None required beyond database and authentication (no payment processors, email services, or external APIs)