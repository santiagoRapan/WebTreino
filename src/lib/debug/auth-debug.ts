/**
 * Auth Debug Utilities
 * Helper functions to debug authentication issues
 */

export interface AuthDebugInfo {
  timestamp: string
  loading: boolean
  authUser: boolean
  customUser: boolean
  session: boolean
  isAuthenticated: boolean
  initialLoadComplete: boolean
}

export function logAuthState(info: AuthDebugInfo) {
  console.group('🔍 Auth Debug Info')
  console.log('Timestamp:', info.timestamp)
  console.log('Loading:', info.loading)
  console.log('Auth User:', info.authUser ? '✅' : '❌')
  console.log('Custom User:', info.customUser ? '✅' : '❌')
  console.log('Session:', info.session ? '✅' : '❌')
  console.log('Is Authenticated:', info.isAuthenticated ? '✅' : '❌')
  console.log('Initial Load Complete:', info.initialLoadComplete ? '✅' : '❌')
  console.groupEnd()
}

export function detectAuthIssues(info: AuthDebugInfo): string[] {
  const issues: string[] = []
  
  if (info.loading && info.initialLoadComplete) {
    issues.push('Loading is true but initial load is complete - possible stuck state')
  }
  
  if (info.authUser && !info.session) {
    issues.push('Auth user exists but no session - possible inconsistency')
  }
  
  if (info.session && !info.authUser) {
    issues.push('Session exists but no auth user - possible inconsistency')
  }
  
  if (info.isAuthenticated && !info.customUser) {
    issues.push('User is authenticated but no custom user data - possible data loading issue')
  }
  
  return issues
}

export function createAuthDebugInfo(
  loading: boolean,
  authUser: any,
  customUser: any,
  session: any,
  isAuthenticated: boolean,
  initialLoadComplete: boolean
): AuthDebugInfo {
  return {
    timestamp: new Date().toISOString(),
    loading,
    authUser: !!authUser,
    customUser: !!customUser,
    session: !!session,
    isAuthenticated,
    initialLoadComplete
  }
}
