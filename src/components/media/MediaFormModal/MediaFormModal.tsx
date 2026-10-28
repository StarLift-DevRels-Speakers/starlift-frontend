import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Input, Modal, Select, Stack, useToast } from '@/components/ui';
import { useAppActions, useAppState } from '@/store/useAppStore';

export interface MediaFormModalProps {
  onClose: () => void;
}

// Types the backend accepts (MinioService allowlist) and the request size limit of the API.
const ACCEPT = '.pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp';
const MAX_BYTES = 50 * 1024 * 1024;

/** Uploads a media file to the backend, optionally tied to one of the speaker's talks. */
export function MediaFormModal({ onClose }: MediaFormModalProps) {
  const { talks } = useAppState();
  const { addMedia } = useAppActions();
  const { toast } = useToast();
  const formId = useId();
  const [file, setFile] = useState<File>();
  const [talkId, setTalkId] = useState(talks[0]?.id ?? '');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const talkOptions = [
    ...talks.map((talk) => ({ value: talk.id, label: talk.name })),
    { value: '', label: 'Без доклада' },
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]);
    setError(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Выберите файл');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Файл больше 50 МБ');
      return;
    }
    setPending(true);
    const result = await addMedia({ file, talkId });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Файл загружен');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Добавить медиафайл"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" form={formId} disabled={pending}>{pending ? 'Загрузка…' : 'Загрузить'}</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <Stack gap={3}>
          <Input
            type="file"
            label="Файл"
            required
            accept={ACCEPT}
            hint="PDF, презентации PowerPoint или изображения, до 50 МБ."
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
