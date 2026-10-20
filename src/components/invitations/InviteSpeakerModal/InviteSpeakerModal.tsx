import { useId, useState, type FormEvent } from 'react';
import { rolePath } from '@/app/navigation';
import { Alert, Button, Input, LinkButton, Modal, Select, Stack, useToast } from '@/components/ui';
import { isEventPast, isSpeakerConfirmed } from '@/features/events/events';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';

export interface InviteSpeakerModalProps {
  speakerName: string;
  onClose: () => void;
}

/** DevRel invites a speaker to one of their published events. */
export function InviteSpeakerModal({ speakerName, onClose }: InviteSpeakerModalProps) {
  const { events, talks, applications, invitations } = useDemoState();
  const { sendInvitation } = useDemoActions();
  const { toast } = useToast();
  const formId = useId();

  const ownPublished = events.filter((event) => event.owner === 'devrel' && event.state === 'published');
  // Past events and events the speaker already takes part in are not offered.
  const available = ownPublished.filter(
    (event) => !isEventPast(event) && !isSpeakerConfirmed(event.id, applications, invitations),
  );
  const [eventId, setEventId] = useState(available[0]?.id ?? '');
  const [topic, setTopic] = useState(talks[0]?.name ?? '');
  const [error, setError] = useState<string>();

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const result = sendInvitation(eventId, topic);
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
          {available.length > 0 && <Button type="submit" form={formId}>Отправить приглашение</Button>}
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
            <Input label="Спикер" value={speakerName} readOnly />
            <Select
              label="Моё мероприятие"
              required
              value={eventId}
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
