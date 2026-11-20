import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { isVisible } from "@/lib/stream-predicates";

export type CarouselSlide = {
  id: string;
  title?: string;
  body: string;
  streams: readonly string[];
};

function useCarouselIndex(api: CarouselApi): number {
  const [activeIndex, setActiveIndex] = useState(0);

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

  return activeIndex;
}

export type StreamCarouselProps = {
  heading: string;
  slideLabel: string;
  slides: readonly CarouselSlide[];
  activeStream: string;
};

export default function StreamCarousel({
  heading,
  slideLabel,
  slides,
  activeStream,
}: StreamCarouselProps) {
  const visibleSlides = slides.filter((slide) =>
    isVisible(slide.streams, activeStream),
  );
  const [api, setApi] = useState<CarouselApi>();
  const activeIndex = useCarouselIndex(api);

  if (visibleSlides.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <Carousel setApi={setApi} aria-label={heading} className="w-full">
        <CarouselContent>
          {visibleSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="flex min-h-44 flex-col justify-center gap-3 rounded-lg border bg-card p-6 text-card-foreground sm:min-h-52">
                {slide.title ? (
                  <h3 className="text-lg font-semibold">{slide.title}</h3>
                ) : null}
                <p className="text-muted-foreground">{slide.body}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        {/* Counted from the slides, not the carousel api, so indicators exist before it initializes. */}
        <div className="mt-4 flex justify-center gap-2">
          {visibleSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to ${slideLabel} ${index + 1}`}
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
