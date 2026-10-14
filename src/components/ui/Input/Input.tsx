import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { Field } from '../Field/Field';
import { fieldControlProps } from '../Field/fieldA11y';
import styles from './Input.module.scss';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Decorative icon at the start of the field. */
  icon?: ReactNode;
}

export function Input({ label, hint, error, icon, required, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field controlId={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className={styles.control}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <input
          id={inputId}
          className={cx(styles.input, Boolean(icon) && styles.withIcon)}
          required={required}
          {...fieldControlProps(inputId, { hint, error })}
          {...rest}
        />
      </div>
    </Field>
  );
}
