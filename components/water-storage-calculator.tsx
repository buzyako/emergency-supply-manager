"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"

interface WaterStorageData {
  familySize: number
  currentStorage: number // in gallons
  targetStorage: number // in gallons
  lastUpdated: string
  storageLocations: string[]
  notes: string
}

export function WaterStorageCalculator() {
  const [data, setData] = useState<WaterStorageData>({
    familySize: 1,
    currentStorage: 0,
    targetStorage: 0,
    lastUpdated: new Date().toISOString(),
    storageLocations: [],
    notes: ""
  })
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    familySize: "1",
    currentStorage: "0",
    storageLocation: "",
    notes: ""
  })

  useEffect(() => {
    const saved = storage.load<WaterStorageData>("waterStorage")
    if (saved) {
      setData(saved)
    } else {
      // Initialize with default values
      const defaultData: WaterStorageData = {
        familySize: 1,
        currentStorage: 0,
        targetStorage: 3, // 3 days minimum
        lastUpdated: new Date().toISOString(),
        storageLocations: [],
        notes: ""
      }
      setData(defaultData)
    }
  }, [])

  useEffect(() => {
    if (data.familySize > 0) {
      // Calculate target storage: 1 gallon per person per day for 3 days minimum
      const target = data.familySize * 3
      setData(prev => ({ ...prev, targetStorage: target }))
    }
  }, [data.familySize])

  const saveData = (newData: WaterStorageData) => {
    setData(newData)
    const success = storage.save("waterStorage", newData)
    if (success) {
      console.log("[WaterStorage] Successfully saved data")
    } else {
      console.error("[WaterStorage] Failed to save data")
      alert("Failed to save data. Please try again.")
    }
  }

  const handleUpdateFamilySize = () => {
    const familySize = parseInt(formData.familySize) || 1
    const targetStorage = familySize * 3 // 3 days minimum
    
    const updatedData = {
      ...data,
      familySize,
      targetStorage,
      lastUpdated: new Date().toISOString()
    }
    
    saveData(updatedData)
    setShowForm(false)
  }

  const handleUpdateStorage = () => {
    const currentStorage = parseFloat(formData.currentStorage) || 0
    const updatedData = {
      ...data,
      currentStorage,
      lastUpdated: new Date().toISOString()
    }
    
    if (formData.storageLocation.trim()) {
      updatedData.storageLocations = [...data.storageLocations, formData.storageLocation]
    }
    
    if (formData.notes.trim()) {
      updatedData.notes = formData.notes
    }
    
    saveData(updatedData)
    setFormData({ familySize: data.familySize.toString(), currentStorage: "0", storageLocation: "", notes: "" })
  }

  const progressPercentage = data.targetStorage > 0 ? Math.min((data.currentStorage / data.targetStorage) * 100, 100) : 0
  const daysOfWater = data.familySize > 0 ? Math.floor(data.currentStorage / data.familySize) : 0

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 70) return "bg-yellow-500"
    if (percentage >= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  const getStatusMessage = (percentage: number, days: number) => {
    if (percentage >= 100) return "✅ Excellent! You have adequate water storage."
    if (percentage >= 70) return "⚠️ Good progress, but consider adding more water."
    if (percentage >= 30) return "🚨 Critical: You need more water storage immediately."
    return "🚨 URGENT: Insufficient water storage for emergency preparedness."
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">💧 Water Storage Calculator</h2>
        <p className="text-slate-600">Track your family's water storage for emergency preparedness</p>
      </div>

      {/* Current Status */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💧 Water Storage Status
            <Badge variant={progressPercentage >= 100 ? "default" : progressPercentage >= 70 ? "secondary" : "destructive"}>
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.familySize}</div>
              <div className="text-sm text-slate-600">Family Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.currentStorage.toFixed(1)}</div>
              <div className="text-sm text-slate-600">Gallons Stored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{daysOfWater}</div>
              <div className="text-sm text-slate-600">Days of Water</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to 3-day minimum</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
          </div>

          <Alert className={progressPercentage >= 100 ? "border-green-200 bg-green-50" : progressPercentage >= 70 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
            <AlertDescription>
              {getStatusMessage(progressPercentage, daysOfWater)}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>👨‍👩‍👧‍👦 Family Size</CardTitle>
            <CardDescription>Update your family size to calculate proper water storage needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familySize">Family Members</Label>
              <Input
                id="familySize"
                type="number"
                min="1"
                value={formData.familySize}
                onChange={(e) => setFormData(prev => ({ ...prev, familySize: e.target.value }))}
                placeholder="Enter family size"
              />
            </div>
            <Button onClick={handleUpdateFamilySize} className="w-full">
              Update Family Size
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💧 Add Water Storage</CardTitle>
            <CardDescription>Record your water storage amounts and locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentStorage">Gallons to Add</Label>
              <Input
                id="currentStorage"
                type="number"
                min="0"
                step="0.1"
                value={formData.currentStorage}
                onChange={(e) => setFormData(prev => ({ ...prev, currentStorage: e.target.value }))}
                placeholder="Enter gallons"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageLocation">Storage Location (Optional)</Label>
              <Input
                id="storageLocation"
                value={formData.storageLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, storageLocation: e.target.value }))}
                placeholder="e.g., Basement, Garage, Closet"
              />
            </div>
            <Button onClick={handleUpdateStorage} className="w-full">
              Add Water Storage
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Storage Locations */}
      {data.storageLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📍 Storage Locations</CardTitle>
            <CardDescription>Where you're storing your emergency water</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.storageLocations.map((location, index) => (
                <Badge key={index} variant="outline">
                  {location}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
        <CardHeader>
          <CardTitle>💡 Water Storage Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Minimum Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>1 gallon per person per day (3 days minimum)</li>
              <li>Store in food-grade containers</li>
              <li>Rotate water every 6 months</li>
              <li>Store in cool, dark locations</li>
            </ul>
            
            <p className="mt-4"><strong>Recommended Storage:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>2 weeks of water (14 gallons per person)</li>
              <li>Multiple storage locations</li>
              <li>Water purification tablets as backup</li>
              <li>Portable water filters for extended emergencies</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
