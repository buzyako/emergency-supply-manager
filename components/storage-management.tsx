"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deviceStorage, DeviceStorageInfo, BackupData } from '@/lib/device-storage'
import { backupScheduler } from '@/lib/backup-scheduler'
import { 
  Download, 
  Upload, 
  Trash2, 
  HardDrive, 
  Database, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Archive
} from 'lucide-react'

export function StorageManagement() {
  const [storageInfo, setStorageInfo] = useState<DeviceStorageInfo | null>(null)
  const [backups, setBackups] = useState<BackupData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [backupDescription, setBackupDescription] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [backupStats, setBackupStats] = useState<any>(null)

  useEffect(() => {
    initializeStorage()
    // Initialize backup scheduler
    backupScheduler.initialize()
  }, [])

  const initializeStorage = async () => {
    setIsLoading(true)
    try {
      const success = await deviceStorage.initialize()
      setIsInitialized(success)
      
      if (success) {
        await loadStorageInfo()
        await loadBackups()
        await loadBackupStats()
        setMessage({ type: 'info', text: 'Device storage initialized successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Device storage initialization failed. Using localStorage only.' })
        await loadStorageInfo()
        await loadBackupStats()
      }
    } catch (error) {
      console.error('Storage initialization error:', error)
      setMessage({ type: 'error', text: 'Failed to initialize device storage.' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStorageInfo = async () => {
    try {
      const info = await deviceStorage.getStorageInfo()
      setStorageInfo(info)
    } catch (error) {
      console.error('Failed to load storage info:', error)
    }
  }

  const loadBackups = async () => {
    try {
      const backupList = await deviceStorage.getBackups()
      setBackups(backupList)
    } catch (error) {
      console.error('Failed to load backups:', error)
    }
  }

  const loadBackupStats = async () => {
    try {
      const stats = await backupScheduler.getBackupStats()
      setBackupStats(stats)
    } catch (error) {
      console.error('Failed to load backup stats:', error)
    }
  }

  const handleCreateBackup = async () => {
    setIsLoading(true)
    try {
      const backup = await deviceStorage.createBackup(backupDescription || undefined)
      if (backup) {
        setMessage({ type: 'success', text: `Backup created successfully! (${formatFileSize(backup.size)})` })
        setBackupDescription('')
        setIsDialogOpen(false)
        await loadBackups()
        await loadStorageInfo()
      } else {
        setMessage({ type: 'error', text: 'Failed to create backup.' })
      }
    } catch (error) {
      console.error('Backup creation error:', error)
      setMessage({ type: 'error', text: 'Failed to create backup.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite your current data.')) {
      return
    }

    setIsLoading(true)
    try {
      const success = await deviceStorage.restoreBackup(backupId)
      if (success) {
        setMessage({ type: 'success', text: 'Backup restored successfully! Please refresh the page.' })
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: 'Failed to restore backup.' })
      }
    } catch (error) {
      console.error('Backup restore error:', error)
      setMessage({ type: 'error', text: 'Failed to restore backup.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return
    }

    setIsLoading(true)
    try {
      const success = await deviceStorage.deleteBackup(backupId)
      if (success) {
        setMessage({ type: 'success', text: 'Backup deleted successfully.' })
        await loadBackups()
        await loadStorageInfo()
      } else {
        setMessage({ type: 'error', text: 'Failed to delete backup.' })
      }
    } catch (error) {
      console.error('Backup deletion error:', error)
      setMessage({ type: 'error', text: 'Failed to delete backup.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportBackup = async (backupId: string) => {
    setIsLoading(true)
    try {
      const success = await deviceStorage.exportBackup(backupId)
      if (success) {
        setMessage({ type: 'success', text: 'Backup exported successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to export backup.' })
      }
    } catch (error) {
      console.error('Backup export error:', error)
      setMessage({ type: 'error', text: 'Failed to export backup.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const success = await deviceStorage.importBackup(file)
      if (success) {
        setMessage({ type: 'success', text: 'Backup imported successfully!' })
        await loadBackups()
        await loadStorageInfo()
      } else {
        setMessage({ type: 'error', text: 'Failed to import backup.' })
      }
    } catch (error) {
      console.error('Backup import error:', error)
      setMessage({ type: 'error', text: 'Failed to import backup.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanupBackups = async () => {
    setIsLoading(true)
    try {
      const deletedCount = await deviceStorage.cleanupOldBackups()
      setMessage({ type: 'success', text: `Cleaned up ${deletedCount} old backups.` })
      await loadBackups()
      await loadStorageInfo()
    } catch (error) {
      console.error('Backup cleanup error:', error)
      setMessage({ type: 'error', text: 'Failed to cleanup old backups.' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  const getStorageUsagePercentage = (): number => {
    if (!storageInfo) return 0
    return Math.round((storageInfo.used / storageInfo.total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="border-slate-200 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <HardDrive className="h-5 w-5" />
            Device Storage Overview
          </CardTitle>
          <CardDescription>
            Manage your emergency supply data storage and backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 
                             message.type === 'success' ? 'border-green-200 bg-green-50' : 
                             'border-blue-200 bg-blue-50'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 
                                          message.type === 'success' ? 'text-green-700' : 
                                          'text-blue-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {storageInfo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Storage Usage</span>
                <span className="text-sm text-slate-600">
                  {formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.total)}
                </span>
              </div>
              
              <Progress value={getStorageUsagePercentage()} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Database className="h-4 w-4 text-slate-600" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">localStorage</div>
                    <div className="text-xs text-slate-600">{formatFileSize(storageInfo.localStorageUsed)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <HardDrive className="h-4 w-4 text-slate-600" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">IndexedDB</div>
                    <div className="text-xs text-slate-600">{formatFileSize(storageInfo.indexedDBUsed)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Archive className="h-4 w-4 text-slate-600" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">Backups</div>
                    <div className="text-xs text-slate-600">{storageInfo.backupCount} files</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isInitialized ? "default" : "secondary"}>
                  {isInitialized ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      IndexedDB Enabled
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      localStorage Only
                    </>
                  )}
                </Badge>
                
                {storageInfo.lastBackup && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Last backup: {formatDate(storageInfo.lastBackup)}
                  </Badge>
                )}
                
                {backupStats && backupStats.scheduleEnabled && (
                  <Badge variant="outline">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Next backup: {backupStats.timeUntilNext || 'Soon'}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={initializeStorage} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Backup</DialogTitle>
                  <DialogDescription>
                    Create a backup of all your emergency supply data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-description">Description (optional)</Label>
                    <Input
                      id="backup-description"
                      value={backupDescription}
                      onChange={(e) => setBackupDescription(e.target.value)}
                      placeholder="e.g., Before major update"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateBackup} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Create Backup
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleCleanupBackups} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Old
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card className="border-slate-200 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Archive className="h-5 w-5" />
            Backup Management
          </CardTitle>
          <CardDescription>
            Manage your data backups and restore points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Archive className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No backups found. Create your first backup to protect your data.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800">
                        {backup.description || 'Backup'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(backup.size)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {formatDate(backup.timestamp)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportBackup(backup.id)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleRestoreBackup(backup.id)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteBackup(backup.id)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Import Backup</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="flex-1"
                disabled={isLoading}
              />
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Select a JSON backup file to import your data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
