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
    quantity: number
    category: string
    lastChecked: string
    notes: string
  }>({
    name: "",
    quantity: 1,
    category: "first-aid",
    lastChecked: new Date().toISOString().split("T")[0],
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

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId ? { ...item, ...formData, category: formData.category as KitItem['category'], updatedAt: new Date().toISOString() } : item,
      )
      saveItems(updated)
      setEditingId(null)
    } else {
      const newItem: KitItem = {
        id: Date.now().toString(),
        ...formData,
        category: formData.category as KitItem['category'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveItems([...items, newItem])
    }

    setFormData({
      name: "",
      quantity: 1,
      category: "first-aid",
      lastChecked: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setShowForm(false)
  }

  const handleEdit = (item: KitItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      lastChecked: item.lastChecked,
      notes: item.notes,
    })
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
                  onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem}>{editingId ? "Update" : "Add"} Item</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    name: "",
                    quantity: 1,
                    category: "first-aid",
                    lastChecked: new Date().toISOString().split("T")[0],
                    notes: "",
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
