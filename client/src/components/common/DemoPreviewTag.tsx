import { Info } from "lucide-react";

/**
 * Honesty label for the parts of the app that show sample/illustrative
 * listings rather than a live, real marketplace — so a visitor or customer
 * never mistakes demo content for a real, bookable vehicle. Per the Honest
 * Pilot principle: don't present fake availability as real.
 */
export function DemoPreviewTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 ${className}`}
      title="Sample listings for preview — not live, bookable inventory yet"
    >
      <Info className="w-3 h-3" /> Preview
    </span>
  );
}

export function DemoPreviewBanner({ note }: { note?: string }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-800">
      <Info className="w-4 h-4 shrink-0 mt-0.5" />
      <span>
        {note ||
          "These are sample listings to show how ShiftzyGo will work — not a live marketplace yet. To move your own vehicle, use "}
        {!note && <a href="/shift-request" className="font-bold underline">Shift a Vehicle</a>}
        {!note && "."}
      </span>
    </div>
  );
}
