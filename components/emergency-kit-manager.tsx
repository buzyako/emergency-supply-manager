"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { KitItem } from "@/lib/types"
import { storage } from "@/lib/storage"

export function EmergencyKitManager() {
  const [kits, setKits] = useState<KitItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedKit, setExpandedKit] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "first-aid",
    lastChecked: new Date().toISOString().split("T")[0],
    notes: "",
    includedItems: [] as any[],
  })
  const [newItem, setNewItem] = useState({ name: "", quantity: "" })

  useEffect(() => {
    const saved = storage.load<KitItem>("kitItems")
    setKits(saved)
    console.log(`[EmergencyKit] Loaded ${saved.length} kits from storage`)
  }, [])

  const saveKits = (newKits: KitItem[]) => {
    setKits(newKits)
    const success = storage.save("kitItems", newKits)
    if (success) {
      console.log(`[EmergencyKit] Successfully saved ${newKits.length} kits`)
    } else {
      console.error(`[EmergencyKit] Failed to save ${newKits.length} kits`)
      alert("Failed to save data. Please try again.")
    }
  }

  const handleAddKit = () => {
    if (!formData.name) {
      alert("Please enter a kit name")
      return
    }

    if (editingId) {
      const updated = kits.map((kit) =>
        kit.id === editingId ? { 
          ...kit, 
          ...formData, 
          category: formData.category as KitItem['category'],
          updatedAt: new Date().toISOString() 
        } : kit,
      )
      saveKits(updated)
      setEditingId(null)
    } else {
      const newKit: KitItem = {
        id: Date.now().toString(),
        ...formData,
        quantity: 1, // Default quantity for kits
        category: formData.category as KitItem['category'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveKits([...kits, newKit])
    }

    setFormData({
      name: "",
      category: "first-aid",
      lastChecked: new Date().toISOString().split("T")[0],
      notes: "",
      includedItems: [],
    })
    setShowForm(false)
  }

  const handleAddIncludedItem = () => {
    if (!newItem.name) return
    
    // Convert quantity to number, default to 1 if empty or invalid
    const quantity = newItem.quantity === "" ? 1 : parseInt(newItem.quantity) || 1
    
    const newIncludedItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity,
      hasExpiration: false,
      noExpiry: false,
      needsMaintenance: false,
      hasBattery: false,
    }
    
    setFormData({
      ...formData,
      includedItems: [...formData.includedItems, newIncludedItem],
    })
    setNewItem({ name: "", quantity: "" })
  }

  const handleRemoveIncludedItem = (itemId: string) => {
    setFormData({
      ...formData,
      includedItems: formData.includedItems.filter((item) => item.id !== itemId),
    })
  }


  const handleEdit = (kit: KitItem) => {
    setFormData({
      name: kit.name,
      category: kit.category,
      lastChecked: kit.lastChecked,
      notes: kit.notes,
      includedItems: kit.includedItems || [],
    })
    setEditingId(kit.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this emergency kit?")) {
      saveKits(kits.filter((kit) => kit.id !== id))
    }
  }

  const handleCheckKit = (id: string) => {
    const updated = kits.map((kit) =>
      kit.id === id ? { ...kit, lastChecked: new Date().toISOString().split("T")[0] } : kit,
    )
    saveKits(updated)
  }

  const categories = [
    { value: "first-aid", label: "First Aid" },
    { value: "water", label: "Water & Food" },
    { value: "tools", label: "Tools" },
    { value: "documents", label: "Documents" },
    { value: "clothing", label: "Clothing" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Emergency Kits</h2>
          <p className="text-muted-foreground">Manage emergency kits and their contents</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          ➕ New Emergency Kit
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Emergency Kit" : "Create New Emergency Kit"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Kit Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Home First Aid Kit"
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
                  placeholder="Any additional notes about this kit..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  rows={3}
                />
              </div>
            </div>

            {/* Items in Kit */}
            <div>
              <label className="text-sm font-medium">Items in Kit</label>
              <div className="space-y-2">
                {formData.includedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                    <span className="text-sm">
                      {item.quantity}x {item.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveIncludedItem(item.id)}>
                      🗑️
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Item to Kit */}
              <div className="mt-3 flex gap-2">
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="w-20"
                  placeholder="1"
                />
                <Button onClick={handleAddIncludedItem} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddKit}>{editingId ? "Update" : "Create"} Kit</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    name: "",
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

      {/* Emergency Kits List */}
      <div className="space-y-3">
        {kits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No emergency kits yet. Create your first emergency kit to get started!
            </CardContent>
          </Card>
        ) : (
          kits.map((kit) => (
            <Card key={kit.id}>
              <CardContent className="p-4">
                <div
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => setExpandedKit(expandedKit === kit.id ? null : kit.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧰</span>
                    <div>
                      <p className="font-medium text-foreground">{kit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {categories.find(cat => cat.value === kit.category)?.label} • 
                        Last checked: {new Date(kit.lastChecked).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{kit.includedItems.length} items</span>
                  </div>
                </div>

                {/* Expanded Items */}
                {expandedKit === kit.id && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {kit.includedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                    ))}
                    {kit.notes && (
                      <div className="text-sm text-muted-foreground italic">
                        Notes: {kit.notes}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCheckKit(kit.id)}>
                        ✓ Check
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(kit)}>
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(kit.id)}>
                        🗑️
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
