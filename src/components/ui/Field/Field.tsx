import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { fieldMessageId } from './fieldA11y';
import styles from './Field.module.scss';

export interface FieldProps {
  /** Id of the control the label points to. */
  controlId: string;
  label?: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint when present. */
  error?: ReactNode;
  /** Shows the "*" marker; pass `required` to the control itself for validation and screen readers. */
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error layout shared by Input, Select and Textarea. */
export function Field({ controlId, label, hint, error, required, className, children }: FieldProps) {
  const message = error ?? hint;

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={controlId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {message && (
        <p id={fieldMessageId(controlId)} className={cx(styles.message, Boolean(error) && styles.error)}>
          {message}
        </p>
      )}
    </div>
  );
}

