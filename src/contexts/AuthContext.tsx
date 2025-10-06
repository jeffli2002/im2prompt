'use client'

import { createContext, useContext, ReactNode } from 'react'
import { authClient } from '@/lib/auth/auth-client'

interface AuthContextType {
  user: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession()
  
  return (
    <AuthContext.Provider value={{ user: session.data?.user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
