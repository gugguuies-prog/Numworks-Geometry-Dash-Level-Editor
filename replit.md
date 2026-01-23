# NumWorks Level Studio

## Overview

A web-based level editor for creating Geometry Dash-style levels for NumWorks calculators. Users can design levels with blocks and spikes, customize colors, and export their creations as Python scripts compatible with the NumWorks calculator platform.

The application provides a visual canvas editor where users can place game elements, configure level properties (background color, ground color, level length), and manage multiple levels. The exported Python code follows the format used by the NumWorks Geometry Dash recreation project.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with React plugin

The frontend follows a component-based architecture with:
- `pages/` - Route-level components (Editor, AuthPage)
- `components/` - Reusable UI components (EditorCanvas, ColorPicker)
- `components/ui/` - shadcn/ui base components
- `hooks/` - Custom React hooks for data fetching and auth
- `lib/` - Utility functions and query client configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful endpoints defined in `shared/routes.ts`
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

API routes are organized around resources:
- `/api/user` - Authentication endpoints
- `/api/levels` - Level data CRUD operations
- `/api/export` - Python script generation

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit with `db:push` command

Key database tables:
- `users` - User accounts with email/password
- `user_levels` - JSONB storage for level data per user

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle table definitions and Zod validation schemas
- `routes.ts` - API route definitions with type-safe request/response schemas

This architecture enables end-to-end type safety from database to UI.

### Build System
- Development: Vite dev server with HMR, Express backend via tsx
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Custom build script in `script/build.ts` handles both frontend and backend compilation

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage in PostgreSQL

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **react-colorful**: Color picker for level background/ground colors
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

### Development Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Backend bundling for production
- **TypeScript**: Type checking across the entire codebase

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator