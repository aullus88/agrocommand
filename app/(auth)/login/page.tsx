import { LoginForm } from './components/login-form'
import { PageTransition } from '@/components/page-transition'


export default function LoginPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4">
         
          <LoginForm />
         
        </div>
      </div>
    </PageTransition>
  )
}