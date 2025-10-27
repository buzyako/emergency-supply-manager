// Automatic backup scheduler for device storage
import { deviceStorage } from './device-storage'

export interface BackupSchedule {
  enabled: boolean
  interval: number // in hours
  maxBackups: number
  lastBackup: string | null
  nextBackup: string | null
}

export class BackupScheduler {
  private static instance: BackupScheduler
  private schedule: BackupSchedule = {
    enabled: true,
    interval: 24, // 24 hours
    maxBackups: 10,
    lastBackup: null,
    nextBackup: null
  }
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  static getInstance(): BackupScheduler {
    if (!BackupScheduler.instance) {
      BackupScheduler.instance = new BackupScheduler()
    }
    return BackupScheduler.instance
  }

  // Initialize the backup scheduler
  async initialize(): Promise<void> {
    try {
      // Load schedule from localStorage
      const savedSchedule = localStorage.getItem('backupSchedule')
      if (savedSchedule) {
        this.schedule = { ...this.schedule, ...JSON.parse(savedSchedule) }
      }

      // Get last backup info
      const backups = await deviceStorage.getBackups()
      if (backups.length > 0) {
        this.schedule.lastBackup = backups[0].timestamp
        this.calculateNextBackup()
      }

      // Start the scheduler if enabled
      if (this.schedule.enabled) {
        this.startScheduler()
      }

      console.log('Backup scheduler initialized:', this.schedule)
    } catch (error) {
      console.error('Failed to initialize backup scheduler:', error)
    }
  }

  // Start the automatic backup scheduler
  startScheduler(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.intervalId = setInterval(async () => {
      await this.checkAndCreateBackup()
    }, 60000) // Check every minute

    console.log('Backup scheduler started')
  }

  // Stop the automatic backup scheduler
  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('Backup scheduler stopped')
  }

  // Check if it's time to create a backup
  private async checkAndCreateBackup(): Promise<void> {
    try {
      const now = new Date()
      const nextBackupTime = this.schedule.nextBackup ? new Date(this.schedule.nextBackup) : null

      if (nextBackupTime && now >= nextBackupTime) {
        await this.createScheduledBackup()
      }
    } catch (error) {
      console.error('Error checking backup schedule:', error)
    }
  }

  // Create a scheduled backup
  private async createScheduledBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString()
      const description = `Automatic backup - ${timestamp.split('T')[0]}`
      
      console.log('Creating scheduled backup...')
      const backup = await deviceStorage.createBackup(description)
      
      if (backup) {
        this.schedule.lastBackup = backup.timestamp
        this.calculateNextBackup()
        this.saveSchedule()
        
        // Cleanup old backups
        await deviceStorage.cleanupOldBackups()
        
        console.log('Scheduled backup created successfully:', backup.id)
        
        // Show notification to user
        this.showBackupNotification('Automatic backup created successfully!')
      } else {
        console.error('Failed to create scheduled backup')
        this.showBackupNotification('Failed to create automatic backup', 'error')
      }
    } catch (error) {
      console.error('Error creating scheduled backup:', error)
      this.showBackupNotification('Error creating automatic backup', 'error')
    }
  }

  // Calculate next backup time
  private calculateNextBackup(): void {
    if (this.schedule.lastBackup) {
      const lastBackupTime = new Date(this.schedule.lastBackup)
      const nextBackupTime = new Date(lastBackupTime.getTime() + (this.schedule.interval * 60 * 60 * 1000))
      this.schedule.nextBackup = nextBackupTime.toISOString()
    } else {
      // If no previous backup, schedule for next interval
      const nextBackupTime = new Date(Date.now() + (this.schedule.interval * 60 * 60 * 1000))
      this.schedule.nextBackup = nextBackupTime.toISOString()
    }
  }

  // Save schedule to localStorage
  private saveSchedule(): void {
    try {
      localStorage.setItem('backupSchedule', JSON.stringify(this.schedule))
    } catch (error) {
      console.error('Failed to save backup schedule:', error)
    }
  }

  // Update schedule settings
  updateSchedule(newSchedule: Partial<BackupSchedule>): void {
    this.schedule = { ...this.schedule, ...newSchedule }
    this.saveSchedule()
    
    if (this.schedule.enabled) {
      this.stopScheduler()
      this.startScheduler()
    } else {
      this.stopScheduler()
    }
    
    console.log('Backup schedule updated:', this.schedule)
  }

  // Get current schedule
  getSchedule(): BackupSchedule {
    return { ...this.schedule }
  }

  // Create manual backup
  async createManualBackup(description?: string): Promise<boolean> {
    try {
      const backup = await deviceStorage.createBackup(description)
      if (backup) {
        this.schedule.lastBackup = backup.timestamp
        this.calculateNextBackup()
        this.saveSchedule()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create manual backup:', error)
      return false
    }
  }

  // Show backup notification
  private showBackupNotification(message: string, type: 'success' | 'error' = 'success'): void {
    // Create a simple notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Emergency Supply Manager', {
        body: message,
        icon: '/placeholder-logo.png',
        tag: 'backup-notification'
      })
    } else {
      // Fallback to console log
      console.log(`[Backup Notification] ${message}`)
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Get time until next backup
  getTimeUntilNextBackup(): string | null {
    if (!this.schedule.nextBackup) return null
    
    const now = new Date()
    const nextBackup = new Date(this.schedule.nextBackup)
    const diffMs = nextBackup.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Now'
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Get backup statistics
  async getBackupStats(): Promise<{
    totalBackups: number
    lastBackup: string | null
    nextBackup: string | null
    timeUntilNext: string | null
    scheduleEnabled: boolean
    intervalHours: number
  }> {
    const backups = await deviceStorage.getBackups()
    
    return {
      totalBackups: backups.length,
      lastBackup: this.schedule.lastBackup,
      nextBackup: this.schedule.nextBackup,
      timeUntilNext: this.getTimeUntilNextBackup(),
      scheduleEnabled: this.schedule.enabled,
      intervalHours: this.schedule.interval
    }
  }
}

// Export singleton instance
export const backupScheduler = BackupScheduler.getInstance()
