import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const LOGO_FONT = "Impact, 'Arial Narrow Bold', sans-serif";

/* ------------------------------------------------------------------ */
/* Premium vehicle showcase (animation section below the wordmark)     */
/* ------------------------------------------------------------------ */

const SHOWCASE_W = 256; // matches container width (w-64)
const VEHICLE_W = 60; // svg render width
const CROSS_DURATION = 3.4; // seconds to cross
const START_DELAY = 0.3; // wait before each vehicle enters
const GAP_AFTER = 300; // ms pause after a vehicle exits

const ALL_VEHICLES = [
  "sedan",
  "hatchback",
  "suv",
  "pickup",
  "luxury",
  "motorcycle",
  "scooter",
] as const;
type VehicleType = (typeof ALL_VEHICLES)[number];

// Motorcycles & scooters travel right -> left; everything else left -> right.
const RIGHT_TO_LEFT = new Set<VehicleType>(["motorcycle", "scooter"]);

function pickNext(prev: VehicleType): VehicleType {
  let next = prev;
  while (next === prev) {
    next = ALL_VEHICLES[Math.floor(Math.random() * ALL_VEHICLES.length)];
  }
  return next;
}

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.45, ease: "linear" }}
    >
      <circle cx={cx} cy={cy} r={r} fill="#1f2937" />
      <circle cx={cx} cy={cy} r={r * 0.46} fill="#e5e7eb" />
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#6b7280" />
      <line x1={cx} y1={cy - r * 0.82} x2={cx} y2={cy + r * 0.82} stroke="#9ca3af" strokeWidth="0.7" />
      <line x1={cx - r * 0.82} y1={cy} x2={cx + r * 0.82} y2={cy} stroke="#9ca3af" strokeWidth="0.7" />
    </motion.g>
  );
}

function Vehicle({ type }: { type: VehicleType }) {
  let body: JSX.Element;
  let wheels: { cx: number; cy: number; r: number }[];

  switch (type) {
    case "hatchback":
      wheels = [
        { cx: 18, cy: 27, r: 5.4 },
        { cx: 44, cy: 27, r: 5.4 },
      ];
      body = (
        <>
          <rect x="6" y="17" width="50" height="10" rx="3.5" fill="#3b82f6" />
          <polygon points="19,17 24,11 39,11 44,17" fill="#2563eb" />
          <polygon points="23,16.5 27,12.5 38,12.5 41,16.5" fill="#dbeafe" />
          <rect x="53" y="19" width="3" height="2.4" rx="1" fill="#f97316" />
        </>
      );
      break;
    case "suv":
      wheels = [
        { cx: 17, cy: 27, r: 5.8 },
        { cx: 47, cy: 27, r: 5.8 },
      ];
      body = (
        <>
          <rect x="6" y="14" width="52" height="13" rx="2.5" fill="#1d4ed8" />
          <rect x="14" y="9" width="34" height="6.5" rx="1.8" fill="#2563eb" />
          <rect x="17" y="10.5" width="12" height="4" rx="0.8" fill="#dbeafe" />
          <rect x="31" y="10.5" width="13" height="4" rx="0.8" fill="#dbeafe" />
          <rect x="54" y="16" width="3" height="2.6" rx="1" fill="#f97316" />
        </>
      );
      break;
    case "pickup":
      wheels = [
        { cx: 17, cy: 27, r: 5.6 },
        { cx: 47, cy: 27, r: 5.6 },
      ];
      body = (
        <>
          <rect x="6" y="18" width="52" height="9" rx="2.5" fill="#2563eb" />
          <rect x="11" y="11" width="17" height="7.5" rx="1.5" fill="#2563eb" />
          <rect x="13" y="12.5" width="12" height="4" rx="0.6" fill="#dbeafe" />
          <rect x="30" y="14" width="27" height="4.5" fill="#1e40af" />
          <rect x="54" y="19.5" width="3" height="2.4" rx="1" fill="#f97316" />
        </>
      );
      break;
    case "luxury":
      wheels = [
        { cx: 18, cy: 27, r: 5.4 },
        { cx: 48, cy: 27, r: 5.4 },
      ];
      body = (
        <>
          <rect x="4" y="19" width="56" height="8" rx="4" fill="#0f172a" />
          <polygon points="22,19 28,13 46,13 50,19" fill="#0f172a" />
          <polygon points="26,18.5 30,14 44,14 47,18.5" fill="#93c5fd" />
          <rect x="7" y="23" width="50" height="1.1" rx="0.5" fill="#f97316" />
          <rect x="55" y="20" width="3" height="2.2" rx="1" fill="#fef3c7" />
        </>
      );
      break;
    case "motorcycle":
      wheels = [
        { cx: 15, cy: 25, r: 7 },
        { cx: 49, cy: 25, r: 7 },
      ];
      body = (
        <>
          <path d="M15 25 L30 19 L40 19 L49 25" stroke="#1d4ed8" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M28 19 Q33 13 41 16 L41 19 Z" fill="#2563eb" />
          <rect x="33" y="16" width="13" height="3" rx="1.5" fill="#111827" />
          <line x1="49" y1="25" x2="51" y2="15" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="48" y1="15" x2="54" y2="15" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="15" y1="25" x2="22" y2="24" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
      break;
    case "scooter":
      wheels = [
        { cx: 16, cy: 26, r: 6 },
        { cx: 48, cy: 26, r: 6 },
      ];
      body = (
        <>
          <rect x="16" y="22.5" width="34" height="3.2" rx="1.6" fill="#f97316" />
          <path d="M12 25 L13.5 12 Q15 9 19 11 L22 24 Z" fill="#f97316" />
          <path d="M14 13 Q15 10.5 18 11.6 L18 14 Z" fill="#bfdbfe" />
          <line x1="13.5" y1="12" x2="11" y2="9" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="40" y="16" width="12" height="3" rx="1.5" fill="#111827" />
          <rect x="44" y="18.5" width="3" height="6" fill="#374151" />
        </>
      );
      break;
    case "sedan":
    default:
      wheels = [
        { cx: 18, cy: 27, r: 5.4 },
        { cx: 46, cy: 27, r: 5.4 },
      ];
      body = (
        <>
          <rect x="6" y="17" width="52" height="10" rx="3.5" fill="#2563eb" />
          <polygon points="19,17 25,11 41,11 47,17" fill="#1d4ed8" />
          <polygon points="23,16.5 27,12.5 39,12.5 43,16.5" fill="#dbeafe" />
          <rect x="54" y="19" width="3" height="2.4" rx="1" fill="#f97316" />
        </>
      );
      break;
  }

  return (
    <svg
      width={VEHICLE_W}
      height="32"
      viewBox="0 0 64 34"
      fill="none"
      style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.22)) blur(0.2px)" }}
    >
      {/* soft ground shadow */}
      <ellipse cx="32" cy="31.4" rx="26" ry="1.8" fill="rgba(0,0,0,0.14)" />
      {/* premium speed lines (trailing edge) */}
      <g opacity="0.55" stroke="#3b82f6" strokeLinecap="round">
        <line x1="0" y1="14" x2="6" y2="14" strokeWidth="1.2" />
        <line x1="-1" y1="19" x2="8" y2="19" strokeWidth="1.2" />
        <line x1="0" y1="24" x2="5" y2="24" strokeWidth="1.2" />
      </g>
      {body}
      {wheels.map((w, i) => (
        <Wheel key={i} {...w} />
      ))}
    </svg>
  );
}

