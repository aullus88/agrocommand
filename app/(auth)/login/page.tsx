import { LoginForm } from './components/login-form'
import { PageTransition } from '@/components/page-transition'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <LoginForm />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}