import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { ApiError, errorMessage } from '@/api/client';
import { roleBasePath } from '@/app/navigation';
import { roleOf } from '@/auth/session';
import { useAuth } from '@/auth/useAuth';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { Alert, Button, Card, FilterChips, Grid, Input, Stack } from '@/components/ui';
import { demoEnabled } from '@/demo/config';
import { roleLabels, type Role } from '@/types/role';
import styles from './LoginPage.module.scss';

type Mode = 'signIn' | 'register';
const roles: Array<{ value: Role; label: string }> = [
  { value: 'speaker', label: roleLabels.speaker },
  { value: 'devrel', label: roleLabels.devrel },
];

/**
 * Sign-in and registration; after sign-in the user lands in their role's section or the page they came from.
 * In demo mode the same form opens the cabinet of the chosen role without a backend.
 */
export function LoginPage() {
  const { session, signIn, register, enterDemo } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(() => (params.get('mode') === 'register' ? 'register' : 'signIn'));
  const [demoRole, setDemoRole] = useState<Role>('speaker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  // The demo entry keeps the form reachable even with a session, so the role can be switched from here.
  if (!demoEnabled && session) {
    const next = params.get('next');
    const home = roleBasePath[roleOf(session.user)];
    return <Navigate to={next && next.startsWith(home) ? next : home} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (demoEnabled) {
      enterDemo(demoRole);
      navigate(roleBasePath[demoRole], { replace: true });
      return;
    }

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

  const title = demoEnabled
    ? 'Демо StarLift'
    : mode === 'signIn' ? 'Вход в StarLift' : 'Регистрация спикера';

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <aside className={styles.intro} aria-label="О StarLift">
          <BrandLogo className={styles.brand} />
          <p className={styles.introTitle}>От темы до сцены</p>
          <p>Доклады, мероприятия и обратная связь в одном рабочем пространстве.</p>
          <Link className={styles.back} to="/">← На главную</Link>
        </aside>
        <Card>
          <Stack gap={4}>
            <div className={styles.theme}><ThemeToggle /></div>
            <div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.muted}>
                {demoEnabled
                  ? 'Выберите роль и откройте кабинет. Логин и бэкенд не нужны: данные демо живут только в этом браузере.'
                  : mode === 'signIn'
                    ? 'Войдите, чтобы работать с докладами, заявками и мероприятиями.'
                    : 'Новый аккаунт получает роль Спикера. Доступ DevRel выдает администратор.'}
              </p>
            </div>

            {!demoEnabled && (
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
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap={3}>
                {demoEnabled && <Alert tone="neutral">Демо-режим: пароль не нужен, данные не отправляются.</Alert>}
                {error && <Alert tone="danger" role="alert">{error}</Alert>}

                {demoEnabled ? (
                  <FilterChips<Role> label="Роль:" value={demoRole} options={roles} onChange={setDemoRole} />
                ) : (
                  <>
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
                  </>
                )}

                <Button type="submit" size="lg" fullWidth disabled={pending}>
                  {demoEnabled
                    ? `Открыть демо: ${roleLabels[demoRole]}`
                    : mode === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </main>
    </div>
  );
}
