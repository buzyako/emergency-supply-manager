// Authentication utilities for secure local storage
import { storage, StorageObject } from './storage'

export interface User extends StorageObject {
  id: string
  username: string
  passwordHash: string
  createdAt: string
  lastLogin: string
}

export interface AuthSession extends StorageObject {
  userId: string
  token: string
  expiresAt: string
  createdAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  session: AuthSession | null
  isLoading: boolean
}

// Simple password hashing using Web Crypto API
export class AuthManager {
  private static instance: AuthManager
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly STORAGE_KEY = 'emergency_supply_auth'
  private readonly USER_KEY = 'emergency_supply_user'
  private readonly SESSION_KEY = 'emergency_supply_session'

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Hash password using Web Crypto API
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Verify password against hash
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  // Generate session token
  private generateSessionToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Check if session is valid
  private isSessionValid(session: AuthSession): boolean {
    const now = new Date().getTime()
    const expiresAt = new Date(session.expiresAt).getTime()
    return now < expiresAt
  }

  // Create new user account
  async createUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user already exists
      const existingUser = storage.loadObject<User>(this.USER_KEY)
      if (existingUser && existingUser.username === username) {
        return { success: false, message: 'Username already exists' }
      }

      // Validate password strength
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' }
      }

      // Create new user
      const passwordHash = await this.hashPassword(password)
      const user: User = {
        id: crypto.randomUUID(),
        username,
        passwordHash,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }

      // Save user
      const saved = storage.save(this.USER_KEY, user)
      if (!saved) {
        return { success: false, message: 'Failed to create user account' }
      }

      return { success: true, message: 'Account created successfully' }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, message: 'An error occurred while creating account' }
    }
  }

  // Login user
  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Load user
      const user = storage.loadObject<User>(this.USER_KEY)
      if (!user) {
        return { success: false, message: 'No account found. Please create an account first.' }
      }

      // Verify credentials
      const isValidPassword = await this.verifyPassword(password, user.passwordHash)
      if (user.username !== username || !isValidPassword) {
        return { success: false, message: 'Invalid username or password' }
      }

      // Create session
      const session: AuthSession = {
        userId: user.id,
        token: this.generateSessionToken(),
        expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }

      // Update user last login
      user.lastLogin = new Date().toISOString()
      storage.save(this.USER_KEY, user)

      // Save session
      const sessionSaved = storage.save(this.SESSION_KEY, session)
      if (!sessionSaved) {
        return { success: false, message: 'Failed to create session' }
      }

      return { success: true, message: 'Login successful', user }
    } catch (error) {
      console.error('Error during login:', error)
      return { success: false, message: 'An error occurred during login' }
    }
  }

  // Logout user
  logout(): boolean {
    try {
      storage.clear(this.SESSION_KEY)
      return true
    } catch (error) {
      console.error('Error during logout:', error)
      return false
    }
  }

  // Check if user is authenticated
  async checkAuth(): Promise<AuthState> {
    try {
      const session = storage.loadObject<AuthSession>(this.SESSION_KEY)
      const user = storage.loadObject<User>(this.USER_KEY)

      if (!session || !user || !this.isSessionValid(session)) {
        // Clear invalid session
        if (session) {
          storage.clear(this.SESSION_KEY)
        }
        return {
          isAuthenticated: false,
          user: null,
          session: null,
          isLoading: false
        }
      }

      return {
        isAuthenticated: true,
        user,
        session,
        isLoading: false
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      return {
        isAuthenticated: false,
        user: null,
        session: null,
        isLoading: false
      }
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = storage.loadObject<User>(this.USER_KEY)
      if (!user) {
        return { success: false, message: 'User not found' }
      }

      // Verify current password
      const isValidPassword = await this.verifyPassword(currentPassword, user.passwordHash)
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' }
      }

      // Validate new password
      if (newPassword.length < 6) {
        return { success: false, message: 'New password must be at least 6 characters long' }
      }

      // Update password
      user.passwordHash = await this.hashPassword(newPassword)
      const saved = storage.save(this.USER_KEY, user)

      if (!saved) {
        return { success: false, message: 'Failed to update password' }
      }

      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      console.error('Error changing password:', error)
      return { success: false, message: 'An error occurred while changing password' }
    }
  }

  // Reset password (for first-time setup)
  async resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = storage.loadObject<User>(this.USER_KEY)
      if (!user) {
        return { success: false, message: 'User not found' }
      }

      // Validate new password
      if (newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' }
      }

      // Update password
      user.passwordHash = await this.hashPassword(newPassword)
      const saved = storage.save(this.USER_KEY, user)

      if (!saved) {
        return { success: false, message: 'Failed to update password' }
      }

      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { success: false, message: 'An error occurred while updating password' }
    }
  }

  // Check if user exists (for first-time setup)
  hasUser(): boolean {
    try {
      const user = storage.loadObject<User>(this.USER_KEY)
      return user !== null
    } catch (error) {
      console.error('Error checking if user exists:', error)
      return false
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance()
