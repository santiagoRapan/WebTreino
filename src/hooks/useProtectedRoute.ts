"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/services/auth'

/**
 * Hook similar to mobile's useProtectedRoute
 * Automatically redirects users based on authentication state
 */
export function useProtectedRoute() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return // Don't do anything while loading

    const isPublicRoute = pathname === '/' || pathname === '/auth' || pathname.startsWith('/auth')
    const isAuthenticatedRoute = !isPublicRoute

    // If user is not authenticated and trying to access protected route
    if (!session && isAuthenticatedRoute) {
      console.log('Not authenticated, redirecting to auth...')
      router.push(`/auth?redirect=${pathname}`)
    }
    
    // If user is authenticated and on public route, redirect to dashboard
    else if (session && isPublicRoute && pathname !== '/') {
      console.log('Already authenticated, redirecting to dashboard...')
      router.push('/dashboard')
    }
    
    // If user is authenticated and on landing page, redirect to dashboard
    else if (session && pathname === '/') {
      console.log('Authenticated user on landing, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [session, loading, pathname, router])

  return { session, loading, isAuthenticated: !!session }
}
