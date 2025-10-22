"use client"

import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { FoodStorageTracker } from "@/components/food-storage-tracker"
import { EmergencyKitManager } from "@/components/emergency-kit-manager"
import { EmergencyKitCheck } from "@/components/emergency-kit-check"
import { GoBagManager } from "@/components/go-bag-manager"
import { Button } from "@/components/ui/button"
import { NotificationsSettings } from "@/components/notifications-settings"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { PWAInstaller } from "@/components/pwa-installer"
import { SwipeGesture, useMobileDetection, PullToRefresh } from "@/components/mobile-gestures"

type Page = "dashboard" | "food" | "kit" | "kitcheck" | "gobag" | "notifications" | "analytics"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isMobile, isTablet } = useMobileDetection()

  const pages: Page[] = ["dashboard", "food", "kit", "kitcheck", "gobag", "analytics", "notifications"]
  const currentIndex = pages.indexOf(currentPage)

  const handleSwipeLeft = () => {
    if (currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1])
    }
  }

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1])
    }
  }

  const handleRefresh = () => {
    // Refresh data logic here
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* PWA Installer */}
      <div className="p-4">
        <PWAInstaller />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
              <span className="text-xl md:text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Emergency Supply Manager</h1>
              <p className="text-xs md:text-sm text-slate-600 hidden md:block">Emergency Preparedness System</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
              <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 md:hidden shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("dashboard")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📊</span>
                  <span>Dashboard</span>
                </div>
              </Button>
              <Button
                variant={currentPage === "food" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("food")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🥫</span>
                  <span>Food Storage</span>
                </div>
              </Button>
              <Button
                variant={currentPage === "kit" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("kit")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🧰</span>
                  <span>Emergency Kit</span>
                </div>
              </Button>
              <Button
                variant={currentPage === "kitcheck" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("kitcheck")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  <span>Kit Check</span>
                </div>
              </Button>
              <Button
                variant={currentPage === "gobag" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("gobag")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎒</span>
                  <span>Go Bags</span>
                </div>
              </Button>
              <Button
                variant={currentPage === "analytics" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("analytics")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📈</span>
                  <span>Analytics</span>
                </div>
              </Button>
              <Button
                variant={currentPage === "notifications" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentPage("notifications")
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔔</span>
                  <span>Notifications</span>
                </div>
              </Button>
            </div>
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200/80 bg-white/90 backdrop-blur-md md:block shadow-xl">
          <nav className="flex flex-col gap-2 p-6">
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Navigation</h2>
            </div>
            <Button
              variant={currentPage === "dashboard" ? "default" : "ghost"}
              onClick={() => setCurrentPage("dashboard")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "dashboard" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">📊</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "dashboard" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Dashboard</div>
                  <div className={`text-xs ${currentPage === "dashboard" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Overview & Status</div>
                </div>
              </div>
            </Button>
            <Button
              variant={currentPage === "food" ? "default" : "ghost"}
              onClick={() => setCurrentPage("food")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "food" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🥫</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "food" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Food Storage</div>
                  <div className={`text-xs ${currentPage === "food" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Inventory & Expiry</div>
                </div>
              </div>
            </Button>
            <Button
              variant={currentPage === "kit" ? "default" : "ghost"}
              onClick={() => setCurrentPage("kit")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "kit" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🧰</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "kit" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Emergency Kit</div>
                  <div className={`text-xs ${currentPage === "kit" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Supplies & Tools</div>
                </div>
              </div>
            </Button>
            <Button
              variant={currentPage === "kitcheck" ? "default" : "ghost"}
              onClick={() => setCurrentPage("kitcheck")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "kitcheck" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">✅</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "kitcheck" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Kit Check</div>
                  <div className={`text-xs ${currentPage === "kitcheck" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Comprehensive Checklist</div>
                </div>
              </div>
            </Button>
            <Button
              variant={currentPage === "gobag" ? "default" : "ghost"}
              onClick={() => setCurrentPage("gobag")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "gobag" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🎒</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "gobag" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Go Bags</div>
                  <div className={`text-xs ${currentPage === "gobag" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Evacuation Ready</div>
                </div>
              </div>
            </Button>
            <Button
              variant={currentPage === "analytics" ? "default" : "ghost"}
              onClick={() => setCurrentPage("analytics")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "analytics" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">📈</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "analytics" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Analytics</div>
                  <div className={`text-xs ${currentPage === "analytics" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Insights & Reports</div>
                </div>
              </div>
            </Button>
            <Button
              variant={currentPage === "notifications" ? "default" : "ghost"}
              onClick={() => setCurrentPage("notifications")}
              className={`w-full justify-start text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group ${currentPage === "notifications" ? "" : "hover:bg-slate-100"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🔔</span>
                <div className="text-left">
                  <div className={`font-medium ${currentPage === "notifications" ? "text-white" : "text-slate-800 group-hover:text-slate-900"}`}>Notifications</div>
                  <div className={`text-xs ${currentPage === "notifications" ? "text-blue-100" : "text-slate-500 group-hover:text-slate-700"}`}>Alerts & Settings</div>
                </div>
              </div>
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/95 via-blue-50/95 to-indigo-100/95 min-h-screen backdrop-blur-sm">
          <PullToRefresh onRefresh={handleRefresh}>
            <SwipeGesture
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              className="min-h-full"
            >
              <div className="p-4 md:p-6 lg:p-8">
                {currentPage === "dashboard" && <Dashboard />}
                {currentPage === "food" && <FoodStorageTracker />}
                {currentPage === "kit" && <EmergencyKitManager />}
                {currentPage === "kitcheck" && <EmergencyKitCheck />}
                {currentPage === "gobag" && <GoBagManager />}
                {currentPage === "analytics" && <AnalyticsDashboard />}
                {currentPage === "notifications" && <NotificationsSettings />}
              </div>
            </SwipeGesture>
          </PullToRefresh>
        </main>
      </div>
    </div>
  )
}
