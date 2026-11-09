import { useNavigate } from 'react-router';
import { rolePath } from '@/app/navigation';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { ProfileForm } from '@/components/profile/ProfileForm/ProfileForm';
import { Card } from '@/components/ui';
import { useAppState } from '@/store/useAppStore';
import type { Role } from '@/types/role';

export function ProfileEditPage({ role }: { role: Role }) {
  const { profile } = useAppState();
  const navigate = useNavigate();
  const profilePath = rolePath(role, 'profile');

  return (
    <>
      <PageHeader
        title="Редактирование профиля"
        description={role === 'speaker'
          ? 'Эти сведения помогают DevRel находить вас в каталоге и подбирать подходящие мероприятия.'
          : 'Эти сведения доступны только вам.'}
      />
      <Card as="section" aria-label="Данные профиля">
        <ProfileForm
          role={role}
          profile={profile}
          cancelTo={profilePath}
          onSaved={() => void navigate(profilePath, { replace: true })}
        />
      </Card>
    </>
  );
}
