"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    checkInstalled()
    updateOnlineStatus()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Supply Manager',
          text: 'Check out this emergency preparedness app!',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  if (isInstalled) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 flex items-center gap-2">
            ✅ App Installed
          </CardTitle>
          <CardDescription className="text-green-700">
            Emergency Supply Manager is installed and ready to use!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isOnline) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertDescription className="text-orange-800">
          📱 You're offline, but the app still works! Your data is saved locally.
        </AlertDescription>
      </Alert>
    )
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800 flex items-center gap-2">
          📱 Install App
        </CardTitle>
        <CardDescription className="text-blue-700">
          Install Emergency Supply Manager for quick access on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2">
          <Button onClick={handleInstallClick} className="w-full">
            📲 Install App
          </Button>
          <Button onClick={handleShareClick} variant="outline" className="w-full">
            🔗 Share App
          </Button>
        </div>
        <div className="text-xs text-blue-600 space-y-1">
          <p>• Access from home screen</p>
          <p>• Works offline</p>
          <p>• Fast loading</p>
          <p>• Mobile optimized</p>
        </div>
      </CardContent>
    </Card>
  )
}
