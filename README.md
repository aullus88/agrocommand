# AgroCommand

A comprehensive agricultural management platform built with Next.js 15, providing farmers with complete control over their operations through an intuitive dashboard system.

## 🌾 Platform Overview

AgroCommand is a complete agricultural command center that empowers farmers and agribusiness operations with:

- **Operational Monitoring** - Real-time tracking of fleet, equipment, and field operations
- **Financial Management** - Comprehensive debt management and cash flow analysis
- **Market Intelligence** - Trading positions, market analysis, and hedge management
- **Production Analytics** - Productivity metrics, input analysis, and quality benchmarks
- **Risk Management** - Scenario planning, risk assessment, and contingency alerts
- **ESG Compliance** - Sustainability tracking and environmental impact monitoring
- **Logistics Control** - Storage and transportation optimization
- **War Room Dashboard** - Executive command center for critical decision making

## 🏗 Platform Architecture

### Page Structure
```
Dashboard Principal
├── 1. Visão Executiva (Home)
├── 2. Monitoramento Operacional
│   ├── 2.1 Mapa de Operações
│   ├── 2.2 Frota e Equipamentos
│   └── 2.3 Clima e Sensores
├── 3. Análise Financeira
│   ├── 3.1 Visão Geral Financeira
│   ├── 3.2 Gestão de Dívidas
│   └── 3.3 Fluxo de Caixa
├── 4. Comercialização e Hedge
│   ├── 4.1 Posições e Contratos
│   ├── 4.2 Análise de Mercado
│   └── 4.3 Gestão CPR
├── 5. Produtividade e Qualidade
│   ├── 5.1 Performance por Talhão
│   ├── 5.2 Análise de Insumos
│   └── 5.3 Histórico e Benchmarks
├── 6. Gestão de Riscos
│   ├── 6.1 Painel de Riscos
│   ├── 6.2 Cenários e Simulações
│   └── 6.3 Alertas e Contingências
├── 7. Logística e Armazenagem
├── 8. ESG e Sustentabilidade
├── 9. Inteligência Competitiva
└── 10. Centro de Comando (War Room)
```

## ✨ Technical Features

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Supabase Auth** - Email + Google OAuth + One-Tap
- **shadcn/ui** - Complete component library
- **Tailwind CSS** - Utility-first styling
- **Dark Mode** - System/manual theme switching
- **Toast Notifications** - User feedback system
- **Page Transitions** - Smooth Framer Motion animations
- **Loading States** - Next.js 15 streaming & Suspense
- **Skeleton Components** - Content-aware loading placeholders
- **Error Boundaries** - Graceful error handling
- **Route Groups** - Organized app structure

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <agrocommand-repo>
cd AgroCommand/App
npm install
```

### 2. Environment Setup
Create `.env.local` with your environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

- **Supabase**: Get from [Supabase Dashboard](https://app.supabase.com)
- **Google OAuth**: Setup in [Google Cloud Console](https://console.cloud.google.com)

### 3. Supabase Setup
1. Create a new Supabase project
2. Enable Email and Google OAuth providers
3. Configure Google OAuth redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 4. Google Cloud Console Setup
1. Create OAuth 2.0 credentials
2. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-supabase-project.supabase.co/auth/v1/callback`

