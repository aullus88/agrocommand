import { SignUpForm } from './components/signup-form'
import { PageTransition } from '@/components/page-transition'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <SignUpForm />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}