"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Upload,
  Download,
  Database,
  Wifi,
  WifiOff
} from "lucide-react"
import { cloudStorage } from "@/lib/cloud-storage"
import { cloudSyncManager } from "@/lib/cloud-sync"
import type { SyncStatus, SyncConflict } from "@/lib/cloud-sync"

export function CloudStorageManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isAuthenticated: false,
    lastSyncTime: null,
    pendingChanges: 0,
    syncInProgress: false
  })
  const [conflicts, setConflicts] = useState<SyncConflict[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Listen for sync status changes
    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status)
    }

    // Listen for conflict changes
    const handleConflictChange = (newConflicts: SyncConflict[]) => {
      setConflicts(newConflicts)
    }

    cloudSyncManager.addSyncListener(handleSyncStatusChange)
    cloudSyncManager.addConflictListener(handleConflictChange)

    // Initial status check
    setSyncStatus(cloudSyncManager.getSyncStatus())
    setConflicts(cloudSyncManager.getConflicts())

    return () => {
      cloudSyncManager.removeSyncListener(handleSyncStatusChange)
      cloudSyncManager.removeConflictListener(handleConflictChange)
    }
  }, [])

  const handleSignUp = async () => {
    try {
      setError("")
      await cloudStorage.signUp(email, password, displayName)
      setSuccess("Account created successfully!")
      setEmail("")
      setPassword("")
      setDisplayName("")
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    }
  }

  const handleSignIn = async () => {
    try {
      setError("")
      await cloudStorage.signIn(email, password)
      setSuccess("Signed in successfully!")
      setEmail("")
      setPassword("")
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    }
  }

  const handleSignOut = async () => {
    try {
      setError("")
      await cloudStorage.signOut()
      setSuccess("Signed out successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to sign out")
    }
  }

  const handleSync = async () => {
    try {
      setError("")
      await cloudSyncManager.syncAllData()
      setSuccess("Data synced successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to sync data")
    }
  }

  const handleMigrateToCloud = async () => {
    try {
      setError("")
      await cloudSyncManager.migrateToCloud()
      setSuccess("Data migrated to cloud successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to migrate to cloud")
    }
  }

  const handleMigrateFromCloud = async () => {
    try {
      setError("")
      await cloudSyncManager.migrateFromCloud()
      setSuccess("Data migrated from cloud successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to migrate from cloud")
    }
  }

  const handleResolveConflict = async (conflictId: string, useLocal: boolean) => {
    try {
      setError("")
      await cloudSyncManager.resolveConflict(conflictId, useLocal)
      setSuccess("Conflict resolved successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to resolve conflict")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud Storage Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!syncStatus.isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={isSignUp ? "default" : "outline"}
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </Button>
                <Button
                  variant={isSignUp ? "outline" : "default"}
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </Button>
              </div>

              {isSignUp && (
                <Input
                  placeholder="Display Name (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              )}

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                onClick={isSignUp ? handleSignUp : handleSignIn}
                className="w-full"
                disabled={!email || !password}
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Signed in to cloud storage</span>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {syncStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {syncStatus.isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {syncStatus.isAuthenticated ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <CloudOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {syncStatus.isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </span>
            </div>
          </div>

          {syncStatus.lastSyncTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                Last sync: {formatTimestamp(syncStatus.lastSyncTime)}
              </span>
            </div>
          )}

          {syncStatus.pendingChanges > 0 && (
            <Badge variant="secondary">
              {syncStatus.pendingChanges} pending changes
            </Badge>
          )}

          {syncStatus.syncInProgress && (
            <Badge variant="outline" className="animate-pulse">
              Syncing...
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Sync Actions */}
      {syncStatus.isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sync Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleSync}
                disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All Data
              </Button>

              <Button
                onClick={handleMigrateToCloud}
                disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Migrate to Cloud
              </Button>

              <Button
                onClick={handleMigrateFromCloud}
                disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Migrate from Cloud
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Sync Conflicts ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{conflict.dataType}: {conflict.id}</h4>
                  <Badge variant="outline">Conflict</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Local Version</h5>
                    <p className="text-xs text-muted-foreground">
                      Updated: {formatTimestamp(conflict.localTimestamp)}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Cloud Version</h5>
                    <p className="text-xs text-muted-foreground">
                      Updated: {formatTimestamp(conflict.cloudTimestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleResolveConflict(conflict.id, true)}
                    variant="outline"
                  >
                    Use Local
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResolveConflict(conflict.id, false)}
                    variant="outline"
                  >
                    Use Cloud
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
