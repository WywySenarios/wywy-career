import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { visiblePillars, type PillarSlide } from "@/lib/pillars";
import { useActiveStream } from "@/lib/use-active-stream";

type PillarsCarouselProps = {
  pillars: readonly PillarSlide[];
  streamIds: readonly string[];
  defaultId: string;
};

export default function PillarsCarousel({
  pillars,
  streamIds,
  defaultId,
}: PillarsCarouselProps) {
  const activeStream = useActiveStream(streamIds, defaultId);
  const slides = visiblePillars(pillars, activeStream);
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeStream]);

  useEffect(() => {
    if (!api) return;

    const syncActiveIndex = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    syncActiveIndex();
    api.on("select", syncActiveIndex);

    return () => {
      api.off("select", syncActiveIndex);
    };
  }, [api]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-foreground">Pillars</h2>
      <Carousel
        key={activeStream}
        setApi={setApi}
        aria-label="Career pillars"
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="flex min-h-44 flex-col justify-center gap-3 rounded-lg border bg-card p-6 text-card-foreground sm:min-h-52">
                <h3 className="text-lg font-semibold">{slide.label}</h3>
                <p className="text-muted-foreground">{slide.sentence}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        {/* Counted from the slides, not the carousel api, so indicators exist before it initializes. */}
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to pillar ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => api?.scrollTo(index)}
              className="size-2.5 rounded-full bg-muted-foreground/40 aria-[current=true]:bg-primary"
            />
          ))}
        </div>
      </Carousel>
    </>
  );
}
