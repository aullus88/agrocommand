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
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      toast.error('As senhas não coincidem', {
        description: 'Certifique-se de que ambos os campos de senha coincidem.'
      })
      setLoading(false)
      return
    }

    const { error } = await signUpWithEmail(email, password)
    
    if (error) {
      setError(error.message)
      toast.error('Falha no cadastro', {
        description: error.message
      })
    } else {
      setSuccess(true)
      toast.success('Conta criada!', {
        description: 'Verifique seu email para confirmar sua conta.'
      })
    }
    
    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()
    
    if (error) {
      setError(error.message)
      toast.error('Falha no cadastro com Google', {
        description: error.message
      })
    } else {
      toast.success('Bem-vindo!', {
        description: 'Conta criada com Google com sucesso.'
      })
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verifique seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para completar seu cadastro.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <GoogleOneTap
        onSuccess={() => setError(null)}
        onError={(err) => setError(err.message || 'Falha no cadastro com Google')}
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
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se para criar uma nova conta
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleEmailSignUp} className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar com Email
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
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continuar com Google
        </Button>
      </CardContent>
      </Card>
      <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Entrar
              </Link>
            </p>
          </div>
    </>
  )
}