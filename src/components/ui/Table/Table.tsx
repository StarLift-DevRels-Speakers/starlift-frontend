import type { Key, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Table.module.scss';

export interface TableColumn<Row> {
  key: string;
  header: ReactNode;
  /** Cell content; defaults to `row[key]`. */
  render?: (row: Row) => ReactNode;
  align?: 'start' | 'end';
  /** Fixed column width, e.g. `120px` or `20%`. */
  width?: string;
}

export interface TableProps<Row> {
  columns: ReadonlyArray<TableColumn<Row>>;
  rows: ReadonlyArray<Row>;
  getRowKey: (row: Row) => Key;
  /** Accessible table name; visually hidden. */
  caption: string;
  /** Shown instead of the body when there are no rows. */
  empty?: ReactNode;
  className?: string;
}

/**
 * Data table for applications, talks and purchases. Status goes into its own column (Badge),
 * not row colors. Scrolls horizontally on narrow screens.
 */
export function Table<Row>({ columns, rows, getRowKey, caption, empty, className }: TableProps<Row>) {
  return (
    <div className={cx(styles.scroll, className)}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(column.align === 'end' && styles.end)}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={cx(column.align === 'end' && styles.end)}>
                    {column.render
                      ? column.render(row)
                      : (row as Record<string, ReactNode>)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
