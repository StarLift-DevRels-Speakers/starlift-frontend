import { useId, useState, type FormEvent } from 'react';
import { Alert, Button, Grid, Input, Modal, Select, Stack, useToast } from '@/components/ui';
import { useAppActions, useAppState } from '@/store/useAppStore';
import { daysFromToday } from '@/utils/date';

// Values stored in talks.conference_type and talks.format on the backend.
const CONFERENCE_TYPES = [
  { value: 'CONFERENCE', label: 'Конференция' },
  { value: 'MEETUP', label: 'Митап' },
  { value: 'WORKSHOP', label: 'Воркшоп' },
];
const FORMATS = [
  { value: 'OFFLINE', label: 'Офлайн' },
  { value: 'ONLINE', label: 'Онлайн' },
];

export interface SpeechFormModalProps {
  onClose: () => void;
}

/** Record a speech given with one of the speaker's talks. */
export function SpeechFormModal({ onClose }: SpeechFormModalProps) {
  const { talks } = useAppState();
  const { addSpeech } = useAppActions();
  const { toast } = useToast();
  const formId = useId();
  const [talkId, setTalkId] = useState(talks[0]?.id ?? '');
  const [event, setEvent] = useState('');
  const [date, setDate] = useState(daysFromToday(-2));
  const [conferenceType, setConferenceType] = useState(CONFERENCE_TYPES[0].value);
  const [format, setFormat] = useState(FORMATS[0].value);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setPending(true);
    const result = await addSpeech({ talkId, event, date, conferenceType, format });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Выступление добавлено');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Добавить выступление"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          {talks.length > 0 && <Button type="submit" form={formId} disabled={pending}>Сохранить выступление</Button>}
        </>
      }
    >
      {talks.length === 0 ? (
        <Alert tone="warning">Сначала создайте доклад: выступление привязывается к одному из ваших докладов.</Alert>
      ) : (
        <form id={formId} onSubmit={handleSubmit}>
          <Stack gap={3}>
            {error && <Alert tone="danger" role="alert">{error}</Alert>}
            <Select
              label="Доклад"
              required
              value={talkId}
              onChange={(e) => setTalkId(e.target.value)}
              options={talks.map((talk) => ({ value: talk.id, label: talk.name }))}
            />
            <Input
              label="Название мероприятия"
              required
              placeholder="Название мероприятия"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            />
            <Input label="Дата выступления" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            <Grid columns={2} responsive={false}>
              <Select label="Тип мероприятия" value={conferenceType} onChange={(e) => setConferenceType(e.target.value)} options={CONFERENCE_TYPES} />
              <Select label="Формат" value={format} onChange={(e) => setFormat(e.target.value)} options={FORMATS} />
            </Grid>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
