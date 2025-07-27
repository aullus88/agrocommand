# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgroCommand is a comprehensive agricultural management platform built with Next.js 15 and App Router. This application provides farmers with complete control over their operations through an intuitive dashboard system covering operational monitoring, financial management, market intelligence, production analytics, risk management, ESG compliance, logistics control, and a war room dashboard for executive decision making.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

### Route Groups & Structure
The app uses Next.js route groups for organization:
- `(auth)` - Authentication routes (login, signup)
- `(dashboard)` - Protected dashboard routes with comprehensive agricultural modules
- `(external)` - Public routes

### Dashboard Module Structure
The platform is organized into 10 main agricultural management areas:
1. **Visão Executiva** (`/dashboard`) - Executive dashboard homepage
2. **Monitoramento Operacional** - Operations map, fleet management, weather sensors
3. **Análise Financeira** - Financial overview, debt management, cash flow
4. **Comercialização e Hedge** - Trading positions, market analysis, CPR management
5. **Produtividade e Qualidade** - Field performance, input analysis, benchmarks
6. **Gestão de Riscos** - Risk panels, scenarios, alerts and contingencies
7. **Logística e Armazenagem** - Storage and transportation optimization
8. **ESG e Sustentabilidade** - Sustainability tracking and environmental monitoring
9. **Inteligência Competitiva** - Market intelligence and competitive analysis
10. **Centro de Comando (War Room)** - Executive command center

### Authentication System
- **Supabase Auth** with email/password and Google OAuth
- **Middleware protection**: `middleware.ts` redirects unauthenticated users to `/login`
- **Auth state management**: `AuthProvider` context in `components/auth/auth-provider.tsx`
- **Auth hooks**: `useAuth` hook in `hooks/use-auth.ts` provides auth methods and state
- **Google One-Tap**: Available via `components/google-one-tap.tsx` for seamless sign-in

### Component Architecture
- **Server Components**: Used for static content and data fetching (default in App Router)
- **Client Components**: For interactivity, marked with 'use client'
- **Route-specific components**: Located in `components/` folders within route directories
- **Global components**: In root `/components/` directory

### Key Patterns & Features
- **Loading states**: Route-level `loading.tsx` files with Next.js 15 streaming
- **Skeleton components**: Content-aware placeholders in `components/skeletons/`
- **Error boundaries**: Graceful error handling via `components/error-boundary.tsx`
- **Theme system**: Dark/light/system modes via `next-themes` and `components/theme-provider.tsx`
- **Toast notifications**: User feedback using Sonner (`components/ui/sonner.tsx`)
- **Page transitions**: Smooth animations via Framer Motion (`components/page-transition.tsx`)
- **Drag & Drop**: @dnd-kit integration for interactive interfaces
- **Data visualization**: Charts and tables using Recharts and TanStack Table

### State Management Stack
- **Zustand**: Client-side state management
- **TanStack Query**: Server state, caching, and data fetching
- **React Hook Form + Zod**: Form handling with schema validation
- **Context API**: Auth state via AuthProvider

### Styling & UI
- **Tailwind CSS 4.x**: Utility-first styling with custom configuration
- **shadcn/ui**: Complete component library with Radix UI primitives
- **class-variance-authority**: Component variant management
- **Framer Motion**: Animations and page transitions
- **Geist fonts**: Modern typography (Sans & Mono)

## Environment Setup

Required environment variables for Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID= (optional)
```

## Database & Migrations

Uses Supabase CLI for database management:
- **Local config**: `supabase/config.toml`
- **Create migrations**: `supabase db diff -f migration_name`
- **Push to remote**: `supabase db push`
- **Link project**: `supabase link --project-ref YOUR_PROJECT_REF`

## Important File Locations

### Configuration Files
- `middleware.ts` - Auth middleware and route protection
- `tsconfig.json` - TypeScript configuration with `@/*` path aliases
- `components.json` - shadcn/ui configuration
- `supabase/config.toml` - Supabase local development config

### Core Utilities
- `utils/supabase/` - Supabase client configurations (client, server, middleware)
- `lib/utils.ts` - Utility functions and helpers
- `hooks/` - Custom React hooks including auth and mobile detection

### UI Components
- `components/ui/` - shadcn/ui components
- `components/loading/` - Loading utilities, spinners, and progressive loaders
- `components/skeletons/` - Skeleton loading components
- `app/layout.tsx` - Root layout with providers (Auth, Theme, Error Boundary)

## Development Patterns

### Adding New Routes
1. Create route group folder in `app/` (e.g., `(dashboard)/new-module/`)
2. Add `page.tsx`, `loading.tsx`, and optional `components/` folder
3. Protected routes automatically redirect unauthenticated users

### Component Development
- Use Server Components by default for better performance
- Add `'use client'` only when needed for interactivity
- Place route-specific components in local `components/` folders
- Use global components from root `/components/` directory

### Authentication Integration
```typescript
import { useAuth } from '@/hooks/use-auth'

const { user, loading, signOut } = useAuth()
```