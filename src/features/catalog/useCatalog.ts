import { useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import { toCatalogProfile } from '@/api/mappers';
import type { UserProfile } from '@/types/domain';

export interface CatalogSpeaker extends UserProfile {
  feedbackCount: number;
  speechCount: number;
}

export interface CatalogResult {
  speakers: CatalogSpeaker[];
  loading: boolean;
  error?: string;
}

/** DevRel catalog search; the backend matches name, competencies and city. */
export function useCatalogSpeakers(query: string): CatalogResult {
  const [result, setResult] = useState<CatalogResult>({ speakers: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    // Small delay so typing does not send a request per keystroke.
    const timer = setTimeout(() => {
      api.catalog(query.trim())
        .then((speakers) => {
          if (!cancelled) {
            setResult({
              speakers: speakers.map((speaker) => ({
                ...toCatalogProfile(speaker),
                feedbackCount: speaker.feedbackCount,
                speechCount: speaker.speechCount,
              })),
              loading: false,
            });
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) setResult({ speakers: [], loading: false, error: errorMessage(error) });
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return result;
}
