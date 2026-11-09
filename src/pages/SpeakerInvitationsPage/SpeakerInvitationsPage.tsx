import { rolePath } from '@/app/navigation';
import { InvitationStatusBadge } from '@/components/invitations/InvitationStatusBadge/InvitationStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import { Button, Card, EmptyState, IconTile, LinkButton, ListItem, Stack, useToast } from '@/components/ui';
import { isEventPast, isSpeakerConfirmed } from '@/features/events/events';
import { useAppActions, useAppState } from '@/store/useAppStore';
import type { InvitationStatus } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerInvitationsPage.module.scss';

/** Speaker reviews DevRel invitations and answers them; pending ones come first. */
export function SpeakerInvitationsPage() {
  const { invitations, applications, events } = useAppState();
  const { answerInvitation } = useAppActions();
  const { toast } = useToast();
  const eventById = new Map(events.map((event) => [event.id, event]));
  const sorted = [...invitations].sort((a, b) => Number(b.status === 'sent') - Number(a.status === 'sent'));

  const answer = async (invitationId: string, status: Exclude<InvitationStatus, 'sent'>) => {
    const result = await answerInvitation(invitationId, status);
    toast(result.ok ? 'Ответ на приглашение сохранен' : result.error);
  };

  return (
    <>
      <PageHeader title="Приглашения" description="Просматривайте предложения DevRel и отвечайте на них." />

      <Card as="section" title="Ваши приглашения" titleAs="h2">
        {sorted.length > 0 ? (
          <Stack as="ul" gap={3} aria-label="Приглашения">
            {sorted.map((invitation) => {
              const event = eventById.get(invitation.eventId);
              // Declining stays available; accepting only while the speaker can still take part.
              const blocked = event && (
                isEventPast(event) ? 'Мероприятие уже прошло'
                  : isSpeakerConfirmed(event.id, applications, invitations) ? 'Вы уже участвуете в этом мероприятии'
                    : undefined
              );
              return (
                <ListItem
                  key={invitation.id}
                  leading={<IconTile><WorkspaceIcon name="mail" /></IconTile>}
                  title={event?.name ?? 'Мероприятие'}
                  meta={`Тема: ${invitation.topic || 'не указана'} · получено ${formatLongDate(invitation.date)}`}
                >
                  <InvitationStatusBadge status={invitation.status} role="speaker" />
                  {event && (
                    <p className={styles.event}>
                      {formatLongDate(event.date)} · {event.city}, {event.format}
                    </p>
                  )}
                  {invitation.status === 'sent' && (
                    <div className={styles.actions}>
                      {blocked
                        ? <span className={styles.note}>{blocked}</span>
                        : <Button size="sm" onClick={() => answer(invitation.id, 'accepted')}>Принять</Button>}
                      <Button size="sm" variant="secondary" onClick={() => answer(invitation.id, 'declined')}>Отклонить</Button>
                    </div>
                  )}
                </ListItem>
              );
            })}
          </Stack>
        ) : (
          <EmptyState
            title="Приглашений пока нет"
            description="Когда DevRel пригласит вас выступить, предложение появится здесь. А пока можно подать заявку самостоятельно."
            action={<LinkButton to={rolePath('speaker', 'events')}>Каталог мероприятий</LinkButton>}
          />
        )}

      </Card>
    </>
  );
}
