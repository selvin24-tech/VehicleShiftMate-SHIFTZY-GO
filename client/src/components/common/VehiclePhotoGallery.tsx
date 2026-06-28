import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface VehiclePhotoGalleryProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

const ANGLE_LABELS = ["Front", "Side", "Rear", "Interior", "Extra"];

export default function VehiclePhotoGallery({
  images,
  open,
  onOpenChange,
  title = "Vehicle photos",
}: VehiclePhotoGalleryProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  if (!images.length) return null;

  const safeIndex = Math.min(index, images.length - 1);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden" data-testid="dialog-vehicle-gallery">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-muted">
          <img
            src={images[safeIndex]}
            alt={`${title} ${ANGLE_LABELS[safeIndex] ?? safeIndex + 1}`}
            className="w-full h-72 object-cover select-none"
            draggable={false}
            data-testid="img-gallery-active"
          />

          {/* angle + counter */}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {ANGLE_LABELS[safeIndex] ?? `Photo ${safeIndex + 1}`}
          </div>
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {safeIndex + 1}/{images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                data-testid="button-gallery-prev"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                data-testid="button-gallery-next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* thumbnails */}
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`shrink-0 h-14 w-20 rounded-md overflow-hidden border-2 transition ${
                i === safeIndex ? "border-primary" : "border-transparent opacity-70"
              }`}
              data-testid={`button-gallery-thumb-${i}`}
            >
              <img src={img} alt={`thumbnail ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>

        <p className="px-4 pb-4 text-xs text-muted-foreground">
          Photos uploaded by the owner — front, side & rear views.
        </p>
      </DialogContent>
    </Dialog>
  );
}
