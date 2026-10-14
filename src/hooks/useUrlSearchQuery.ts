import { useState } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Search text kept in local state (so typing stays responsive) and mirrored to `?<param>=`
 * so a search can be linked to. Reading the input value straight from the URL drops keystrokes.
 */
export function useUrlSearchQuery(param = 'q'): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(() => params.get(param) ?? '');

  const changeQuery = (value: string) => {
    setQuery(value);
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(param, value);
      else next.delete(param);
      return next;
    }, { replace: true });
  };

  return [query, changeQuery];
}