function VehicleShowcase() {
  const [vehicle, setVehicle] = useState<VehicleType>(() =>
    ALL_VEHICLES[Math.floor(Math.random() * ALL_VEHICLES.length)]
  );
  const [runId, setRunId] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const rtl = RIGHT_TO_LEFT.has(vehicle);
  const from = rtl ? SHOWCASE_W : -VEHICLE_W;
  const to = rtl ? -VEHICLE_W : SHOWCASE_W;

  return (
    <div className="relative w-64 h-10 mt-1 overflow-hidden">
      {/* faint baseline road */}
      <div className="absolute bottom-1 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

      {/* glowing blue Z trail */}
      <svg
        key={`z-${runId}`}
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${SHOWCASE_W} 40`}
        fill="none"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M104 13 H150 L106 30 H152"
          stroke="#2563eb"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 5px rgba(37,99,235,0.85))" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 0.95, 0] }}
          transition={{ duration: CROSS_DURATION, delay: START_DELAY, times: [0, 0.5, 1], ease: "easeInOut" }}
        />
      </svg>

      {/* single vehicle */}
      <motion.div
        key={`v-${runId}`}
        className="absolute left-0 top-1/2"
        style={{ y: "-50%" }}
        initial={{ x: from }}
        animate={{ x: to }}
        transition={{ duration: CROSS_DURATION, delay: START_DELAY, ease: [0.45, 0.05, 0.55, 0.95] }}
        onAnimationComplete={() => {
          timerRef.current = window.setTimeout(() => {
            setVehicle((prev) => pickNext(prev));
            setRunId((id) => id + 1);
          }, GAP_AFTER);
        }}
      >
        <div style={{ transform: rtl ? "scaleX(-1)" : "none" }}>
          <Vehicle type={vehicle} />
        </div>
      </motion.div>
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
          <span style={{ color: "#111827" }} className="ml-1">GO</span>
        </div>
        <p className="text-[11px] text-neutral-400 font-medium tracking-wide -mt-0.5">Safe Shifts. Joyful Journeys.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      {/* Animated wordmark */}
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
      <p className="text-[11px] text-neutral-400 font-medium tracking-wide -mt-0.5">Safe Shifts. Joyful Journeys.</p>

      {/* Premium single-vehicle showcase with glowing blue "Z" trail */}
      <VehicleShowcase />
    </div>
  );
}
