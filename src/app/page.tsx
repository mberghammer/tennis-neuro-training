"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Square, RotateCcw, Zap, Bot, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StimulusDisplay } from "@/components/drill/StimulusDisplay"
import { CountdownOverlay } from "@/components/drill/CountdownOverlay"
import { SplitStepPulse } from "@/components/drill/SplitStepPulse"
import { SettingsPanel } from "@/components/settings/SettingsPanel"
import { useDrillEngine } from "@/hooks/useDrillEngine"
import { useWakeLock } from "@/hooks/useWakeLock"
import { useSettings } from "@/hooks/useSettings"
import { DrillState } from "@/types/drill"

const STATE_LABELS: Record<DrillState, string> = {
  [DrillState.IDLE]: "Ready",
  [DrillState.COUNTDOWN]: "Get Ready",
  [DrillState.RUNNING]: "⚡ LIVE",
  [DrillState.FINISHED]: "Finished",
}

const STATE_COLORS: Record<DrillState, string> = {
  [DrillState.IDLE]: "bg-zinc-700 text-zinc-300",
  [DrillState.COUNTDOWN]: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  [DrillState.RUNNING]: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse",
  [DrillState.FINISHED]: "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

export default function HomePage() {
  const { settings, updateSettings, addCustomLabel, removeCustomLabel } = useSettings()

  const { drillState, secondsLeft, stimulus, splitStepActive, countdownValue, start, stop, reset } = useDrillEngine(settings)

  const { acquire, release } = useWakeLock()

  const isRunning = drillState === DrillState.RUNNING
  const isCountdown = drillState === DrillState.COUNTDOWN
  const isFinished = drillState === DrillState.FINISHED
  const isIdle = drillState === DrillState.IDLE
  const isActive = isRunning || isCountdown

  const drillContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive) {
      acquire()
    } else {
      release()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const totalDuration = settings.config.drillDuration
  const progressFraction = isRunning || isFinished ? (totalDuration - secondsLeft) / totalDuration : 0

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const activeFeatures: { label: string; icon: React.ReactNode }[] = []
  if (settings.splitStepPulse) activeFeatures.push({ label: "Split-Step", icon: <Zap className="w-3 h-3" /> })
  if (settings.distractorMode) activeFeatures.push({ label: "Distractor", icon: <Bot className="w-3 h-3" /> })
  if (settings.voiceOnlyMode) activeFeatures.push({ label: "Voice-Only", icon: <Volume2 className="w-3 h-3" /> })

  return (
    <div
      ref={drillContainerRef}
      className="fixed inset-0 select-none overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: settings.highContrast
            ? "#000000"
            : isRunning
              ? "radial-gradient(ellipse at center, #0f1a0f 0%, #050505 100%)"
              : "radial-gradient(ellipse at center, #0d0d0d 0%, #000000 100%)",
        }}
      />

      {/* Stimulus Layer */}
      <StimulusDisplay
        stimulus={stimulus}
        voiceOnly={settings.voiceOnlyMode}
        highContrast={settings.highContrast}
        hideArrowLabel={settings.hideArrowLabel}
        arrowBgColor={settings.arrowBgColor}
      />

      {/* Split-Step Pulse */}
      <SplitStepPulse active={splitStepActive} />

      {/* Countdown */}
      <CountdownOverlay
        value={countdownValue}
        visible={isCountdown}
      />

      {/* Finished Screen */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center px-8"
            >
              <div className="text-7xl mb-4">🎾</div>
              <h2 className="text-4xl font-black text-white mb-2">DRILL COMPLETE</h2>
              <p className="text-white/50 mb-8 text-lg">{formatTime(totalDuration)} of reactive training done.</p>
              <Button
                size="lg"
                onClick={reset}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-10 py-6 rounded-2xl shadow-2xl shadow-emerald-500/30"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> New Drill
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Overlay */}
      <div className="absolute inset-0 flex flex-col pointer-events-none z-20">
        {/* Top Bar — hidden while drill is active */}
        <AnimatePresence>
          {!isActive && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between px-5 pointer-events-auto"
              style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-lg tracking-tight">TNT</span>
                <span className="text-white/30 text-xs font-medium uppercase tracking-widest hidden sm:block">Neuro Training</span>
              </div>

              <Badge className={`border ${STATE_COLORS[drillState]} font-bold text-xs px-3 py-1`}>{STATE_LABELS[drillState]}</Badge>

              <SettingsPanel
                settings={settings}
                onUpdate={updateSettings}
                onAddCustomLabel={addCustomLabel}
                onRemoveCustomLabel={removeCustomLabel}
                disabled={isActive}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Timer + Controls */}
          <div className="flex flex-col items-center justify-end pointer-events-auto" style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
          {/* Active feature badges */}
          {activeFeatures.length > 0 && !isActive && (
            <div className="flex gap-2 mb-6 flex-wrap justify-center px-4">
              {activeFeatures.map((f) => (
                <span
                  key={f.label}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white/60 bg-white/10 border border-white/10 rounded-full px-3 py-1"
                >
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </div>
          )}

          {/* Button row */}
          <div className="flex items-center gap-4">
            {(isIdle || isFinished) && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Button
                  size="lg"
                  onClick={start}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 text-white font-semibold text-base px-7 py-3.5 rounded-xl transition-all"
                >
                  <Play className="w-6 h-6 mr-2 fill-black" /> START
                </Button>
              </motion.div>
            )}
            {isActive && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <button
                  onClick={stop}
                  className="relative overflow-hidden border border-white/10 hover:border-red-500/30 active:scale-95 text-white/60 hover:text-red-300 font-semibold text-base px-7 py-3.5 rounded-xl transition-all flex items-center"
                >
                  {/* Left-to-right fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white/10"
                    style={{ width: `${progressFraction * 100}%`, transition: "width 1s linear" }}
                  />
                  <span className="relative z-10 flex items-center">
                    <Square className="w-5 h-5 mr-2 fill-current" /> STOP
                  </span>
                </button>
              </motion.div>
            )}
          </div>

          {settings.voiceOnlyMode && isRunning && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-white/40 text-sm font-medium tracking-widest uppercase"
            >
              🎙 Listening for audio cues…
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
