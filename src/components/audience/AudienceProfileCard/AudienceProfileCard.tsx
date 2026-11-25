import { useState } from 'react';
import { AudienceProfileFormModal } from '@/components/audience/AudienceProfileFormModal/AudienceProfileFormModal';
import { Alert, Badge, Button, Meter, Skeleton, useToast } from '@/components/ui';
import { confidenceLabels, formatAgeRange, levelShares, primaryAudience, segmentShares, visualLabels } from '@/features/audience/audienceFit';
import { useAudienceProfile } from '@/features/audience/useAudience';
import styles from './AudienceProfileCard.module.scss';

export interface AudienceProfileCardProps {
  eventId: string;
  /** The event's DevRel can correct the profile or infer it again. */
  editable?: boolean;
}

/** Expected audience of an event: levels, roles, expectations and what turns it off. */
export function AudienceProfileCard({ eventId, editable = false }: AudienceProfileCardProps) {
  const { response, loading, error, save, refresh } = useAudienceProfile(eventId);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const runRefresh = async () => {
    setRefreshing(true);
    const result = await refresh();
    setRefreshing(false);
    toast(result.ok ? 'Аудитория определена заново' : result.error);
  };

  const profile = response?.profile;

  return (
    <section className={styles.card} aria-label="Ожидаемая аудитория">
      <div className={styles.header}>
        <h3 className={styles.title}>✦ Ожидаемая аудитория</h3>
        {profile && (
          <Badge tone={response.manual ? 'brand' : 'ai'}>
            {response.manual ? 'Уточнено организатором' : `AI · уверенность ${confidenceLabels[profile.confidence]}`}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className={styles.loading} role="status">
          <span className={styles.muted}>Определяем аудиторию по данным мероприятия…</span>
          <Skeleton height={14} />
          <Skeleton height={14} width="70%" />
        </div>
      ) : error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !profile ? (
        <Alert tone="warning">{response?.message ?? 'Аудиторию пока не удалось определить.'}</Alert>
      ) : (
        <>
          {primaryAudience(profile) && (
            <div className={styles.primary}>
              <span className={styles.muted}>Преимущественно</span>
              <strong className={styles.primaryLabel}>{primaryAudience(profile)}</strong>
              <div className={styles.chips}>
                {formatAgeRange(profile.ageRange) && <Badge tone="muted">Возраст: {formatAgeRange(profile.ageRange)}</Badge>}
                {profile.visualExpectation && <Badge tone="muted">Слайды: {visualLabels[profile.visualExpectation]}</Badge>}
              </div>
              {profile.segmentReason && <span className={styles.muted}>{profile.segmentReason}</span>}
            </div>
          )}

          {profile.summary && <p className={styles.summary}>{profile.summary}</p>}

          {segmentShares(profile.experience).length > 1 && (
            <div className={styles.levels} aria-label="Состав аудитории">
              {segmentShares(profile.experience).map((share) => (
                <Meter key={share.segment} value={share.percent} label={share.label} showLabel />
              ))}
            </div>
          )}

          {segmentShares(profile.experience).length <= 1 && levelShares(profile.levels).length > 0 && (
            <div className={styles.levels}>
              {levelShares(profile.levels).map((share) => (
                <Meter key={share.level} value={share.percent} label={share.label} showLabel />
              ))}
            </div>
          )}

          <dl className={styles.facts}>
            <Facts title="Кто в зале" items={[...profile.roles, ...profile.domains]} />
            <Facts title="Чего ждут" items={profile.expectations} />
            <Facts title="Уже знают" items={profile.assumedKnowledge} />
            <Facts title="Что оттолкнёт" items={profile.turnoffs} />
          </dl>

          {profile.evidence.length > 0 && (
            <p className={styles.muted}>Основано на: {profile.evidence.map((item) => item.label).join('; ')}</p>
          )}
        </>
      )}

      {editable && !loading && (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Уточнить аудиторию</Button>
          <Button variant="soft" size="sm" onClick={runRefresh} disabled={refreshing}>
            {refreshing ? 'Определяем…' : 'Определить заново по данным'}
          </Button>
        </div>
      )}

      {editing && (
        <AudienceProfileFormModal
          profile={profile ?? null}
          onClose={() => setEditing(false)}
          onSave={async (update) => {
            const result = await save(update);
            if (result.ok) {
              setEditing(false);
              toast('Аудитория сохранена');
            }
            return result;
          }}
        />
      )}
    </section>
  );
}

function Facts({ title, items }: { title: string; items: ReadonlyArray<string> }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.fact}>
      <dt>{title}</dt>
      <dd>
        {items.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}
      </dd>
    </div>
  );
}
