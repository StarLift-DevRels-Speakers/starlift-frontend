import { cx } from '@/utils/cx';
import styles from './Avatar.module.scss';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Full name: used for initials and as the image alt text. */
  name: string;
  src?: string;
  size?: AvatarSize;
  /** Set when the name is already shown next to the avatar. */
  decorative?: boolean;
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function Avatar({ name, src, size = 'md', decorative = false, className }: AvatarProps) {
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name };

  return (
    <span className={cx(styles.avatar, styles[size], className)} {...(src ? {} : a11y)}>
      {src ? <img src={src} alt={decorative ? '' : name} className={styles.image} /> : initials(name)}
    </span>
  );
}
