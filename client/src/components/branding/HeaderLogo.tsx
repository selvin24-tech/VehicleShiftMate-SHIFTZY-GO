import { motion, useReducedMotion } from "framer-motion";

const LOGO_FONT = "Impact, 'Arial Narrow Bold', sans-serif";

export default function HeaderLogo() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="flex flex-col items-center select-none">
        <div
          className="flex items-center justify-center"
          style={{ fontFamily: LOGO_FONT, fontSize: "20px", fontWeight: 900, letterSpacing: "1px", fontStyle: "italic", lineHeight: 1 }}
        >
          <span style={{ color: "#1d4ed8" }}>SHIFT</span>
          <span style={{ color: "#f97316", margin: "0 1px" }}>ZY</span>
          <span style={{ color: "#111827" }} className="ml-1">GO</span>
        </div>
        <p className="text-[9px] text-neutral-400 font-medium tracking-wide -mt-0.5">Safe Shifts. Joyful Journeys.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      {/* Animated wordmark */}
      <div
        className="flex items-center justify-center"
        style={{ fontFamily: LOGO_FONT, fontSize: "20px", fontWeight: 900, letterSpacing: "1px", fontStyle: "italic", lineHeight: 1 }}
      >
        {/* SHIFT — drops in like a heavy container */}
        <motion.span
          initial={{ y: -34, rotate: -12, opacity: 0 }}
          animate={{ y: [-34, 0, -4, 0], rotate: [-12, 0, 0, 0], opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, times: [0, 0.6, 0.8, 1], ease: "easeOut" }}
          style={{ color: "#1d4ed8", display: "inline-block" }}
        >
          SHIFT
        </motion.span>

        {/* ZY — squashes & wobbles like jelly to connect the two */}
        <motion.span
          initial={{ scaleX: 0.2, scaleY: 1.4, opacity: 0 }}
          animate={{
            scaleX: [0.2, 1.35, 0.85, 1.1, 1],
            scaleY: [1.4, 0.7, 1.15, 0.95, 1],
            opacity: 1,
          }}
          transition={{ duration: 0.7, delay: 0.7, times: [0, 0.3, 0.55, 0.8, 1], ease: "easeOut" }}
          style={{ color: "#f97316", display: "inline-block", transformOrigin: "center bottom", margin: "0 1px" }}
        >
          ZY
        </motion.span>

        {/* GO — lurches forward with a smoke puff, then settles back */}
        <span className="relative inline-flex items-center ml-1">
          <motion.span
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [0, 14, 0], opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.3, times: [0, 0.45, 1], ease: [0.25, 0.1, 0.25, 1] }}
            style={{ color: "#111827", display: "inline-block" }}
          >
            GO
          </motion.span>

          {/* smoke puffs behind GO */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, x: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2 + i * 0.3, 1.6 + i * 0.3], x: [0, -10 - i * 6, -18 - i * 8], opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.7, delay: 1.3 + i * 0.05, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "-6px",
                top: "50%",
                width: `${8 + i * 3}px`,
                height: `${8 + i * 3}px`,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(160,160,160,0.7) 0%, transparent 70%)",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          ))}
        </span>
      </div>

      {/* Tagline */}
      <p className="text-[9px] text-neutral-400 font-medium tracking-wide -mt-0.5">Safe Shifts. Joyful Journeys.</p>

      {/* Tiny road with car going right→left and bike going left→right */}
      <div className="relative w-32 h-3 mt-0.5 overflow-hidden">
        {/* dashed road line */}
        <div className="absolute top-1/2 left-0 right-0 flex gap-1 -translate-y-1/2">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="h-[1.5px] w-2 bg-neutral-200 rounded-full" />
          ))}
        </div>
        {/* car: right → left */}
        <motion.span
          className="absolute top-1/2 -translate-y-1/2"
          style={{ fontSize: "11px", lineHeight: 1 }}
          animate={{ x: [128, -16] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          🚗
        </motion.span>
        {/* bike: left → right */}
        <motion.span
          className="absolute top-1/2 -translate-y-1/2 scale-x-[-1]"
          style={{ fontSize: "10px", lineHeight: 1 }}
          animate={{ x: [-16, 128] }}
          transition={{ repeat: Infinity, duration: 7.5, ease: "linear", delay: 1 }}
        >
          🏍️
        </motion.span>
      </div>
    </div>
  );
}
