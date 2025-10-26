export interface FoodItem {
  id: string
  name: string
  quantity: number
  unit: string
  expiryDate: string
  location: string
  category: "grains" | "proteins" | "vegetables" | "fruits" | "dairy" | "other"
  createdAt: string
  updatedAt: string
}

export interface KitItem {
  id: string
  name: string
  quantity: number
  category: "first-aid" | "water" | "tools" | "documents" | "clothing" | "other"
  lastChecked: string
  notes: string
  includedItems: string[]
  // Monitoring fields
  hasExpiration: boolean
  expirationDate?: string
  needsMaintenance: boolean
  maintenanceInterval?: number // in days
  lastMaintenance?: string
  hasBattery: boolean
  batteryType?: string
  lastBatteryCheck?: string
  createdAt: string
  updatedAt: string
}

export interface GoBagItem {
  id: string
  name: string
  quantity: number
}

export interface GoBag {
  id: string
  name: string
  person: string
  items: GoBagItem[]
  createdAt: string
  updatedAt: string
}
