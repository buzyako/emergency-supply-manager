// Data encryption utilities for secure local storage
import { storage, StorageObject, StorageItem } from './storage'

export interface EncryptedData extends StorageObject {
  data: string
  iv: string
  salt: string
}

export class EncryptionManager {
  private static instance: EncryptionManager
  private readonly ALGORITHM = 'AES-GCM'
  private readonly KEY_LENGTH = 256
  private readonly IV_LENGTH = 12
  private readonly SALT_LENGTH = 16

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager()
    }
    return EncryptionManager.instance
  }

  // Derive encryption key from password
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = new TextEncoder().encode(password)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as unknown as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Generate random salt
  private generateSalt(): Uint8Array {
    const array = new Uint8Array(this.SALT_LENGTH)
    crypto.getRandomValues(array)
    return array
  }

  // Generate random IV
  private generateIV(): Uint8Array {
    const array = new Uint8Array(this.IV_LENGTH)
    crypto.getRandomValues(array)
    return array
  }

  // Encrypt data
  async encrypt(data: any, password: string): Promise<EncryptedData> {
    try {
      const salt = this.generateSalt()
      const iv = this.generateIV()
      const key = await this.deriveKey(password, salt)
      
      const dataString = JSON.stringify(data)
      const dataBuffer = new TextEncoder().encode(dataString)
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv.buffer as unknown as ArrayBuffer
        },
        key,
        dataBuffer
      )

      return {
        data: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  // Decrypt data
  async decrypt(encryptedData: EncryptedData, password: string): Promise<any> {
    try {
      const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedData.salt))
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv))
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data)
      
      const key = await this.deriveKey(password, salt)
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv.buffer as unknown as ArrayBuffer
        },
        key,
        encryptedBuffer
      )

      const decryptedString = new TextDecoder().decode(decryptedBuffer)
      return JSON.parse(decryptedString)
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  // Convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Convert Base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

// Enhanced storage manager with encryption
export class SecureStorageManager {
  private static instance: SecureStorageManager
  private encryptionManager = EncryptionManager.getInstance()
  private storageManager = storage

  static getInstance(): SecureStorageManager {
    if (!SecureStorageManager.instance) {
      SecureStorageManager.instance = new SecureStorageManager()
    }
    return SecureStorageManager.instance
  }

  // Save encrypted data
  async saveSecure<T>(key: string, data: T, password: string): Promise<boolean> {
    try {
      const encryptedData = await this.encryptionManager.encrypt(data, password)
      return this.storageManager.save(key, encryptedData)
    } catch (error) {
      console.error('Failed to save secure data:', error)
      return false
    }
  }

  // Load and decrypt data
  async loadSecure<T>(key: string, password: string): Promise<T | null> {
    try {
      const encryptedData = this.storageManager.loadObject<EncryptedData>(key)
      if (!encryptedData) {
        return null
      }
      return await this.encryptionManager.decrypt(encryptedData, password)
    } catch (error) {
      console.error('Failed to load secure data:', error)
      return null
    }
  }

  // Check if encrypted data exists
  hasSecureData(key: string): boolean {
    return this.storageManager.loadObject<EncryptedData>(key) !== null
  }

  // Clear encrypted data
  clearSecure(key: string): boolean {
    return this.storageManager.clear(key)
  }

  // Migrate existing unencrypted data to encrypted storage
  async migrateToSecureStorage(key: string, password: string): Promise<boolean> {
    try {
      // Try to load existing unencrypted data
      const existingData = this.storageManager.loadObject<any>(key) || 
                          this.storageManager.loadArray<any>(key)
      
      if (existingData) {
        // Save as encrypted data
        const success = await this.saveSecure(key, existingData, password)
        if (success) {
          // Clear the old unencrypted data
          this.storageManager.clear(key)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Failed to migrate data to secure storage:', error)
      return false
    }
  }

  // Backup encrypted data
  async backupSecure(password: string): Promise<string> {
    try {
      const backup: Record<string, any> = {}
      const keys = ['foodItems', 'kitItems', 'goBags', 'financialData', 'communicationData']
      
      for (const key of keys) {
        const data = await this.loadSecure(key, password)
        if (data) {
          backup[key] = data
        }
      }
      
      return JSON.stringify(backup)
    } catch (error) {
      console.error('Failed to create secure backup:', error)
      return '{}'
    }
  }

  // Restore encrypted data
  async restoreSecure(backupData: string, password: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupData)
      
      for (const key in backup) {
        const success = await this.saveSecure(key, backup[key], password)
        if (!success) {
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to restore secure data:', error)
      return false
    }
  }
}

// Export singleton instances
export const encryptionManager = EncryptionManager.getInstance()
export const secureStorage = SecureStorageManager.getInstance()
