"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { DrillConfig, DrillSettings, DrillState, StimulusKind, VisualColor, DirectionArrow, DIRECTION_AUDIO_LABEL } from "@/types/drill"

// ─── Helpers ──────────────────────────────────────────────────────────────
const VISUAL_COLORS: VisualColor[] = ["green", "red", "blue", "yellow"]
const DIRECTIONS: DirectionArrow[] = ["top-left", "left", "bot-left", "top-right", "right", "bot-right"]

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateStimulus(settings: DrillSettings): StimulusKind {
  // Distractor: 20% chance grey circle
  if (settings.distractorMode && Math.random() < 0.2) {
    return { type: "distractor" }
  }

  // Build pool of enabled types
  const pool: StimulusKind[] = []

  if (settings.enableVisual) {
    const color = VISUAL_COLORS[Math.floor(Math.random() * VISUAL_COLORS.length)]
    pool.push({ type: "visual", color })
  }
  if (settings.enableDirectional) {
    const pool_dirs = settings.activeDirections.length > 0 ? settings.activeDirections : DIRECTIONS
    const direction = pool_dirs[Math.floor(Math.random() * pool_dirs.length)]
    pool.push({ type: "directional", direction })
  }
  if (settings.enableCustomLabels) {
    const active = settings.customLabels.filter((cl) => cl.enabled)
    if (active.length > 0) {
      const cl = active[Math.floor(Math.random() * active.length)]
      pool.push({ type: "custom", label: cl.text, color: cl.color })
    }
  }
  if (settings.enableAudio) {
    // Audio piggybacks on one of the other stimuli – generate a label
    const audioLabels = ["Backhand", "Forehand", "Overhead", "Sprint", "Lob", "Drop"]
    const label = audioLabels[Math.floor(Math.random() * audioLabels.length)]
    pool.push({ type: "audio", label })
  }

  if (pool.length === 0) return { type: "visual", color: "green" } // fallback

  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export interface DrillEngineOutput {
  drillState: DrillState
  secondsLeft: number
  stimulus: StimulusKind | null
  splitStepActive: boolean
  countdownValue: number
  start: () => void
  stop: () => void
  reset: () => void
}

export function useDrillEngine(settings: DrillSettings): DrillEngineOutput {
  const { config } = settings

  const [drillState, setDrillState] = useState<DrillState>(DrillState.IDLE)
  const [secondsLeft, setSecondsLeft] = useState(config.drillDuration)
  const [stimulus, setStimulus] = useState<StimulusKind | null>(null)
  const [splitStepActive, setSplitStepActive] = useState(false)
  const [countdownValue, setCountdownValue] = useState(5)

  // Mutable refs for RAF loop (avoid stale closures)
  const stateRef = useRef<DrillState>(DrillState.IDLE)
  const settingsRef = useRef<DrillSettings>(settings)
  const rafRef = useRef<number>(0)

  const drillStartTimeRef = useRef<number>(0)
  const lastStimulusTimeRef = useRef<number>(0)
  const nextIntervalRef = useRef<number>(0)
  const splitStepFiredRef = useRef<boolean>(false)
  const countdownStartRef = useRef<number>(0)

  // Keep settings ref fresh
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  // ─── RAF Loop ─────────────────────────────────────────────────────────
  const loop = useCallback((now: number) => {
    if (stateRef.current === DrillState.COUNTDOWN) {
      const elapsed = now - countdownStartRef.current
      const remaining = 5 - Math.floor(elapsed / 1000)
      if (remaining > 0) {
        setCountdownValue(remaining)
      } else {
        // Transition to RUNNING
        stateRef.current = DrillState.RUNNING
        setDrillState(DrillState.RUNNING)
        drillStartTimeRef.current = now
        lastStimulusTimeRef.current = now
        nextIntervalRef.current = randomBetween(settingsRef.current.config.minInterval, settingsRef.current.config.maxInterval)
        splitStepFiredRef.current = false
      }
      rafRef.current = requestAnimationFrame(loop)
      return
    }

    if (stateRef.current !== DrillState.RUNNING) return

    const cfg: DrillConfig = settingsRef.current.config
    const elapsed = now - drillStartTimeRef.current
    const sLeft = Math.max(0, cfg.drillDuration - Math.floor(elapsed / 1000))
    setSecondsLeft(sLeft)

    if (sLeft <= 0) {
      stateRef.current = DrillState.FINISHED
      setDrillState(DrillState.FINISHED)
      setStimulus(null)
      cancelAnimationFrame(rafRef.current)
      return
    }

    const sinceLastStimulus = now - lastStimulusTimeRef.current
    const interval = nextIntervalRef.current

    // Split-step pulse fires 400ms before the stimulus
    if (settingsRef.current.splitStepPulse && !splitStepFiredRef.current && sinceLastStimulus >= interval - 400) {
      splitStepFiredRef.current = true
      setSplitStepActive(true)
      setTimeout(() => setSplitStepActive(false), 300)
    }

    // Stimulus fires at interval
    if (sinceLastStimulus >= interval) {
      const newStimulus = generateStimulus(settingsRef.current)
      setStimulus(newStimulus)

      // TTS — fires for audio, custom, AND directional (gate system names)
      if (settingsRef.current.enableAudio) {
        let utteranceText: string | null = null
        if (newStimulus.type === "directional") {
          utteranceText = DIRECTION_AUDIO_LABEL[newStimulus.direction] // e.g. "Attacking Left"
        } else if (newStimulus.type === "audio" || newStimulus.type === "custom") {
          utteranceText = newStimulus.label
        }
        if (utteranceText) {
          const utter = new SpeechSynthesisUtterance(utteranceText)
          utter.rate = 1.1
          window.speechSynthesis?.speak(utter)
        }
      }

      // Clear stimulus after a short flash (750ms)
      setTimeout(() => setStimulus(null), 750)

      lastStimulusTimeRef.current = now
      nextIntervalRef.current = randomBetween(settingsRef.current.config.minInterval, settingsRef.current.config.maxInterval)
      splitStepFiredRef.current = false
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // ─── Controls ─────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (stateRef.current !== DrillState.IDLE && stateRef.current !== DrillState.FINISHED) return
    stateRef.current = DrillState.COUNTDOWN
    countdownStartRef.current = performance.now()
    setCountdownValue(5)
    setSecondsLeft(settingsRef.current.config.drillDuration)
    setStimulus(null)
    setDrillState(DrillState.COUNTDOWN)
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    stateRef.current = DrillState.IDLE
    setDrillState(DrillState.IDLE)
    setStimulus(null)
    setSplitStepActive(false)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    stateRef.current = DrillState.IDLE
    setDrillState(DrillState.IDLE)
    setSecondsLeft(settingsRef.current.config.drillDuration)
    setStimulus(null)
    setSplitStepActive(false)
    setCountdownValue(5)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // Sync drillDuration changes when IDLE
  useEffect(() => {
    if (stateRef.current === DrillState.IDLE) {
      setSecondsLeft(config.drillDuration)
    }
  }, [config.drillDuration])

  return {
    drillState,
    secondsLeft,
    stimulus,
    splitStepActive,
    countdownValue,
    start,
    stop,
    reset,
  }
}
