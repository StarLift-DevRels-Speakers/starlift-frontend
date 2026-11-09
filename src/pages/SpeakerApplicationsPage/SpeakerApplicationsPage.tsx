import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { AudienceFitCheckDto } from '@/api/types';
import { rolePath } from '@/app/navigation';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge/ApplicationStatusBadge';
import { AudienceFitBadge } from '@/components/audience/AudienceFitBadge/AudienceFitBadge';
import { AudienceFitModal } from '@/components/audience/AudienceFitModal/AudienceFitModal';
import { ChangeApplicationTalkModal } from '@/components/applications/ChangeApplicationTalkModal/ChangeApplicationTalkModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, Card, EmptyState, LinkButton, ListItem, useToast } from '@/components/ui';
import { canRequestTalkChange } from '@/features/applications/applicationStatus';
import { eventTalkKey, latestBy } from '@/features/audience/audienceFit';
import { useAudienceFitChecks } from '@/features/audience/useAudience';
import { useAppState } from '@/store/useAppStore';
import type { Application } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerApplicationsPage.module.scss';

/** Speaker's CFP applications and the DevRel decisions on them. */
export function SpeakerApplicationsPage() {
  const { applications, events } = useAppState();
  const eventById = new Map(events.map((event) => [event.id, event]));
  const [params, setParams] = useSearchParams();
  const { toast } = useToast();
  const { checks, request } = useAudienceFitChecks();
  const [openedCheck, setOpenedCheck] = useState<AudienceFitCheckDto>();
  const latestCheck = latestBy(checks, (check) => eventTalkKey(check.eventId, check.talkId));

  const checkFit = async (application: Application) => {
    const result = await request({ eventId: application.eventId, talkId: application.talkId });
    toast(result.ok ? 'Проверяем доклад под аудиторию мероприятия' : result.error);
  };

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
              const check = latestCheck.get(eventTalkKey(application.eventId, application.talkId || null));
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
                    {check ? (
                      <AudienceFitBadge check={check} onOpen={() => setOpenedCheck(check)} />
                    ) : application.talkId && (
                      <Button variant="soft" size="sm" onClick={() => checkFit(application)}>✦ Проверить</Button>
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

      {openedCheck && (
        <AudienceFitModal
          check={checks.find((check) => check.id === openedCheck.id) ?? openedCheck}
          onClose={() => setOpenedCheck(undefined)}
        />
      )}

      {canEdit && editedEvent && (
        <ChangeApplicationTalkModal application={editedApplication} eventName={editedEvent.name} onClose={closeEdit} />
      )}
    </>
  );
}
