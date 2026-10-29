import { useState, type FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { ApiError, errorMessage } from '@/api/client';
import { roleBasePath } from '@/app/navigation';
import { roleOf } from '@/auth/session';
import { useAuth } from '@/auth/useAuth';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { Alert, Button, Card, FilterChips, Grid, Input, Stack } from '@/components/ui';
import styles from './LoginPage.module.scss';

type Mode = 'signIn' | 'register';

/** Sign-in and registration; after sign-in the user lands in their role's section or the page they came from. */
export function LoginPage() {
  const { session, signIn, register } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>('signIn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (session) {
    const next = params.get('next');
    const home = roleBasePath[roleOf(session.user)];
    return <Navigate to={next && next.startsWith(home) ? next : home} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }
    if (mode === 'register' && !firstName.trim()) {
      setError('Введите имя');
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      if (mode === 'signIn') await signIn(username, password);
      else await register({ username, password, firstName: firstName.trim(), lastName: lastName.trim() });
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 401 ? 'Неверный логин или пароль' : errorMessage(caught));
      setPending(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <BrandLogo className={styles.brand} />
        <Card>
          <Stack gap={4}>
            <div>
              <h1 className={styles.title}>{mode === 'signIn' ? 'Вход в StarLift' : 'Регистрация спикера'}</h1>
              <p className={styles.muted}>
                {mode === 'signIn'
                  ? 'Войдите, чтобы работать с докладами, заявками и мероприятиями.'
                  : 'Новый аккаунт получает роль Спикера. Доступ DevRel выдает администратор.'}
              </p>
            </div>

            <FilterChips<Mode>
              label="Действие:"
              value={mode}
              onChange={(value) => {
                setMode(value);
                setError(undefined);
              }}
              options={[
                { value: 'signIn', label: 'Вход' },
                { value: 'register', label: 'Регистрация' },
              ]}
            />

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap={3}>
                {error && <Alert tone="danger" role="alert">{error}</Alert>}
                <Input label="Логин" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                <Input
                  label="Пароль"
                  type="password"
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode === 'register' && (
                  <Grid columns={2} responsive={false}>
                    <Input label="Имя" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </Grid>
                )}
                <Button type="submit" size="lg" fullWidth disabled={pending}>
                  {mode === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </main>
    </div>
  );
}
