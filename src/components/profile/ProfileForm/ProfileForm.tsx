import { useState, type FormEvent } from 'react';
import { Button, Grid, Input, LinkButton, Stack, Textarea, useToast } from '@/components/ui';
import type { ProfileInput } from '@/store/appContext';
import { useAppActions } from '@/store/useAppStore';
import type { UserProfile } from '@/types/domain';
import type { Role } from '@/types/role';
import styles from './ProfileForm.module.scss';

export interface ProfileFormProps {
  role: Role;
  profile: UserProfile;
  cancelTo: string;
  onSaved: () => void;
}

/** Own profile editor; competencies and preferences exist only for the speaker. */
export function ProfileForm({ role, profile, cancelTo, onSaved }: ProfileFormProps) {
  const { saveProfile } = useAppActions();
  const { toast } = useToast();
  const [values, setValues] = useState<ProfileInput>(profile);
  const [error, setError] = useState<string>();

  const change = (key: keyof ProfileInput) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
  };

  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const result = await saveProfile(values);
    if (!form.isConnected) return;
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    toast('Профиль сохранён');
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Grid columns={2}>
          <Input label="Имя и фамилия" required error={error} value={values.name} onChange={change('name')} />
          <Input label="Должность / специализация" value={values.position} onChange={change('position')} />
          <Input label="Компания" value={values.company} onChange={change('company')} />
          <Input label="Город" value={values.city} onChange={change('city')} />
          {role === 'speaker' && (
            <>
              <Input
                label="Компетенции и темы"
                hint="Через запятую. Для поиска в каталоге и AI-рекомендаций"
                value={values.skills}
                onChange={change('skills')}
              />
              <Input label="Предпочтения" value={values.preferences} onChange={change('preferences')} />
            </>
          )}
        </Grid>
        <Textarea label="О себе" value={values.about} onChange={change('about')} />
        <div className={styles.actions}>
          <Button className={styles.submit} type="submit" disabled={pending}>
            {pending ? 'Сохраняем…' : 'Сохранить изменения'}
          </Button>
          <LinkButton to={cancelTo} variant="secondary">Отмена</LinkButton>
        </div>
      </Stack>
    </form>
  );
}
