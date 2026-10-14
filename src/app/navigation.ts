import type { Role } from '@/types/role';

export interface NavItem {
  /** Path segment inside the role section; empty for the role's home page. */
  slug: string;
  title: string;
  /** Decorative glyph until the icon set is updated. */
  icon: string;
}

export const roleBasePath: Record<Role, string> = {
  speaker: '/speaker',
  devrel: '/devrel',
};

export function rolePath(role: Role, slug = ''): string {
  return slug ? `${roleBasePath[role]}/${slug}` : roleBasePath[role];
}

// Menu order follows StarLift_Макеты.html.
export const navigation: Record<Role, ReadonlyArray<NavItem>> = {
  speaker: [
    { slug: '', title: 'Главная', icon: '◫' },
    { slug: 'calendar', title: 'Календарь', icon: '▦' },
    { slug: 'profile', title: 'Мой профиль', icon: '◉' },
    { slug: 'talks', title: 'Доклады и выступления', icon: '▤' },
    { slug: 'events', title: 'Мероприятия и CFP', icon: '▥' },
    { slug: 'ai', title: 'AI-подбор мероприятий', icon: '✦' },
    { slug: 'applications', title: 'Мои заявки', icon: '✉' },
    { slug: 'invitations', title: 'Приглашения', icon: '↗' },
    { slug: 'producer', title: 'ИИ-продюсер', icon: '✺' },
    { slug: 'reviews', title: 'Отзывы', icon: '☆' },
    { slug: 'media', title: 'Медиа', icon: '▧' },
    { slug: 'billing', title: 'Подписка и покупки', icon: '◇' },
    { slug: 'notifications', title: 'Уведомления', icon: '♧' },
  ],
  devrel: [
    { slug: '', title: 'Главная', icon: '◫' },
    { slug: 'calendar', title: 'Календарь', icon: '▦' },
    { slug: 'profile', title: 'Мой профиль', icon: '◉' },
    { slug: 'catalog', title: 'Каталог спикеров', icon: '♙' },
    { slug: 'events', title: 'Мои мероприятия', icon: '▥' },
    { slug: 'ai', title: 'AI-подбор спикеров', icon: '✦' },
    { slug: 'applications', title: 'Заявки и приглашения', icon: '✉' },
    { slug: 'analytics', title: 'Аналитика', icon: '▤' },
    { slug: 'billing', title: 'Подписка и покупки', icon: '◇' },
    { slug: 'notifications', title: 'Уведомления', icon: '♧' },
  ],
};

/** Menu item for the current URL; falls back to the role's home page. */
export function findNavItem(role: Role, pathname: string): NavItem {
  const items = navigation[role];
  const slug = pathname.slice(roleBasePath[role].length).split('/').filter(Boolean)[0] ?? '';
  return items.find((item) => item.slug === slug) ?? items[0];
}
