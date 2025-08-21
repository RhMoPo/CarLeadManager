# Car Lead Management System

A comprehensive full-stack TypeScript application for managing car lead submissions, tracking commissions, and coordinating between virtual assistants and managers.

## Features

- **Role-based Authentication**: SUPERADMIN, MANAGER, and VA roles with different permissions
- **Lead Management**: Complete CRUD operations for car leads with status tracking
- **Kanban Board**: Drag-and-drop interface for managing lead statuses
- **Commission Tracking**: Automatic commission calculation and payment tracking
- **User Management**: Invite system for onboarding new users
- **Reporting & Analytics**: KPIs, VA leaderboards, and performance metrics
- **Magic Link Authentication**: Passwordless login for VAs
- **Audit Logging**: Complete audit trail for all system actions

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** for styling
- **Wouter** for routing
- **TanStack Query** for data fetching
- **React Hook Form** + **Zod** for form validation
- **@hello-pangea/dnd** for drag-and-drop functionality

### Backend
- **Express.js** with TypeScript
- **Iron Session** for session management
- **bcrypt** for password hashing
- **Drizzle ORM** with PostgreSQL
- **Pino** for structured logging
- **express-rate-limit** for API protection

### Database
- **PostgreSQL** with Neon serverless
- Comprehensive schema with proper relations and indexes

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (we recommend Neon)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_PASSWORD=your_session_secret_32_chars_minimum
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your_secure_admin_password

# Optional
DISCORD_WEBHOOK_URL=your_discord_webhook_for_notifications
SENTRY_DSN=your_sentry_dsn_for_error_tracking
