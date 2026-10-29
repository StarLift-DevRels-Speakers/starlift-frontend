import { useId, useState, type FormEvent } from 'react';
import { rolePath } from '@/app/navigation';
import { Alert, Button, Input, LinkButton, Modal, Select, Stack, useToast } from '@/components/ui';
import { useCatalogSpeakers } from '@/features/catalog/useCatalog';
import { isEventPast, isSpeakerConfirmed } from '@/features/events/events';
import { useAppActions, useAppState } from '@/store/useAppStore';

export interface InviteSpeakerModalProps {
  /** Speaker to invite; without it the DevRel picks one from the catalog. */
  speaker?: { id: string; name: string };
  /** Suggested topic, e.g. one of the speaker's talks. */
  defaultTopic?: string;
  onClose: () => void;
}

/** DevRel invites a speaker to one of their published events. */
export function InviteSpeakerModal({ speaker, defaultTopic = '', onClose }: InviteSpeakerModalProps) {
  const { events, applications, invitations } = useAppState();
  const { sendInvitation } = useAppActions();
  const { toast } = useToast();
  const formId = useId();
  // The catalog is needed only to pick a speaker.
  const catalog = useCatalogSpeakers('', !speaker);
  const [speakerId, setSpeakerId] = useState(speaker?.id ?? '');
  const chosenSpeakerId = speaker?.id ?? (speakerId || catalog.speakers[0]?.id || '');

  const ownPublished = events.filter((event) => event.owner === 'devrel' && event.state === 'published');
  // Past events and events the speaker already takes part in are not offered.
  const available = ownPublished.filter(
    (event) => !isEventPast(event) && !isSpeakerConfirmed(event.id, applications, invitations, chosenSpeakerId),
  );
  const [eventId, setEventId] = useState('');
  const chosenEventId = available.some((event) => event.id === eventId) ? eventId : available[0]?.id ?? '';
  const [topic, setTopic] = useState(defaultTopic);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!chosenSpeakerId) {
      setError('Выберите спикера');
      return;
    }
    setPending(true);
    const result = await sendInvitation(chosenEventId, chosenSpeakerId, topic);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Приглашение отправлено');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Пригласить Спикера"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          {available.length > 0 && <Button type="submit" form={formId} disabled={pending}>Отправить приглашение</Button>}
        </>
      }
    >
      {available.length === 0 ? (
        <Stack gap={3}>
          <Alert tone="warning">
            {ownPublished.length === 0
              ? 'Для отправки приглашения нужно опубликованное мероприятие, которым вы управляете.'
              : 'Нет мероприятий для приглашения: они уже прошли или Спикер в них уже участвует.'}
          </Alert>
          <div>
            <LinkButton to={rolePath('devrel', 'events')} size="sm" onClick={onClose}>Мои мероприятия</LinkButton>
          </div>
        </Stack>
      ) : (
        <form id={formId} onSubmit={handleSubmit}>
          <Stack gap={3}>
            {error && <Alert tone="danger" role="alert">{error}</Alert>}
            {speaker ? (
              <Input label="Спикер" value={speaker.name} readOnly />
            ) : (
              <Select
                label="Спикер"
                required
                value={chosenSpeakerId}
                disabled={catalog.loading || catalog.speakers.length === 0}
                onChange={(event) => {
                  setSpeakerId(event.target.value);
                  setError(undefined);
                }}
                options={catalog.speakers.length > 0
                  ? catalog.speakers.map((item) => ({ value: item.id, label: item.city ? `${item.name} · ${item.city}` : item.name }))
                  : [{ value: '', label: catalog.loading ? 'Загрузка…' : 'В каталоге нет спикеров' }]}
              />
            )}
            <Select
              label="Моё мероприятие"
              required
              value={chosenEventId}
              onChange={(event) => {
                setEventId(event.target.value);
                setError(undefined);
              }}
              options={available.map((event) => ({ value: event.id, label: event.name }))}
            />
            <Input
              label="Предлагаемая тема"
              required
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setError(undefined);
              }}
            />
          </Stack>
        </form>
      )}
    </Modal>
  );
}
