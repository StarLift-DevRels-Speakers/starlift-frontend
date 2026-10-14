import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Field } from '../Field/Field';
import { fieldControlProps } from '../Field/fieldA11y';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentPropsWithRef<'select'> {
  options: ReadonlyArray<SelectOption>;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Empty first option, e.g. "Выберите формат". */
  placeholder?: string;
}

export function Select({
  options,
  label,
  hint,
  error,
  placeholder,
  required,
  id,
  className,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <Field controlId={selectId} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={selectId}
        className={styles.select}
        required={required}
        {...fieldControlProps(selectId, { hint, error })}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