### 5. Connect to Remote Supabase
```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Pull existing migrations (if any)
supabase db pull

# Or create new migrations
supabase db diff -f your_migration_name

# Push to remote
supabase db push
```

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Authentication routes
│   │   ├── login/
│   │   │   ├── components/  # Local login components
│   │   │   │   └── login-form.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── signup/
│   │       ├── components/  # Local signup components
│   │       │   └── signup-form.tsx
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── dashboard/           # 1. Visão Executiva (Home)
│   │   │   ├── components/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── monitoring/          # 2. Monitoramento Operacional
│   │   │   ├── operations-map/      # 2.1 Mapa de Operações
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── fleet/              # 2.2 Frota e Equipamentos
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── weather-sensors/    # 2.3 Clima e Sensores
│   │   │       ├── components/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── financial/           # 3. Análise Financeira
│   │   │   ├── overview/           # 3.1 Visão Geral Financeira
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── debt-management/    # 3.2 Gestão de Dívidas
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── cash-flow/          # 3.3 Fluxo de Caixa
│   │   │       ├── components/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── trading/             # 4. Comercialização e Hedge
│   │   │   ├── positions/          # 4.1 Posições e Contratos
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── market-analysis/    # 4.2 Análise de Mercado
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── cpr-management/     # 4.3 Gestão CPR
│   │   │       ├── components/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── productivity/        # 5. Produtividade e Qualidade
│   │   │   ├── field-performance/  # 5.1 Performance por Talhão
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── input-analysis/     # 5.2 Análise de Insumos
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── benchmarks/         # 5.3 Histórico e Benchmarks
│   │   │       ├── components/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── risk-management/     # 6. Gestão de Riscos
│   │   │   ├── risk-panel/         # 6.1 Painel de Riscos
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── scenarios/          # 6.2 Cenários e Simulações
│   │   │   │   ├── components/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── alerts/             # 6.3 Alertas e Contingências
│   │   │       ├── components/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── logistics/           # 7. Logística e Armazenagem
│   │   │   ├── components/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── esg/                 # 8. ESG e Sustentabilidade
│   │   │   ├── components/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── intelligence/        # 9. Inteligência Competitiva
│   │   │   ├── components/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── war-room/            # 10. Centro de Comando (War Room)
│   │       ├── components/
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── auth/callback/    # OAuth callback handler
│   ├── components/       # Shared app-level components
│   └── layout.tsx        # Root layout with providers
├── components/           # Global shared components
│   ├── auth/            # Shared auth components
│   ├── loading/         # Loading utilities & spinners
│   ├── skeletons/       # Skeleton components
│   ├── ui/              # shadcn/ui components
│   ├── animated-button.tsx
│   ├── error-boundary.tsx
│   ├── google-one-tap.tsx
│   ├── page-transition.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities
├── supabase/            # Supabase configuration
│   └── config.toml      # Local dev settings
├── utils/
│   └── supabase/        # Supabase client configuration
└── middleware.ts        # Auth middleware
```

## 🔐 Authentication

### Available Auth Methods
- **Email/Password** - Traditional auth
- **Google OAuth** - Redirect-based
- **Google One-Tap** - Seamless sign-in (HTTPS required)

### Protected Routes
Routes in `(dashboard)` are automatically protected by middleware.

### Usage Example
```tsx
import { useAuth } from '@/hooks/use-auth'

export function MyComponent() {
  const { user, signOut, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome, {user.email}!</div>
}
```

## 🎨 UI Components

This boilerplate includes a complete set of shadcn/ui components:
- Forms, buttons, modals
- Navigation, cards, badges  
- Data display, feedback
- And much more!

### Adding New Components
```bash
npx shadcn@latest add <component-name>
```

## 🌗 Dark Mode

Dark mode is fully supported with system preference detection:

### Usage Example
```tsx
import { ThemeToggle } from '@/components/theme-toggle'

// Dropdown with Light/Dark/System options
<ThemeToggle />

// Simple toggle between light/dark (available in theme-toggle.tsx)
// Check the component file for available variants
```

### Programmatic Control
```tsx
import { useTheme } from 'next-themes'

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle theme
    </button>
  )
}
```

## 🎬 Animations & Transitions

Beautiful animations powered by Framer Motion:

### Page Transitions
```tsx
import { PageTransition } from '@/components/page-transition'

export default function MyPage() {
  return (
    <PageTransition>
      <div>Your page content</div>
    </PageTransition>
  )
}
```

### Animated Components
```tsx
import { AnimatedButton } from '@/components/animated-button'

// Button with hover/tap animations
<AnimatedButton>Click me</AnimatedButton>

// Configure custom animations
<AnimatedButton 
  whileHover={{ scale: 1.05 }} 
  whileTap={{ scale: 0.95 }}
>
  Custom Animation
</AnimatedButton>
```

### Stagger Animations
```tsx
import { motion } from 'framer-motion'
// Define stagger variants (see dashboard components for examples)
const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } }
}

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerChild}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## 🔔 Toast Notifications

User feedback system with Sonner:

### Usage Examples
```tsx
import { toast } from 'sonner'

// Success notification
toast.success('Success!', {
  description: 'Your action was completed successfully.'
})

// Error notification
toast.error('Error!', {
  description: 'Something went wrong.'
})

// Info notification
toast.info('Info', {
  description: 'Here's some information for you.'
})

// Loading toast
const promise = () => new Promise((resolve) => setTimeout(resolve, 2000))
toast.promise(promise, {
  loading: 'Loading...',
  success: 'Success!',
  error: 'Error occurred.',
})
```

## 🔄 Loading States & Streaming

Professional loading states following Next.js 15 best practices:

### Route-Level Loading (loading.tsx)
Automatic loading UI for entire routes:
```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <DashboardSkeleton />
}
```

