# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 boilerplate application with App Router, built for authentication-enabled web applications. The project uses TypeScript, Supabase for authentication and database, shadcn/ui components, and Tailwind CSS for styling.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

### Route Groups & Structure
The app uses Next.js route groups for organization:
- `(auth)` - Authentication routes (login, signup)
- `(dashboard)` - Protected dashboard routes
- `(external)` - Public routes

### Authentication System
- Supabase Auth with email/password and Google OAuth
- Middleware-protected routes via `middleware.ts`
- Auth state managed through `AuthProvider` context
- Custom `useAuth` hook for consuming auth state

### Component Architecture
- **Server Components**: Used for static content and data fetching (default in App Router)
- **Client Components**: For interactivity, marked with 'use client'
- **Route-specific components**: Located in `components/` folders within route directories
- **Global components**: In root `/components/` directory

### Key Patterns
- Loading states using `loading.tsx` files and Suspense boundaries
- Skeleton components for content placeholders
- Error boundaries for graceful error handling
- Theme support via `next-themes` with system preference detection
- Toast notifications using Sonner

### State Management
- Zustand for client-side state
- TanStack Query for server state and caching
- React Hook Form with Zod validation for forms

### Styling
- Tailwind CSS with custom configuration
- CSS custom properties for theming
- Component variants using `class-variance-authority`
- Animation support via Framer Motion

## Environment Setup

Required environment variables for Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID= (optional)
```

## Database & Migrations

Uses Supabase CLI for database management:
- Local config: `supabase/config.toml`
- Migrations: `supabase db diff -f migration_name`
- Push to remote: `supabase db push`

## Path Aliases

TypeScript path mapping configured with `@/*` pointing to repository root.