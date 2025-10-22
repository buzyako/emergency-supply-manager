"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FoodItem, KitItem, GoBag } from "@/lib/types"

export function NotificationsSettings() {
  const [settings, setSettings] = useState({
    expiryAlertDays: 7,
    kitCheckReminderDays: 90,
    enableNotifications: true,
  })
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [kitItems, setKitItems] = useState<KitItem[]>([])
  const [goBags, setGoBags] = useState<GoBag[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notificationSettings") || "{}")
    if (Object.keys(saved).length > 0) {
      setSettings(saved)
    }

    const food = JSON.parse(localStorage.getItem("foodItems") || "[]")
    const kit = JSON.parse(localStorage.getItem("kitItems") || "[]")
    const bags = JSON.parse(localStorage.getItem("goBags") || "[]")

    setFoodItems(food)
    setKitItems(kit)
    setGoBags(bags)
  }, [])

  const saveSettings = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings))
    alert("Settings saved!")
  }

  const exportToCSV = () => {
    let csv = "EMERGENCY SUPPLY INVENTORY\n\n"

    // Food Items
    csv += "FOOD STORAGE\n"
    csv += "Name,Quantity,Unit,Expiry Date,Location,Category,Status\n"
    foodItems.forEach((item) => {
      const today = new Date()
      const expiry = new Date(item.expiryDate)
      let status = "Good"
      if (expiry < today) status = "Expired"
      else if (expiry.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) status = "Critical"
      else if (expiry.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) status = "Warning"

      csv += `"${item.name}",${item.quantity},"${item.unit}","${item.expiryDate}","${item.location}","${item.category}","${status}"\n`
    })

    csv += "\n\nEMERGENCY KIT\n"
    csv += "Name,Quantity,Category,Last Checked,Notes\n"
    kitItems.forEach((item) => {
      csv += `"${item.name}",${item.quantity},"${item.category}","${item.lastChecked}","${item.notes}"\n`
    })

    csv += "\n\nGO BAGS\n"
    csv += "Bag Name,Person,Items\n"
    goBags.forEach((bag) => {
      const itemsList = bag.items.map((i) => `${i.quantity}x ${i.name}`).join("; ")
      csv += `"${bag.name}","${bag.person}","${itemsList}"\n`
    })

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv))
    element.setAttribute("download", `emergency-supplies-${new Date().toISOString().split("T")[0]}.csv`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const exportToPDF = () => {
    let content = "EMERGENCY SUPPLY INVENTORY\n"
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`

    content += "=== FOOD STORAGE ===\n"
    foodItems.forEach((item) => {
      content += `• ${item.name}: ${item.quantity} ${item.unit} (Expires: ${item.expiryDate})\n`
      content += `  Location: ${item.location}\n\n`
    })

    content += "\n=== EMERGENCY KIT ===\n"
    kitItems.forEach((item) => {
      content += `• ${item.name}: ${item.quantity} (${item.category})\n`
      content += `  Last checked: ${item.lastChecked}\n`
      if (item.notes) content += `  Notes: ${item.notes}\n`
      content += "\n"
    })

    content += "\n=== GO BAGS ===\n"
    goBags.forEach((bag) => {
      content += `${bag.name} (${bag.person}):\n`
      bag.items.forEach((item) => {
        content += `  • ${item.quantity}x ${item.name}\n`
      })
      content += "\n"
    })

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `emergency-supplies-${new Date().toISOString().split("T")[0]}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const printChecklist = () => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (!printWindow) return

    let html = `
      <html>
        <head>
          <title>Emergency Supply Checklist</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            h2 { margin-top: 20px; border-bottom: 2px solid #333; }
            .item { margin: 10px 0; }
            .checkbox { margin-right: 10px; }
          </style>
        </head>
        <body>
          <h1>Emergency Supply Checklist</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
          
          <h2>Food Storage</h2>
    `

    foodItems.forEach((item) => {
      html += `
        <div class="item">
          <input type="checkbox" class="checkbox"> ${item.name} - ${item.quantity} ${item.unit}
          <br><small>Expires: ${item.expiryDate} | Location: ${item.location}</small>
        </div>
      `
    })

    html += `<h2>Emergency Kit</h2>`
    kitItems.forEach((item) => {
      html += `
        <div class="item">
          <input type="checkbox" class="checkbox"> ${item.name} - ${item.quantity}
          <br><small>Category: ${item.category}</small>
        </div>
      `
    })

    html += `<h2>Go Bags</h2>`
    goBags.forEach((bag) => {
      html += `<h3>${bag.name} (${bag.person})</h3>`
      bag.items.forEach((item) => {
        html += `
          <div class="item">
            <input type="checkbox" class="checkbox"> ${item.quantity}x ${item.name}
          </div>
        `
      })
    })

    html += `
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications & Export</h2>
        <p className="text-muted-foreground">Manage reminders and export your inventory</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🔔 Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Alert for items expiring in (days)</label>
            <Input
              type="number"
              min="1"
              max="90"
              value={settings.expiryAlertDays}
              onChange={(e) => setSettings({ ...settings, expiryAlertDays: Number.parseInt(e.target.value) || 7 })}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              You'll be alerted when food items expire within this many days
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Kit maintenance reminder (days)</label>
            <Input
              type="number"
              min="30"
              max="365"
              value={settings.kitCheckReminderDays}
              onChange={(e) =>
                setSettings({ ...settings, kitCheckReminderDays: Number.parseInt(e.target.value) || 90 })
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Remind you to check kit items if not checked in this many days
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifications"
              checked={settings.enableNotifications}
              onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="notifications" className="text-sm font-medium">
              Enable browser notifications
            </label>
          </div>

          <Button onClick={saveSettings}>Save Settings</Button>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📥 Export & Print</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={exportToCSV} variant="outline" className="w-full justify-start gap-2 bg-transparent">
            📊 Export as CSV (Spreadsheet)
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="w-full justify-start gap-2 bg-transparent">
            📄 Export as Text File
          </Button>
          <Button onClick={printChecklist} variant="outline" className="w-full justify-start gap-2 bg-transparent">
            🖨️ Print Checklist
          </Button>
          <p className="text-xs text-muted-foreground">
            Export your complete inventory for backup or sharing with family members
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
