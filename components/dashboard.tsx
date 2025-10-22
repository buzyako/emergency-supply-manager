"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { FoodItem, KitItem, GoBag } from "@/lib/types"
import { getDailyQuote, getRandomQuote, InspirationalQuote } from "@/lib/quotes"
import { calculateOverallProgress, getAchievedMilestones, getNextMilestone, PreparednessLevel } from "@/lib/progress"
import { philippinesSettings, getCurrentSeasonHazards } from "@/lib/regional"

export function Dashboard() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [kitItems, setKitItems] = useState<KitItem[]>([])
  const [goBags, setGoBags] = useState<GoBag[]>([])
  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([])
  const [hasData, setHasData] = useState(false)
  const [dailyQuote, setDailyQuote] = useState<InspirationalQuote | null>(null)
  const [preparednessLevel, setPreparednessLevel] = useState<PreparednessLevel>({
    food: 0,
    water: 0,
    financial: 0,
    communication: 0,
    spiritual: 0,
    emergencyKit: 0,
    goBags: 0
  })
  const [currentHazards, setCurrentHazards] = useState(getCurrentSeasonHazards())

  useEffect(() => {
    // Load data from localStorage
    const food = JSON.parse(localStorage.getItem("foodItems") || "[]")
    const kit = JSON.parse(localStorage.getItem("kitItems") || "[]")
    const bags = JSON.parse(localStorage.getItem("goBags") || "[]")

    setFoodItems(food)
    setKitItems(kit)
    setGoBags(bags)
    setHasData(food.length > 0 || kit.length > 0 || bags.length > 0)

    const settings = JSON.parse(localStorage.getItem("notificationSettings") || "{}")
    const alertDays = settings.expiryAlertDays || 7

    // Calculate expiring items
    const today = new Date()
    const alertDate = new Date(today.getTime() + alertDays * 24 * 60 * 60 * 1000)

    const expiring = food.filter((item: FoodItem) => {
      const expiryDate = new Date(item.expiryDate)
      return expiryDate <= alertDate && expiryDate > today
    })

    setExpiringItems(expiring)

    // Load daily inspirational quote
    setDailyQuote(getDailyQuote())

    // Calculate preparedness levels
    const foodLevel = Math.min((food.length / 10) * 100, 100) // Assume 10 items = 100%
    const waterLevel = localStorage.getItem("waterStored") ? parseInt(localStorage.getItem("waterStored")!) : 0
    const financialLevel = localStorage.getItem("emergencyFund") ? parseInt(localStorage.getItem("emergencyFund")!) : 0
    const communicationLevel = localStorage.getItem("communicationPlan") ? 100 : 0
    const spiritualLevel = localStorage.getItem("spiritualPreparedness") ? parseInt(localStorage.getItem("spiritualPreparedness")!) : 0
    const emergencyKitLevel = Math.min((kit.length / 15) * 100, 100) // Assume 15 items = 100%
    const goBagsLevel = Math.min((bags.length / 4) * 100, 100) // Assume 4 bags = 100%

    setPreparednessLevel({
      food: foodLevel,
      water: waterLevel,
      financial: financialLevel,
      communication: communicationLevel,
      spiritual: spiritualLevel,
      emergencyKit: emergencyKitLevel,
      goBags: goBagsLevel
    })

    // Show browser notification if enabled
    if (settings.enableNotifications && expiring.length > 0 && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Emergency Supply Alert", {
          body: `${expiring.length} item(s) expiring soon!`,
        })
      }
    }
  }, [])

  const getExpirationStatus = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: "expired", color: "text-red-600", bg: "bg-red-50 border-red-200" }
    if (daysUntilExpiry < 7)
      return { status: "critical", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" }
    if (daysUntilExpiry < 30)
      return { status: "warning", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" }
    return { status: "good", color: "text-green-600", bg: "bg-green-50 border-green-200" }
  }

  const expiredCount = foodItems.filter((item) => {
    const expiry = new Date(item.expiryDate)
    return expiry < new Date()
  }).length

  const totalFoodItems = foodItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalKitItems = kitItems.reduce((sum, item) => sum + item.quantity, 0)

  if (!hasData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-5xl">🛡️</span>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Welcome to Emergency Supply Manager</h2>
            <p className="text-lg text-muted-foreground">
              Get started by adding your first items to track your emergency preparedness
            </p>
          </div>

          <div className="space-y-3 rounded-lg border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent p-6">
            <p className="italic text-foreground leading-relaxed">
              "As disciples of the Savior, we are commanded to 'prepare every needful thing.'"
            </p>
            <p className="text-sm text-muted-foreground">— Doctrine and Covenants 88:119</p>
          </div>

          <div className="space-y-3 rounded-lg bg-primary/5 p-6">
            <h3 className="font-semibold text-foreground">Quick Start Guide:</h3>
            <ul className="space-y-2 text-left text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1</span>
                <span>Add food items with expiration dates</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2</span>
                <span>Track emergency kit supplies</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3</span>
                <span>Create go bags for family members</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4</span>
                <span>Monitor your preparedness score</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button size="lg" className="w-full">
              🥫 Add Food Items
            </Button>
            <Button size="lg" variant="outline" className="w-full bg-transparent">
              🧰 Add Emergency Kit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Emergency Dashboard</h2>
            <p className="text-sm text-slate-600">Your preparedness command center</p>
          </div>
        </div>
      </div>

      {/* Daily Inspirational Quote */}
      {dailyQuote && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Daily Inspiration</h3>
                <p className="text-lg italic leading-relaxed mb-3">"{dailyQuote.text}"</p>
                <p className="text-sm text-blue-100">— {dailyQuote.source}</p>
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                  {dailyQuote.category}
                </Badge>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>
      )}

      {/* Overall Preparedness Progress */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5"></div>
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Overall Preparedness</CardTitle>
              <CardDescription className="text-slate-600">Your emergency readiness progress</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-800 mb-2">
                {calculateOverallProgress(preparednessLevel)}%
              </div>
              <Progress value={calculateOverallProgress(preparednessLevel)} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-sm font-medium text-slate-600 mb-1">Food</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(preparednessLevel.food)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-600 mb-1">Water</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(preparednessLevel.water)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-600 mb-1">Financial</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(preparednessLevel.financial)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-600 mb-1">Communication</div>
                <div className="text-lg font-bold text-slate-800">{Math.round(preparednessLevel.communication)}%</div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/5 rounded-full blur-xl"></div>
      </Card>

      {/* Alerts */}
      {expiredCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Critical Alert</h3>
              <p className="text-sm">You have {expiredCount} expired item{expiredCount !== 1 ? "s" : ""}. Please review and remove them immediately.</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        </div>
      )}

      {expiringItems.length > 0 && expiredCount === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Expiration Warning</h3>
              <p className="text-sm">{expiringItems.length} item{expiringItems.length !== 1 ? "s" : ""} expiring within 30 days</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">🥫</span>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-700">Food Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{totalFoodItems}</div>
            <p className="text-xs text-slate-600">{foodItems.length} types stored</p>
          </CardContent>
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-green-500/5 rounded-full blur-xl"></div>
        </Card>

        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">🧰</span>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-700">Kit Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{totalKitItems}</div>
            <p className="text-xs text-slate-600">{kitItems.length} types ready</p>
          </CardContent>
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-orange-500/5 rounded-full blur-xl"></div>
        </Card>

        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">🎒</span>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-700">Go Bags</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{goBags.length}</div>
            <p className="text-xs text-slate-600">Prepared for evacuation</p>
          </CardContent>
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
        </Card>

        <Card className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${expiredCount > 0 ? "ring-2 ring-red-200" : "ring-2 ring-green-200"}`}>
          <div className={`absolute inset-0 ${expiredCount > 0 ? "bg-gradient-to-br from-red-500/10 to-pink-600/10" : "bg-gradient-to-br from-green-500/10 to-emerald-600/10"}`}></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${expiredCount > 0 ? "bg-gradient-to-br from-red-500 to-pink-600" : "bg-gradient-to-br from-green-500 to-emerald-600"}`}>
                <span className="text-lg">{expiredCount > 0 ? "⚠️" : "✅"}</span>
              </div>
              <CardTitle className="text-sm font-semibold text-slate-700">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl md:text-4xl font-bold mb-1 ${expiredCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {expiredCount > 0 ? "⚠️" : "✓"}
            </div>
            <p className="text-xs text-slate-600">{expiredCount > 0 ? "Needs attention" : "All good"}</p>
          </CardContent>
          <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full blur-xl ${expiredCount > 0 ? "bg-red-500/5" : "bg-green-500/5"}`}></div>
        </Card>
      </div>

      {/* Expiring Soon */}
      {expiringItems.length > 0 && (
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">⏰</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Expiring Soon</CardTitle>
                <CardDescription className="text-slate-600">Items expiring within 30 days - take action now</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {expiringItems.slice(0, 5).map((item) => {
                const status = getExpirationStatus(item.expiryDate)
                const daysUntilExpiry = Math.floor(
                  (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                return (
                  <div key={item.id} className={`group relative overflow-hidden rounded-xl border-0 p-4 transition-all duration-200 hover:scale-105 ${status.bg} shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${status.status === 'critical' ? 'bg-red-500' : status.status === 'warning' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                          <span className="text-lg">{status.status === 'critical' ? '🚨' : status.status === 'warning' ? '⚠️' : '⏰'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className={`text-sm font-medium ${status.color}`}>
                            {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} remaining
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-600">Qty: {item.quantity}</span>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${status.status === 'critical' ? 'bg-red-100 text-red-700' : status.status === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {status.status === 'critical' ? 'Critical' : status.status === 'warning' ? 'Warning' : 'Good'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full blur-xl"></div>
        </Card>
      )}

      {/* Philippines-Specific Hazards */}
      {currentHazards.length > 0 && (
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🇵🇭</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Current Season Hazards</CardTitle>
                <CardDescription className="text-slate-600">Philippines-specific emergency preparedness</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {currentHazards.slice(0, 3).map((hazard) => (
                <div key={hazard.id} className="group relative overflow-hidden rounded-xl border-0 p-4 transition-all duration-200 hover:scale-105 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-lg">
                        {hazard.id === 'typhoon' ? '🌀' : 
                         hazard.id === 'earthquake' ? '🌍' : 
                         hazard.id === 'flood' ? '🌊' : '🌋'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1">{hazard.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">{hazard.description}</p>
                      {hazard.season && (
                        <Badge variant="outline" className="text-xs">
                          {hazard.season}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" className="text-slate-600">
                  View All Hazards
                </Button>
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full blur-xl"></div>
        </Card>
      )}

      {/* Next Milestone */}
      {getNextMilestone(preparednessLevel) && (
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Next Milestone</CardTitle>
                <CardDescription className="text-slate-600">Your next preparedness goal</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {(() => {
                const nextMilestone = getNextMilestone(preparednessLevel);
                if (!nextMilestone) return null;
                
                return (
                  <div className="group relative overflow-hidden rounded-xl border-0 p-4 transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-lg">🎯</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">{nextMilestone.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">{nextMilestone.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={preparednessLevel[nextMilestone.category]} className="flex-1 h-2" />
                          <span className="text-xs text-slate-500">
                            {Math.round(preparednessLevel[nextMilestone.category])}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
        </Card>
      )}
    </div>
  )
}
