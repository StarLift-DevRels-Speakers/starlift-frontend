import { useEffect, useRef, useState, type ReactNode } from 'react';
import { aiPayment, aiRight, isChargedOutcome } from '@/features/ai/aiMatch';
import { applicationStatuses, canRequestTalkChange, isTalkTaken } from '@/features/applications/applicationStatus';
import { hasRight, isSubscriptionActive } from '@/features/billing/access';
import { rightLabels, rightPrices, subscriptions } from '@/features/billing/pricing';
import { hasPendingInvitation, isCfpOpen, isEventPast, isSpeakerConfirmed } from '@/features/events/events';
import { feedbackQuestions } from '@/features/feedback/questions';
import { buildPlanContent, collectFacts } from '@/features/producer/producer';
import type { Feedback } from '@/types/domain';
import { todayKey } from '@/utils/date';
import { DemoActionsContext, DemoStateContext, type DemoActions } from './demoContext';
import { createId, demoReducer, notificationOf, type DemoAction } from './demoReducer';
import { createInitialState, loadState, parseState, saveState, STORAGE_KEY, type DemoState } from './demoState';

/**
 * Demo backend: holds the shared state, applies the mockup's business rules and persists
 * to localStorage (shared between tabs). Replace with API calls when the backend is connected.
 */
