"use client"

import { motion, AnimatePresence } from "framer-motion"

interface SplitStepPulseProps {
  active: boolean
}

export function SplitStepPulse({ active }: SplitStepPulseProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="pulse"
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.25 }}
        >
          {/* Outer pulse ring */}
          <motion.div
            className="absolute rounded-full border-4 border-white"
            style={{ width: 180, height: 180 }}
            animate={{ scale: [1, 1.8], opacity: [0.9, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          {/* Inner solid ring */}
          <div
            className="rounded-full border-4 border-white bg-white/10"
            style={{ width: 80, height: 80 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
