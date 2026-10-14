import { useId, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './OptionGroup.module.scss';

export interface OptionGroupOption {
  value: string;
  label: ReactNode;
}

export interface OptionGroupProps {
  /** Question text, rendered as the fieldset legend. */
  legend: ReactNode;
  options: ReadonlyArray<OptionGroupOption>;
  /** Radio group name; generated when omitted. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Single choice from ready-made answers rendered as pills (e.g. listener feedback form).
 * Backed by native radios: arrow-key navigation and form submission work out of the box.
 */
export function OptionGroup({
  legend,
  options,
  name,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  className,
}: OptionGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <fieldset className={cx(styles.group, className)} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              className={styles.input}
              name={groupName}
              value={option.value}
              required={required}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={defaultValue === undefined ? undefined : defaultValue === option.value}
              onChange={() => onChange?.(option.value)}
            />
            <span className={styles.pill}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
