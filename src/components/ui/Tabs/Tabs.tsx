import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Tabs.module.scss';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: ReadonlyArray<TabItem>;
  /** Controlled selected tab. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible name of the tab list. */
  label: string;
  className?: string;
}

/** WAI-ARIA tabs: arrow keys / Home / End move between tabs, only the active tab is in the Tab order. */
export function Tabs({ items, value, defaultValue, onChange, label, className }: TabsProps) {
  const baseId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue ?? items[0]?.value);
  const selected = value ?? innerValue;
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const select = (next: string) => {
    setInnerValue(next);
    onChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    const index = enabled.findIndex((item) => item.value === selected);
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % enabled.length,
      ArrowLeft: (index - 1 + enabled.length) % enabled.length,
      Home: 0,
      End: enabled.length - 1,
    };
    const target = enabled[targets[event.key] ?? -1];
    if (!target) return;

    event.preventDefault();
    select(target.value);
    tabRefs.current.get(target.value)?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className={styles.list} onKeyDown={handleKeyDown}>
        {items.map((item) => {
          const isSelected = item.value === selected;
          return (
            <button
              key={item.value}
              ref={(node) => {
                if (node) tabRefs.current.set(item.value, node);
                else tabRefs.current.delete(item.value);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-controls={`${baseId}-panel-${item.value}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              className={styles.tab}
              onClick={() => select(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${baseId}-panel-${item.value}`}
          aria-labelledby={`${baseId}-tab-${item.value}`}
          hidden={item.value !== selected}
          tabIndex={0}
          className={styles.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
