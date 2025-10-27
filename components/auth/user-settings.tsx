"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { StorageManagement } from '@/components/storage-management'
import { Eye, EyeOff, Lock, User, LogOut, Key, Shield, AlertCircle } from 'lucide-react'

export function UserSettings() {
  const { user, logout, changePassword, resetPassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' })
        setIsSubmitting(false)
        return
      }

      const result = await changePassword(currentPassword, newPassword)
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setIsDialogOpen(false)
          setMessage(null)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="border-slate-200 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Manage your account settings and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Username</Label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-800 font-medium">{user.username}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Account Created</Label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Last Login</Label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-800">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Security Status</Label>
              <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      <Card className="border-slate-200 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Key className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Change your password and manage security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new secure password
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        disabled={isSubmitting}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isSubmitting}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        disabled={isSubmitting}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isSubmitting}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {message && (
                    <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>🔒 Your password is hashed using SHA-256</p>
            <p>🛡️ All data is encrypted locally on your device</p>
            <p>⏰ Sessions expire after 24 hours of inactivity</p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Management */}
      <StorageManagement />
    </div>
  )
}
