import { useId, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { rolePath } from '@/app/navigation';
import { Alert, Badge, Button, DetailList, EmptyState, LinkButton, Modal, Select, useToast } from '@/components/ui';
import { hasPendingInvitation, isCfpOpen, isSpeakerConfirmed } from '@/features/events/events';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import type { TechEvent } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './EventDetailsModal.module.scss';

export interface EventDetailsModalProps {
  event: TechEvent;
  onClose: () => void;
}

/** Published event details for a speaker, with a free CFP application form while the CFP is open. */
export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { talks, applications, invitations } = useDemoState();
  const { submitApplication } = useDemoActions();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formId = useId();
  const [talkId, setTalkId] = useState(talks[0]?.id ?? '');
  const [error, setError] = useState<string>();

  const cfpOpen = isCfpOpen(event);
  const confirmed = isSpeakerConfirmed(event.id, applications, invitations);
  const invited = hasPendingInvitation(event.id, invitations);
  const canApply = cfpOpen && !confirmed && !invited && talks.length > 0;

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const result = submitApplication(event.id, talkId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Заявка отправлена');
    navigate(rolePath('speaker', 'applications'));
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={event.name}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Закрыть</Button>
          {canApply && <Button type="submit" form={formId}>Подать заявку</Button>}
        </>
      }
    >
      <div className={styles.body}>
        <div className={styles.badges}>
          <Badge>Опубликовано</Badge>
          <Badge tone={cfpOpen ? 'brand' : 'warning'}>{cfpOpen ? 'CFP открыт' : 'CFP закрыт'}</Badge>
        </div>

        <DetailList
          items={[
            { label: 'Дата', value: formatLongDate(event.date) },
            { label: 'Город и формат', value: `${event.city}, ${event.format}` },
            { label: 'Темы', value: event.topic },
            { label: 'Дедлайн CFP', value: event.cfp ? formatLongDate(event.cfp) : '—' },
          ]}
        />

        <p className={styles.description}>{event.description}</p>

        {confirmed ? (
          <Alert>Вы уже участвуете в этом мероприятии — повторная заявка не нужна.</Alert>
        ) : !cfpOpen ? (
          <Alert tone="warning">Прием заявок завершен.</Alert>
        ) : invited ? (
          <EmptyState
            variant="plain"
            title="Вас уже пригласили на это мероприятие"
            description="Вместо заявки ответьте на приглашение."
            action={<LinkButton to={rolePath('speaker', 'invitations')} variant="soft" size="sm">К приглашениям</LinkButton>}
          />
        ) : talks.length === 0 ? (
          <EmptyState
            variant="plain"
            title="Сначала добавьте доклад"
            description="Для заявки на CFP нужно выбрать один из ваших докладов."
            action={<LinkButton to={rolePath('speaker', 'talks')} variant="soft" size="sm">К докладам</LinkButton>}
          />
        ) : (
          <>
            <Alert>Подать заявку можно бесплатно. Выберите свой доклад для данного CFP.</Alert>
            <form id={formId} onSubmit={handleSubmit}>
              <Select
                label="Доклад"
                required
                value={talkId}
                error={error}
                onChange={(changeEvent) => {
                  setTalkId(changeEvent.target.value);
                  setError(undefined);
                }}
                options={talks.map((talk) => ({ value: talk.id, label: talk.name }))}
              />
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
