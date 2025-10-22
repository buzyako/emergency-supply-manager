"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FoodItem, KitItem, GoBag } from "@/lib/types"

export function AnalyticsDashboard() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [kitItems, setKitItems] = useState<KitItem[]>([])
  const [goBags, setGoBags] = useState<GoBag[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [expirationData, setExpirationData] = useState<{ name: string; value: number }[]>([])
  const [kitCategoryData, setKitCategoryData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const food = JSON.parse(localStorage.getItem("foodItems") || "[]")
    const kit = JSON.parse(localStorage.getItem("kitItems") || "[]")
    const bags = JSON.parse(localStorage.getItem("goBags") || "[]")

    setFoodItems(food)
    setKitItems(kit)
    setGoBags(bags)

    // Process food category data
    const categories: Record<string, number> = {}
    food.forEach((item: FoodItem) => {
      categories[item.category] = (categories[item.category] || 0) + item.quantity
    })
    setCategoryData(
      Object.entries(categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })),
    )

    // Process expiration timeline
    const today = new Date()
    const expirationBuckets = {
      Expired: 0,
      "0-7 days": 0,
      "7-30 days": 0,
      "30-90 days": 0,
      "90+ days": 0,
    }

    food.forEach((item: FoodItem) => {
      const expiry = new Date(item.expiryDate)
      const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) expirationBuckets["Expired"] += item.quantity
      else if (daysUntilExpiry <= 7) expirationBuckets["0-7 days"] += item.quantity
      else if (daysUntilExpiry <= 30) expirationBuckets["7-30 days"] += item.quantity
      else if (daysUntilExpiry <= 90) expirationBuckets["30-90 days"] += item.quantity
      else expirationBuckets["90+ days"] += item.quantity
    })

    setExpirationData(
      Object.entries(expirationBuckets).map(([name, value]) => ({
        name,
        value,
      })),
    )

    // Process kit category data
    const kitCategories: Record<string, number> = {}
    kit.forEach((item: KitItem) => {
      kitCategories[item.category] = (kitCategories[item.category] || 0) + item.quantity
    })
    setKitCategoryData(
      Object.entries(kitCategories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
        value,
      })),
    )
  }, [])

  const totalFoodValue = foodItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalKitValue = kitItems.reduce((sum, item) => sum + item.quantity, 0)
  const expiredCount = foodItems.filter((item) => new Date(item.expiryDate) < new Date()).length
  const preparednessScore = Math.min(100, Math.round((totalFoodValue + totalKitValue + goBags.length * 10) / 2))

  const SimpleBar = ({ value, max = 100 }: { value: number; max?: number }) => {
    const percentage = (value / max) * 100
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
        <span className="text-sm font-medium w-12 text-right">{value}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics & Reports</h2>
        <p className="text-muted-foreground">Insights into your emergency preparedness</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preparedness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{preparednessScore}%</div>
            <p className="text-xs text-muted-foreground">Based on inventory levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Food Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFoodValue}</div>
            <p className="text-xs text-muted-foreground">{foodItems.length} unique items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kit Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalKitValue}</div>
            <p className="text-xs text-muted-foreground">{kitItems.length} unique items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{expiredCount}</div>
            <p className="text-xs text-muted-foreground">Need replacement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Food Category Distribution */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Food by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    </div>
                    <SimpleBar value={item.value} max={Math.max(...categoryData.map((d) => d.value))} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiration Timeline */}
        {expirationData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expiration Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expirationData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    </div>
                    <SimpleBar value={item.value} max={Math.max(...expirationData.map((d) => d.value), 1)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kit Category Distribution */}
        {kitCategoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Kit by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kitCategoryData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    </div>
                    <SimpleBar value={item.value} max={Math.max(...kitCategoryData.map((d) => d.value), 1)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Go Bag Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Go Bag Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goBags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No go bags created yet</p>
              ) : (
                goBags.map((bag) => (
                  <div key={bag.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{bag.name}</p>
                      <p className="text-xs text-muted-foreground">{bag.person}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{bag.items.length} items</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {expiredCount > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  Remove {expiredCount} expired item{expiredCount !== 1 ? "s" : ""} from your inventory
                </span>
              </li>
            )}
            {totalFoodValue < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Consider increasing food storage - aim for at least 50 items</span>
              </li>
            )}
            {totalKitValue < 30 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Build up your emergency kit - target 30+ items</span>
              </li>
            )}
            {goBags.length === 0 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Create go bags for each family member</span>
              </li>
            )}
            {preparednessScore >= 80 && (
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Great job! Your emergency supplies are well-stocked</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
