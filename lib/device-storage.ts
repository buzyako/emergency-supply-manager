// Enhanced device storage system with IndexedDB and backup capabilities
import { storage } from './storage'

export interface DeviceStorageInfo {
  used: number
  available: number
  total: number
  localStorageUsed: number
  indexedDBUsed: number
  lastBackup: string | null
  backupCount: number
}

export interface BackupData {
  id: string
  timestamp: string
  data: Record<string, any>
  size: number
  version: string
  description?: string
}

export interface StorageOptions {
  useIndexedDB: boolean
  autoBackup: boolean
  backupInterval: number // in hours
  maxBackups: number
  compressionEnabled: boolean
}

export class DeviceStorageManager {
  private static instance: DeviceStorageManager
  private dbName = 'EmergencySupplyManager'
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private options: StorageOptions = {
    useIndexedDB: true,
    autoBackup: true,
    backupInterval: 24, // 24 hours
    maxBackups: 10,
    compressionEnabled: true
  }

  static getInstance(): DeviceStorageManager {
    if (!DeviceStorageManager.instance) {
      DeviceStorageManager.instance = new DeviceStorageManager()
    }
    return DeviceStorageManager.instance
  }

  // Initialize IndexedDB
  async initialize(): Promise<boolean> {
    try {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, falling back to localStorage')
        this.options.useIndexedDB = false
        return false
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion)

        request.onerror = () => {
          console.error('Failed to open IndexedDB:', request.error)
          this.options.useIndexedDB = false
          resolve(false)
        }

        request.onsuccess = () => {
          this.db = request.result
          console.log('IndexedDB initialized successfully')
          resolve(true)
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result

          // Create object stores
          if (!db.objectStoreNames.contains('appData')) {
            const appDataStore = db.createObjectStore('appData', { keyPath: 'key' })
            appDataStore.createIndex('timestamp', 'timestamp', { unique: false })
          }

          if (!db.objectStoreNames.contains('backups')) {
            const backupStore = db.createObjectStore('backups', { keyPath: 'id' })
            backupStore.createIndex('timestamp', 'timestamp', { unique: false })
            backupStore.createIndex('size', 'size', { unique: false })
          }

          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }

          console.log('IndexedDB schema upgraded')
        }
      })
    } catch (error) {
      console.error('Error initializing IndexedDB:', error)
      this.options.useIndexedDB = false
      return false
    }
  }

  // Save data to IndexedDB or localStorage
  async saveData<T>(key: string, data: T): Promise<boolean> {
    try {
      if (this.options.useIndexedDB && this.db) {
        return await this.saveToIndexedDB(key, data)
      } else {
        return storage.save(key, data as any)
      }
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error)
      return false
    }
  }

  // Load data from IndexedDB or localStorage
  async loadData<T>(key: string): Promise<T | null> {
    try {
      if (this.options.useIndexedDB && this.db) {
        return await this.loadFromIndexedDB<T>(key)
      } else {
        return storage.load(key) as T
      }
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error)
      return null
    }
  }

  // Save to IndexedDB
  private async saveToIndexedDB<T>(key: string, data: T): Promise<boolean> {
    if (!this.db) return false

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite')
      const store = transaction.objectStore('appData')
      
      const item = {
        key,
        data,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(data).length
      }

      const request = store.put(item)

      request.onsuccess = () => {
        console.log(`Saved data to IndexedDB for key: ${key}`)
        resolve(true)
      }

      request.onerror = () => {
        console.error(`Failed to save to IndexedDB for key: ${key}`, request.error)
        resolve(false)
      }
    })
  }

  // Load from IndexedDB
  private async loadFromIndexedDB<T>(key: string): Promise<T | null> {
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readonly')
      const store = transaction.objectStore('appData')
      const request = store.get(key)

      request.onsuccess = () => {
        if (request.result) {
          console.log(`Loaded data from IndexedDB for key: ${key}`)
          resolve(request.result.data)
        } else {
          console.log(`No data found in IndexedDB for key: ${key}`)
          resolve(null)
        }
      }

      request.onerror = () => {
        console.error(`Failed to load from IndexedDB for key: ${key}`, request.error)
        resolve(null)
      }
    })
  }

  // Create backup
  async createBackup(description?: string): Promise<BackupData | null> {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timestamp = new Date().toISOString()
      
      // Collect all data
      const data: Record<string, any> = {}
      
      if (this.options.useIndexedDB && this.db) {
        // Get all data from IndexedDB
        const transaction = this.db.transaction(['appData'], 'readonly')
        const store = transaction.objectStore('appData')
        const request = store.getAll()

        await new Promise<void>((resolve, reject) => {
          request.onsuccess = () => {
            request.result.forEach((item: any) => {
              data[item.key] = item.data
            })
            resolve()
          }
          request.onerror = () => reject(request.error)
        })
      } else {
        // Get all data from localStorage
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key) && 
              (key.startsWith('food') || key.startsWith('kit') || key.startsWith('go') || 
               key.startsWith('emergency') || key.startsWith('financial') || 
               key.startsWith('communication') || key.startsWith('notification'))) {
            try {
              data[key] = JSON.parse(localStorage.getItem(key) || '{}')
            } catch (e) {
              console.warn(`Failed to parse data for key ${key}:`, e)
            }
          }
        }
      }

      const backupData: BackupData = {
        id: backupId,
        timestamp,
        data,
        size: JSON.stringify(data).length,
        version: '1.0.0',
        description
      }

      // Save backup to IndexedDB
      if (this.options.useIndexedDB && this.db) {
        const transaction = this.db.transaction(['backups'], 'readwrite')
        const store = transaction.objectStore('backups')
        await new Promise<void>((resolve, reject) => {
          const request = store.add(backupData)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }

      console.log(`Backup created: ${backupId} (${backupData.size} bytes)`)
      return backupData
    } catch (error) {
      console.error('Failed to create backup:', error)
      return null
    }
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      let backupData: BackupData | null = null

      if (this.options.useIndexedDB && this.db) {
        const transaction = this.db.transaction(['backups'], 'readonly')
        const store = transaction.objectStore('backups')
        backupData = await new Promise<BackupData | null>((resolve, reject) => {
          const request = store.get(backupId)
          request.onsuccess = () => resolve(request.result || null)
          request.onerror = () => reject(request.error)
        })
      }

      if (!backupData) {
        console.error('Backup not found:', backupId)
        return false
      }

      // Restore data
      for (const [key, value] of Object.entries(backupData.data)) {
        await this.saveData(key, value)
      }

      console.log(`Backup restored: ${backupId}`)
      return true
    } catch (error) {
      console.error('Failed to restore backup:', error)
      return false
    }
  }

  // Get all backups
  async getBackups(): Promise<BackupData[]> {
    try {
      if (!this.options.useIndexedDB || !this.db) {
        return []
      }

      const transaction = this.db.transaction(['backups'], 'readonly')
      const store = transaction.objectStore('backups')
      const index = store.index('timestamp')
      
      return new Promise<BackupData[]>((resolve, reject) => {
        const request = index.getAll()
        request.onsuccess = () => {
          const backups = request.result.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          resolve(backups)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to get backups:', error)
      return []
    }
  }

  // Delete backup
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      if (!this.options.useIndexedDB || !this.db) {
        return false
      }

      const transaction = this.db.transaction(['backups'], 'readwrite')
      const store = transaction.objectStore('backups')
      
      return new Promise<boolean>((resolve, reject) => {
        const request = store.delete(backupId)
        request.onsuccess = () => {
          console.log(`Backup deleted: ${backupId}`)
          resolve(true)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to delete backup:', error)
      return false
    }
  }

  // Export backup as JSON file
  async exportBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackupById(backupId)
      if (!backup) return false

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `emergency-supply-backup-${backup.timestamp.split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log(`Backup exported: ${backupId}`)
      return true
    } catch (error) {
      console.error('Failed to export backup:', error)
      return false
    }
  }

  // Import backup from JSON file
  async importBackup(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const backupData: BackupData = JSON.parse(text)

      // Validate backup data
      if (!backupData.id || !backupData.data || !backupData.timestamp) {
        throw new Error('Invalid backup file format')
      }

      // Create new backup with imported data
      const newBackup: BackupData = {
        ...backupData,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        description: `Imported from ${file.name}`
      }

      // Save imported backup
      if (this.options.useIndexedDB && this.db) {
        const transaction = this.db.transaction(['backups'], 'readwrite')
        const store = transaction.objectStore('backups')
        await new Promise<void>((resolve, reject) => {
          const request = store.add(newBackup)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }

      console.log(`Backup imported: ${newBackup.id}`)
      return true
    } catch (error) {
      console.error('Failed to import backup:', error)
      return false
    }
  }

  // Get specific backup by ID
  private async getBackupById(backupId: string): Promise<BackupData | null> {
    try {
      if (!this.options.useIndexedDB || !this.db) {
        return null
      }

      const transaction = this.db.transaction(['backups'], 'readonly')
      const store = transaction.objectStore('backups')
      
      return new Promise<BackupData | null>((resolve, reject) => {
        const request = store.get(backupId)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to get backup:', error)
      return null
    }
  }

  // Get storage information
  async getStorageInfo(): Promise<DeviceStorageInfo> {
    try {
      const localStorageInfo = storage.getStorageInfo()
      let indexedDBUsed = 0
      let backupCount = 0
      let lastBackup: string | null = null

      if (this.options.useIndexedDB && this.db) {
        // Get IndexedDB usage (approximate)
        const transaction = this.db.transaction(['appData', 'backups'], 'readonly')
        
        // Count app data size
        const appDataStore = transaction.objectStore('appData')
        const appDataRequest = appDataStore.getAll()
        await new Promise<void>((resolve) => {
          appDataRequest.onsuccess = () => {
            indexedDBUsed = JSON.stringify(appDataRequest.result).length
            resolve()
          }
          appDataRequest.onerror = () => resolve()
        })

        // Count backups
        const backupStore = transaction.objectStore('backups')
        const backupRequest = backupStore.count()
        await new Promise<void>((resolve) => {
          backupRequest.onsuccess = () => {
            backupCount = backupRequest.result
            resolve()
          }
          backupRequest.onerror = () => resolve()
        })

        // Get last backup timestamp
        const index = backupStore.index('timestamp')
        const lastBackupRequest = index.openCursor(null, 'prev')
        await new Promise<void>((resolve) => {
          lastBackupRequest.onsuccess = () => {
            if (lastBackupRequest.result) {
              lastBackup = lastBackupRequest.result.value.timestamp
            }
            resolve()
          }
          lastBackupRequest.onerror = () => resolve()
        })
      }

      return {
        used: localStorageInfo.used + indexedDBUsed,
        available: localStorageInfo.available,
        total: localStorageInfo.total,
        localStorageUsed: localStorageInfo.used,
        indexedDBUsed,
        lastBackup,
        backupCount
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return {
        used: 0,
        available: 0,
        total: 0,
        localStorageUsed: 0,
        indexedDBUsed: 0,
        lastBackup: null,
        backupCount: 0
      }
    }
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<number> {
    try {
      if (!this.options.useIndexedDB || !this.db) {
        return 0
      }

      const backups = await this.getBackups()
      if (backups.length <= this.options.maxBackups) {
        return 0
      }

      const backupsToDelete = backups.slice(this.options.maxBackups)
      let deletedCount = 0

      for (const backup of backupsToDelete) {
        if (await this.deleteBackup(backup.id)) {
          deletedCount++
        }
      }

      console.log(`Cleaned up ${deletedCount} old backups`)
      return deletedCount
    } catch (error) {
      console.error('Failed to cleanup old backups:', error)
      return 0
    }
  }

  // Update options
  updateOptions(newOptions: Partial<StorageOptions>): void {
    this.options = { ...this.options, ...newOptions }
    console.log('Storage options updated:', this.options)
  }

  // Get current options
  getOptions(): StorageOptions {
    return { ...this.options }
  }
}

// Export singleton instance
export const deviceStorage = DeviceStorageManager.getInstance()
