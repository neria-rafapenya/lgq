import { useEffect } from "react";
import { fetchMe } from "../lib/api";
import type { AuthUser } from "../lib/api";

type BootSequenceOptions = {
  onBootStart: () => void;
  onBootEnd: () => void;
  onUser: (user: AuthUser | null) => void;
  loadProjects: () => Promise<void>;
  timeoutMs?: number;
};

export const useBootSequence = ({
  onBootStart,
  onBootEnd,
  onUser,
  loadProjects,
  timeoutMs = 8000,
}: BootSequenceOptions) => {
  useEffect(() => {
    let mounted = true;
    let timedOut = false;
    let timeoutId: number | null = null;
    const init = async () => {
      onBootStart();
      timeoutId = window.setTimeout(() => {
        if (!mounted) return;
        timedOut = true;
        onUser(null);
        onBootEnd();
      }, timeoutMs);
      try {
        const user = await fetchMe();
        if (!mounted || timedOut) return;
        onUser(user);
        await loadProjects();
      } catch {
        if (!mounted || timedOut) return;
        onUser(null);
      } finally {
        if (!timedOut) {
          if (timeoutId !== null) window.clearTimeout(timeoutId);
          if (mounted) onBootEnd();
        }
      }
    };
    init();
    return () => {
      mounted = false;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [loadProjects, onBootEnd, onBootStart, onUser, timeoutMs]);
};
