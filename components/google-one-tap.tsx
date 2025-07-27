'use client'

import Script from 'next/script'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { generateNonce } from '@/lib/auth-utils'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

interface GoogleOneTapProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function GoogleOneTap({ onSuccess, onError }: GoogleOneTapProps) {
  const { user, signInWithIdToken } = useAuth()
  const router = useRouter()
  const initialized = useRef(false)

  const initializeGoogleOneTap = async () => {
    // Don't initialize if user is already signed in or already initialized
    if (user || initialized.current || !window.google) return
    
    // Temporarily disable One-Tap until Google Cloud Console changes propagate
    if (process.env.NODE_ENV === 'development') {
      console.log('Google One-Tap temporarily disabled - waiting for Google Cloud Console changes to propagate')
      return
    }
    
    initialized.current = true

    try {
      const [nonce, hashedNonce] = await generateNonce()

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response: { credential: string }) => {
          try {
            const { error } = await signInWithIdToken(response.credential, nonce)
            
            if (error) {
              console.error('Google One-Tap login error:', error)
              onError?.(error)
              return
            }

            onSuccess?.()
            router.push('/dashboard')
          } catch (error) {
            console.error('Google One-Tap login error:', error)
            onError?.(error as Error)
          }
        },
        nonce: hashedNonce,
        use_fedcm_for_prompt: false, // Disable FedCM for now to avoid AbortError
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
      })

      // Show the One-Tap prompt
      window.google.accounts.id.prompt()
    } catch (error) {
      console.error('Failed to initialize Google One-Tap:', error)
      onError?.(error as Error)
    }
  }

  useEffect(() => {
    // Reset initialization when user changes
    if (!user) {
      initialized.current = false
    }
  }, [user])

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      onReady={() => {
        initializeGoogleOneTap().catch(console.error)
      }}
      strategy="afterInteractive"
    />
  )
}