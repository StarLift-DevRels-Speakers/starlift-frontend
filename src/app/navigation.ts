import type { WorkspaceIconName } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import type { Role } from '@/types/role';

export interface NavItem {
  /** Path inside the role section; empty for the role's home page. Group children use the full path ('ai/events'). */
  slug: string;
  title: string;
  icon: WorkspaceIconName;
  /** Menu group: the item has no page of its own, its address redirects to the first child. */
  children?: ReadonlyArray<NavItem>;
}

export const roleBasePath: Record<Role, string> = {
  speaker: '/speaker',
  devrel: '/devrel',
};

export function rolePath(role: Role, slug = ''): string {
  return slug ? `${roleBasePath[role]}/${slug}` : roleBasePath[role];
}

interface NavigationSection {
  title: string;
  items: ReadonlyArray<NavItem>;
}

export const navigationSections: Record<Role, ReadonlyArray<NavigationSection>> = {
  speaker: [
    {
      title: 'Работа',
      items: [
        { slug: '', title: 'Главная', icon: 'home-icon' },
        { slug: 'calendar', title: 'Календарь', icon: 'calendar' },
        { slug: 'talks', title: 'Доклады и выступления', icon: 'talk' },
        { slug: 'events', title: 'Мероприятия и CFP', icon: 'event' },
        { slug: 'applications', title: 'Мои заявки', icon: 'file' },
        { slug: 'invitations', title: 'Приглашения', icon: 'mail' },
      ],
    },
    {
      title: 'Развитие',
      items: [
        {
          slug: 'ai',
          title: 'StarLift AI',
          icon: 'star',
          children: [
            { slug: 'ai/events', title: 'Подбор мероприятий', icon: 'star' },
            { slug: 'ai/producer', title: 'Траектория развития', icon: 'star' },
          ],
        },
        { slug: 'reviews', title: 'Отзывы', icon: 'chat' },
        { slug: 'competition', title: 'Соревнование', icon: 'cup' },
      ],
    },
    {
      title: 'Аккаунт',
      items: [
        { slug: 'profile', title: 'Мой профиль', icon: 'user' },
        { slug: 'media', title: 'Медиа', icon: 'image' },
        { slug: 'billing', title: 'Подписка и покупки', icon: 'card' },
        { slug: 'notifications', title: 'Уведомления', icon: 'bell' },
      ],
    },
  ],
  devrel: [
    {
      title: 'Работа',
      items: [
        { slug: '', title: 'Главная', icon: 'home-icon' },
        { slug: 'calendar', title: 'Календарь', icon: 'calendar' },
        { slug: 'catalog', title: 'Каталог спикеров', icon: 'user' },
        { slug: 'events', title: 'Мои мероприятия', icon: 'event' },
        { slug: 'applications', title: 'Заявки и приглашения', icon: 'file' },
      ],
    },
    {
      title: 'Развитие',
      items: [
        {
          slug: 'ai',
          title: 'StarLift AI',
          icon: 'star',
          children: [
            { slug: 'ai/speaker', title: 'Подбор спикеров', icon: 'star' },
          ],
        },
        { slug: 'analytics', title: 'Аналитика', icon: 'talk' },
      ],
    },
    {
      title: 'Аккаунт',
      items: [
        { slug: 'profile', title: 'Мой профиль', icon: 'user' },
        { slug: 'billing', title: 'Подписка и покупки', icon: 'card' },
        { slug: 'notifications', title: 'Уведомления', icon: 'bell' },
      ],
    },
  ],
};

export const navigation: Record<Role, ReadonlyArray<NavItem>> = {
  speaker: navigationSections.speaker.flatMap((section) => section.items),
  devrel: navigationSections.devrel.flatMap((section) => section.items),
};

/** Menu items for the current URL, outermost first (a group, then its child); falls back to the role's home page. */
export function findNavTrail(role: Role, pathname: string): NavItem[] {
  const items = navigation[role];
  const segments = pathname.slice(roleBasePath[role].length).split('/').filter(Boolean);
  const item = items.find((entry) => entry.slug === (segments[0] ?? ''));
  if (!item) return [items[0]];
  if (!item.children) return [item];

  const path = segments.slice(0, 2).join('/');
  const child = item.children.find((entry) => entry.slug === path) ?? item.children[0];
  return [item, child];
}
