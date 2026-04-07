"use client"

import { useEffect, useRef, useState } from "react"

export function useWakeLock() {
  const [supported, setSupported] = useState(false)
  const [active, setActive] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    setSupported("wakeLock" in navigator)
  }, [])

  const acquire = async () => {
    if (!supported) return
    try {
      sentinelRef.current = await navigator.wakeLock.request("screen")
      setActive(true)
      sentinelRef.current.addEventListener("release", () => setActive(false))
    } catch {
      // WakeLock not granted (e.g. page not visible)
    }
  }

  const release = async () => {
    if (sentinelRef.current) {
      await sentinelRef.current.release()
      sentinelRef.current = null
      setActive(false)
    }
  }

  // Re-acquire on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        acquire()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return { supported, active, acquire, release }
}
