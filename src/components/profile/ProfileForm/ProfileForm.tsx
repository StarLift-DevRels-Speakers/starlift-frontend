import { useState, type FormEvent } from 'react';
import { Button, Grid, Input, Stack, Textarea, useToast } from '@/components/ui';
import type { ProfileInput } from '@/store/demoContext';
import { useDemoActions } from '@/store/useDemoStore';
import type { UserProfile } from '@/types/domain';
import type { Role } from '@/types/role';
import styles from './ProfileForm.module.scss';

export interface ProfileFormProps {
  role: Role;
  profile: UserProfile;
}

/** Own profile editor; competencies and preferences exist only for the speaker. */
export function ProfileForm({ role, profile }: ProfileFormProps) {
  const { saveProfile } = useDemoActions();
  const { toast } = useToast();
  const [values, setValues] = useState<ProfileInput>(profile);
  const [error, setError] = useState<string>();

  const change = (key: keyof ProfileInput) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = saveProfile(role, values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    toast('Профиль сохранен');
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Grid columns={2}>
          <Input label="Имя" required error={error} value={values.name} onChange={change('name')} />
          <Input label="Должность / специализация" value={values.position} onChange={change('position')} />
          <Input label="Компания" value={values.company} onChange={change('company')} />
          <Input label="Город" value={values.city} onChange={change('city')} />
          {role === 'speaker' && (
            <>
              <Input
                label="Компетенции и темы"
                hint="Для обычного поиска и AI-рекомендаций"
                value={values.skills}
                onChange={change('skills')}
              />
              <Input label="Предпочтения" value={values.preferences} onChange={change('preferences')} />
            </>
          )}
        </Grid>
        <Textarea label="О себе" value={values.about} onChange={change('about')} />
        <div className={styles.actions}>
          <Button type="submit">Сохранить изменения</Button>
        </div>
      </Stack>
    </form>
  );
}
