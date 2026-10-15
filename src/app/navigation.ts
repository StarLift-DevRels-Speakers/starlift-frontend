import type { Role } from '@/types/role';

export interface NavItem {
  /** Path inside the role section; empty for the role's home page. Group children use the full path ('ai/events'). */
  slug: string;
  title: string;
  /** Decorative glyph until the icon set is updated. */
  icon: string;
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

// Menu order follows StarLift_Макеты.html; AI features are grouped under StarLift AI.
export const navigation: Record<Role, ReadonlyArray<NavItem>> = {
  speaker: [
    { slug: '', title: 'Главная', icon: '◫' },
    { slug: 'calendar', title: 'Календарь', icon: '▦' },
    { slug: 'profile', title: 'Мой профиль', icon: '◉' },
    { slug: 'talks', title: 'Доклады и выступления', icon: '▤' },
    { slug: 'events', title: 'Мероприятия и CFP', icon: '▥' },
    {
      slug: 'ai',
      title: 'StarLift AI',
      icon: '✦',
      children: [
        { slug: 'ai/events', title: 'Подбор мероприятий', icon: '◎' },
        { slug: 'ai/producer', title: 'Траектория развития', icon: '✺' },
      ],
    },
    { slug: 'applications', title: 'Мои заявки', icon: '✉' },
    { slug: 'invitations', title: 'Приглашения', icon: '↗' },
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
    {
      slug: 'ai',
      title: 'StarLift AI',
      icon: '✦',
      children: [
        { slug: 'ai/speaker', title: 'Подбор спикеров', icon: '◎' },
      ],
    },
    { slug: 'applications', title: 'Заявки и приглашения', icon: '✉' },
    { slug: 'analytics', title: 'Аналитика', icon: '▤' },
    { slug: 'billing', title: 'Подписка и покупки', icon: '◇' },
    { slug: 'notifications', title: 'Уведомления', icon: '♧' },
  ],
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
