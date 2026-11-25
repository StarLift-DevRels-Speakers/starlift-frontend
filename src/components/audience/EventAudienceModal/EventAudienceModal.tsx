import { useState } from 'react';
import type { AudienceFitCheckDto } from '@/api/types';
import { AudienceFitBadge } from '@/components/audience/AudienceFitBadge/AudienceFitBadge';
import { AudienceFitDetails } from '@/components/audience/AudienceFitDetails/AudienceFitDetails';
import { AudienceProfileCard } from '@/components/audience/AudienceProfileCard/AudienceProfileCard';
import { Button, EmptyState, ListItem, Modal } from '@/components/ui';
import { latestBy } from '@/features/audience/audienceFit';
import { useAudienceFitChecks } from '@/features/audience/useAudience';
import { useAppState } from '@/store/useAppStore';
import type { TechEvent } from '@/types/domain';
import styles from './EventAudienceModal.module.scss';

export interface EventAudienceModalProps {
  event: TechEvent;
  onClose: () => void;
}

/** DevRel: expected audience of their event and how the speakers' materials fit it. */
export function EventAudienceModal({ event, onClose }: EventAudienceModalProps) {
  const { applications } = useAppState();
  const { checks } = useAudienceFitChecks({ eventId: event.id });
  const [opened, setOpened] = useState<AudienceFitCheckDto>();

  const speakerName = new Map(applications.map((application) => [String(application.speakerId), application.speakerName]));
  const latest = [...latestBy(checks, (check) => `${check.speakerId}:${check.talkId ?? check.mediaId}`).values()];

  return (
    <Modal
      open
      onClose={onClose}
      title={`Аудитория: ${event.name}`}
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Закрыть</Button>}
    >
      <div className={styles.body}>
        <AudienceProfileCard eventId={event.id} editable />

        <section aria-label="Материалы спикеров">
          <h3 className={styles.title}>Материалы спикеров</h3>
          {latest.length > 0 ? (
            <ul className={styles.list}>
              {latest.map((check) => (
                <ListItem
                  key={check.id}
                  title={speakerName.get(String(check.speakerId)) ?? 'Спикер'}
                  meta={[check.talkName && `«${check.talkName}»`, check.fileName].filter(Boolean).join(' · ')}
                  trailing={<AudienceFitBadge check={check} onOpen={() => setOpened(opened?.id === check.id ? undefined : check)} />}
                >
                  {opened?.id === check.id && <AudienceFitDetails check={check} />}
                </ListItem>
              ))}
            </ul>
          ) : (
            <EmptyState
              variant="plain"
              title="Проверок пока нет"
              description="Доклады и презентации проверяются автоматически, когда спикеры подают заявку или загружают файлы."
            />
          )}
        </section>
      </div>
    </Modal>
  );
}
