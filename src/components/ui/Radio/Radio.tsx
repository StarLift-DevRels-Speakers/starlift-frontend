import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from '../Checkbox/Checkbox.module.scss';

export interface RadioProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  label: ReactNode;
  hint?: ReactNode;
}

/** Single radio; group several with the same `name` inside a fieldset. */
export function Radio({ label, hint, id, className, ...rest }: RadioProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className={cx(styles.check, className)}>
      <input
        id={inputId}
        type="radio"
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
