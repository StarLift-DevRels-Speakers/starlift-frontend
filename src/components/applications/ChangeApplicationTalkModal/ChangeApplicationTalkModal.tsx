import { useId, useState, type FormEvent } from 'react';
import { rolePath } from '@/app/navigation';
import { Alert, Button, Input, LinkButton, Modal, Select, Stack, useToast } from '@/components/ui';
import { replacementTalks } from '@/features/applications/applicationStatus';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import type { Application } from '@/types/domain';

export interface ChangeApplicationTalkModalProps {
  application: Application;
  eventName: string;
  onClose: () => void;
}

/** Speaker asks to switch the talk of an application; the change applies after the DevRel approves it. */
export function ChangeApplicationTalkModal({ application, eventName, onClose }: ChangeApplicationTalkModalProps) {
  const { applications, talks } = useDemoState();
  const { requestTalkChange } = useDemoActions();
  const { toast } = useToast();
  const formId = useId();

  const options = replacementTalks(application, applications, talks);
  const [talkId, setTalkId] = useState(options[0]?.id ?? '');
  const [error, setError] = useState<string>();

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const result = requestTalkChange(application.id, talkId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Запрос на смену доклада отправлен');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Сменить доклад"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          {options.length > 0 && <Button type="submit" form={formId}>Отправить запрос</Button>}
        </>
      }
    >
      {options.length === 0 ? (
        <Stack gap={3}>
          <Alert tone="warning">Нет других докладов: остальные уже поданы на это мероприятие. Создайте новый доклад.</Alert>
          <div>
            <LinkButton to={rolePath('speaker', 'talks')} size="sm" onClick={onClose}>К докладам</LinkButton>
          </div>
        </Stack>
      ) : (
        <form id={formId} onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Alert>Смену доклада подтверждает DevRel. До ответа в заявке остается текущий доклад.</Alert>
            {error && <Alert tone="danger" role="alert">{error}</Alert>}
            <Input label="Мероприятие" value={eventName} readOnly />
            <Input label="Текущий доклад" value={application.topic} readOnly />
            <Select
              label="Новый доклад"
              required
              value={talkId}
              onChange={(event) => {
                setTalkId(event.target.value);
                setError(undefined);
              }}
              options={options.map((talk) => ({ value: talk.id, label: talk.name }))}
            />
          </Stack>
        </form>
      )}
    </Modal>
  );
}
