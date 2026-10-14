import { useId, useState, type FormEvent } from 'react';
import { Alert, Button, Input, Modal, Select, Stack, useToast } from '@/components/ui';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import { daysFromToday } from '@/utils/date';

export interface SpeechFormModalProps {
  onClose: () => void;
}

/** Record a speech given with one of the speaker's talks. */
export function SpeechFormModal({ onClose }: SpeechFormModalProps) {
  const { talks } = useDemoState();
  const { addSpeech } = useDemoActions();
  const { toast } = useToast();
  const formId = useId();
  const [talkId, setTalkId] = useState(talks[0]?.id ?? '');
  const [event, setEvent] = useState('');
  const [date, setDate] = useState(daysFromToday(-2));
  const [error, setError] = useState<string>();

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const result = addSpeech({ talkId, event, date });
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
          {talks.length > 0 && <Button type="submit" form={formId}>Сохранить выступление</Button>}
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
          </Stack>
        </form>
      )}
    </Modal>
  );
}
