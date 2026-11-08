import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import type { AudienceFitCheckDto, AudienceFitRequest, AudienceProfileResponseDto, AudienceProfileUpdate } from '@/api/types';
import { hasPending } from './audienceFit';

type Result = { ok: true } | { ok: false; error: string };

export interface AudienceProfileState {
  response?: AudienceProfileResponseDto;
  loading: boolean;
  error?: string;
  /** DevRel only: saves a manual profile. */
  save: (update: AudienceProfileUpdate) => Promise<Result>;
  /** DevRel only: drops the manual profile and infers it again from the event data. */
  refresh: () => Promise<Result>;
}

/** Expected audience of an event. The first request may take a while: the backend asks the LLM. */
export function useAudienceProfile(eventId: string): AudienceProfileState {
  const [state, setState] = useState<{ eventId: string; response?: AudienceProfileResponseDto; error?: string }>({ eventId });

  useEffect(() => {
    let cancelled = false;
    api.audienceProfile(eventId)
      .then((response) => {
        if (!cancelled) setState({ eventId, response });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ eventId, error: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const apply = useCallback(async (call: () => Promise<AudienceProfileResponseDto>): Promise<Result> => {
    try {
      const response = await call();
      setState({ eventId, response });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }, [eventId]);

  const current = state.eventId === eventId ? state : { eventId };
  return {
    response: current.response,
    error: current.error,
    loading: !current.response && !current.error,
    save: (update) => apply(() => api.updateAudienceProfile(eventId, update)),
    refresh: () => apply(() => api.refreshAudienceProfile(eventId)),
  };
}

export interface AudienceFitFilter {
  eventId?: string;
  talkId?: string;
  mediaId?: string;
}

export interface AudienceFitChecksState {
  checks: AudienceFitCheckDto[];
  loading: boolean;
  error?: string;
  /** Starts a check; the list refreshes until it is done. */
  request: (body: AudienceFitRequest) => Promise<Result>;
  reload: () => void;
}

const POLL_MS = 4000;

/**
 * Audience fit checks: the speaker's own, or the ready ones of a DevRel's event (with `eventId`).
 * While any check is pending the list is polled. With `enabled: false` nothing is requested.
 */
export function useAudienceFitChecks(filter: AudienceFitFilter = {}, enabled = true): AudienceFitChecksState {
  const { eventId, talkId, mediaId } = filter;
  const [checks, setChecks] = useState<AudienceFitCheckDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      api.audienceFitChecks({ eventId, talkId, mediaId })
        .then((loaded) => {
          if (cancelled) return;
          setChecks(loaded);
          setError(undefined);
          setLoading(false);
          if (hasPending(loaded)) timer = setTimeout(load, POLL_MS);
        })
        .catch((loadError: unknown) => {
          if (cancelled) return;
          setError(errorMessage(loadError));
          setLoading(false);
        });
    };
    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [eventId, talkId, mediaId, enabled, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const request = useCallback(async (body: AudienceFitRequest): Promise<Result> => {
    try {
      const created = await api.requestAudienceFit(body);
      setChecks((current) => [created, ...current]);
      reload();
      return { ok: true };
    } catch (requestError) {
      return { ok: false, error: errorMessage(requestError) };
    }
  }, [reload]);

  return { checks, loading: enabled && loading, error, request, reload };
}

/** Ready checks of several DevRel events at once, e.g. for the incoming applications list. */
export function useEventsFitChecks(eventIds: ReadonlyArray<string>): AudienceFitCheckDto[] {
  const key = [...new Set(eventIds)].sort().join(',');
  const [state, setState] = useState<{ key: string; checks: AudienceFitCheckDto[] }>({ key: '', checks: [] });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    Promise.all(key.split(',').map((eventId) => api.audienceFitChecks({ eventId }).catch(() => [])))
      .then((lists) => {
        if (!cancelled) setState({ key, checks: lists.flat() });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state.key === key ? state.checks : [];
}
