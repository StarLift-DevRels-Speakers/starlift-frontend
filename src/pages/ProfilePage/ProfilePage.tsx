import { rolePath } from '@/app/navigation';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { ProfileForm } from '@/components/profile/ProfileForm/ProfileForm';
import { Avatar, Badge, Card, Grid, LinkButton, Stack } from '@/components/ui';
import { useAppState } from '@/store/useAppStore';
import { roleLabels, type Role } from '@/types/role';
import styles from './ProfilePage.module.scss';

export interface ProfilePageProps {
  role: Role;
}

const descriptions: Record<Role, string> = {
  speaker: 'Сведения используются для поиска и подбора мероприятий.',
  devrel: 'Профиль DevRel виден только его владельцу. Просмотр профилей других DevRel не предусмотрен.',
};

/** Own profile of the current role: editable form and a preview card. */
export function ProfilePage({ role }: ProfilePageProps) {
  const { profile } = useAppState();
  const place = [profile.company, profile.city].filter(Boolean).join(' · ');

  return (
    <>
      <PageHeader title="Мой профиль" description={descriptions[role]} actions={<Badge>Собственный профиль</Badge>} />

      <Grid columns={2} className={styles.layout}>
        <Card as="section" aria-label="Редактирование профиля">
          {/* Remount after a save to show the stored values. */}
          <ProfileForm key={JSON.stringify(profile)} role={role} profile={profile} />
        </Card>

        <Stack>
          <Card as="section" aria-label="Так профиль выглядит для других">
            <div className={styles.identity}>
              <Avatar name={profile.name} size="lg" decorative />
              <div className={styles.identityText}>
                <h2 className={styles.name}>{profile.name}</h2>
                {profile.position && <p className={styles.muted}>{profile.position}</p>}
                <Badge tone="muted">{roleLabels[role]}</Badge>
              </div>
            </div>
            <hr className={styles.divider} />
            <div className={styles.bio}>
              {profile.about && <p>{profile.about}</p>}
              {place && <p className={styles.muted}>{place}</p>}
            </div>
          </Card>

          {role === 'speaker' ? (
            <Card as="section" title="Отзывы по ссылке" description="Ссылка на выступление ведет только к форме обратной связи, не к профилю.">
              <LinkButton to={rolePath('speaker', 'reviews')} variant="soft">К ссылке и отзывам</LinkButton>
            </Card>
          ) : (
            <Card
              as="section"
              title="Правила доступа"
              description="Бесплатно доступны каталог Спикеров и отзывы слушателей. Чужие профили DevRel недоступны."
            >
              <LinkButton to={rolePath('devrel', 'catalog')} variant="soft">Каталог спикеров</LinkButton>
            </Card>
          )}
        </Stack>
      </Grid>
    </>
  );
}
