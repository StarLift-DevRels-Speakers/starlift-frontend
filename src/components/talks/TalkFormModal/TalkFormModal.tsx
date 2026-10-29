import { useId, useState, type FormEvent } from 'react';
import { Alert, Button, Input, Modal, Stack, Textarea, useToast } from '@/components/ui';
import { useAppActions } from '@/store/useAppStore';
import type { Talk } from '@/types/domain';

export interface TalkFormModalProps {
  /** Talk to edit; omitted when creating a new one. */
  talk?: Talk;
  onClose: () => void;
}

/** Create or edit a speaker's talk: used for CFP applications and AI matching. */
export function TalkFormModal({ talk, onClose }: TalkFormModalProps) {
  const { saveTalk } = useAppActions();
  const { toast } = useToast();
  const formId = useId();
  const [name, setName] = useState(talk?.name ?? '');
  const [topic, setTopic] = useState(talk?.topic ?? '');
  const [description, setDescription] = useState(talk?.description ?? '');
  const [error, setError] = useState<string>();

  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const result = await saveTalk({ name, topic, description }, talk?.id);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Доклад сохранен');
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={talk ? 'Изменить доклад' : 'Создать доклад'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" form={formId} disabled={pending}>Сохранить доклад</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <Stack gap={3}>
          {error && <Alert tone="danger" role="alert">{error}</Alert>}
          <Input label="Название доклада" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Тема / компетенция"
            required
            placeholder="Например, Java / Архитектура"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Textarea label="Краткое описание" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Stack>
      </form>
    </Modal>
  );
}
