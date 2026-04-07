"use client"

import { useCallback, useEffect, useState } from "react"
import { DEFAULT_SETTINGS, DrillSettings } from "@/types/drill"

const STORAGE_KEY = "tnt_settings_v3"

function loadSettings(): DrillSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<DrillSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSettings = useCallback((patch: Partial<DrillSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const addCustomLabel = useCallback((label: string, color: string) => {
    setSettings((prev) => {
      const next = { ...prev, customLabels: [...prev.customLabels, { text: label, color, enabled: true }] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeCustomLabel = useCallback((index: number) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        customLabels: prev.customLabels.filter((_, i) => i !== index),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return {
    settings,
    updateSettings,
    addCustomLabel,
    removeCustomLabel,
  }
}
