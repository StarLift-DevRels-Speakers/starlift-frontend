import { Link, useSearchParams } from 'react-router';
import { rolePath } from '@/app/navigation';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge/ApplicationStatusBadge';
import { ChangeApplicationTalkModal } from '@/components/applications/ChangeApplicationTalkModal/ChangeApplicationTalkModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, Card, EmptyState, LinkButton, ListItem } from '@/components/ui';
import { canRequestTalkChange } from '@/features/applications/applicationStatus';
import { useAppState } from '@/store/useAppStore';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerApplicationsPage.module.scss';

/** Speaker's CFP applications and the DevRel decisions on them. */
export function SpeakerApplicationsPage() {
  const { applications, events } = useAppState();
  const eventById = new Map(events.map((event) => [event.id, event]));
  const [params, setParams] = useSearchParams();

  // `?edit=<id>` opens the talk change request for an application that still allows it.
  const editedApplication = applications.find((application) => application.id === params.get('edit'));
  const editedEvent = editedApplication && eventById.get(editedApplication.eventId);
  const canEdit = editedApplication && canRequestTalkChange(editedApplication, editedEvent);
  const openEdit = (applicationId: string) => setParams({ edit: applicationId }, { replace: true });
  const closeEdit = () => setParams({}, { replace: true });

  return (
    <>
      <PageHeader
        title="Мои заявки"
        description="Решения организаторов и запросы на смену доклада."
        actions={<LinkButton to={rolePath('speaker', 'events')}>Найти мероприятие</LinkButton>}
      />

      <Card as="section" title="Все заявки" titleAs="h2">
        {applications.length ? (
          <ul className={styles.list}>
            {applications.map((application) => {
              const event = eventById.get(application.eventId);
              const title = event?.state === 'published'
                ? <Link to={`${rolePath('speaker', 'events')}?event=${encodeURIComponent(event.id)}`}>{event.name}</Link>
                : event?.name ?? 'Мероприятие';
              return (
                <ListItem
                  key={application.id}
                  title={title}
                  meta={
                    <>
                      <span>{application.topic} · подана {formatLongDate(application.at)}</span>
                      {application.talkChange && <span className={styles.change}>Смена на «{application.talkChange.topic}» ждёт подтверждения</span>}
                    </>
                  }
                >
                  <div className={styles.actions}>
                    <ApplicationStatusBadge status={application.status} />
                    {canRequestTalkChange(application, event) && (
                      <Button variant="secondary" size="sm" aria-label={`Изменить доклад: ${application.topic}`} onClick={() => openEdit(application.id)}>
                        Изменить доклад
                      </Button>
                    )}
                  </div>
                </ListItem>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            variant="plain"
            title="Заявок пока нет"
            description="Выберите мероприятие с открытым CFP и нажмите «Подать заявку»."
            action={<LinkButton to={rolePath('speaker', 'events')} variant="secondary">Открыть каталог</LinkButton>}
          />
        )}
      </Card>

      {canEdit && editedEvent && (
        <ChangeApplicationTalkModal application={editedApplication} eventName={editedEvent.name} onClose={closeEdit} />
      )}
    </>
  );
}
