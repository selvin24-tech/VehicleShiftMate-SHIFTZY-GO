import { motion, useReducedMotion } from "framer-motion";

const LOGO_FONT = "Impact, 'Arial Narrow Bold', sans-serif";

interface LoadingScreenProps {
  /** when true, fills the whole viewport; otherwise fills its parent */
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingScreen({ fullScreen = true, message = "Loading" }: LoadingScreenProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        className={`${fullScreen ? "fixed inset-0 z-[100]" : "w-full py-16"} bg-white flex flex-col items-center justify-center gap-3`}
      >
        <div
          className="flex items-center justify-center"
          style={{ fontFamily: LOGO_FONT, fontSize: "30px", fontWeight: 900, letterSpacing: "1px", fontStyle: "italic", lineHeight: 1 }}
        >
          <span style={{ color: "#1d4ed8" }}>SHIFT</span>
          <span style={{ color: "#f97316", margin: "0 2px" }}>ZY</span>
          <span style={{ color: "#111827", marginLeft: "4px" }}>GO</span>
        </div>
        <p className="text-[11px] text-neutral-400 font-medium tracking-wide">Safe Shift. Joyful Journey.</p>
        <div className="h-1 w-32 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-blue-600 animate-pulse" />
        </div>
        <span className="text-xs font-medium text-neutral-400">{message}…</span>
      </div>
    );
  }

  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[100]" : "w-full py-16"} bg-white flex flex-col items-center justify-center`}
    >
      {/* Wordmark sketched in */}
      <div
        className="flex items-center justify-center mb-1"
        style={{ fontFamily: LOGO_FONT, fontSize: "30px", fontWeight: 900, letterSpacing: "1px", fontStyle: "italic", lineHeight: 1 }}
      >
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ color: "#1d4ed8" }}
        >
          SHIFT
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ color: "#f97316", margin: "0 2px" }}
        >
          ZY
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ color: "#111827", marginLeft: "4px" }}
        >
          GO
        </motion.span>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-[11px] text-neutral-400 font-medium tracking-wide mb-1"
      >
        Safe Shift. Joyful Journey.
      </motion.p>

      {/* Pencil-sketch road being drawn, with a car driving along it */}
      <div className="relative" style={{ width: 200, height: 50 }}>
        <svg width="200" height="50" viewBox="0 0 200 50" fill="none" className="absolute inset-0">
          {/* sketch road line drawn by "pencil" */}
          <motion.path
            d="M6 38 Q60 22 100 32 T194 30"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          />
          {/* underline pencil stroke */}
          <motion.path
            d="M6 46 L194 46"
            stroke="#1d4ed8"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
          />
        </svg>

        {/* car driving across the sketched road */}
        <motion.div
          className="absolute"
          style={{ top: 8, fontSize: "20px" }}
          animate={{ x: [0, 176], y: [0, -4, 2, 0] }}
          transition={{
            x: { duration: 1.8, ease: "easeInOut", repeat: Infinity },
            y: { duration: 0.6, ease: "easeInOut", repeat: Infinity },
          }}
        >
          🚗
        </motion.div>
      </div>

      {/* message with animated dots */}
      <div className="flex items-center gap-1 mt-1 text-neutral-400">
        <span className="text-xs font-medium">{message}</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-orange-400"
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
