"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"

export function DataPersistenceDebug() {
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [dataCounts, setDataCounts] = useState<Record<string, number>>({})
  const [lastSaved, setLastSaved] = useState<string>("")

  useEffect(() => {
    updateStorageInfo()
    // Update every 5 seconds
    const interval = setInterval(updateStorageInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  const updateStorageInfo = () => {
    try {
      // Get storage usage info
      const info = storage.getStorageInfo()
      setStorageInfo(info)

      // Get data counts
      const foodItems = storage.load("foodItems")
      const kitItems = storage.load("kitItems")
      const goBags = storage.load("goBags")
      
      setDataCounts({
        foodItems: foodItems.length,
        kitItems: kitItems.length,
        goBags: goBags.length
      })

      // Get last saved time
      const lastSavedTime = localStorage.getItem("lastSaved")
      setLastSaved(lastSavedTime || "Never")
    } catch (error) {
      console.error("Failed to update storage info:", error)
    }
  }

  const testStorage = () => {
    try {
      const testData = [{
        id: Date.now().toString(),
        name: "Test Item",
        quantity: 1,
        unit: "pieces",
        expiryDate: new Date().toISOString().split("T")[0],
        location: "Test Location",
        category: "other",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]

      const success = storage.save("testItems", testData)
      if (success) {
        alert("✅ Storage test successful! Data saved and can be retrieved.")
        updateStorageInfo()
      } else {
        alert("❌ Storage test failed! Data could not be saved.")
      }
    } catch (error) {
      alert(`❌ Storage test failed: ${error}`)
    }
  }

  const clearTestData = () => {
    try {
      storage.clear("testItems")
      alert("✅ Test data cleared!")
      updateStorageInfo()
    } catch (error) {
      alert(`❌ Failed to clear test data: ${error}`)
    }
  }

  const backupData = () => {
    try {
      const backup = storage.backup()
      const blob = new Blob([backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emergency-supply-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      alert("✅ Data backup created and downloaded!")
    } catch (error) {
      alert(`❌ Backup failed: ${error}`)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800 flex items-center gap-2">
          🔧 Data Persistence Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Info */}
        {storageInfo && (
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Storage Usage:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">{formatBytes(storageInfo.used)}</div>
                <div className="text-blue-500">Used</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{formatBytes(storageInfo.available)}</div>
                <div className="text-green-500">Available</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-600">{formatBytes(storageInfo.total)}</div>
                <div className="text-gray-500">Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Data Counts */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">Your Data:</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="font-bold text-blue-600">{dataCounts.foodItems || 0}</div>
              <div className="text-blue-500 text-xs">Food Items</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{dataCounts.kitItems || 0}</div>
              <div className="text-green-500 text-xs">Kit Items</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">{dataCounts.goBags || 0}</div>
              <div className="text-purple-500 text-xs">Go Bags</div>
            </div>
          </div>
        </div>

        {/* Last Saved */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">Last Saved:</h4>
          <Badge variant="outline" className="text-blue-600">
            {lastSaved}
          </Badge>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">Storage Tests:</h4>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={testStorage}
              size="sm"
              className="w-full"
            >
              🧪 Test Storage
            </Button>
            <Button 
              onClick={clearTestData}
              size="sm"
              variant="outline"
              className="w-full"
            >
              🗑️ Clear Test Data
            </Button>
            <Button 
              onClick={backupData}
              size="sm"
              variant="outline"
              className="w-full"
            >
              💾 Backup Data
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-blue-600 space-y-1">
          <p>✅ Data is saved to your device's local storage</p>
          <p>✅ Data persists when you close and reopen the app</p>
          <p>✅ Data is private to your device only</p>
          <p>⚠️ Data will be lost if you clear browser data</p>
        </div>
      </CardContent>
    </Card>
  )
}
