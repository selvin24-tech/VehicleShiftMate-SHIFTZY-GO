import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const LOGO_FONT = "Impact, 'Arial Narrow Bold', sans-serif";

/* ------------------------------------------------------------------ */
/* Vehicle showcase — one clear vehicle glides smoothly at a time      */
/* ------------------------------------------------------------------ */

const SHOWCASE_W = 256; // container width (w-64)
const VEHICLE_PAD = 48; // offscreen padding so the vehicle fully enters/exits
const WORDMARK_DURATION = 2.4; // wait for the SHIFTZY GO animation to finish
const CROSS_DURATION = 5.5; // smooth, calm crossing (slower = premium)
const GAP_AFTER = 400; // ms pause after a vehicle exits

type Ride = { emoji: string; dir: "ltr" | "rtl"; size: number; label: string };

// Two-wheelers travel right -> left; four-wheelers travel left -> right.
const RIDES: Ride[] = [
  { emoji: "🏍️", dir: "rtl", size: 32, label: "bike" },
  { emoji: "🚗", dir: "ltr", size: 34, label: "car" },
  { emoji: "🛵", dir: "rtl", size: 31, label: "scooter" },
  { emoji: "🚙", dir: "ltr", size: 35, label: "suv" },
  { emoji: "🏎️", dir: "ltr", size: 34, label: "premium car" },
];

// Always alternate two-wheeler (R->L) and four-wheeler (L->R) so a bike
// is followed by a car, then a bike again — never two of the same kind.
function pickNext(prev: number): number {
  const wantDir: Ride["dir"] = RIDES[prev].dir === "rtl" ? "ltr" : "rtl";
  const pool = RIDES.map((r, i) => ({ r, i })).filter(({ r }) => r.dir === wantDir);
  return pool[Math.floor(Math.random() * pool.length)].i;
}

/* The animated wordmark — identical animation, replays each cycle via `key`. */
function Wordmark() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ fontFamily: LOGO_FONT, fontSize: "30px", fontWeight: 900, letterSpacing: "1px", fontStyle: "italic", lineHeight: 1 }}
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
          style={{ color: "#1d4ed8", display: "inline-block" }}
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
  );
}

/* Full looping experience: SHIFTZY GO plays -> one vehicle glides across -> repeat. */
function AnimatedLogo() {
  const [cycle, setCycle] = useState(0);
  const [rideIndex, setRideIndex] = useState(() => Math.floor(Math.random() * RIDES.length));
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const ride = RIDES[rideIndex];
  const ltr = ride.dir === "ltr";
  const from = ltr ? -VEHICLE_PAD : SHOWCASE_W + VEHICLE_PAD;
  const to = ltr ? SHOWCASE_W + VEHICLE_PAD : -VEHICLE_PAD;

  return (
    <div className="flex flex-col items-center select-none">
      {/* SHIFTZY GO wordmark — replays at the start of every cycle */}
      <Wordmark key={cycle} />

      {/* Tagline */}
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium tracking-wide -mt-0.5">Safe Shift. Joyful Journey.</p>

      {/* One vehicle glides smoothly across, after the wordmark settles */}
      <div className="relative w-64 h-11 mt-1 overflow-hidden">
        {/* soft road baseline */}
        <div className="absolute bottom-1.5 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <motion.div
          key={cycle}
          className="absolute bottom-[3px] left-0"
          initial={{ x: from }}
          animate={{ x: to }}
          transition={{ duration: CROSS_DURATION, delay: WORDMARK_DURATION + 0.3, ease: "linear" }}
          onAnimationComplete={() => {
            timerRef.current = window.setTimeout(() => {
              setRideIndex((prev) => pickNext(prev));
              setCycle((c) => c + 1);
            }, GAP_AFTER);
          }}
          style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.18))" }}
        >
          <span
            aria-label={ride.label}
            style={{
              display: "inline-block",
              fontSize: `${ride.size}px`,
              lineHeight: 1,
              // Vehicle emoji face left by default — flip them when driving right.
              transform: ltr ? "scaleX(-1)" : "none",
            }}
          >
            {ride.emoji}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default function HeaderLogo() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="flex flex-col items-center select-none">
        <div
          className="flex items-center justify-center"
          style={{ fontFamily: LOGO_FONT, fontSize: "30px", fontWeight: 900, letterSpacing: "1px", fontStyle: "italic", lineHeight: 1 }}
        >
          <span style={{ color: "#1d4ed8" }}>SHIFT</span>
          <span style={{ color: "#f97316", margin: "0 1px" }}>ZY</span>
          <span style={{ color: "#1d4ed8" }} className="ml-1">GO</span>
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium tracking-wide -mt-0.5">Safe Shift. Joyful Journey.</p>
      </div>
    );
  }

  return <AnimatedLogo />;
}
