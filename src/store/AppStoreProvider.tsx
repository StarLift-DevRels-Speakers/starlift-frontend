import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import {
  formatCode,
  toApplication,
  toEvent,
  toFeedback,
  toInvitation,
  toMediaFile,
  toNotification,
  toPlans,
  toProfile,
  toProfilePatch,
  toSpeech,
  toTalk,
} from '@/api/mappers';
import { roleOf, type SessionUser } from '@/auth/session';
import { Alert, Button, Stack } from '@/components/ui';
import { aiPayment, aiRight, isChargedOutcome } from '@/features/ai/aiMatch';
import { hasRight, isSubscriptionActive } from '@/features/billing/access';
import { rightLabels, rightPrices, subscriptions } from '@/features/billing/pricing';
import type { Role } from '@/types/role';
import { AppActionsContext, AppStateContext, type ActionResult, type AppActions } from './appContext';
import { initialLocalDemo, loadLocalDemo, saveLocalDemo, type AppState, type LocalDemo, type RemoteSlice } from './appState';
import styles from './AppStoreProvider.module.scss';

type RemoteState = Omit<AppState, 'role' | 'billing' | 'aiResults'>;

const SPEAKER_SLICES: RemoteSlice[] = [
  'profile', 'talks', 'speeches', 'media', 'events', 'applications', 'invitations', 'feedback', 'notifications', 'plans',
];
const DEVREL_SLICES: RemoteSlice[] = ['profile', 'events', 'applications', 'invitations', 'notifications'];

/** Data other users change: refreshed in the background while the tab is visible. */
const LIVE_SLICES: Record<Role, RemoteSlice[]> = {
  speaker: ['events', 'applications', 'invitations', 'feedback', 'notifications'],
  devrel: ['events', 'applications', 'invitations', 'notifications'],
};
const LIVE_REFRESH_MS = 60_000;

const ok: ActionResult = { ok: true };
const fail = (error: unknown): ActionResult => ({ ok: false, error: errorMessage(error) });

function createId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

/** Loads one slice of the user's data from the backend. */
async function fetchSlice(slice: RemoteSlice, userId: number): Promise<Partial<RemoteState>> {
  switch (slice) {
    case 'profile': return { profile: toProfile((await api.me()).me) };
    case 'talks': return { talks: (await api.speakerTalks()).map(toTalk) };
    case 'speeches': return { speeches: (await api.speeches(userId)).map(toSpeech) };
    case 'media': return { media: (await api.mediaFiles()).map(toMediaFile) };
    case 'events': return { events: (await api.events()).map(toEvent) };
    case 'applications': return { applications: (await api.applications()).map(toApplication) };
    case 'invitations': return { invitations: (await api.invitations()).map(toInvitation) };
    case 'feedback': return { feedback: (await api.myFeedback()).map(toFeedback) };
    case 'notifications': return { notifications: (await api.notifications()).map(toNotification) };
    case 'plans': return { plans: toPlans(await api.producerPlans()) };
  }
}

function emptyRemote(user: SessionUser): RemoteState {
  return {
    profile: {
      id: String(user.id),
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
      position: '', company: '', city: '', skills: '', preferences: '', about: '',
    },
    talks: [], speeches: [], media: [], events: [], applications: [], invitations: [], feedback: [], notifications: [], plans: [],
  };
}

/**
 * Store of the signed-in user: loads their data from the backend and runs actions through the API.
 * Test purchases and AI matching stay a browser-side demo until billing exists on the backend.
 */