export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState);
  // Actions read and update the latest state synchronously, so several actions
  // in one handler (e.g. purchase, then publish) see each other's results.
  const latest = useRef(state);

  const replaceState = (next: DemoState) => {
    latest.current = next;
    setState(next);
  };

  const dispatch = (action: DemoAction) => {
    replaceState(demoReducer(latest.current, action));
    saveState(latest.current);
  };

  // Changes made in another tab (e.g. a listener submits the public form) show up here.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      const next = parseState(event.newValue);
      if (next) replaceState(next);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const actions: DemoActions = {
    submitApplication: (eventId, talkId) => {
      const event = latest.current.events.find((item) => item.id === eventId && item.state === 'published');
      const talk = latest.current.talks.find((item) => item.id === talkId);
      if (!event || !talk) return { ok: false, error: 'Недоступное мероприятие или доклад' };
      if (!isCfpOpen(event)) return { ok: false, error: 'Прием заявок завершен' };
      if (isSpeakerConfirmed(eventId, latest.current.applications, latest.current.invitations)) {
        return { ok: false, error: 'Вы уже участвуете в этом мероприятии' };
      }
      if (hasPendingInvitation(eventId, latest.current.invitations)) {
        return { ok: false, error: 'У вас есть приглашение на это мероприятие — ответьте на него' };
      }
      if (latest.current.applications.some((item) => item.eventId === eventId && (item.talkId === talkId || item.talkChange?.talkId === talkId))) {
        return { ok: false, error: 'Заявка с этим докладом уже отправлена' };
      }

      dispatch({
        type: 'application/submitted',
        application: { id: createId(), eventId, talkId, topic: talk.name, at: todayKey(), status: 'sent' },
      });
      if (event.owner === 'devrel') {
        dispatch({ type: 'notification/added', role: 'devrel', notification: notificationOf(`Поступила заявка на ${event.name}`) });
      }
      return { ok: true };
    },

    requestTalkChange: (applicationId, talkId) => {
      const application = latest.current.applications.find((item) => item.id === applicationId);
      if (!application) return { ok: false, error: 'Заявка не найдена' };
      const event = latest.current.events.find((item) => item.id === application.eventId);
      if (application.talkChange) return { ok: false, error: 'Запрос на смену доклада уже ожидает ответа DevRel' };
      if (!canRequestTalkChange(application, event)) {
        return { ok: false, error: 'Сменить доклад можно в заявке на рассмотрении (пока открыт CFP) или в принятой заявке' };
      }
      const talk = latest.current.talks.find((item) => item.id === talkId);
      if (!talk) return { ok: false, error: 'Доклад не найден' };
      if (talk.id === application.talkId) return { ok: false, error: 'Выберите другой доклад' };
      if (isTalkTaken(application, talkId, latest.current.applications)) {
        return { ok: false, error: 'Заявка с этим докладом уже отправлена' };
      }

      dispatch({ type: 'application/talkChangeRequested', applicationId, talk });
      if (event?.owner === 'devrel') {
        dispatch({
          type: 'notification/added',
          role: 'devrel',
          notification: notificationOf(`Запрошена смена доклада в заявке на «${event.name}»: «${application.topic}» → «${talk.name}»`),
        });
      }
      return { ok: true };
    },

    answerTalkChange: (applicationId, approved) => {
      const application = latest.current.applications.find((item) => item.id === applicationId);
      const event = application && latest.current.events.find((item) => item.id === application.eventId);
      if (!application || event?.owner !== 'devrel') return { ok: false, error: 'Заявка не найдена' };
      const change = application.talkChange;
      if (!change) return { ok: false, error: 'Запроса на смену доклада нет' };
      // Rejecting is always possible; approving needs the talk to still exist and stay unique for the event.
      if (approved) {
        if (isEventPast(event)) return { ok: false, error: 'Мероприятие уже прошло' };
        if (!latest.current.talks.some((talk) => talk.id === change.talkId)) return { ok: false, error: 'Доклад больше не существует' };
        if (isTalkTaken(application, change.talkId, latest.current.applications)) {
          return { ok: false, error: 'С этим докладом уже есть другая заявка' };
        }
      }

      dispatch({ type: 'application/talkChangeAnswered', applicationId, approved });
      dispatch({
        type: 'notification/added',
        role: 'speaker',
        notification: notificationOf(`Смена доклада в заявке на «${event.name}»: ${approved ? 'подтверждена' : 'отклонена'}`),
      });
      return { ok: true };
    },

    decideApplication: (applicationId, status) => {
      const application = latest.current.applications.find((item) => item.id === applicationId);
      const event = application && latest.current.events.find((item) => item.id === application.eventId);
      if (!application || event?.owner !== 'devrel') return { ok: false, error: 'Заявка не найдена' };
      // A reserved application can still be accepted or rejected later.
      if (application.status !== 'sent' && application.status !== 'reserve') {
        return { ok: false, error: 'Решение по заявке уже принято' };
      }
      if (application.status === status) return { ok: false, error: 'Заявка уже в этом статусе' };
      if (application.talkChange) return { ok: false, error: 'Сначала ответьте на запрос смены доклада' };
      if (isEventPast(event)) return { ok: false, error: 'Мероприятие уже прошло' };
      if (status === 'accepted' && isSpeakerConfirmed(event.id, latest.current.applications, latest.current.invitations)) {
        return { ok: false, error: 'Спикер уже участвует в этом мероприятии' };
      }

      dispatch({ type: 'application/decided', applicationId, status });
      dispatch({ type: 'notification/added', role: 'speaker', notification: notificationOf(`Заявка на «${event.name}»: ${applicationStatuses[status].label.toLowerCase()}`) });
      return { ok: true };
    },

    sendInvitation: (eventId, topic) => {
      const event = latest.current.events.find((item) => item.id === eventId);
      if (event?.owner !== 'devrel' || event.state !== 'published') {
        return { ok: false, error: 'Выберите свое опубликованное мероприятие' };
      }
      if (isEventPast(event)) return { ok: false, error: 'Мероприятие уже прошло' };
      if (isSpeakerConfirmed(eventId, latest.current.applications, latest.current.invitations)) {
        return { ok: false, error: 'Спикер уже участвует в этом мероприятии' };
      }
      if (!topic.trim()) return { ok: false, error: 'Укажите предлагаемую тему' };
      if (hasPendingInvitation(eventId, latest.current.invitations)) {
        return { ok: false, error: 'Приглашение на это мероприятие уже ожидает ответа Спикера' };
      }

      dispatch({
        type: 'invitation/sent',
        invitation: { id: createId(), eventId, status: 'sent', date: todayKey(), topic: topic.trim() },
      });
      dispatch({ type: 'notification/added', role: 'speaker', notification: notificationOf('Новое приглашение выступить') });
      return { ok: true };
    },

    answerInvitation: (invitationId, answer) => {
      const invitation = latest.current.invitations.find((item) => item.id === invitationId);
      if (!invitation) return { ok: false, error: 'Приглашение не найдено' };
      if (invitation.status !== 'sent') return { ok: false, error: 'Ответ на приглашение уже дан' };

      const event = latest.current.events.find((item) => item.id === invitation.eventId);
      // Declining is always possible; accepting only while the speaker can still take part.
      if (answer === 'accepted' && event) {
        if (isEventPast(event)) return { ok: false, error: 'Мероприятие уже прошло' };
        if (isSpeakerConfirmed(event.id, latest.current.applications, latest.current.invitations)) {
          return { ok: false, error: 'Вы уже участвуете в этом мероприятии' };
        }
      }
      const result = answer === 'accepted' ? 'принято' : 'отклонено';
      dispatch({ type: 'invitation/answered', invitationId, status: answer });
      dispatch({
        type: 'notification/added',
        role: 'devrel',
        notification: notificationOf(`${latest.current.profiles.speaker.name}: приглашение${event ? ` на «${event.name}»` : ''} ${result}`),
      });
      return { ok: true };
    },

    saveEvent: (input, eventId) => {
      const existing = eventId ? latest.current.events.find((item) => item.id === eventId) : undefined;
      if (eventId && existing?.owner !== 'devrel') return { ok: false, error: 'Нет доступа к чужому мероприятию' };
      if (!input.name.trim() || !input.topic.trim() || !input.date) return { ok: false, error: 'Заполните обязательные поля' };
      if (input.cfp && input.cfp > input.date) {
        return { ok: false, error: 'Дедлайн CFP не может быть позже даты мероприятия' };
      }
      // A past date that was not changed may stay, so a past event can still be edited.
      const today = todayKey();
      if (input.date < today && input.date !== existing?.date) {
        return { ok: false, error: 'Дата мероприятия не может быть в прошлом' };
      }
      if (input.cfp && input.cfp < today && input.cfp !== existing?.cfp) {
        return { ok: false, error: 'Дедлайн CFP не может быть в прошлом' };
      }

      dispatch({
        type: 'event/saved',
        event: {
          ...input,
          id: existing?.id ?? createId(),
          owner: 'devrel',
          state: existing?.state ?? 'draft',
        },
      });
      return { ok: true };
    },

    publishEvent: (eventId) => {
      const event = latest.current.events.find((item) => item.id === eventId);
      if (event?.owner !== 'devrel') return { ok: false, error: 'Нет доступа к мероприятию' };
      if (event.state === 'published') return { ok: false, error: 'Мероприятие уже опубликовано' };
      const billing = latest.current.billing.devrel;
      if (!hasRight(billing, 'publication')) return { ok: false, error: 'Нужен платный доступ', reason: 'paywall' };

      dispatch({ type: 'event/published', eventId, spentRight: !isSubscriptionActive(billing) });
      dispatch({ type: 'notification/added', role: 'devrel', notification: notificationOf(`Мероприятие опубликовано: ${event.name}`) });
      return { ok: true };
    },

    purchase: (role, type) => {
      const at = new Date().toISOString();
      if (type === 'subscription') {
        const expires = new Date();
        expires.setMonth(expires.getMonth() + 1);
        const { title, price } = subscriptions[role];
        dispatch({
          type: 'billing/subscribed',
          role,
          expires: expires.toISOString(),
          purchase: { id: createId(), title: `Подписка «${title}»`, price, at, demo: true },
        });
        dispatch({ type: 'notification/added', role, notification: notificationOf('Тестовая подписка оформлена') });
      } else {
        dispatch({
          type: 'billing/rightPurchased',
          role,
          right: type,
          purchase: { id: createId(), title: rightLabels[type], price: rightPrices[type], at, demo: true },
        });
        dispatch({ type: 'notification/added', role, notification: notificationOf('Тестовое приобретение успешно') });
      }
      return { ok: true };
    },

    runAiMatch: (role, topics, outcome) => {
      if (!topics.trim()) return { ok: false, error: 'Укажите тематику для подбора' };
      const payment = aiPayment(latest.current.billing[role], role);
      if (!payment) return { ok: false, error: 'Нужен платный доступ', reason: 'paywall' };

      const charged = isChargedOutcome(outcome) && payment !== 'subscription';
      dispatch({
        type: 'ai/completed',
        role,
        right: aiRight[role],
        charge: charged ? payment : null,
        result: { kind: outcome, at: new Date().toISOString(), topics: topics.trim() },
      });
      return { ok: true };
    },

    submitFeedback: (token, answers, comment) => {
      if (token !== latest.current.feedbackToken) return { ok: false, error: 'Недействительная ссылка' };
      const complete = feedbackQuestions.every((question) => [0, 1, 2].includes(answers[question.key] ?? -1));
      if (!complete) return { ok: false, error: 'Ответьте на все пять вопросов' };

      dispatch({
        type: 'feedback/submitted',
        feedback: { id: createId(), at: todayKey(), answers: answers as Feedback['answers'], comment: comment.trim() },
      });
      dispatch({ type: 'notification/added', role: 'speaker', notification: notificationOf('Новый отзыв слушателя') });
      return { ok: true };
    },

    saveTalk: (input, talkId) => {
      if (!input.name.trim() || !input.topic.trim()) return { ok: false, error: 'Укажите название и тему' };
      if (talkId && !latest.current.talks.some((talk) => talk.id === talkId)) return { ok: false, error: 'Доклад не найден' };

      dispatch({
        type: 'talk/saved',
        talk: { id: talkId ?? createId(), name: input.name.trim(), topic: input.topic.trim(), description: input.description.trim() },
      });
      return { ok: true };
    },

    addSpeech: (input) => {
      if (!latest.current.talks.some((talk) => talk.id === input.talkId)) return { ok: false, error: 'Сначала создайте доклад' };
      if (!input.event.trim() || !input.date) return { ok: false, error: 'Укажите мероприятие и дату' };

      dispatch({ type: 'speech/added', speech: { ...input, id: createId(), event: input.event.trim() } });
      return { ok: true };
    },

    buildProducerPlan: () => {
      if (!isSubscriptionActive(latest.current.billing.speaker)) {
        return { ok: false, error: 'Нужна подписка Спикера', reason: 'paywall' };
      }
      const facts = collectFacts(latest.current);
      if (!facts.ready) {
        return { ok: false, error: 'Недостаточно исходных данных: нужны минимум три отзыва за год, доклад и выступление' };
      }

      dispatch({
        type: 'plan/built',
        plan: { ...buildPlanContent(facts), id: createId(), version: latest.current.plans.length + 1, at: todayKey() },
      });
      dispatch({
        type: 'notification/added',
        role: 'speaker',
        notification: notificationOf('ИИ-продюсер сформировал новую демонстрационную версию плана'),
      });
      return { ok: true };
    },

    addMedia: (input) => {
      if (!input.name.trim()) return { ok: false, error: 'Выберите файл' };
      if (input.talkId && !latest.current.talks.some((talk) => talk.id === input.talkId)) {
        return { ok: false, error: 'Доклад не найден' };
      }

      dispatch({ type: 'media/added', file: { ...input, id: createId(), name: input.name.trim() } });
      return { ok: true };
    },

    deleteMedia: (fileId) => {
      if (!latest.current.media.some((file) => file.id === fileId)) return { ok: false, error: 'Файл не найден' };

      dispatch({ type: 'media/deleted', fileId });
      return { ok: true };
    },

    saveProfile: (role, input) => {
      const name = input.name.trim();
      if (!name) return { ok: false, error: 'Введите имя' };

      const current = latest.current.profiles[role];
      dispatch({
        type: 'profile/saved',
        role,
        profile: {
          id: current.id,
          name,
          position: input.position.trim(),
          company: input.company.trim(),
          city: input.city.trim(),
          skills: input.skills.trim(),
          preferences: input.preferences.trim(),
          about: input.about.trim(),
        },
      });
      return { ok: true };
    },

    markNotificationsRead: (role, notificationId) => {
      dispatch({ type: 'notifications/read', role, notificationId });
      return { ok: true };
    },

    resetDemo: () => {
      replaceState(createInitialState());
      saveState(latest.current);
      return { ok: true };
    },
  };

  return (
    <DemoStateContext value={state}>
      <DemoActionsContext value={actions}>{children}</DemoActionsContext>
    </DemoStateContext>
  );
}
