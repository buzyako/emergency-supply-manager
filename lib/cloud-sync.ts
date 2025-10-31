import { cloudStorage } from './cloud-storage';
import { storage } from './storage';
import type { StorageObject } from './storage';

export interface SyncStatus {
  isOnline: boolean;
  isAuthenticated: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
  syncInProgress: boolean;
}

export interface SyncConflict {
  id: string;
  dataType: string;
  localData: any;
  cloudData: any;
  localTimestamp: string;
  cloudTimestamp: string;
}

class CloudSyncManager {
  private syncStatus: SyncStatus = {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isAuthenticated: false,
    lastSyncTime: null,
    pendingChanges: 0,
    syncInProgress: false
  };

  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private conflictListeners: ((conflicts: SyncConflict[]) => void)[] = [];
  private conflicts: SyncConflict[] = [];

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      // Listen for online/offline status
      window.addEventListener('online', () => {
        this.syncStatus.isOnline = true;
        this.notifyListeners();
        this.autoSync();
      });

      window.addEventListener('offline', () => {
        this.syncStatus.isOnline = false;
        this.notifyListeners();
      });

      // Listen for authentication changes
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus() {
    const user = cloudStorage.getCurrentUser();
    this.syncStatus.isAuthenticated = user !== null;
    this.notifyListeners();
  }

  // Sync methods
  async syncData<T extends StorageObject>(dataType: string): Promise<void> {
    if (!this.syncStatus.isOnline || !this.syncStatus.isAuthenticated) {
      console.log('[CloudSync] Cannot sync - offline or not authenticated');
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      // Load local data - handle both arrays and single objects
      const localDataRaw = storage.load(dataType);
      const localData = Array.isArray(localDataRaw) ? localDataRaw : (localDataRaw ? [localDataRaw] : []);
      
      // Load cloud data
      const cloudData = await cloudStorage.loadData<T>(dataType);

      // Detect conflicts and merge data
      const { mergedData, conflicts } = this.mergeData(localData, cloudData, dataType);
      
      if (conflicts.length > 0) {
        this.conflicts = [...this.conflicts, ...conflicts];
        this.notifyConflictListeners();
      }

      // Save merged data locally
      if (Array.isArray(localDataRaw)) {
        storage.save(dataType, mergedData as any);
      } else {
        storage.save(dataType, mergedData[0] || {} as any);
      }

      // Upload merged data to cloud
      for (const item of mergedData) {
        await cloudStorage.saveData(dataType, item);
      }

      this.syncStatus.lastSyncTime = new Date().toISOString();
      this.syncStatus.pendingChanges = 0;
      
      console.log(`[CloudSync] Synced ${dataType}: ${mergedData.length} items`);
    } catch (error) {
      console.error('[CloudSync] Sync error:', error);
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    }
  }

  async syncAllData(): Promise<void> {
    if (!this.syncStatus.isOnline || !this.syncStatus.isAuthenticated) {
      console.log('[CloudSync] Cannot sync all - offline or not authenticated');
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      const dataTypes = ['foodItems', 'kitItems', 'goBags', 'notificationSettings', 'progress', 'quotes', 'hazards'];
      
      for (const dataType of dataTypes) {
        await this.syncData(dataType);
      }

      console.log('[CloudSync] All data synced successfully');
    } catch (error) {
      console.error('[CloudSync] Sync all error:', error);
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    }
  }

  async autoSync(): Promise<void> {
    if (this.syncStatus.isOnline && this.syncStatus.isAuthenticated && !this.syncStatus.syncInProgress) {
      console.log('[CloudSync] Starting auto-sync...');
      await this.syncAllData();
    }
  }

  // Data merging and conflict resolution
  private mergeData<T extends StorageObject>(
    localData: any[], 
    cloudData: T[], 
    dataType: string
  ): { mergedData: T[]; conflicts: SyncConflict[] } {
    const mergedData: T[] = [];
    const conflicts: SyncConflict[] = [];
    const localMap = new Map(localData.map(item => [item.id || item.createdAt, item]));
    const cloudMap = new Map(cloudData.map(item => [(item as any).id || (item as any).createdAt, item]));

    // Get all unique IDs
    const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);

    for (const id of allIds) {
      const localItem = localMap.get(id);
      const cloudItem = cloudMap.get(id);

      if (localItem && cloudItem) {
        // Both exist - check for conflicts
        const localTime = new Date(localItem.lastUpdated || localItem.updatedAt || localItem.createdAt || 0).getTime();
        const cloudTime = new Date(cloudItem.lastUpdated || (cloudItem as any).updatedAt || (cloudItem as any).createdAt || 0).getTime();

        if (Math.abs(localTime - cloudTime) > 1000) { // More than 1 second difference
          // Conflict detected
          conflicts.push({
            id: id.toString(),
            dataType,
            localData: localItem,
            cloudData: cloudItem,
            localTimestamp: localItem.lastUpdated || localItem.updatedAt || localItem.createdAt || '',
            cloudTimestamp: cloudItem.lastUpdated || (cloudItem as any).updatedAt || (cloudItem as any).createdAt || ''
          });
          
          // Use the most recent version
          const mostRecent = localTime > cloudTime ? localItem : cloudItem;
          mergedData.push(mostRecent as T);
        } else {
          // No conflict - use either version
          mergedData.push(cloudItem);
        }
      } else if (localItem) {
        // Only local exists
        mergedData.push(localItem as T);
      } else if (cloudItem) {
        // Only cloud exists
        mergedData.push(cloudItem);
      }
    }

