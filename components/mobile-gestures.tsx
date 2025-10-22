"use client"

import { useEffect, useRef, useState } from "react"

interface SwipeGestureProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  children: React.ReactNode
  className?: string
}

export function SwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  children,
  className = ""
}: SwipeGestureProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isUpSwipe = distanceY > minSwipeDistance
    const isDownSwipe = distanceY < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
    if (isUpSwipe && onSwipeUp) {
      onSwipeUp()
    }
    if (isDownSwipe && onSwipeDown) {
      onSwipeDown()
    }
  }

  return (
    <div
      ref={elementRef}
      className={`touch-pan-y ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  )
}

// Mobile-specific utility hooks
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isTabletDevice = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setIsMobile(isMobileDevice)
      setIsTablet(isTabletDevice)
      setIsTouch(isTouchDevice)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return { isMobile, isTablet, isTouch }
}

// Pull-to-refresh component
export function PullToRefresh({
  onRefresh,
  children,
  className = ""
}: {
  onRefresh: () => void
  children: React.ReactNode
  className?: string
}) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      currentY.current = e.touches[0].clientY
      const distance = currentY.current - startY.current
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, 100))
        setIsPulling(distance > 20)
      }
    }
  }

  const handleTouchEnd = () => {
    if (isPulling && !isRefreshing) {
      setIsRefreshing(true)
      onRefresh()
      
      setTimeout(() => {
        setIsRefreshing(false)
        setIsPulling(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
    
    startY.current = 0
    currentY.current = 0
  }

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 bg-primary/10 flex items-center justify-center py-2 z-10"
          style={{ transform: `translateY(${pullDistance}px)` }}
        >
          <div className="flex items-center gap-2 text-primary">
            {isRefreshing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm">Refreshing...</span>
              </>
            ) : (
              <>
                <span className="text-sm">Pull to refresh</span>
                <span className="text-lg">↓</span>
              </>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// Mobile-optimized button component
export function MobileButton({
  children,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  disabled?: boolean
  [key: string]: any
}) {
  const baseClasses = "touch-manipulation select-none"
  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[44px]",
    default: "px-4 py-3 text-base min-h-[48px]",
    lg: "px-6 py-4 text-lg min-h-[56px]"
  }
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95 transition-transform"
      }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
