import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Modal.module.scss';

export interface ModalProps {
  open: boolean;
  /** Called on Esc, backdrop click and the close button. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Action buttons; put the confirming action last. */
  footer?: ReactNode;
  children?: ReactNode;
  /** `md` (440px) for confirmations, `lg` (560px) for details and forms. */
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Dialog on top of native <dialog>: focus trap, inert background, Esc and
 * focus restore come from the browser. Use it to confirm dangerous actions.
 */
export function Modal({ open, onClose, title, description, footer, children, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Clicks on the <dialog> element itself (not its content) land on the backdrop.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.dialog, size === 'lg' && styles.lg, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Keep `open` controlled by the parent.
        event.preventDefault();
        onClose();
      }}
      onClick={handleClick}
    >
      <div className={styles.content}>
        <h2 id={titleId} className={styles.title}>{title}</h2>
        {description && <p id={descriptionId} className={styles.description}>{description}</p>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
