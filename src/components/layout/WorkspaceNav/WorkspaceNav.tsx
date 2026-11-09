import { useId } from 'react';
import { NavLink } from 'react-router';
import { navigationSections, rolePath } from '@/app/navigation';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import type { Role } from '@/types/role';
import styles from './WorkspaceNav.module.scss';

export function WorkspaceNav({ role, pathname }: { role: Role; pathname: string }) {
  const group = useId();
  const current = pathname.replace(/\/$/, '');

  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      {navigationSections[role].map(({ title, items }) => {
        const links = items.flatMap((item) => item.children ?? [item]);
        const active = links.some(({ slug }) => {
          const path = rolePath(role, slug);
          return current === path || (slug !== '' && current.startsWith(`${path}/`));
        });

        return (
          <details
            key={title}
            name={group}
            className={styles.group}
            data-active={active}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') event.currentTarget.open = true;
            }}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'mouse') return;
              const details = event.currentTarget;
              if (!details.querySelector('a:focus')) details.open = false;
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Escape' || !event.currentTarget.open) return;
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }}
          >
            <summary>{title}</summary>
            <ul className={styles.links}>
              {links.map((item) => (
                <li key={item.slug}>
                  <NavLink
                    to={rolePath(role, item.slug)}
                    end={item.slug === ''}
                    onClick={(event) => {
                      const details = event.currentTarget.closest('details');
                      if (details) details.open = false;
                    }}
                  >
                    <WorkspaceIcon name={item.icon} />
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </nav>
  );
}
