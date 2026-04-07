"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpLeft, ArrowLeft, ArrowDownLeft, ArrowUpRight, ArrowRight, ArrowDownRight } from "lucide-react"
import { StimulusKind, VisualColor, DirectionArrow, DIRECTION_DISPLAY_LABEL } from "@/types/drill"

// ─── Color Maps ───────────────────────────────────────────────────────────
const COLOR_MAP: Record<VisualColor, { bg: string; text: string }> = {
  green: { bg: "#22c55e", text: "#052e16" },
  red: { bg: "#ef4444", text: "#450a0a" },
  blue: { bg: "#3b82f6", text: "#172554" },
  yellow: { bg: "#eab308", text: "#422006" },
}

const HC_COLOR_MAP: Record<VisualColor, { bg: string; text: string }> = {
  green: { bg: "#00ff41", text: "#000000" },
  red: { bg: "#ff0000", text: "#ffffff" },
  blue: { bg: "#0066ff", text: "#ffffff" },
  yellow: { bg: "#ffff00", text: "#000000" },
}

// ─── Gate Zone Tints: green=attacking, blue=wide, red=defensive ───────────────
const GATE_TINT: Record<DirectionArrow, string> = {
  "top-left": "rgba(34,197,94,0.10)",
  "top-right": "rgba(34,197,94,0.10)",
  left: "rgba(59,130,246,0.10)",
  right: "rgba(59,130,246,0.10)",
  "bot-left": "rgba(239,68,68,0.10)",
  "bot-right": "rgba(239,68,68,0.10)",
}
const HC_GATE_TINT: Record<DirectionArrow, string> = {
  "top-left": "rgba(0,255,65,0.14)",
  "top-right": "rgba(0,255,65,0.14)",
  left: "rgba(0,102,255,0.14)",
  right: "rgba(0,102,255,0.14)",
  "bot-left": "rgba(255,0,0,0.14)",
  "bot-right": "rgba(255,0,0,0.14)",
}

// ─── Solid gate backgrounds (arrowBgColor mode) ───────────────────────────
// Attacking = orange, Neutral/Wide = light green, Defensive = light blue
const GATE_BG: Record<DirectionArrow, string> = {
  "top-left": "rgba(249,115,22,0.5)", // orange-500 @ 50%
  "top-right": "rgba(249,115,22,0.5)",
  left: "rgba(74,222,128,0.5)", // green-400 @ 50%
  right: "rgba(74,222,128,0.5)",
  "bot-left": "rgba(96,165,250,0.5)", // blue-400 @ 50%
  "bot-right": "rgba(96,165,250,0.5)",
}

// 60 vh so the arrow bleeds into peripheral vision ─────────────────────
const ICON_STYLE: React.CSSProperties = { width: "min(60vh, 85vw)", height: "min(60vh, 85vw)" }

const DIRECTION_ICON: Record<DirectionArrow, React.ReactNode> = {
  "top-left": (
    <ArrowUpLeft
      strokeWidth={2}
      style={ICON_STYLE}
    />
  ),
  left: (
    <ArrowLeft
      strokeWidth={2}
      style={ICON_STYLE}
    />
  ),
  "bot-left": (
    <ArrowDownLeft
      strokeWidth={2}
      style={ICON_STYLE}
    />
  ),
  "top-right": (
    <ArrowUpRight
      strokeWidth={2}
      style={ICON_STYLE}
    />
  ),
  right: (
    <ArrowRight
      strokeWidth={2}
      style={ICON_STYLE}
    />
  ),
  "bot-right": (
    <ArrowDownRight
      strokeWidth={2}
      style={ICON_STYLE}
    />
  ),
}

const SIDE_LABEL: Record<DirectionArrow, string> = {
  "top-left": "LEFT",
  left: "LEFT",
  "bot-left": "LEFT",
  "top-right": "RIGHT",
  right: "RIGHT",
  "bot-right": "RIGHT",
}

