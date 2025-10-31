"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FoodItem, GoBag } from "@/lib/types"
import { storage } from "@/lib/storage"

export function FoodStorageTracker() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [goBags, setGoBags] = useState<GoBag[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [useCustomLocation, setUseCustomLocation] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    quantity: string
    unit: string
    expiryDate: string
    location: string
    category: string
  }>({
    name: "",
    quantity: "",
    unit: "pieces",
    expiryDate: "",
    location: "",
    category: "other",
  })

  useEffect(() => {
    const saved = storage.load<FoodItem>("foodItems")
    setItems(saved)
    console.log(`[FoodStorage] Loaded ${saved.length} items from storage`)

    const savedGoBags = storage.load<GoBag>("goBags")
    setGoBags(savedGoBags)
    console.log(`[FoodStorage] Loaded ${savedGoBags.length} go bags`)
  }, [])

  // Reload go bags when form is opened to ensure dropdown is up-to-date
  useEffect(() => {
    if (showForm) {
      const savedGoBags = storage.load<GoBag>("goBags")
      setGoBags(savedGoBags)
    }
  }, [showForm])

  const saveItems = (newItems: FoodItem[]) => {
    setItems(newItems)
    const success = storage.save("foodItems", newItems)
    if (success) {
      console.log(`[FoodStorage] Successfully saved ${newItems.length} items`)
    } else {
      console.error(`[FoodStorage] Failed to save ${newItems.length} items`)
      alert("Failed to save data. Please try again.")
    }
  }

  const handleAddItem = () => {
    if (!formData.name || !formData.expiryDate) {
      alert("Please fill in all required fields")
      return
    }

    // Convert quantity to number, default to 1 if empty or invalid
    const quantity = formData.quantity === "" ? 1 : parseInt(formData.quantity) || 1

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId ? { ...item, ...formData, quantity, category: formData.category as FoodItem['category'], updatedAt: new Date().toISOString() } : item,
      )
      saveItems(updated)
      setEditingId(null)
    } else {
      const newItem: FoodItem = {
        id: Date.now().toString(),
        ...formData,
        quantity,
        category: formData.category as FoodItem['category'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveItems([...items, newItem])
    }

    setFormData({
      name: "",
      quantity: "",
      unit: "pieces",
      expiryDate: "",
      location: "",
      category: "other",
    })
    setUseCustomLocation(false)
    setShowForm(false)
  }

  const handleEdit = (item: FoodItem) => {
    // Check if location matches a go bag name
    const isGoBagLocation = goBags.some(bag => bag.name === item.location)
    setUseCustomLocation(!isGoBagLocation)
    
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
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
                  aria-label="Category"
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
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="1"
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
                {useCustomLocation ? (
                  <div className="space-y-2">
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Pantry, Freezer"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUseCustomLocation(false)
                        setFormData({ ...formData, location: "" })
                      }}
                      className="h-auto p-1 text-xs"
                    >
                      ← Select from Go Bags
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.location || ""}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setUseCustomLocation(true)
                        setFormData({ ...formData, location: "" })
                      } else {
                        setFormData({ ...formData, location: value })
                      }
                    }}
                  >
                    <SelectTrigger className="w-full" aria-label="Storage location">
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      {goBags.length > 0 ? (
                        <>
                          {goBags.map((bag) => (
                            <SelectItem key={bag.id} value={bag.name}>
                              {bag.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Location...</SelectItem>
                        </>
                      ) : (
                        <SelectItem value="custom">Custom Location...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem}>{editingId ? "Update" : "Add"} Item</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setUseCustomLocation(false)
                  setFormData({
                    name: "",
                    quantity: "",
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
