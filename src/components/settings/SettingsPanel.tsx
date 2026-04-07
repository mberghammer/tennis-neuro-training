"use client"

import { useState } from "react"
import { Settings, X, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { DrillSettings, CustomLabel, DirectionArrow, DIRECTION_AUDIO_LABEL } from "@/types/drill"

interface SettingsPanelProps {
  settings: DrillSettings
  onUpdate: (patch: Partial<DrillSettings>) => void
  onAddCustomLabel: (label: string, color: string) => void
  onRemoveCustomLabel: (index: number) => void
  disabled: boolean
}

function SwitchSetting({
  id,
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  id: string
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <Label
          htmlFor={id}
          className="text-white font-medium cursor-pointer"
        >
          {label}
        </Label>
        {desc && <p className="text-xs text-white/40 mt-0.5 max-w-xs">{desc}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  )
}

export function SettingsPanel({ settings, onUpdate, onAddCustomLabel, onRemoveCustomLabel, disabled }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newColor, setNewColor] = useState("#3b82f6")

  const { config } = settings

  return (
    <>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-white/60 hover:text-white hover:bg-white/10"
        aria-label="Open Settings"
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-zinc-950 border-l border-white/10 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-white font-bold text-lg tracking-tight">Drill Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="px-6 py-6 space-y-8">
                {/* ─── Drill Config ─── */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Drill Configuration</h3>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white font-medium">Duration</Label>
                        <span className="text-white/60 text-sm">{config.drillDuration}s</span>
                      </div>
                      <Slider
                        min={10}
                        max={300}
                        step={5}
                        value={[config.drillDuration]}
                        onValueChange={(v) => {
                          const val = Array.isArray(v) ? (v as number[])[0] : (v as number)
                          onUpdate({ config: { ...config, drillDuration: val } })
                        }}
                        disabled={disabled}
                        className="**:[[role=slider]]:bg-emerald-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white font-medium">Min Interval</Label>
                        <span className="text-white/60 text-sm">{config.minInterval}ms</span>
                      </div>
                      <Slider
                        min={500}
                        max={15000}
                        step={100}
                        value={[config.minInterval]}
                        onValueChange={(v) => {
                          const val = Array.isArray(v) ? (v as number[])[0] : (v as number)
                          onUpdate({ config: { ...config, minInterval: Math.min(val, config.maxInterval) } })
                        }}
                        disabled={disabled}
                        className="**:[[role=slider]]:bg-emerald-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white font-medium">Max Interval</Label>
                        <span className="text-white/60 text-sm">{config.maxInterval}ms</span>
                      </div>
                      <Slider
                        min={500}
                        max={15000}
                        step={100}
                        value={[config.maxInterval]}
                        onValueChange={(v) => {
                          const val = Array.isArray(v) ? (v as number[])[0] : (v as number)
                          onUpdate({ config: { ...config, maxInterval: Math.max(val, config.minInterval) } })
                        }}
                        disabled={disabled}
                        className="**:[[role=slider]]:bg-emerald-400"
                      />
                    </div>
                  </div>
                </section>

                {/* ─── Stimulus Types ─── */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Stimulus Types</h3>
                  <div>
                    <SwitchSetting
                      id="enableVisual"
                      label="🎨 Color Flashes"
                      desc="Full-screen color bursts (Green, Red, Blue, Yellow)."
                      checked={settings.enableVisual}
                      onChange={(v) => onUpdate({ enableVisual: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="enableDirectional"
                      label="↕ Directional Arrows"
                      desc="Large centered arrows — Up, Down, Left, Right."
                      checked={settings.enableDirectional}
                      onChange={(v) => onUpdate({ enableDirectional: v })}
                      disabled={disabled}
                    />

                    {/* Direction selector */}
                    {settings.enableDirectional && (
                      <div className="ml-1 mb-2 grid grid-cols-2 gap-1.5">
                        {(
                          [
                            ["top-left", "↖", "Att. Left"],
                            ["top-right", "↗", "Att. Right"],
                            ["left", "←", "Wide Left"],
                            ["right", "→", "Wide Right"],
                            ["bot-left", "↙", "Def. Left"],
                            ["bot-right", "↘", "Def. Right"],
                          ] as [DirectionArrow, string, string][]
                        ).map(([dir, arrow, name]) => {
                          const active = settings.activeDirections.includes(dir)
                          return (
                            <button
                              key={dir}
                              disabled={disabled}
                              onClick={() => {
                                const next = active ? settings.activeDirections.filter((d) => d !== dir) : [...settings.activeDirections, dir]
                                onUpdate({ activeDirections: next })
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                active
                                  ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                                  : "bg-white/5 border-white/10 text-white/30 hover:border-white/25 hover:text-white/50"
                              } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span className="text-base leading-none">{arrow}</span>
                              <span>{name}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <SwitchSetting
                      id="enableAudio"
                      label="🔊 Audio (TTS)"
                      desc="Web Speech API announces cues out loud."
                      checked={settings.enableAudio}
                      onChange={(v) => onUpdate({ enableAudio: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="enableCustomLabels"
                      label="📝 Custom Labels"
                      desc="Your own drill cues displayed as text."
                      checked={settings.enableCustomLabels}
                      onChange={(v) => onUpdate({ enableCustomLabels: v })}
                      disabled={disabled}
                    />
                  </div>

                  {/* Custom labels editor */}
                  {settings.enableCustomLabels && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Custom Labels</p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {settings.customLabels.map((cl: CustomLabel, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2"
                          >
                            <button
                              disabled={disabled}
                              onClick={() => {
                                const next = [...settings.customLabels]
                                next[i] = { ...next[i], enabled: !next[i].enabled }
                                onUpdate({ customLabels: next })
                              }}
                              title={cl.enabled ? "Disable" : "Enable"}
                              className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-all ${
                                cl.enabled ? "bg-emerald-500/30 border-emerald-500/70 text-emerald-300" : "bg-white/5 border-white/15 text-white/20 hover:border-white/30"
                              } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {cl.enabled && <span className="text-[10px] leading-none">✓</span>}
                            </button>
                            <input
                              type="color"
                              value={cl.color}
                              disabled={disabled}
                              onChange={(e) => {
                                const next = [...settings.customLabels]
                                next[i] = { ...next[i], color: e.target.value }
                                onUpdate({ customLabels: next })
                              }}
                              title="Pick background colour"
                              className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent p-0.5 shrink-0"
                              style={{ minWidth: 32 }}
                            />
                            <Input
                              value={cl.text}
                              onChange={(e) => {
                                const next = [...settings.customLabels]
                                next[i] = { ...next[i], text: e.target.value }
                                onUpdate({ customLabels: next })
                              }}
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/25 text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onRemoveCustomLabel(i)}
                              className="shrink-0 text-white/30 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          title="Pick background colour"
                          className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent p-0.5 shrink-0"
                          style={{ minWidth: 36 }}
                        />
                        <Input
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newLabel.trim()) {
                              onAddCustomLabel(newLabel.trim(), newColor)
                              setNewLabel("")
                            }
                          }}
                          placeholder="New label… (press Enter)"
                          className="bg-white/5 border-white/15 text-white placeholder:text-white/25 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            if (newLabel.trim()) {
                              onAddCustomLabel(newLabel.trim(), newColor)
                              setNewLabel("")
                            }
                          }}
                          className="border-white/20 text-white hover:bg-white/10 hover:text-white shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </section>

                {/* ─── Pro Coach ─── */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">⚡ Pro Coach Features</h3>
                  <div>
                    <SwitchSetting
                      id="splitStepPulse"
                      label="Split-Step Pulse"
                      desc="White pulse fires 400ms before each arrow. Instruction: Split-step on the pulse, explosive step on the arrow."
                      checked={settings.splitStepPulse}
                      onChange={(v) => onUpdate({ splitStepPulse: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="distractorMode"
                      label="Distractor Mode"
                      desc="20% chance of a Grey Circle — do NOT move. Trains inhibitory control."
                      checked={settings.distractorMode}
                      onChange={(v) => onUpdate({ distractorMode: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="voiceOnlyMode"
                      label="Voice-Only Mode"
                      desc="Hides all visual cues. Forces auditory-to-motor processing."
                      checked={settings.voiceOnlyMode}
                      onChange={(v) => onUpdate({ voiceOnlyMode: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="highContrast"
                      label="High-Contrast Visuals"
                      desc="Neon/B&W palette for maximum peripheral retina stimulation."
                      checked={settings.highContrast}
                      onChange={(v) => onUpdate({ highContrast: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="hideArrowLabel"
                      label="Hide Arrow Label"
                      desc="Show only the arrow icon — no ATTACKING · LEFT text."
                      checked={settings.hideArrowLabel}
                      onChange={(v) => onUpdate({ hideArrowLabel: v })}
                      disabled={disabled}
                    />
                    <SwitchSetting
                      id="arrowBgColor"
                      label="Arrow Zone Colours"
                      desc="Solid background per zone: orange = Attacking, green = Wide, blue = Defensive."
                      checked={settings.arrowBgColor}
                      onChange={(v) => onUpdate({ arrowBgColor: v })}
                      disabled={disabled}
                    />
                  </div>
                </section>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
