"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CountdownOverlayProps {
  value: number // 3, 2, 1
  visible: boolean
}

function CountdownOverlayInner({ value, visible }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white"
        >
          {/* Countdown Number */}
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[8rem] font-black text-white leading-none select-none"
              style={{ textShadow: "0 0 40px rgba(255,255,255,0.5)" }}
            >
              {value}
            </motion.div>
          </AnimatePresence>

          <p className="mt-4 text-white/60 text-lg font-medium tracking-widest uppercase">GET READY</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const CountdownOverlay = memo(CountdownOverlayInner)
