import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import type { AudioAnalysisSummaryDto } from '@/api/types';
import { useAuth } from '@/auth/useAuth';
import { isAnalysing } from './audioAnalysis';

/** Lightweight library statuses. Full transcripts are fetched only when opening a result. */
export function useAudioAnalyses(enabled: boolean) {
  const { session } = useAuth();
  const owner = session?.user.id;
  const [state, setState] = useState<{ owner?: number; jobs: AudioAnalysisSummaryDto[]; error?: string }>({ jobs: [] });
  const [version, setVersion] = useState(0);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || owner == null) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const jobs = await api.audioAnalyses();
        if (cancelled) return;
        setState({ owner, jobs });
        if (jobs.some((job) => isAnalysing(job.status))) timer = setTimeout(load, 4000);
      } catch (error) {
        if (cancelled) return;
        setState((current) => ({ owner, jobs: current.owner === owner ? current.jobs : [], error: errorMessage(error) }));
        timer = setTimeout(load, 8000);
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, owner, version]);

  const start = async (mediaId: string): Promise<void> => {
    if (startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    try {
      await api.startAudioAnalysis(mediaId);
      // Invalidate an older in-flight list request before showing the newly created job.
      reload();
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  const current = enabled && state.owner === owner ? state : undefined;
  return {
    jobs: current?.jobs ?? [],
    error: current?.error,
    loading: enabled && !current,
    starting, start, reload,
  };
}
