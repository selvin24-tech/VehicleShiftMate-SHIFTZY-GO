type BrandNameProps = {
  /** Also render the " Go" suffix (Shiftzy Go). */
  go?: boolean;
  /** Use light colors for placement on dark/colored backgrounds. */
  onDark?: boolean;
  className?: string;
};

/**
 * Consistent Shiftzy wordmark: "Shift" (blue) + "zy" (orange) + optional " Go" (blue).
 * On dark backgrounds the blue parts render white so they stay readable.
 */
export default function BrandName({ go = false, onDark = false, className }: BrandNameProps) {
  const primary = onDark ? "#ffffff" : "#1d4ed8";
  const accent = onDark ? "#fdba74" : "#f97316";
  return (
    <span className={className}>
      <span style={{ color: primary }}>Shift</span>
      <span style={{ color: accent }}>zy</span>
      {go && <span style={{ color: primary }}> Go</span>}
    </span>
  );
}
