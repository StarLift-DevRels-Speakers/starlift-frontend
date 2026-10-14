import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Checkbox.module.scss';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Checkbox({ label, hint, id, className, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className={cx(styles.check, className)}>
      <input
        id={inputId}
        type="checkbox"
        className={styles.input}
        aria-describedby={hint ? hintId : undefined}
        {...rest}
      />
      <span className={styles.text}>
        <label htmlFor={inputId}>{label}</label>
        {hint && <span id={hintId} className={styles.hint}>{hint}</span>}
      </span>
    </div>
  );
}
