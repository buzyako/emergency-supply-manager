"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { KitItem } from "@/lib/types"
import { storage } from "@/lib/storage"

export function EmergencyKitManager() {
  const [items, setItems] = useState<KitItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    quantity: string
    category: string
    lastChecked: string
    notes: string
    includedItems: string[]
    hasExpiration: boolean
    expirationDate: string
    needsMaintenance: boolean
    maintenanceInterval: string
    lastMaintenance: string
    hasBattery: boolean
    batteryType: string
    lastBatteryCheck: string
  }>({
    name: "",
    quantity: "",
    category: "first-aid",
    lastChecked: new Date().toISOString().split("T")[0],
    notes: "",
    includedItems: [],
    hasExpiration: false,
    expirationDate: "",
    needsMaintenance: false,
    maintenanceInterval: "90",
    lastMaintenance: "",
    hasBattery: false,
    batteryType: "",
    lastBatteryCheck: "",
  })
  const [newItem, setNewItem] = useState("")

  useEffect(() => {
    const saved = storage.load<KitItem>("kitItems")
    setItems(saved)
    console.log(`[EmergencyKit] Loaded ${saved.length} items from storage`)
  }, [])

  const saveItems = (newItems: KitItem[]) => {
    setItems(newItems)
    const success = storage.save("kitItems", newItems)
    if (success) {
      console.log(`[EmergencyKit] Successfully saved ${newItems.length} items`)
    } else {
      console.error(`[EmergencyKit] Failed to save ${newItems.length} items`)
      alert("Failed to save data. Please try again.")
    }
  }

  const handleAddItem = () => {
    if (!formData.name) {
      alert("Please enter an item name")
      return
    }

    // Convert quantity to number, default to 1 if empty or invalid
    const quantity = formData.quantity === "" ? 1 : parseInt(formData.quantity) || 1

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId ? { 
          ...item, 
          ...formData, 
          quantity, 
          category: formData.category as KitItem['category'], 
          includedItems: formData.includedItems,
          hasExpiration: formData.hasExpiration,
          expirationDate: formData.hasExpiration ? formData.expirationDate : undefined,
          needsMaintenance: formData.needsMaintenance,
          maintenanceInterval: formData.needsMaintenance ? parseInt(formData.maintenanceInterval) : undefined,
          lastMaintenance: formData.needsMaintenance ? formData.lastMaintenance : undefined,
          hasBattery: formData.hasBattery,
          batteryType: formData.hasBattery ? formData.batteryType : undefined,
          lastBatteryCheck: formData.hasBattery ? formData.lastBatteryCheck : undefined,
          updatedAt: new Date().toISOString() 
        } : item,
      )
      saveItems(updated)
      setEditingId(null)
    } else {
      const newItem: KitItem = {
        id: Date.now().toString(),
        ...formData,
        quantity,
        category: formData.category as KitItem['category'],
        hasExpiration: formData.hasExpiration,
        expirationDate: formData.hasExpiration ? formData.expirationDate : undefined,
        needsMaintenance: formData.needsMaintenance,
        maintenanceInterval: formData.needsMaintenance ? parseInt(formData.maintenanceInterval) : undefined,
        lastMaintenance: formData.needsMaintenance ? formData.lastMaintenance : undefined,
        hasBattery: formData.hasBattery,
        batteryType: formData.hasBattery ? formData.batteryType : undefined,
        lastBatteryCheck: formData.hasBattery ? formData.lastBatteryCheck : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveItems([...items, newItem])
    }

    setFormData({
      name: "",
      quantity: "",
      category: "first-aid",
      lastChecked: new Date().toISOString().split("T")[0],
      notes: "",
      includedItems: [],
      hasExpiration: false,
      expirationDate: "",
      needsMaintenance: false,
      maintenanceInterval: "90",
      lastMaintenance: "",
      hasBattery: false,
      batteryType: "",
      lastBatteryCheck: "",
    })
    setNewItem("")
    setShowForm(false)
  }

  const handleAddIncludedItem = () => {
    if (newItem.trim()) {
      setFormData(prev => ({
        ...prev,
        includedItems: [...prev.includedItems, newItem.trim()]
      }))
      setNewItem("")
    }
  }

  const handleRemoveIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedItems: prev.includedItems.filter((_, i) => i !== index)
    }))
  }

  const handleEdit = (item: KitItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      category: item.category,
      lastChecked: item.lastChecked,
      notes: item.notes,
      includedItems: item.includedItems || [],
      hasExpiration: item.hasExpiration || false,
      expirationDate: item.expirationDate || "",
      needsMaintenance: item.needsMaintenance || false,
      maintenanceInterval: item.maintenanceInterval?.toString() || "90",
      lastMaintenance: item.lastMaintenance || "",
      hasBattery: item.hasBattery || false,
      batteryType: item.batteryType || "",
      lastBatteryCheck: item.lastBatteryCheck || "",
    })
    setNewItem("") // Reset the new item input
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      saveItems(items.filter((item) => item.id !== id))
    }
  }

  const handleCheckItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, lastChecked: new Date().toISOString().split("T")[0] } : item,
    )
    saveItems(updated)
  }

  const categories = [
    { value: "first-aid", label: "First Aid" },
    { value: "water", label: "Water & Food" },
    { value: "tools", label: "Tools" },
    { value: "documents", label: "Documents" },
    { value: "clothing", label: "Clothing" },
    { value: "other", label: "Other" },
  ]

  const groupedItems = categories.reduce(
    (acc, cat) => {
      acc[cat.value] = items.filter((item) => item.category === cat.value)
      return acc
    },
    {} as Record<string, KitItem[]>,
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Emergency Kit</h2>
          <p className="text-muted-foreground">Manage your emergency kit items</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          ➕ Add Item
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Item" : "Add New Kit Item"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., First Aid Kit"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  aria-label="Category selection"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Checked</label>
                <Input
                  type="date"
                  value={formData.lastChecked}
                  onChange={(e) => setFormData({ ...formData, lastChecked: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Included Items</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add an item included in this kit..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIncludedItem()}
                    />
                    <Button onClick={handleAddIncludedItem} type="button" variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.includedItems.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Items included in this kit:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.includedItems.map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveIncludedItem(index)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Monitoring Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">📅 Monitoring & Maintenance</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Expiration Monitoring */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasExpiration"
                        checked={formData.hasExpiration}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasExpiration: e.target.checked }))}
                      />
                      <label htmlFor="hasExpiration" className="text-sm font-medium">Has Expiration Date</label>
                    </div>
                    {formData.hasExpiration && (
                      <div>
                        <label className="text-sm text-muted-foreground">Expiration Date</label>
                        <Input
                          type="date"
                          value={formData.expirationDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Maintenance Monitoring */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="needsMaintenance"
                        checked={formData.needsMaintenance}
                        onChange={(e) => setFormData(prev => ({ ...prev, needsMaintenance: e.target.checked }))}
                      />
                      <label htmlFor="needsMaintenance" className="text-sm font-medium">Needs Maintenance</label>
                    </div>
                    {formData.needsMaintenance && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-muted-foreground">Maintenance Interval (days)</label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.maintenanceInterval}
                            onChange={(e) => setFormData(prev => ({ ...prev, maintenanceInterval: e.target.value }))}
                            placeholder="90"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Last Maintenance</label>
                          <Input
                            type="date"
                            value={formData.lastMaintenance}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Battery Monitoring */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasBattery"
                        checked={formData.hasBattery}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasBattery: e.target.checked }))}
                      />
                      <label htmlFor="hasBattery" className="text-sm font-medium">Has Battery</label>
                    </div>
                    {formData.hasBattery && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-muted-foreground">Battery Type</label>
                          <Input
                            value={formData.batteryType}
                            onChange={(e) => setFormData(prev => ({ ...prev, batteryType: e.target.value }))}
                            placeholder="e.g., AA, AAA, 9V"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Last Battery Check</label>
                          <Input
                            type="date"
                            value={formData.lastBatteryCheck}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastBatteryCheck: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem}>{editingId ? "Update" : "Add"} Item</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setNewItem("")
                  setFormData({
                    name: "",
                    quantity: "",
                    category: "first-aid",
                    lastChecked: new Date().toISOString().split("T")[0],
                    notes: "",
                    includedItems: [],
                    hasExpiration: false,
                    expirationDate: "",
                    needsMaintenance: false,
                    maintenanceInterval: "90",
                    lastMaintenance: "",
                    hasBattery: false,
                    batteryType: "",
                    lastBatteryCheck: "",
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items by Category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryItems = groupedItems[cat.value]
          if (categoryItems.length === 0) return null

          return (
            <div key={cat.value}>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{cat.label}</h3>
              <div className="space-y-2">
                {categoryItems.map((item) => {
                  const daysSinceCheck = Math.floor(
                    (new Date().getTime() - new Date(item.lastChecked).getTime()) / (1000 * 60 * 60 * 24),
                  )
                  const needsCheck = daysSinceCheck > 90

                  return (
                    <Card key={item.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} • Last checked: {new Date(item.lastChecked).toLocaleDateString()}
                          </p>
                          {item.notes && <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>}
                          {item.includedItems && item.includedItems.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Included items:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.includedItems.map((includedItem, index) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                                  >
                                    {includedItem}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Monitoring Status Indicators */}
                          <div className="mt-2 space-y-1">
                            {/* Expiration Status */}
                            {item.hasExpiration && item.expirationDate && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Expires:</span>
                                <span className={`text-xs font-medium ${
                                  new Date(item.expirationDate) < new Date() 
                                    ? 'text-red-600' 
                                    : new Date(item.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }`}>
                                  {new Date(item.expirationDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {/* Maintenance Status */}
                            {item.needsMaintenance && item.maintenanceInterval && item.lastMaintenance && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Maintenance:</span>
                                <span className={`text-xs font-medium ${
                                  new Date(item.lastMaintenance) < new Date(Date.now() - item.maintenanceInterval * 24 * 60 * 60 * 1000)
                                    ? 'text-red-600'
                                    : new Date(item.lastMaintenance) < new Date(Date.now() - (item.maintenanceInterval - 7) * 24 * 60 * 60 * 1000)
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }`}>
                                  {new Date(item.lastMaintenance).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {/* Battery Status */}
                            {item.hasBattery && item.batteryType && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Battery:</span>
                                <span className="text-xs font-medium text-blue-600">{item.batteryType}</span>
                                {item.lastBatteryCheck && (
                                  <span className="text-xs text-muted-foreground">
                                    (checked: {new Date(item.lastBatteryCheck).toLocaleDateString()})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {needsCheck && <p className="mt-1 text-xs text-orange-600 font-medium">Needs checking</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckItem(item.id)}
                            title="Mark as checked"
                          >
                            ✅
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            ✏️
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            🗑️
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No kit items yet. Add your first item to get started!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
