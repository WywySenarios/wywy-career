import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { applyStreamFilter } from "@/lib/stream-filter-dom";
import { useActiveStream } from "@/lib/use-active-stream";

type Stream = {
  id: string;
  label: string;
};

type StreamSwitcherProps = {
  streams: Stream[];
  defaultId: string;
};

export default function StreamSwitcher({
  streams,
  defaultId,
}: StreamSwitcherProps) {
  const active = useActiveStream(
    streams.map((stream) => stream.id),
    defaultId,
  );

  useEffect(() => {
    applyStreamFilter(document, active);
  }, [active]);

  return (
    <nav aria-label="Career stream" className="flex flex-wrap gap-2">
      {streams.map((stream) => {
        const isActive = stream.id === active;

        return (
          <Button
            key={stream.id}
            asChild
            size="sm"
            variant={isActive ? "default" : "outline"}
          >
            <a
              href={`#${stream.id}`}
              data-stream-id={stream.id}
              aria-current={isActive ? "true" : undefined}
            >
              {stream.label}
            </a>
          </Button>
        );
      })}
    </nav>
  );
}
