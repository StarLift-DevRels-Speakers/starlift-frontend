import { useState } from 'react';
import { AudienceFitDetails } from '@/components/audience/AudienceFitDetails/AudienceFitDetails';
import { Alert, Button, Select } from '@/components/ui';
import { isCheckableFile, newestFirst } from '@/features/audience/audienceFit';
import { useAudienceFitChecks } from '@/features/audience/useAudience';
import { useAppState } from '@/store/useAppStore';
import type { TechEvent } from '@/types/domain';
import styles from './AudienceFitPanel.module.scss';

export interface AudienceFitPanelProps {
  event: TechEvent;
}

const LATEST_FILE = '';

/** Speaker checks one of their talks (and its presentation) against the expected audience of an event. */
export function AudienceFitPanel({ event }: AudienceFitPanelProps) {
  const { talks, media } = useAppState();
  const { checks, request } = useAudienceFitChecks({ eventId: event.id });
  const [talkId, setTalkId] = useState(talks[0]?.id ?? '');
  const [mediaId, setMediaId] = useState(LATEST_FILE);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const files = media.filter((file) => file.talkId === talkId && isCheckableFile(file.name));
  const latest = newestFirst(checks).find((check) => check.talkId === talkId && (mediaId === LATEST_FILE || check.mediaId === mediaId));
  const checking = latest?.status === 'pending';

  const run = async () => {
    setPending(true);
    setError(undefined);
    const result = await request({ eventId: event.id, talkId, mediaId: mediaId || undefined });
    setPending(false);
    if (!result.ok) setError(result.error);
  };

  if (talks.length === 0) return null;

  return (
    <section className={styles.panel} aria-label="Проверка доклада под аудиторию">
      <h3 className={styles.title}>Подойдёт ли мой доклад этой аудитории?</h3>
      <div className={styles.controls}>
        <Select
          label="Доклад"
          value={talkId}
          onChange={(e) => {
            setTalkId(e.target.value);
            setMediaId(LATEST_FILE);
          }}
          options={talks.map((talk) => ({ value: talk.id, label: talk.name }))}
        />
        <Select
          label="Презентация или текст"
          value={mediaId}
          onChange={(e) => setMediaId(e.target.value)}
          options={[
            { value: LATEST_FILE, label: files.length > 0 ? 'Последний файл доклада' : 'Только описание доклада' },
            ...files.map((file) => ({ value: file.id, label: file.name })),
          ]}
          hint={files.length === 0 ? 'Загрузите PDF, PPTX или DOCX к докладу в разделе «Медиа» — проверка будет точнее.' : undefined}
        />
      </div>
      <div>
        <Button variant="soft" size="sm" onClick={run} disabled={pending || checking || !talkId}>
          {checking ? 'Проверяем…' : latest ? 'Проверить ещё раз' : '✦ Проверить под аудиторию'}
        </Button>
      </div>
      {error && <Alert tone="danger" role="alert">{error}</Alert>}
      {latest && <AudienceFitDetails check={latest} />}
    </section>
  );
}
