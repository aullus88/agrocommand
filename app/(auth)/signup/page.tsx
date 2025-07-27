import { SignUpForm } from './components/signup-form'
import { PageTransition } from '@/components/page-transition'


export default function SignUpPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
          <SignUpForm />
         
        </div>
      </div>
    </PageTransition>
  )
}