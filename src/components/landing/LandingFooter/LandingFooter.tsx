import { Link } from 'react-router';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { footer } from '@/features/landing/content';
import styles from './LandingFooter.module.scss';

/** Footer: brand, anchor navigation and the account entry points. */
export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <BrandLogo to="/" className={styles.logo} />
          <p className={styles.tagline}>{footer.tagline}</p>
        </div>

        <nav className={styles.columns} aria-label="Ссылки в подвале">
          {footer.columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <p className={styles.columnTitle}>{column.title}</p>
              <ul className={styles.links}>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {link.href.startsWith('#') ? (
                      <a className={styles.link} href={link.href}>{link.label}</a>
                    ) : (
                      <Link className={styles.link} to={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.note}>{footer.note}</p>
      </div>
    </footer>
  );
}
