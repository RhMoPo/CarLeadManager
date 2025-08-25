# Overview

This is a comprehensive Car Lead Management System built as a full-stack TypeScript application. The system manages car lead submissions, tracks commissions, and coordinates between virtual assistants (VAs) and managers through a role-based interface. VAs can submit and view leads, while managers and superadmins have full access to manage leads, track commissions, generate reports, and handle user management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type safety and modern development
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing

**UI & Styling**
- Tailwind CSS for utility-first styling
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Lucide React for consistent iconography

**State Management & Data Fetching**
- TanStack Query for server state management, caching, and background updates
- React Hook Form with Zod validation for type-safe form handling
- Session-based authentication with automatic session management

**Interactive Features**
- @hello-pangea/dnd for drag-and-drop Kanban board functionality
- Role-based UI rendering (VA vs Manager/Admin views)

## Backend Architecture

**Core Framework**
- Express.js with TypeScript for API development
- Structured middleware pipeline for authentication, rate limiting, and validation

**Authentication & Sessions**
- Iron Session for secure session management with PostgreSQL storage
- Dual authentication system: password-based for admins, magic links for VAs
- bcrypt for password hashing with configurable salt rounds

**Database Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL with comprehensive schema including proper relations and indexes
- Database connection pooling via Neon serverless

**Security & Monitoring**
- express-rate-limit for API protection with role-based limits
- Pino structured logging with sensitive data redaction
- Comprehensive audit logging for all system actions

**Validation & Type Safety**
- Shared Zod schemas between client and server
- Request/response validation middleware
- Runtime environment validation

## Data Architecture

**Database Schema**
- Users table with role-based access (SUPERADMIN, MANAGER, VA)
- VAs table for additional VA-specific information
- Leads table with comprehensive car information and status tracking
- Commissions table for automatic commission calculation and payment tracking
- Audit logs for complete action history
- Session storage integrated with PostgreSQL

**Lead Management Flow**
- Status progression: PENDING → APPROVED → CONTACTED → BOUGHT → SOLD → PAID
- Automatic commission calculation based on individual VA commission rates
- Expense tracking and profit estimation
- Duplicate lead detection
- Per-VA commission system replacing global commission settings

## External Dependencies

**Database**
- PostgreSQL via Neon serverless for production database hosting
- Drizzle ORM for database operations and migrations

**Session Management**
- connect-pg-simple for PostgreSQL session storage
- Iron Session for encrypted session cookies

**Development Tools**
- Vite with React plugin for development server
- ESBuild for production bundling
- TypeScript compiler for type checking

**UI Components**
- Radix UI primitives for accessible base components
- @hello-pangea/dnd for drag-and-drop functionality
- date-fns for date manipulation and formatting

**Authentication**
- bcrypt for password hashing
- Cryptographic randomBytes for magic link token generation

**Logging & Monitoring**
- Pino for structured logging with pretty printing in development
- Optional Sentry integration (disabled by default)

**Validation & Forms**
- Zod for schema validation shared between client and server
- React Hook Form with Zod resolver for form management

**Rate Limiting**
- express-rate-limit for API protection with configurable limits