import { Link, useSearchParams } from 'react-router';
import { rolePath } from '@/app/navigation';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge/ApplicationStatusBadge';
import { ChangeApplicationTalkModal } from '@/components/applications/ChangeApplicationTalkModal/ChangeApplicationTalkModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, EmptyState, LinkButton, Stack, Table } from '@/components/ui';
import { canRequestTalkChange } from '@/features/applications/applicationStatus';
import { useDemoState } from '@/store/useDemoStore';
import type { Application } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerApplicationsPage.module.scss';

/** Speaker's CFP applications and the DevRel decisions on them. */
export function SpeakerApplicationsPage() {
  const { applications, events } = useDemoState();
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
      <PageHeader title="Мои заявки" description="Отправленные заявки на CFP и текущие решения DevRel." />

      <Stack>
        {applications.length > 0 ? (
          <Table<Application>
            caption="Мои заявки на CFP"
            rows={applications}
            getRowKey={(application) => application.id}
            columns={[
              {
                key: 'event',
                header: 'Мероприятие',
                render: (application) => {
                  const event = eventById.get(application.eventId);
                  if (!event) return '—';
                  return event.state === 'published'
                    ? <Link to={`${rolePath('speaker', 'events')}?event=${event.id}`}>{event.name}</Link>
                    : event.name;
                },
              },
              {
                key: 'topic',
                header: 'Тема доклада',
                render: (application) => (
                  <>
                    {application.topic}
                    {application.talkChange && (
                      <span className={styles.change}>Смена на «{application.talkChange.topic}» ждет подтверждения DevRel</span>
                    )}
                  </>
                ),
              },
              { key: 'status', header: 'Статус', render: (application) => <ApplicationStatusBadge status={application.status} /> },
              { key: 'at', header: 'Дата подачи', render: (application) => formatLongDate(application.at) },
              {
                key: 'actions',
                header: 'Действия',
                align: 'end',
                render: (application) => canRequestTalkChange(application, eventById.get(application.eventId)) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Изменить доклад: ${application.topic}`}
                    onClick={() => openEdit(application.id)}
                  >
                    Изменить доклад
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="Заявок пока нет"
            description="Выберите мероприятие с открытым CFP и нажмите «Подать заявку»."
            action={<LinkButton to={rolePath('speaker', 'events')}>Каталог мероприятий</LinkButton>}
          />
        )}

        <p className={styles.note}>Полный перечень статусов и правила переходов еще подлежат согласованию.</p>
      </Stack>

      {canEdit && editedEvent && (
        <ChangeApplicationTalkModal application={editedApplication} eventName={editedEvent.name} onClose={closeEdit} />
      )}
    </>
  );
}
