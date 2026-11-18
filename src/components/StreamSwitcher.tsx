import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { applyStreamFilter } from "@/lib/stream-filter-dom";
import { activeStreamFromHash } from "@/lib/stream-predicates";

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
  const [active, setActive] = useState(defaultId);

  useEffect(() => {
    const knownIds = streams.map((stream) => stream.id);
    const syncFromHash = () => {
      setActive(
        activeStreamFromHash(window.location.hash, knownIds, defaultId),
      );
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [defaultId, streams]);

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
