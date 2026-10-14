import { useId } from 'react';
import { cx } from '@/utils/cx';
import styles from './FilterChips.module.scss';

export interface FilterChipOption<Value extends string> {
  value: Value;
  label: string;
}

export interface FilterChipsProps<Value extends string> {
  /** Visible group caption, e.g. "Показать:". */
  label: string;
  options: ReadonlyArray<FilterChipOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
}

/** Single-choice filter pills for lists and calendars. */
export function FilterChips<Value extends string>({ label, options, value, onChange, className }: FilterChipsProps<Value>) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className={cx(styles.group, className)}>
      <span id={labelId} className={styles.label}>{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.chip}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
