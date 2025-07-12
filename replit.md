# SkillSwap Platform

## Overview

SkillSwap is a minimalist skill exchange platform where users can connect to trade skills and knowledge. The application uses a modern full-stack architecture with React frontend, Express.js backend, PostgreSQL database via Neon, and integrates Replit's authentication system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit's OIDC-based authentication system
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with JSON responses

### Database Design
- **Provider**: Neon PostgreSQL (serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Core Tables**:
  - `users` - User profiles and authentication data
  - `skills` - User skills (offered/wanted) with proficiency levels
  - `availability` - Time slot scheduling
  - `swap_requests` - Skill exchange requests with status tracking
  - `reviews` - Post-exchange feedback system
  - `reports` - User reporting/moderation system
  - `sessions` - Express session storage

## Key Components

### Authentication System
- **Provider**: Replit OIDC integration
- **Session Storage**: PostgreSQL-backed express sessions
- **User Management**: Automatic user creation/updates on login
- **Authorization**: Route-level protection with middleware

### Skill Management
- **Skill Types**: "offered" and "wanted" skills
- **Proficiency Levels**: beginner, intermediate, expert
- **Search & Discovery**: Text-based search with filtering
- **Categories**: Dynamic skill categorization

### Availability Scheduling
- **Time Slots**: Day-of-week with start/end times
- **Flexible Scheduling**: Multiple slots per day support
- **Timezone Handling**: Client-side time management

### Exchange System
- **Request Flow**: Request → Accept/Reject → Complete → Review
- **Status Tracking**: pending, accepted, completed, rejected, cancelled
- **Messaging**: Basic communication through request messages
- **Feedback Loop**: Review system for completed exchanges

### Admin Features
- **Dashboard**: Platform statistics and monitoring
- **User Management**: View all users and swap requests
- **Moderation**: Report handling and user management
- **Analytics**: Basic platform metrics

## Data Flow

1. **User Authentication**: Replit OIDC → Express session → Database user record
2. **Profile Creation**: User data → Skills input → Availability setup
3. **Discovery**: Search skills → Filter results → View profiles
4. **Exchange Request**: Send request → Notification → Accept/Reject → Scheduling
5. **Completion**: Mark complete → Leave reviews → Update metrics

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Authentication**: OIDC provider for user management
- **Replit Hosting**: Development and deployment platform

### UI/UX Libraries
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Development Tools
- **TypeScript**: Type safety across frontend/backend
- **Vite**: Frontend build tool and dev server
- **Drizzle**: Type-safe ORM and migration tool
- **TanStack Query**: Server state management

## Deployment Strategy

### Development Environment
- **File Structure**: Monorepo with client/, server/, and shared/ directories
- **Dev Server**: Vite development server with Express API proxy
- **Hot Reload**: Automatic refresh for both frontend and backend changes
- **Database**: Neon PostgreSQL with environment-based connection

### Production Build
- **Frontend**: Static assets built to dist/public/
- **Backend**: Bundled Node.js application with esbuild
- **Database**: Production Neon instance with connection pooling
- **Environment**: Replit deployment with environment variables

### Configuration Management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID
- **Type Safety**: Shared schema types between frontend/backend
- **Path Aliases**: Organized imports with @/ and @shared/ prefixes