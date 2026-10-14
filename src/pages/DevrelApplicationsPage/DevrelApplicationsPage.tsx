import { useState } from 'react';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge/ApplicationStatusBadge';
import { InvitationStatusBadge } from '@/components/invitations/InvitationStatusBadge/InvitationStatusBadge';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Avatar, Button, Card, EmptyState, Grid, ListItem, Stack, useToast } from '@/components/ui';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import type { ApplicationStatus } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './DevrelApplicationsPage.module.scss';

type Decision = Exclude<ApplicationStatus, 'sent'>;

/** DevRel reviews applications to their own events and sends invitations. */
export function DevrelApplicationsPage() {
  const { applications, invitations, events, profiles } = useDemoState();
  const { decideApplication } = useDemoActions();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);

  // The demo has a single speaker account.
  const speakerName = profiles.speaker.name;
  const ownEvents = new Map(events.filter((event) => event.owner === 'devrel').map((event) => [event.id, event]));
  const incoming = applications.filter((application) => ownEvents.has(application.eventId));
  const sentInvitations = invitations.filter((invitation) => ownEvents.has(invitation.eventId));

  const decide = (applicationId: string, decision: Decision) => {
    const result = decideApplication(applicationId, decision);
    toast(result.ok ? 'Статус заявки обновлен' : result.error);
  };

  return (
    <>
      <PageHeader
        title="Заявки и приглашения"
        description="Рассматривайте заявки на собственные мероприятия и направляйте приглашения."
      />

      <Stack>
        <Grid columns={2}>
          <Card as="section" title="Поступившие заявки" titleAs="h2">
            {incoming.length > 0 ? (
              <ul className={styles.list}>
                {incoming.map((application) => (
                  <ListItem
                    key={application.id}
                    leading={<Avatar name={speakerName} decorative />}
                    title={speakerName}
                    meta={
                      <>
                        <span>{ownEvents.get(application.eventId)?.name} · {application.topic}</span>
                        <span className={styles.date}>Подана {formatLongDate(application.at)}</span>
                      </>
                    }
                  >
                    <ApplicationStatusBadge status={application.status} />
                    {application.status === 'sent' && (
                      <div className={styles.actions}>
                        <Button size="sm" onClick={() => decide(application.id, 'accepted')}>Принять</Button>
                        <Button size="sm" variant="secondary" onClick={() => decide(application.id, 'reserve')}>В резерв</Button>
                        <Button size="sm" variant="danger" onClick={() => decide(application.id, 'rejected')}>Отклонить</Button>
                      </div>
                    )}
                  </ListItem>
                ))}
              </ul>
            ) : (
              <EmptyState variant="plain" title="Заявок пока нет" description="Заявки Спикеров на ваши мероприятия появятся здесь." />
            )}
          </Card>

          <Card
            as="section"
            title="Приглашения"
            titleAs="h2"
            actions={<Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>+ Пригласить</Button>}
          >
            {sentInvitations.length > 0 ? (
              <ul className={styles.list}>
                {sentInvitations.map((invitation) => (
                  <ListItem
                    key={invitation.id}
                    leading={<Avatar name={speakerName} decorative />}
                    title={speakerName}
                    meta={<span>{ownEvents.get(invitation.eventId)?.name} · {invitation.topic}</span>}
                  >
                    <InvitationStatusBadge status={invitation.status} role="devrel" />
                  </ListItem>
                ))}
              </ul>
            ) : (
              <EmptyState variant="plain" title="Приглашений пока нет" description="Пригласите Спикера на опубликованное мероприятие." />
            )}
          </Card>
        </Grid>

        <p className={styles.note}>
          Состояния и переходы указаны для демонстрации. Полный жизненный цикл заявок и приглашений необходимо утвердить отдельно.
        </p>
      </Stack>

      {inviteOpen && <InviteSpeakerModal speakerName={speakerName} onClose={() => setInviteOpen(false)} />}
    </>
  );
}
