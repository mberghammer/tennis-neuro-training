// ─── Drill State Machine ───────────────────────────────────────────────────
export enum DrillState {
  IDLE = "IDLE",
  COUNTDOWN = "COUNTDOWN",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
}

// ─── Stimulus ──────────────────────────────────────────────────────────────
export type VisualColor = "green" | "red" | "blue" | "yellow"

/**
 * 6-point radial grid (left side + right side, three depth zones each):
 *   top-left  / top-right   → Diagonal-Up   → "Attacking" (move FORWARD of cones)
 *   left      / right       → Horizontal    → "Wide"      (move TO the cones)
 *   bot-left  / bot-right   → Diagonal-Down → "Defensive" (move BEHIND cones)
 */
export type DirectionArrow =
  | "top-left" // ↖  Attacking Left
  | "left" // ←  Wide Left
  | "bot-left" // ↙  Defensive Left
  | "top-right" // ↗  Attacking Right
  | "right" // →  Wide Right
  | "bot-right" // ↘  Defensive Right

/** Human-readable spoken label for each directional arrow */
export const DIRECTION_AUDIO_LABEL: Record<DirectionArrow, string> = {
  "top-left": "Attacking Left",
  left: "Wide Left",
  "bot-left": "Defensive Left",
  "top-right": "Attacking Right",
  right: "Wide Right",
  "bot-right": "Defensive Right",
}

/** Short display label shown beneath the arrow */
export const DIRECTION_DISPLAY_LABEL: Record<DirectionArrow, string> = {
  "top-left": "Attacking",
  left: "Wide",
  "bot-left": "Defensive",
  "top-right": "Attacking",
  right: "Wide",
  "bot-right": "Defensive",
}

export type StimulusKind =
  | { type: "visual"; color: VisualColor }
  | { type: "directional"; direction: DirectionArrow }
  | { type: "audio"; label: string }
  | { type: "custom"; label: string; color: string }
  | { type: "distractor" }

// ─── Custom Label ────────────────────────────────────────────────────────────
export interface CustomLabel {
  text: string
  color: string // hex, used as full-screen background
  enabled: boolean // whether this label is included in the drill pool
}

// ─── Drill Configuration ──────────────────────────────────────────────────
export interface DrillConfig {
  drillDuration: number // seconds
  minInterval: number // ms between stimuli (min)
  maxInterval: number // ms between stimuli (max)
}

// ─── Settings ─────────────────────────────────────────────────────────────
export interface DrillSettings {
  // --- Stimulus Types ---
  enableVisual: boolean
  enableDirectional: boolean
  activeDirections: DirectionArrow[] // subset of the 6 directions used in the drill
  enableAudio: boolean
  enableCustomLabels: boolean
  customLabels: CustomLabel[]

  // --- Pro Coach Features ---
  splitStepPulse: boolean // 400ms pre-stimulus cue
  distractorMode: boolean // 20% chance grey circle
  voiceOnlyMode: boolean // hide visuals, force auditory
  highContrast: boolean // black/white/neon palette
  hideArrowLabel: boolean // hide ATTACKING · LEFT text beneath arrows
  arrowBgColor: boolean // solid zone background: orange=attacking, green=neutral, blue=defensive

  // --- Config ---
  config: DrillConfig
}

export const DEFAULT_SETTINGS: DrillSettings = {
  enableVisual: true,
  enableDirectional: true,
  activeDirections: ["top-left", "left", "bot-left", "top-right", "right", "bot-right"],
  enableAudio: false,
  enableCustomLabels: false,
  customLabels: [
    { text: "Overhead Smash", color: "#6b7280", enabled: true },
    { text: "Drop Shot",      color: "#eab308", enabled: true },
  ],

  splitStepPulse: false,
  distractorMode: false,
  voiceOnlyMode: false,
  highContrast: false,
  hideArrowLabel: false,
  arrowBgColor: false,

  config: {
    drillDuration: 60,
    minInterval: 1500,
    maxInterval: 4000,
  },
}
