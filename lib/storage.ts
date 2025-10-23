// Enhanced localStorage utilities with error handling and debugging
export interface StorageItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export class StorageManager {
  private static instance: StorageManager;
  private debugMode = true;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[StorageManager] ${message}`, data);
    }
  }

  private error(message: string, error?: any) {
    console.error(`[StorageManager] ${message}`, error);
  }

  // Check if localStorage is available
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      this.error('localStorage is not available', e);
      return false;
    }
  }

  // Save data to localStorage with error handling
  save<T extends StorageItem>(key: string, data: T[]): boolean {
    try {
      if (!this.isLocalStorageAvailable()) {
        this.error('localStorage not available, cannot save data');
        return false;
      }

      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      this.log(`Saved ${data.length} items to ${key}`, { key, count: data.length });
      return true;
    } catch (error) {
      this.error(`Failed to save data to ${key}`, error);
      return false;
    }
  }

  // Load data from localStorage with error handling
  load<T extends StorageItem>(key: string): T[] {
    try {
      if (!this.isLocalStorageAvailable()) {
        this.error('localStorage not available, returning empty array');
        return [];
      }

      const serialized = localStorage.getItem(key);
      if (!serialized) {
        this.log(`No data found for key: ${key}`);
        return [];
      }

      const data = JSON.parse(serialized);
      this.log(`Loaded ${data.length} items from ${key}`, { key, count: data.length });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      this.error(`Failed to load data from ${key}`, error);
      return [];
    }
  }

  // Clear all data
  clear(key: string): boolean {
    try {
      if (!this.isLocalStorageAvailable()) {
        this.error('localStorage not available, cannot clear data');
        return false;
      }

      localStorage.removeItem(key);
      this.log(`Cleared data for key: ${key}`);
      return true;
    } catch (error) {
      this.error(`Failed to clear data for ${key}`, error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }
      
      // Estimate available space (this is approximate)
      const total = 5 * 1024 * 1024; // 5MB typical limit
      const available = total - used;
      
      return { used, available, total };
    } catch (error) {
      this.error('Failed to get storage info', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  // Backup all data
  backup(): string {
    try {
      const backup: Record<string, any> = {};
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && (key.startsWith('food') || key.startsWith('kit') || key.startsWith('go'))) {
          backup[key] = localStorage.getItem(key);
        }
      }
      return JSON.stringify(backup);
    } catch (error) {
      this.error('Failed to create backup', error);
      return '{}';
    }
  }

  // Restore data from backup
  restore(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      for (let key in backup) {
        localStorage.setItem(key, backup[key]);
      }
      this.log('Data restored from backup');
      return true;
    } catch (error) {
      this.error('Failed to restore data', error);
      return false;
    }
  }

  // Enable/disable debug mode
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();
