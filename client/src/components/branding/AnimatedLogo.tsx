import { motion } from "framer-motion";

export default function AnimatedLogo() {
  return (
    <div style={{
      fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
      fontSize: "clamp(40px, 8vw, 72px)",
      fontWeight: "bold",
      textAlign: "center",
      lineHeight: "1",
      margin: "0",
      letterSpacing: "1px",
      textTransform: "uppercase",
      WebkitTextStroke: "1px #000",
      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      position: "relative",
      minHeight: "120px"
    }}>
      
      {/* SHIFT - Container drop effect */}
      <motion.span
        initial={{ x: -200, y: -300, rotate: -45, opacity: 0 }}
        animate={{ 
          x: 0, 
          y: 0, 
          rotate: [0, 5, -3, 2, 0],
          opacity: 1 
        }}
        transition={{
          duration: 1.2,
          delay: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
          rotate: {
            duration: 0.8,
            delay: 1.7,
            times: [0, 0.3, 0.6, 0.8, 1]
          }
        }}
        style={{
          color: "#3b82f6",
          background: "linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
          position: "relative",
          filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.5))"
        }}
      >
        SHIFT
        
        {/* Impact effect - shockwave */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 3, 4], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 0.8,
            delay: 1.7,
            ease: "easeOut"
          }}
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100px",
            height: "20px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(200,200,200,0.3) 50%, transparent 70%)",
            pointerEvents: "none"
          }}
        />
        
        {/* Dust particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              x: [0, (i - 3) * 30],
              y: [0, -20 - i * 10],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 0.8,
              delay: 1.7 + i * 0.05,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              bottom: "0",
              left: "50%",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: `rgba(${150 + i * 15}, ${150 + i * 15}, ${150 + i * 15}, 0.6)`,
              pointerEvents: "none"
            }}
          />
        ))}
      </motion.span>

      {/* zy - Small, orange, bending support */}
      <motion.span
        initial={{ scale: 1, y: 0 }}
        animate={{
          scale: [1, 0.9, 0.85, 0.9, 1],
          y: [0, 5, 8, 5, 0],
          scaleY: [1, 0.8, 0.7, 0.85, 1]
        }}
        transition={{
          duration: 0.8,
          delay: 1.7,
          times: [0, 0.3, 0.5, 0.7, 1],
          ease: "easeInOut"
        }}
        style={{
          color: "#ff8c00",
          background: "linear-gradient(135deg, #ff8c00, #f59e0b, #fbbf24)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
          fontSize: "0.6em",
          position: "relative",
          top: "0.15em",
          margin: "0 5px",
          transformOrigin: "center bottom",
          filter: "drop-shadow(0 2px 4px rgba(255, 140, 0, 0.4))"
        }}
      >
        zy
      </motion.span>

      {/* GO - Zooms off and returns - wrapped for proper spacing */}
      <div style={{ display: "inline-block", marginLeft: "15px" }}>
        <motion.span
          initial={{ x: 0, opacity: 1 }}
          animate={{
            x: [0, 0, 800, 800, 0],
            opacity: [1, 1, 1, 1, 1],
            scale: [1, 1, 1.1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            delay: 2.5,
            times: [0, 0.1, 0.35, 0.6, 1],
            ease: "easeInOut"
          }}
          style={{
            color: "#3b82f6",
            background: "linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
            position: "relative",
            filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.5))"
          }}
        >
        GO
        
        {/* Smoke puff effect */}
        <motion.div
          initial={{ scale: 0, x: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 0, 2, 3],
            x: [0, 0, -80, -120],
            opacity: [0, 0, 0.7, 0]
          }}
          transition={{
            duration: 1.2,
            delay: 2.7,
            ease: "easeOut"
          }}
          style={{
            position: "absolute",
            left: "-20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,200,200,0.8) 0%, rgba(150,150,150,0.4) 40%, transparent 70%)",
            pointerEvents: "none"
          }}
        />
        
        {/* Multiple smoke clouds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 0, 1.5 + i * 0.3, 2 + i * 0.4],
              x: [0, 0, -60 - i * 20, -100 - i * 30],
              y: [0, 0, (i - 1) * 15, (i - 1) * 25],
              opacity: [0, 0, 0.5, 0]
            }}
            transition={{
              duration: 1.4,
              delay: 2.7 + i * 0.1,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              left: "-10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${180 - i * 20}, ${180 - i * 20}, ${180 - i * 20}, ${0.6 - i * 0.1}) 0%, transparent 70%)`,
              pointerEvents: "none"
            }}
          />
        ))}

        {/* Speed lines */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`speed-${i}`}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: [0, 0, 1, 0],
              x: [0, 0, -100, -150],
              opacity: [0, 0, 0.8, 0]
            }}
            transition={{
              duration: 0.6,
              delay: 2.7 + i * 0.08,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              left: "-10px",
              top: `${30 + i * 15}%`,
              width: "80px",
              height: "3px",
              background: `linear-gradient(to left, rgba(59, 130, 246, ${0.8 - i * 0.15}), transparent)`,
              transformOrigin: "right center",
              pointerEvents: "none"
            }}
          />
        ))}
        </motion.span>
      </div>
    </div>
  );
}
