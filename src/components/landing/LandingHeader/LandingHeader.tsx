import { rolePath } from '@/app/navigation';
import { roleOf } from '@/auth/session';
import { useAuth } from '@/auth/useAuth';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LinkButton } from '@/components/ui';
import { landingNav } from '@/features/landing/content';
import styles from './LandingHeader.module.scss';

/** Public header: anchor navigation, theme switch and the way into the product. */
export function LandingHeader() {
  const { session } = useAuth();
  const role = session ? roleOf(session.user) : null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <BrandLogo to="/" className={styles.brand} />

        <nav className={styles.nav} aria-label="Разделы страницы">
          {landingNav.map((item) => (
            <a key={item.block} href={`#${item.block}`} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          {role ? (
            <LinkButton variant="secondary" size="sm" to={rolePath(role)}>Открыть платформу</LinkButton>
          ) : (
            <>
              <LinkButton variant="text" size="sm" to="/login" className={styles.signIn}>Войти</LinkButton>
              <LinkButton variant="secondary" size="sm" to="/login?mode=register">Создать аккаунт</LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
