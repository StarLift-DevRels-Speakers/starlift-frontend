import type { AudienceFitCheckDto } from '@/api/types';
import { Badge } from '@/components/ui';
import { checkLabel, checkTone } from '@/features/audience/audienceFit';
import styles from './AudienceFitBadge.module.scss';

export interface AudienceFitBadgeProps {
  check: AudienceFitCheckDto;
  /** Opens the check details; without it the badge is plain text. */
  onOpen?: () => void;
  /** Prefix for screen readers and the tooltip, e.g. the event name. */
  context?: string;
}

/** Verdict of an audience fit check: "Подходит · 82/100", "Проверяется…". */
export function AudienceFitBadge({ check, onOpen, context }: AudienceFitBadgeProps) {
  const label = checkLabel(check);
  const badge = <Badge tone={checkTone(check)} icon="✦">{context ? `${context}: ${label}` : label}</Badge>;
  if (!onOpen) return badge;
  return (
    <button type="button" className={styles.button} onClick={onOpen} aria-label={`Разбор проверки под аудиторию: ${context ? `${context}, ` : ''}${label}`}>
      {badge}
    </button>
  );
}
