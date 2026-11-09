import { useEffect } from 'react';
import { api } from '@/api/endpoints';
import { useToast } from '@/components/ui';
import { todayKey } from '@/utils/date';

const storageKey = (userId: string) => `starlift-check-in-${userId}`;

/**
 * Daily check-in of the competition mode: the streak counts only marked days, so the speaker's
 * workspace marks the day once on opening. The backend ignores repeats; the local key only saves requests.
 */
export function useDailyCheckIn(userId: string, enabled: boolean) {
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;
    const today = todayKey();
    try {
      if (localStorage.getItem(storageKey(userId)) === today) return;
    } catch {
      // Storage unavailable: just ask the backend.
    }
    let cancelled = false;
    api.checkIn()
      .then((result) => {
        try {
          localStorage.setItem(storageKey(userId), today);
        } catch {
          // Nothing to remember without storage.
        }
        if (!cancelled && result.awardedPoints > 0) toast(`Отметка дня: +${result.awardedPoints} в соревновании`);
      })
      .catch(() => {
        // Check-in is a bonus; a failure must not disturb the workspace.
      });
    return () => {
      cancelled = true;
    };
  }, [userId, enabled, toast]);
}
