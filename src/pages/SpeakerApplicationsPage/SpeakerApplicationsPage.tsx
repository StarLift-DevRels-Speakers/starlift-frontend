import { Link } from 'react-router';
import { rolePath } from '@/app/navigation';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge/ApplicationStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { EmptyState, LinkButton, Stack, Table } from '@/components/ui';
import { useDemoState } from '@/store/useDemoStore';
import type { Application } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerApplicationsPage.module.scss';

/** Speaker's CFP applications and the DevRel decisions on them. */
export function SpeakerApplicationsPage() {
  const { applications, events } = useDemoState();
  const eventById = new Map(events.map((event) => [event.id, event]));

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
              { key: 'topic', header: 'Тема доклада' },
              { key: 'status', header: 'Статус', render: (application) => <ApplicationStatusBadge status={application.status} /> },
              { key: 'at', header: 'Дата подачи', render: (application) => formatLongDate(application.at) },
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
    </>
  );
}
