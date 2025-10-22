"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FoodItem } from "@/lib/types"

export function FoodStorageTracker() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    quantity: number
    unit: string
    expiryDate: string
    location: string
    category: string
  }>({
    name: "",
    quantity: 1,
    unit: "pieces",
    expiryDate: "",
    location: "",
    category: "other",
  })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("foodItems") || "[]")
    setItems(saved)
  }, [])

  const saveItems = (newItems: FoodItem[]) => {
    setItems(newItems)
    localStorage.setItem("foodItems", JSON.stringify(newItems))
  }

  const handleAddItem = () => {
    if (!formData.name || !formData.expiryDate) {
      alert("Please fill in all required fields")
      return
    }

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId ? { ...item, ...formData, category: formData.category as FoodItem['category'], updatedAt: new Date().toISOString() } : item,
      )
      saveItems(updated)
      setEditingId(null)
    } else {
      const newItem: FoodItem = {
        id: Date.now().toString(),
        ...formData,
        category: formData.category as FoodItem['category'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveItems([...items, newItem])
    }

    setFormData({
      name: "",
      quantity: 1,
      unit: "pieces",
      expiryDate: "",
      location: "",
      category: "other",
    })
    setShowForm(false)
  }

  const handleEdit = (item: FoodItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      location: item.location,
      category: item.category,
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      saveItems(items.filter((item) => item.id !== id))
    }
  }

  const getExpirationStatus = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: "expired", color: "bg-red-100 text-red-800", badge: "Expired" }
    if (daysUntilExpiry < 7) return { status: "critical", color: "bg-orange-100 text-orange-800", badge: "Critical" }
    if (daysUntilExpiry < 30) return { status: "warning", color: "bg-yellow-100 text-yellow-800", badge: "Warning" }
    return { status: "good", color: "bg-green-100 text-green-800", badge: "Good" }
  }

  const sortedItems = [...items].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Food Storage</h2>
          <p className="text-muted-foreground">Track your food items and expiration dates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          ➕ Add Item
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Item" : "Add New Food Item"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Canned Beans"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="grains">Grains</option>
                  <option value="proteins">Proteins</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="dairy">Dairy</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., cans, boxes, kg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expiry Date *</label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Storage Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Pantry, Freezer"
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
                    unit: "pieces",
                    expiryDate: "",
                    location: "",
                    category: "other",
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No food items yet. Add your first item to get started!
            </CardContent>
          </Card>
        ) : (
          sortedItems.map((item) => {
            const status = getExpirationStatus(item.expiryDate)
            return (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} • {item.location}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                        {status.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
          })
        )}
      </div>
    </div>
  )
}
