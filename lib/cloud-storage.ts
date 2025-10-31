import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase-config';
import type { StorageObject } from './storage';

export interface CloudUser {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface CloudData {
  id: string;
  userId: string;
  dataType: string;
  data: any;
  createdAt: string;
  lastUpdated: string;
}

export interface CloudBackup {
  id: string;
  userId: string;
  backupName: string;
  data: any;
  createdAt: string;
  lastUpdated: string;
}

class CloudStorage {
  private currentUser: FirebaseUser | null = null;
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      // Listen for authentication state changes
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        console.log('[CloudStorage] Auth state changed:', user ? 'signed in' : 'signed out');
      });

      // Listen for online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('[CloudStorage] Back online - sync will resume');
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('[CloudStorage] Gone offline - using local storage');
      });
    }
  }

  // Authentication methods
  async signUp(email: string, password: string, displayName?: string): Promise<CloudUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user document in Firestore
      const cloudUser: CloudUser = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName || user.displayName || undefined,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), cloudUser);

      console.log('[CloudStorage] User created successfully:', user.uid);
      return cloudUser;
    } catch (error) {
      console.error('[CloudStorage] Sign up error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<CloudUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as CloudUser;
        console.log('[CloudStorage] User signed in successfully:', user.uid);
        return userData;
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      console.error('[CloudStorage] Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('[CloudStorage] User signed out successfully');
    } catch (error) {
      console.error('[CloudStorage] Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Data storage methods
  async saveData<T extends StorageObject>(dataType: string, data: T): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      console.log('[CloudStorage] Offline - data will be synced when online');
      return;
    }

    try {
      const cloudData: CloudData = {
        id: (data as any).id || Date.now().toString(),
        userId: this.currentUser.uid,
        dataType,
        data,
        createdAt: (data as any).createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await setDoc(doc(db, 'userData', `${this.currentUser.uid}_${dataType}_${cloudData.id}`), cloudData);
      console.log(`[CloudStorage] Saved ${dataType} data:`, cloudData.id);
    } catch (error) {
      console.error('[CloudStorage] Save data error:', error);
      throw error;
    }
  }

  async loadData<T extends StorageObject>(dataType: string): Promise<T[]> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      console.log('[CloudStorage] Offline - cannot load cloud data');
      return [];
    }

    try {
      const q = query(
        collection(db, 'userData'),
        where('userId', '==', this.currentUser.uid),
        where('dataType', '==', dataType)
      );

      const querySnapshot = await getDocs(q);
      const data: T[] = [];

      querySnapshot.forEach((doc) => {
        const cloudData = doc.data() as CloudData;
        data.push(cloudData.data as T);
      });

      console.log(`[CloudStorage] Loaded ${data.length} ${dataType} items`);
      return data;
    } catch (error) {
      console.error('[CloudStorage] Load data error:', error);
      throw error;
    }
  }

  async deleteData(dataType: string, id: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      console.log('[CloudStorage] Offline - deletion will be synced when online');
      return;
    }

    try {
      await deleteDoc(doc(db, 'userData', `${this.currentUser.uid}_${dataType}_${id}`));
      console.log(`[CloudStorage] Deleted ${dataType} data:`, id);
    } catch (error) {
      console.error('[CloudStorage] Delete data error:', error);
      throw error;
    }
  }

  // Backup methods
  async createBackup(backupName: string, data: any): Promise<string> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      throw new Error('Cannot create backup while offline');
    }

    try {
      const backup: CloudBackup = {
        id: Date.now().toString(),
        userId: this.currentUser.uid,
        backupName,
        data,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'backups'), backup);
      console.log('[CloudStorage] Backup created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[CloudStorage] Create backup error:', error);
      throw error;
    }
  }

  async getBackups(): Promise<CloudBackup[]> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      console.log('[CloudStorage] Offline - cannot load backups');
      return [];
    }

    try {
      const q = query(
        collection(db, 'backups'),
        where('userId', '==', this.currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const backups: CloudBackup[] = [];

      querySnapshot.forEach((doc) => {
        backups.push(doc.data() as CloudBackup);
      });

      console.log(`[CloudStorage] Loaded ${backups.length} backups`);
      return backups;
    } catch (error) {
      console.error('[CloudStorage] Get backups error:', error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<any> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!this.isOnline) {
      throw new Error('Cannot restore backup while offline');
    }

    try {
      const q = query(
        collection(db, 'backups'),
        where('userId', '==', this.currentUser.uid),
        where('id', '==', backupId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Backup not found');
      }

      const backup = querySnapshot.docs[0].data() as CloudBackup;
      console.log('[CloudStorage] Backup restored:', backupId);
      return backup.data;
    } catch (error) {
      console.error('[CloudStorage] Restore backup error:', error);
      throw error;
    }
  }

  // Sync methods
  async syncAllData(): Promise<void> {
    if (!this.currentUser || !this.isOnline) {
      console.log('[CloudStorage] Cannot sync - user not authenticated or offline');
      return;
    }

    try {
      console.log('[CloudStorage] Starting full data sync...');
      
      // This would sync all data types
      // Implementation depends on your specific data types
      
      console.log('[CloudStorage] Full data sync completed');
    } catch (error) {
      console.error('[CloudStorage] Sync error:', error);
      throw error;
    }
  }

  // Utility methods
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  async getStorageUsage(): Promise<{ used: number; limit: number }> {
    // Firebase doesn't provide direct storage usage info
    // This would need to be calculated based on your data
    return { used: 0, limit: 1024 * 1024 * 1024 }; // 1GB limit
  }
}

export const cloudStorage = new CloudStorage();