**Benefits:**
- ✅ Instant navigation feedback
- ✅ Automatic Suspense boundaries  
- ✅ Interruptible navigation
- ✅ SEO-friendly streaming

### Skeleton Components
Content-aware loading placeholders:

```tsx
import { 
  CardSkeleton, 
  ListSkeleton, 
  FormSkeleton,
  TableSkeleton,
  StatsCardSkeleton 
} from '@/components/skeletons'

// Basic usage
<CardSkeleton />
<ListSkeleton items={5} showAvatar />
<FormSkeleton fields={3} />

// Available skeleton components
<PageSkeleton />
// Note: Create specialized skeletons as needed for your project
```

### Component-Level Suspense
Granular loading for specific sections:

```tsx
import { Suspense } from 'react'
import { StatsCardSkeleton } from '@/components/skeletons'

<Suspense fallback={<StatsCardSkeleton />}>
  <StatsGrid />
</Suspense>
```

### Loading Utilities

**Spinners & Indicators:**
```tsx
import { 
  LoadingSpinner, 
  ProgressiveLoader 
} from '@/components/loading'

<LoadingSpinner size="lg" text="Loading..." />
<ProgressiveLoader 
  stages={[ /* your stages */ ]}
  onComplete={() => console.log('Done!')}
/>
```

**Loading Boundaries:**
```tsx
import { LoadingBoundary } from '@/components/loading'

<LoadingBoundary
  fallback={<MySkeleton />}
  errorMessage="Failed to load data"
  onRetry={() => refetch()}
>
  <MyComponent />
</LoadingBoundary>
```

**Progressive Loading:**
```tsx
import { ProgressiveLoader } from '@/components/loading'

<ProgressiveLoader
  stages={[
    { id: 'header', component: Header, skeleton: HeaderSkeleton },
    { id: 'content', component: Content, skeleton: ContentSkeleton, delay: 200 }
  ]}
  onComplete={() => console.log('All loaded!')}
/>
```

### Server + Client Hybrid Pattern

**Server Components** for static content + data fetching:
```tsx
// app/dashboard/page.tsx (Server Component)
import { Suspense } from 'react'

export default async function Dashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>
      
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid />
      </Suspense>
      
      <InteractiveSection /> {/* Client Component */}
    </div>
  )
}

async function StatsGrid() {
  const stats = await fetchStats() // Server-side data fetching
  return <StatsDisplay stats={stats} />
}
```

**Client Components** for interactivity:
```tsx
// components/InteractiveSection.tsx
'use client'

export function InteractiveSection() {
  const [data, setData] = useState(null)
  // Client-side interactions, animations, etc.
  return <InteractiveContent />
}
```

### Loading Patterns Comparison

| Pattern | Use Case | Performance | SEO |
|---------|----------|-------------|-----|
| `loading.tsx` | Route navigation | ⚡ Instant | ✅ Perfect |
| Component Suspense | Data sections | 🚀 Streaming | ✅ Good |
| Client loading | Interactions | 💫 Smooth | ⚠️ Limited |
| Progressive | Complex pages | 📈 Optimized | ✅ Great |

## 🗄️ Database Management

### Supabase Setup
This boilerplate includes Supabase CLI configuration for database management:

```bash
# Initialize (already done in this project)
supabase init

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Create migrations
supabase db diff -f migration_name

# Apply migrations locally
supabase db reset

# Push to remote
supabase db push
```

### Adapting for New Projects
To use this boilerplate for different projects:

1. **Update project configuration:**
   ```toml
   # Edit supabase/config.toml
   project_id = "your-new-project"
   ```

2. **Connect to new Supabase project:**
   ```bash
   supabase link --project-ref NEW_PROJECT_REF
   ```

3. **Update environment variables:**
   ```bash
   # Update .env.local
   NEXT_PUBLIC_SUPABASE_URL=new_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=new_project_anon_key
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=new_google_client_id  # optional
   ```

4. **Customize the app:**
   - Remove demo components (`/dashboard/demo-server/`)
   - Update app name in `layout.tsx`
   - Replace favicon and branding
   - Create your own database schema and migrations

The auth system and UI components work with any Supabase backend!

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy!

### Other Platforms
Ensure you:
1. Set all environment variables
2. Update OAuth redirect URLs
3. Configure your domain

## 🛠 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Features
1. Create components in appropriate folders
2. Use route groups for organization
3. Follow existing patterns and conventions

## 📝 License

MIT License - feel free to use this boilerplate for any project!

---

**Happy coding!** 🎉
