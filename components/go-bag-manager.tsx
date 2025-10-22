"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GoBag, GoBagItem } from "@/lib/types"
import { storage } from "@/lib/storage"

export function GoBagManager() {
  const [bags, setBags] = useState<GoBag[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedBag, setExpandedBag] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    person: "",
    items: [] as GoBagItem[],
  })
  const [newItem, setNewItem] = useState({ name: "", quantity: "" })

  useEffect(() => {
    const saved = storage.load<GoBag>("goBags")
    setBags(saved)
    console.log(`[GoBags] Loaded ${saved.length} bags from storage`)
  }, [])

  const saveBags = (newBags: GoBag[]) => {
    setBags(newBags)
    const success = storage.save("goBags", newBags)
    if (success) {
      console.log(`[GoBags] Successfully saved ${newBags.length} bags`)
    } else {
      console.error(`[GoBags] Failed to save ${newBags.length} bags`)
      alert("Failed to save data. Please try again.")
    }
  }

  const handleAddBag = () => {
    if (!formData.name || !formData.person) {
      alert("Please fill in all required fields")
      return
    }

    if (editingId) {
      const updated = bags.map((bag) =>
        bag.id === editingId ? { ...bag, ...formData, updatedAt: new Date().toISOString() } : bag,
      )
      saveBags(updated)
      setEditingId(null)
    } else {
      const newBag: GoBag = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveBags([...bags, newBag])
    }

    setFormData({ name: "", person: "", items: [] })
    setShowForm(false)
  }

  const handleAddItem = () => {
    if (!newItem.name) return
    
    // Convert quantity to number, default to 1 if empty or invalid
    const quantity = newItem.quantity === "" ? 1 : parseInt(newItem.quantity) || 1
    
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now().toString(), ...newItem, quantity }],
    })
    setNewItem({ name: "", quantity: "" })
  }

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    })
  }

  const handleEdit = (bag: GoBag) => {
    setFormData({
      name: bag.name,
      person: bag.person,
      items: bag.items,
    })
    setEditingId(bag.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this go bag?")) {
      saveBags(bags.filter((bag) => bag.id !== id))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Go Bags</h2>
          <p className="text-muted-foreground">Manage emergency go bags for each person</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          ➕ New Go Bag
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Go Bag" : "Create New Go Bag"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Bag Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Home Evacuation Kit"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Person/Family Member *</label>
                <Input
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  placeholder="e.g., John, Family"
                />
              </div>
            </div>

            {/* Items in Bag */}
            <div>
              <label className="text-sm font-medium">Items in Bag</label>
              <div className="space-y-2">
                {formData.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                    <span className="text-sm">
                      {item.quantity}x {item.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                      🗑️
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Item to Bag */}
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
                <Button onClick={handleAddItem} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddBag}>{editingId ? "Update" : "Create"} Bag</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({ name: "", person: "", items: [] })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Go Bags List */}
      <div className="space-y-3">
        {bags.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No go bags yet. Create your first go bag to get started!
            </CardContent>
          </Card>
        ) : (
          bags.map((bag) => (
            <Card key={bag.id}>
              <CardContent className="p-4">
                <div
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => setExpandedBag(expandedBag === bag.id ? null : bag.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎒</span>
                    <div>
                      <p className="font-medium text-foreground">{bag.name}</p>
                      <p className="text-sm text-muted-foreground">{bag.person}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{bag.items.length} items</span>
                  </div>
                </div>

                {/* Expanded Items */}
                {expandedBag === bag.id && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {bag.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(bag)}>
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(bag.id)}>
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
