"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authManager, AuthState, User, AuthSession } from '@/lib/auth'

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  createUser: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (newPassword: string) => Promise<{ success: boolean; message: string }>
  hasUser: () => boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    isLoading: true
  })

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Set up session timeout
  useEffect(() => {
    if (authState.isAuthenticated && authState.session) {
      const expiresAt = new Date(authState.session.expiresAt).getTime()
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now

      if (timeUntilExpiry > 0) {
        const timeoutId = setTimeout(() => {
          logout()
        }, timeUntilExpiry)

        return () => clearTimeout(timeoutId)
      } else {
        // Session already expired
        logout()
      }
    }
  }, [authState.isAuthenticated, authState.session])

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      const authResult = await authManager.checkAuth()
      setAuthState(authResult)
    } catch (error) {
      console.error('Error checking auth:', error)
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        isLoading: false
      })
    }
  }

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      const result = await authManager.login(username, password)
      
      if (result.success && result.user) {
        // Create session for the logged-in user
        const session: AuthSession = {
          userId: result.user.id,
          token: crypto.randomUUID(), // Simple token generation
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }

        setAuthState({
          isAuthenticated: true,
          user: result.user,
          session,
          isLoading: false
        })
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
      
      return result
    } catch (error) {
      console.error('Error during login:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { success: false, message: 'An error occurred during login' }
    }
  }

  const logout = () => {
    try {
      authManager.logout()
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        isLoading: false
      })
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const createUser = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      const result = await authManager.createUser(username, password)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return result
    } catch (error) {
      console.error('Error creating user:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { success: false, message: 'An error occurred while creating account' }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const result = await authManager.changePassword(currentPassword, newPassword)
      if (result.success) {
        // Refresh auth state to get updated user info
        await refreshAuth()
      }
      return result
    } catch (error) {
      console.error('Error changing password:', error)
      return { success: false, message: 'An error occurred while changing password' }
    }
  }

  const resetPassword = async (newPassword: string) => {
    try {
      const result = await authManager.resetPassword(newPassword)
      if (result.success) {
        // Refresh auth state to get updated user info
        await refreshAuth()
      }
      return result
    } catch (error) {
      console.error('Error resetting password:', error)
      return { success: false, message: 'An error occurred while updating password' }
    }
  }

  const hasUser = () => {
    return authManager.hasUser()
  }

  const refreshAuth = async () => {
    await checkAuth()
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    createUser,
    changePassword,
    resetPassword,
    hasUser,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
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
