'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GoogleOneTap } from '@/components/google-one-tap'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signInWithEmail(email, password)
    
    if (error) {
      setError(error.message)
      toast.error('Falha no login', {
        description: error.message
      })
    } else {
      toast.success('Bem-vindo de volta!', {
        description: 'Você entrou com sucesso.'
      })
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()
    
    if (error) {
      setError(error.message)
      toast.error('Falha no login com Google', {
        description: error.message
      })
    } else {
      toast.success('Bem-vindo!', {
        description: 'Login com Google realizado com sucesso.'
      })
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <>
      <GoogleOneTap
        onSuccess={() => setError(null)}
        onError={(err) => setError(err.message || 'Falha no login com Google')}
      />
      <div className="text-center">
            <Image 
              src="/logo.png" 
              alt="Agro Command Logo" 
              width={256} 
              height={256} 
              className="mx-auto h-64 w-64"
            />
          
          </div>
      <Card className="w-full max-w-md mx-auto">
      
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Entre na sua conta para continuar
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar com Email
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continuar com Google
        </Button>
      </CardContent>
      </Card>
      <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                Cadastre-se
              </Link>
            </p>
          </div>
    </>
  )
}