# Desi Events Leeds

## Overview

Desi Events Leeds is a community-driven event discovery platform designed specifically for the Indian community in Leeds. The application enables users to discover local cultural events, festivals, workshops, and networking opportunities. Event organizers can create and manage their event listings, while the general public can browse and search for events of interest. The platform operates as a discovery and listing service without integrated ticketing or payment processing—users contact event organizers directly through provided contact information.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 2, 2025 - Image Upload Feature for Events
- **Added** Replit Object Storage integration for event image uploads
- **Added** `imageUrl` field to events database schema (optional text field)
- **Implemented** secure image upload endpoints with ACL ownership validation
- **Created** `ObjectUploader` component with upload modal, preview, and 5MB file size limit
- **Updated** event form to include optional image upload functionality
- **Updated** event detail page to display uploaded images with gradient fallback
- **Security**: ACL policies prevent unauthorized users from claiming ownership of others' images
- **Files**: `server/objectStorage.ts`, `server/objectAcl.ts`, `client/src/components/ObjectUploader.tsx`

### October 2, 2025 - Authentication System Migration
- **Replaced** Replit Auth (OpenID Connect) with traditional email/password authentication
- **Added** signup page (`/signup`) with email, password, firstName, lastName fields
- **Added** login page (`/login`) with email and password fields
- **Updated** database schema to include password field (bcrypt hashed)
- **Implemented** Passport Local Strategy for authentication (`server/localAuth.ts`)
- **Updated** all routes to use `req.user.id` instead of `req.user.claims.sub`
- **Updated** navbar with login/signup buttons and user dropdown menu
- **Security**: Passwords hashed with bcrypt (10 rounds), responses sanitize password field

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
- Passport.js with Local Strategy for email/password authentication
- Express sessions stored in PostgreSQL for persistence
- Bcrypt for secure password hashing

**API Design:**
- RESTful endpoints organized in `routes.ts`
- Public routes for event browsing and searching (no authentication required)
- Protected routes for event creation, editing, and deletion (authentication required)
- Admin routes with separate credential validation for analytics access
- Middleware-based analytics logging for tracking user interactions

**Authentication Flow:**
- Email/password authentication using Passport Local Strategy
- Passwords hashed with bcrypt (10 salt rounds) before storage
- Session management via `express-session` with PostgreSQL store
- Sign up: POST /api/signup creates user account with email, password, firstName, lastName
- Login: POST /api/login validates credentials and creates session
- Logout: POST /api/logout destroys session
- User information stored in `users` table with password field (hashed)
- Admin access controlled separately via credential validation

### Database Schema

**Tables:**
- `users`: Stores user profiles with email, hashed password, firstName, and lastName
- `sessions`: Session storage table for express-session
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
- Email/password authentication using Passport Local Strategy
- Bcrypt for password hashing (10 salt rounds)
- Requires `SESSION_SECRET` and `DATABASE_URL` environment variables
- Session store uses PostgreSQL connection for persistence via connect-pg-simple

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

**Object Storage:**
- Replit Object Storage for event image uploads
- Secure file upload with ACL (Access Control List) policies
- Public visibility for event images with owner-based access control
- 5MB file size limit enforced on frontend
- Image URLs stored in events table as optional `imageUrl` field

**Third-Party Services:**
- None required beyond database, authentication, and object storage (no payment processors, email services, or external APIs)