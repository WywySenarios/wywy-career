import { useEffect, useState } from "react";
import { activeStreamFromHash } from "@/lib/stream-predicates";

export function useActiveStream(
  streamIds: readonly string[],
  defaultId: string,
): string {
  const [active, setActive] = useState(defaultId);
  // Callers may pass a fresh array each render. Depend on the ids' content so
  // the hashchange listener survives identical arrays.
  const streamIdsKey = JSON.stringify(streamIds);

  useEffect(() => {
    const knownIds = JSON.parse(streamIdsKey) as readonly string[];

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
  }, [defaultId, streamIdsKey]);

  return active;
}
