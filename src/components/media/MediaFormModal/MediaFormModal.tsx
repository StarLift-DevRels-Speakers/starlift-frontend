import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Input, Modal, Select, Stack, useToast } from '@/components/ui';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';

export interface MediaFormModalProps {
  onClose: () => void;
}

/** Demo file picker: only the name and size go to the list, the content is never uploaded. */
export function MediaFormModal({ onClose }: MediaFormModalProps) {
  const { talks } = useDemoState();
  const { addMedia } = useDemoActions();
  const { toast } = useToast();
  const formId = useId();
  const [file, setFile] = useState<File>();
  const [talkId, setTalkId] = useState(talks[0]?.id ?? '');
  const [error, setError] = useState<string>();

  const talkOptions = talks.length > 0
    ? talks.map((talk) => ({ value: talk.id, label: talk.name }))
    : [{ value: '', label: 'Без доклада' }];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]);
    setError(undefined);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Выберите файл');
      return;
    }
    const result = addMedia({ name: file.name, talkId, sizeBytes: file.size });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Файл добавлен только в демо-список');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Добавить медиафайл"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" form={formId}>Добавить в список</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <Stack gap={3}>
          <Input
            type="file"
            label="Файл (демонстрационный выбор)"
            required
            hint="Содержимое файла не загружается и не сохраняется. Допустимые форматы и размер уточняются в спецификации API."
            error={error}
            onChange={handleFileChange}
          />
          <Select
            label="Связанный доклад"
            options={talkOptions}
            value={talkId}
            onChange={(event) => setTalkId(event.target.value)}
          />
        </Stack>
      </form>
    </Modal>
  );
}