// ─── Transition Variants ──────────────────────────────────────────────────
function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#000000" : "#ffffff"
}
const variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.05 } },
  exit: { opacity: 0, scale: 1.1, transition: { duration: 0.1 } },
}

// ─── Component ────────────────────────────────────────────────────────────
interface StimulusDisplayProps {
  stimulus: StimulusKind | null
  voiceOnly: boolean
  highContrast: boolean
  hideArrowLabel: boolean
  arrowBgColor: boolean
}

function StimulusDisplayInner({ stimulus, voiceOnly, highContrast, hideArrowLabel, arrowBgColor }: StimulusDisplayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {stimulus && !voiceOnly && (
          <motion.div
            key={JSON.stringify(stimulus)}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {renderStimulus(stimulus, highContrast, hideArrowLabel, arrowBgColor)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const StimulusDisplay = memo(StimulusDisplayInner)

// ─── Background Flash ─────────────────────────────────────────────────────
function renderStimulus(stimulus: StimulusKind, highContrast: boolean, hideArrowLabel: boolean, arrowBgColor: boolean): React.ReactNode {
  if (stimulus.type === "visual") {
    const palette = highContrast ? HC_COLOR_MAP : COLOR_MAP
    const { bg, text } = palette[stimulus.color]
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <span
          className="text-4xl font-black uppercase tracking-widest select-none"
          style={{ color: text }}
        >
          {stimulus.color}
        </span>
      </div>
    )
  }

  if (stimulus.type === "directional") {
    const { direction } = stimulus
    const icon = DIRECTION_ICON[direction]
    const displayLabel = DIRECTION_DISPLAY_LABEL[direction]
    const sideLabel = SIDE_LABEL[direction]
    const solidBg = arrowBgColor ? GATE_BG[direction] : null
    const tint = solidBg ?? (highContrast ? HC_GATE_TINT : GATE_TINT)[direction]
    const arrowColor = highContrast ? "#00ff41" : "#ffffff"
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: tint }}
      >
        {/* Arrow — 60 vh, fills peripheral vision */}
        <div style={{ color: arrowColor, filter: "drop-shadow(0 0 48px currentColor)", lineHeight: 0 }}>{icon}</div>
        {/* Gate label: e.g. ATTACKING · LEFT */}
        {!hideArrowLabel && (
          <div className="mt-2 flex items-baseline gap-3 select-none">
            <span
              className="font-black uppercase tracking-[0.2em]"
              style={{ fontSize: "clamp(1.4rem, 4.5vw, 3rem)", color: arrowColor, opacity: 0.95 }}
            >
              {displayLabel}
            </span>
            <span style={{ color: arrowColor, opacity: 0.3, fontSize: "clamp(1rem, 3vw, 2rem)" }}>·</span>
            <span
              className="font-black uppercase tracking-[0.2em]"
              style={{ fontSize: "clamp(1.4rem, 4.5vw, 3rem)", color: arrowColor, opacity: 0.5 }}
            >
              {sideLabel}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (stimulus.type === "audio") {
    // Voice-only – show a subtle audio wave icon when not in voice-only mode
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-white">
        <span className="text-8xl animate-pulse">🎙️</span>
        <span className="text-3xl font-bold">{stimulus.label}</span>
      </div>
    )
  }

  if (stimulus.type === "custom") {
    const bgColor = stimulus.color || "#1a1a1a"
    const textColor = getContrastText(bgColor)
    return (
      <div
        className="absolute inset-0 flex items-center justify-center px-8"
        style={{ backgroundColor: bgColor }}
      >
        <span
          className="text-center font-black uppercase tracking-wider select-none"
          style={{
            fontSize: "clamp(2rem, 8vw, 5rem)",
            color: textColor,
          }}
        >
          {stimulus.label}
        </span>
      </div>
    )
  }

  if (stimulus.type === "distractor") {
    // Grey circle — inhibitory control
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="w-48 h-48 rounded-full bg-gray-500 opacity-80 border-4 border-gray-400" />
        <span className="text-gray-300 text-2xl font-semibold tracking-widest">HOLD</span>
      </div>
    )
  }

  return null
}