export function AppStoreProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  const role = roleOf(user);
  const userId = user.id;
  const [remote, setRemote] = useState<RemoteState>(() => emptyRemote(user));
  const [demo, setDemo] = useState<LocalDemo>(() => loadLocalDemo(userId));
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string>();
  // Actions read the latest data synchronously, so several actions in one handler see each other's results.
  const latestDemo = useRef(demo);
  const latestRemote = useRef(remote);
  // Number of the latest request per slice: an older response that arrives later is dropped.
  const requestNumbers = useRef<Partial<Record<RemoteSlice, number>>>({});

  const reload = useCallback(async (slices: RemoteSlice[]) => {
    const numbers = slices.map((slice) => {
      const number = (requestNumbers.current[slice] ?? 0) + 1;
      requestNumbers.current[slice] = number;
      return number;
    });
    const parts = await Promise.all(slices.map((slice) => fetchSlice(slice, userId)));
    const fresh = parts.filter((_, index) => requestNumbers.current[slices[index]] === numbers[index]);
    setRemote((current) => {
      const next = Object.assign({ ...current }, ...fresh) as RemoteState;
      latestRemote.current = next;
      return next;
    });
  }, [userId]);

  const loadAll = useCallback(() => {
    reload(role === 'speaker' ? SPEAKER_SLICES : DEVREL_SLICES)
      .then(() => setStatus('ready'))
      .catch((error: unknown) => {
        setLoadError(errorMessage(error));
        setStatus('error');
      });
  }, [reload, role]);

  useEffect(loadAll, [loadAll]);

  // New applications, answers and notifications from other users show up without a page reload.
  useEffect(() => {
    if (status !== 'ready') return;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      // Background refresh is best effort: the next one or any action catches up.
      reload(LIVE_SLICES[role]).catch(() => undefined);
    };
    const timer = setInterval(refresh, LIVE_REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [status, role, reload]);

  const retry = () => {
    setStatus('loading');
    loadAll();
  };

  const updateDemo = (update: (current: LocalDemo) => LocalDemo) => {
    const next = update(latestDemo.current);
    latestDemo.current = next;
    setDemo(next);
    saveLocalDemo(userId, next);
  };

  /** Runs an API call, then refreshes the slices it changes (notifications always). */
  const mutate = async (call: () => Promise<unknown>, slices: RemoteSlice[]): Promise<ActionResult> => {
    try {
      await call();
    } catch (error) {
      return fail(error);
    }
    try {
      await reload([...slices, 'notifications']);
    } catch {
      // The change is saved; the list catches up on the next action or reload.
    }
    return ok;
  };

  const actions: AppActions = {
    submitApplication: (eventId, talkId) => mutate(() => api.submitApplication(eventId, talkId), ['applications']),
    requestTalkChange: (applicationId, talkId) => mutate(() => api.requestTalkChange(applicationId, talkId), ['applications']),
    answerTalkChange: (applicationId, approved) => mutate(() => api.answerTalkChange(applicationId, approved), ['applications']),
    decideApplication: (applicationId, status) => mutate(() => api.decideApplication(applicationId, status), ['applications']),
    sendInvitation: (eventId, speakerId, topic) => {
      if (!topic.trim()) return Promise.resolve({ ok: false, error: 'Укажите предлагаемую тему' });
      return mutate(() => api.sendInvitation(eventId, Number(speakerId), topic.trim()), ['invitations']);
    },
    answerInvitation: (invitationId, answer) => mutate(() => api.answerInvitation(invitationId, answer), ['invitations']),

    saveEvent: (input, eventId) => {
      const body = {
        name: input.name.trim(),
        date: input.date,
        cfp: input.cfp || null,
        city: input.city.trim(),
        format: formatCode(input.format),
        topic: input.topic.trim(),
        audience: input.audience.trim(),
        description: input.description.trim(),
      };
      return mutate(() => (eventId ? api.updateEvent(eventId, body) : api.createEvent(body)), ['events']);
    },

    publishEvent: async (eventId) => {
      const billing = latestDemo.current.billing.devrel;
      if (!hasRight(billing, 'publication')) return { ok: false, error: 'Нужен платный доступ', reason: 'paywall' };
      const result = await mutate(() => api.publishEvent(eventId), ['events']);
      if (result.ok && !isSubscriptionActive(billing)) {
        updateDemo((current) => {
          const devrel = current.billing.devrel;
          return {
            ...current,
            billing: { ...current.billing, devrel: { ...devrel, rights: { ...devrel.rights, publication: devrel.rights.publication - 1 } } },
          };
        });
      }
      return result;
    },

    purchase: (purchaseRole, type) => {
      const at = new Date().toISOString();
      updateDemo((current) => {
        const billing = current.billing[purchaseRole];
        const next = type === 'subscription'
          ? (() => {
              const expires = new Date();
              expires.setMonth(expires.getMonth() + 1);
              const { title, price } = subscriptions[purchaseRole];
              return {
                ...billing,
                expires: expires.toISOString(),
                history: [{ id: createId(), title: `Подписка «${title}»`, price, at, demo: true as const }, ...billing.history],
              };
            })()
          : {
              ...billing,
              rights: { ...billing.rights, [type]: billing.rights[type] + 1 },
              history: [{ id: createId(), title: rightLabels[type], price: rightPrices[type], at, demo: true as const }, ...billing.history],
            };
        return { ...current, billing: { ...current.billing, [purchaseRole]: next } };
      });
      return ok;
    },

    runAiMatch: (matchRole, topics, outcome) => {
      if (!topics.trim()) return { ok: false, error: 'Укажите тематику для подбора' };
      const payment = aiPayment(latestDemo.current.billing[matchRole], matchRole);
      if (!payment) return { ok: false, error: 'Нужен платный доступ', reason: 'paywall' };

      const charge = isChargedOutcome(outcome) && payment !== 'subscription' ? payment : null;
      updateDemo((current) => {
        const billing = current.billing[matchRole];
        const right = aiRight[matchRole];
        return {
          billing: {
            ...current.billing,
            [matchRole]: {
              ...billing,
              trialUsed: billing.trialUsed || charge === 'trial',
              rights: charge === 'right' ? { ...billing.rights, [right]: billing.rights[right] - 1 } : billing.rights,
            },
          },
          aiResults: { ...current.aiResults, [matchRole]: { kind: outcome, at: new Date().toISOString(), topics: topics.trim() } },
        };
      });
      return ok;
    },

    saveTalk: (input, talkId) => {
      if (!input.name.trim() || !input.topic.trim()) return Promise.resolve({ ok: false, error: 'Укажите название и тему' });
      const body = { name: input.name.trim(), topic: input.topic.trim(), description: input.description.trim() };
      return mutate(() => (talkId ? api.updateSpeakerTalk(talkId, body) : api.createSpeakerTalk(body)), ['talks']);
    },

    addSpeech: (input) => {
      const talk = latestRemote.current.talks.find((item) => item.id === input.talkId);
      if (!talk) return Promise.resolve({ ok: false, error: 'Сначала создайте доклад' });
      if (!input.event.trim() || !input.date) return Promise.resolve({ ok: false, error: 'Укажите мероприятие и дату' });
      const at = `${input.date}T10:00:00`;
      return mutate(() => api.createSpeech({
        speakerId: userId,
        topic: talk.name,
        talkDate: at,
        conferenceType: input.conferenceType,
        format: input.format,
        activityName: input.event.trim(),
        activityDate: at,
        speakerTalkId: talk.id,
      }), ['speeches']);
    },

    buildProducerPlan: async () => {
      if (!isSubscriptionActive(latestDemo.current.billing.speaker)) {
        return { ok: false, error: 'Нужна подписка Спикера', reason: 'paywall' };
      }
      // Readiness is decided by the backend: with too little data it answers insufficient_data without calling the model.
      let plan: Awaited<ReturnType<typeof api.buildProducerPlan>>;
      try {
        plan = await api.buildProducerPlan();
      } catch (error) {
        return fail(error);
      }
      // The plan is saved even if the list fails to refresh right now.
      await reload(['plans', 'notifications']).catch(() => undefined);
      if (plan.status === 'ready') return ok;
      const error = plan.message ?? 'Не удалось сформировать план. Попробуйте еще раз позже.';
      return plan.status === 'insufficient_data' ? { ok: false, error, reason: 'not_ready' } : { ok: false, error };
    },

    addMedia: ({ file, talkId }) => mutate(() => api.uploadMedia(file, talkId), ['media']),
    deleteMedia: (fileId) => mutate(() => api.deleteMedia(fileId), ['media']),

    saveProfile: (input) => {
      if (!input.name.trim()) return Promise.resolve({ ok: false, error: 'Введите имя' });
      return mutate(() => api.patchMe(toProfilePatch(input)), ['profile']);
    },

    markNotificationsRead: (notificationId) => mutate(() => api.markNotificationsRead(notificationId), []),

    resetDemoBilling: () => {
      updateDemo(() => initialLocalDemo());
      return ok;
    },
  };

  if (status !== 'ready') {
    return (
      <div className={styles.screen}>
        {status === 'loading' ? (
          <p className={styles.loading} role="status">Загрузка данных…</p>
        ) : (
          <Stack gap={3} className={styles.error}>
            <Alert tone="danger" title="Не удалось загрузить данные">{loadError}</Alert>
            <div>
              <Button onClick={retry}>Повторить</Button>
            </div>
          </Stack>
        )}
      </div>
    );
  }

  return (
    <AppStateContext value={{ ...remote, role, billing: demo.billing, aiResults: demo.aiResults }}>
      <AppActionsContext value={actions}>{children}</AppActionsContext>
    </AppStateContext>
  );
}
