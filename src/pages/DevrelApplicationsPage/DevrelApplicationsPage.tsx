import { useState } from 'react';
import { useSearchParams } from 'react-router';
import type { AudienceFitCheckDto } from '@/api/types';
import { AudienceFitBadge } from '@/components/audience/AudienceFitBadge/AudienceFitBadge';
import { AudienceFitModal } from '@/components/audience/AudienceFitModal/AudienceFitModal';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge/ApplicationStatusBadge';
import { InvitationStatusBadge } from '@/components/invitations/InvitationStatusBadge/InvitationStatusBadge';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Avatar, Button, Card, EmptyState, ListItem, Stack, Tabs, useToast } from '@/components/ui';
import { eventTalkKey, latestBy } from '@/features/audience/audienceFit';
import { useEventsFitChecks } from '@/features/audience/useAudience';
import { isEventPast, isSpeakerConfirmed } from '@/features/events/events';
import { useAppActions, useAppState } from '@/store/useAppStore';
import type { ApplicationStatus } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './DevrelApplicationsPage.module.scss';

type Decision = Exclude<ApplicationStatus, 'sent'>;

/** DevRel reviews applications to their own events and sends invitations. */
export function DevrelApplicationsPage() {
  const { applications, invitations, events } = useAppState();
  const { decideApplication, answerTalkChange } = useAppActions();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [params, setParams] = useSearchParams();

  const ownEvents = new Map(events.filter((event) => event.owner === 'devrel').map((event) => [event.id, event]));
  const incoming = applications.filter((application) => ownEvents.has(application.eventId));
  const sentInvitations = invitations.filter((invitation) => ownEvents.has(invitation.eventId));
  const fitChecks = useEventsFitChecks(incoming.map((application) => application.eventId));
  const latestFit = latestBy(fitChecks, (check) => `${check.speakerId}:${eventTalkKey(check.eventId, check.talkId)}`);
  const [openedCheck, setOpenedCheck] = useState<AudienceFitCheckDto>();

  const decide = async (applicationId: string, decision: Decision) => {
    const result = await decideApplication(applicationId, decision);
    toast(result.ok ? 'Статус заявки обновлен' : result.error);
  };

  const answerChange = async (applicationId: string, approved: boolean) => {
    const result = await answerTalkChange(applicationId, approved);
    toast(result.ok ? (approved ? 'Смена доклада подтверждена' : 'Смена доклада отклонена') : result.error);
  };

  return (
    <>
      <PageHeader
        title="Заявки и приглашения"
        description="Рассматривайте заявки на собственные мероприятия и направляйте приглашения."
      />

      <Stack>
        <Tabs
          label="Заявки и приглашения"
          value={params.get('tab') === 'outgoing' ? 'outgoing' : 'incoming'}
          onChange={(tab) => setParams(tab === 'outgoing' ? { tab } : {}, { replace: true })}
          items={[
            {
              value: 'incoming',
              label: `Входящие заявки · ${incoming.length}`,
              content: (
                  <Card as="section" title="Поступившие заявки" titleAs="h2">
                    {incoming.length > 0 ? (
                      <ul className={styles.list}>
                        {incoming.map((application) => {
                          const event = ownEvents.get(application.eventId);
                          const past = event === undefined || isEventPast(event);
                          const change = application.talkChange;
                          // A reserved application can still be accepted or rejected, until the event is over;
                          // a requested talk change is answered first.
                          const decidable = (application.status === 'sent' || application.status === 'reserve') && !past && !change;
                          const confirmed = isSpeakerConfirmed(application.eventId, applications, invitations, application.speakerId);
                          const fit = latestFit.get(`${application.speakerId}:${eventTalkKey(application.eventId, application.talkId || null)}`);
                          return (
                            <ListItem
                              key={application.id}
                              leading={<Avatar name={application.speakerName} decorative />}
                              title={application.speakerName}
                              meta={
                                <>
                                  <span>{event?.name} · {application.topic}</span>
                                  <span className={styles.date}>Подана {formatLongDate(application.at)}</span>
                                </>
                              }
                            >
                              <ApplicationStatusBadge status={application.status} />
                              {fit && <AudienceFitBadge check={fit} context="Под аудиторию" onOpen={() => setOpenedCheck(fit)} />}
                              {change && (
                                <>
                                  <span className={styles.note}>Запрошена смена доклада на «{change.topic}»</span>
                                  <div className={styles.actions}>
                                    {!past && <Button size="sm" onClick={() => answerChange(application.id, true)}>Подтвердить смену</Button>}
                                    <Button size="sm" variant="secondary" onClick={() => answerChange(application.id, false)}>Отклонить смену</Button>
                                  </div>
                                </>
                              )}
                              {decidable && (
                                <div className={styles.actions}>
                                  {confirmed
                                    ? <span className={styles.note}>Спикер уже участвует</span>
                                    : <Button size="sm" onClick={() => decide(application.id, 'accepted')}>Принять</Button>}
                                  {application.status === 'sent' && (
                                    <Button size="sm" variant="secondary" onClick={() => decide(application.id, 'reserve')}>В резерв</Button>
                                  )}
                                  <Button size="sm" variant="danger" onClick={() => decide(application.id, 'rejected')}>Отклонить</Button>
                                </div>
                              )}
                            </ListItem>
                          );
                        })}
                      </ul>
                    ) : (
                      <EmptyState variant="plain" title="Заявок пока нет" description="Заявки Спикеров на ваши мероприятия появятся здесь." />
                    )}
                  </Card>
              ),
            },
            {
              value: 'outgoing',
              label: `Приглашения · ${sentInvitations.length}`,
              content: (
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
                            leading={<Avatar name={invitation.speakerName} decorative />}
                            title={invitation.speakerName}
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
              ),
            },
          ]}
        />

        <p className={styles.note}>
          Полный жизненный цикл заявок и приглашений необходимо утвердить отдельно.
        </p>
      </Stack>

      {inviteOpen && <InviteSpeakerModal onClose={() => setInviteOpen(false)} />}
      {openedCheck && <AudienceFitModal check={openedCheck} onClose={() => setOpenedCheck(undefined)} />}
    </>
  );
}