    return { mergedData, conflicts };
  }

  // Conflict resolution
  async resolveConflict(conflictId: string, useLocal: boolean): Promise<void> {
    const conflictIndex = this.conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex === -1) return;

    const conflict = this.conflicts[conflictIndex];
    const resolvedData = useLocal ? conflict.localData : conflict.cloudData;

    // Save resolved data locally
    const localData = storage.load(conflict.dataType);
    const updatedData = localData.map(item => 
      item.id === conflictId ? resolvedData : item
    );
    storage.save(conflict.dataType, updatedData);

    // Upload resolved data to cloud
    await cloudStorage.saveData(conflict.dataType, resolvedData);

    // Remove conflict
    this.conflicts.splice(conflictIndex, 1);
    this.notifyConflictListeners();

    console.log(`[CloudSync] Resolved conflict for ${conflictId}`);
  }

  // Migration methods
  async migrateToCloud(): Promise<void> {
    if (!this.syncStatus.isAuthenticated) {
      throw new Error('User must be authenticated to migrate to cloud');
    }

    console.log('[CloudSync] Starting migration to cloud...');

    const dataTypes = ['foodItems', 'kitItems', 'goBags', 'notificationSettings', 'progress', 'quotes', 'hazards'];
    
    for (const dataType of dataTypes) {
      const localData = storage.load(dataType) || [];
      
      for (const item of localData) {
        await cloudStorage.saveData(dataType, item as any);
      }
      
      console.log(`[CloudSync] Migrated ${localData.length} ${dataType} items to cloud`);
    }

    console.log('[CloudSync] Migration to cloud completed');
  }

  async migrateFromCloud(): Promise<void> {
    if (!this.syncStatus.isAuthenticated) {
      throw new Error('User must be authenticated to migrate from cloud');
    }

    console.log('[CloudSync] Starting migration from cloud...');

    const dataTypes = ['foodItems', 'kitItems', 'goBags', 'notificationSettings', 'progress', 'quotes', 'hazards'];
    
    for (const dataType of dataTypes) {
      const cloudData = await cloudStorage.loadData(dataType);
      storage.save(dataType, cloudData as any);
      console.log(`[CloudSync] Migrated ${cloudData.length} ${dataType} items from cloud`);
    }

    console.log('[CloudSync] Migration from cloud completed');
  }

  // Backup methods
  async createCloudBackup(backupName: string): Promise<string> {
    if (!this.syncStatus.isAuthenticated) {
      throw new Error('User must be authenticated to create cloud backup');
    }

    const allData = {
      foodItems: storage.load('foodItems') || [],
      kitItems: storage.load('kitItems') || [],
      goBags: storage.load('goBags') || [],
      notificationSettings: storage.load('notificationSettings') || {},
      progress: storage.load('progress') || {},
      quotes: storage.load('quotes') || {},
      hazards: storage.load('hazards') || {}
    };

    const backupId = await cloudStorage.createBackup(backupName, allData);
    console.log('[CloudSync] Cloud backup created:', backupId);
    return backupId;
  }

  async restoreFromCloudBackup(backupId: string): Promise<void> {
    if (!this.syncStatus.isAuthenticated) {
      throw new Error('User must be authenticated to restore from cloud backup');
    }

    const backupData = await cloudStorage.restoreBackup(backupId);
    
    // Restore all data types
    Object.keys(backupData).forEach(dataType => {
      storage.save(dataType, backupData[dataType]);
    });

    console.log('[CloudSync] Restored from cloud backup:', backupId);
  }

  // Event listeners
  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener: (status: SyncStatus) => void): void {
    const index = this.syncListeners.indexOf(listener);
    if (index > -1) {
      this.syncListeners.splice(index, 1);
    }
  }

  addConflictListener(listener: (conflicts: SyncConflict[]) => void): void {
    this.conflictListeners.push(listener);
  }

  removeConflictListener(listener: (conflicts: SyncConflict[]) => void): void {
    const index = this.conflictListeners.indexOf(listener);
    if (index > -1) {
      this.conflictListeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.syncListeners.forEach(listener => listener(this.syncStatus));
  }

  private notifyConflictListeners(): void {
    this.conflictListeners.forEach(listener => listener(this.conflicts));
  }

  // Getters
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  hasConflicts(): boolean {
    return this.conflicts.length > 0;
  }
}

export const cloudSyncManager = new CloudSyncManager();
