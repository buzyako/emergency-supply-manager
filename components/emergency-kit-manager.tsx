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
    includedItems: any[]
  }>({
    name: "",
    quantity: "",
    category: "first-aid",
    lastChecked: new Date().toISOString().split("T")[0],
    notes: "",
    includedItems: [],
  })
  const [newItem, setNewItem] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemFormData, setItemFormData] = useState<{
    name: string
    quantity: string
    hasExpiration: boolean
    expirationDate: string
    noExpiry: boolean
    needsMaintenance: boolean
    maintenanceInterval: string
    lastMaintenance: string
    hasBattery: boolean
    batteryType: string
    lastBatteryCheck: string
    notes: string
  }>({
    name: "",
    quantity: "1",
    hasExpiration: false,
    expirationDate: "",
    noExpiry: false,
    needsMaintenance: false,
    maintenanceInterval: "90",
    lastMaintenance: "",
    hasBattery: false,
    batteryType: "",
    lastBatteryCheck: "",
    notes: "",
  })

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
    })
    setNewItem("")
    setShowForm(false)
  }

  const handleAddIncludedItem = () => {
    if (itemFormData.name.trim()) {
      const newIncludedItem = {
        id: Date.now().toString(),
        name: itemFormData.name.trim(),
        quantity: parseInt(itemFormData.quantity) || 1,
        hasExpiration: itemFormData.hasExpiration,
        expirationDate: itemFormData.hasExpiration ? itemFormData.expirationDate : undefined,
        noExpiry: itemFormData.noExpiry,
        needsMaintenance: itemFormData.needsMaintenance,
        maintenanceInterval: itemFormData.needsMaintenance ? parseInt(itemFormData.maintenanceInterval) : undefined,
        lastMaintenance: itemFormData.needsMaintenance ? itemFormData.lastMaintenance : undefined,
        hasBattery: itemFormData.hasBattery,
        batteryType: itemFormData.hasBattery ? itemFormData.batteryType : undefined,
        lastBatteryCheck: itemFormData.hasBattery ? itemFormData.lastBatteryCheck : undefined,
        notes: itemFormData.notes,
      }
      
      setFormData(prev => ({
        ...prev,
        includedItems: [...prev.includedItems, newIncludedItem]
      }))
      
      // Reset item form
      setItemFormData({
        name: "",
        quantity: "1",
        hasExpiration: false,
        expirationDate: "",
        noExpiry: false,
        needsMaintenance: false,
        maintenanceInterval: "90",
        lastMaintenance: "",
        hasBattery: false,
        batteryType: "",
        lastBatteryCheck: "",
        notes: "",
      })
      setEditingItemId(null)
    }
  }

  const handleRemoveIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedItems: prev.includedItems.filter((_, i) => i !== index)
    }))
  }

  const handleEditIncludedItem = (item: any, index: number) => {
    setItemFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      hasExpiration: item.hasExpiration || false,
      expirationDate: item.expirationDate || "",
      noExpiry: item.noExpiry || false,
      needsMaintenance: item.needsMaintenance || false,
      maintenanceInterval: item.maintenanceInterval?.toString() || "90",
      lastMaintenance: item.lastMaintenance || "",
      hasBattery: item.hasBattery || false,
      batteryType: item.batteryType || "",
      lastBatteryCheck: item.lastBatteryCheck || "",
      notes: item.notes || "",
    })
    setEditingItemId(item.id)
  }

  const handleUpdateIncludedItem = () => {
    if (editingItemId && itemFormData.name.trim()) {
      const updatedItem = {
        id: editingItemId,
        name: itemFormData.name.trim(),
        quantity: parseInt(itemFormData.quantity) || 1,
        hasExpiration: itemFormData.hasExpiration,
        expirationDate: itemFormData.hasExpiration ? itemFormData.expirationDate : undefined,
        noExpiry: itemFormData.noExpiry,
        needsMaintenance: itemFormData.needsMaintenance,
        maintenanceInterval: itemFormData.needsMaintenance ? parseInt(itemFormData.maintenanceInterval) : undefined,
        lastMaintenance: itemFormData.needsMaintenance ? itemFormData.lastMaintenance : undefined,
        hasBattery: itemFormData.hasBattery,
        batteryType: itemFormData.hasBattery ? itemFormData.batteryType : undefined,
        lastBatteryCheck: itemFormData.hasBattery ? itemFormData.lastBatteryCheck : undefined,
        notes: itemFormData.notes,
      }

      setFormData(prev => ({
        ...prev,
        includedItems: prev.includedItems.map(item => 
          item.id === editingItemId ? updatedItem : item
        )
      }))

      // Reset item form
      setItemFormData({
        name: "",
        quantity: "1",
        hasExpiration: false,
        expirationDate: "",
        noExpiry: false,
        needsMaintenance: false,
        maintenanceInterval: "90",
        lastMaintenance: "",
        hasBattery: false,
        batteryType: "",
        lastBatteryCheck: "",
        notes: "",
      })
      setEditingItemId(null)
    }
  }

  const handleEdit = (item: KitItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      category: item.category,
      lastChecked: item.lastChecked,
      notes: item.notes,
      includedItems: item.includedItems || [],
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
                <label className="text-sm font-medium">Included Items with Individual Monitoring</label>
                <div className="space-y-4">
                  {/* Add New Item Form */}
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <h4 className="font-medium mb-3">{editingItemId ? "Edit Item" : "Add New Item"}</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm text-muted-foreground">Item Name *</label>
                        <Input
                          value={itemFormData.name}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Bandages, Flashlight, Radio"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={itemFormData.quantity}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>
                      
                      {/* Expiration Options */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="itemHasExpiration"
                            checked={itemFormData.hasExpiration}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, hasExpiration: e.target.checked, noExpiry: false }))}
                          />
                          <label htmlFor="itemHasExpiration" className="text-sm">Has Expiration Date</label>
                        </div>
                        {itemFormData.hasExpiration && (
                          <Input
                            type="date"
                            value={itemFormData.expirationDate}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="itemNoExpiry"
                            checked={itemFormData.noExpiry}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, noExpiry: e.target.checked, hasExpiration: false }))}
                          />
                          <label htmlFor="itemNoExpiry" className="text-sm">No Expiration (e.g., tools, clothing)</label>
                        </div>
                      </div>
                      
                      {/* Maintenance Options */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="itemNeedsMaintenance"
                            checked={itemFormData.needsMaintenance}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, needsMaintenance: e.target.checked }))}
                          />
                          <label htmlFor="itemNeedsMaintenance" className="text-sm">Needs Maintenance</label>
                        </div>
                        {itemFormData.needsMaintenance && (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              min="1"
                              value={itemFormData.maintenanceInterval}
                              onChange={(e) => setItemFormData(prev => ({ ...prev, maintenanceInterval: e.target.value }))}
                              placeholder="Days between maintenance"
                            />
                            <Input
                              type="date"
                              value={itemFormData.lastMaintenance}
                              onChange={(e) => setItemFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                              placeholder="Last maintenance date"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Battery Options */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="itemHasBattery"
                            checked={itemFormData.hasBattery}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, hasBattery: e.target.checked }))}
                          />
                          <label htmlFor="itemHasBattery" className="text-sm">Has Battery</label>
                        </div>
                        {itemFormData.hasBattery && (
                          <div className="space-y-2">
                            <Input
                              value={itemFormData.batteryType}
                              onChange={(e) => setItemFormData(prev => ({ ...prev, batteryType: e.target.value }))}
                              placeholder="Battery type (e.g., AA, AAA, 9V)"
                            />
                            <Input
                              type="date"
                              value={itemFormData.lastBatteryCheck}
                              onChange={(e) => setItemFormData(prev => ({ ...prev, lastBatteryCheck: e.target.value }))}
                              placeholder="Last battery check"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-sm text-muted-foreground">Notes</label>
                        <Input
                          value={itemFormData.notes}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes about this item"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        onClick={editingItemId ? handleUpdateIncludedItem : handleAddIncludedItem}
                        size="sm"
                      >
                        {editingItemId ? "Update Item" : "Add Item"}
                      </Button>
                      {editingItemId && (
                        <Button 
                          onClick={() => {
                            setEditingItemId(null)
                            setItemFormData({
                              name: "",
                              quantity: "1",
                              hasExpiration: false,
                              expirationDate: "",
                              noExpiry: false,
                              needsMaintenance: false,
                              maintenanceInterval: "90",
                              lastMaintenance: "",
                              hasBattery: false,
                              batteryType: "",
                              lastBatteryCheck: "",
                              notes: "",
                            })
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Display Added Items */}
                  {formData.includedItems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Items included in this kit:</p>
                      <div className="space-y-2">
                        {formData.includedItems.map((item, index) => (
                          <div key={item.id} className="border rounded-lg p-3 bg-white">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-sm text-muted-foreground">(Qty: {item.quantity})</span>
                                </div>
                                
                                {/* Item Monitoring Status */}
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
                                  
                                  {item.noExpiry && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-green-600">✓ No expiration</span>
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
                                  
                                  {item.notes && (
                                    <div className="text-xs text-muted-foreground italic">{item.notes}</div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-1 ml-2">
                                <Button
                                  onClick={() => handleEditIncludedItem(item, index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  ✏️
                                </Button>
                                <Button
                                  onClick={() => handleRemoveIncludedItem(index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                              <p className="text-xs text-muted-foreground mb-1">Included items with monitoring:</p>
                              <div className="space-y-1">
                                {item.includedItems.map((includedItem, index) => (
                                  <div key={includedItem.id || index} className="text-xs">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{includedItem.name}</span>
                                      <span className="text-muted-foreground">(Qty: {includedItem.quantity})</span>
                                    </div>
                                    
                                    {/* Individual Item Monitoring Status */}
                                    <div className="ml-2 space-y-1">
                                      {/* Expiration Status */}
                                      {includedItem.hasExpiration && includedItem.expirationDate && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-muted-foreground">Expires:</span>
                                          <span className={`font-medium ${
                                            new Date(includedItem.expirationDate) < new Date() 
                                              ? 'text-red-600' 
                                              : new Date(includedItem.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                              ? 'text-orange-600'
                                              : 'text-green-600'
                                          }`}>
                                            {new Date(includedItem.expirationDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {includedItem.noExpiry && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-green-600">✓ No expiration</span>
                                        </div>
                                      )}
                                      
                                      {/* Maintenance Status */}
                                      {includedItem.needsMaintenance && includedItem.maintenanceInterval && includedItem.lastMaintenance && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-muted-foreground">Maintenance:</span>
                                          <span className={`font-medium ${
                                            new Date(includedItem.lastMaintenance) < new Date(Date.now() - includedItem.maintenanceInterval * 24 * 60 * 60 * 1000)
                                              ? 'text-red-600'
                                              : new Date(includedItem.lastMaintenance) < new Date(Date.now() - (includedItem.maintenanceInterval - 7) * 24 * 60 * 60 * 1000)
                                              ? 'text-orange-600'
                                              : 'text-green-600'
                                          }`}>
                                            {new Date(includedItem.lastMaintenance).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Battery Status */}
                                      {includedItem.hasBattery && includedItem.batteryType && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-muted-foreground">Battery:</span>
                                          <span className="font-medium text-blue-600">{includedItem.batteryType}</span>
                                          {includedItem.lastBatteryCheck && (
                                            <span className="text-muted-foreground">
                                              (checked: {new Date(includedItem.lastBatteryCheck).toLocaleDateString()})
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      
                                      {includedItem.notes && (
                                        <div className="text-muted-foreground italic">{includedItem.notes}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
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
