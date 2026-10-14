import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Field } from '../Field/Field';
import { fieldControlProps } from '../Field/fieldA11y';
import styles from './Textarea.module.scss';

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function Textarea({ label, hint, error, required, id, className, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <Field controlId={textareaId} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={textareaId}
        className={styles.textarea}
        required={required}
        {...fieldControlProps(textareaId, { hint, error })}
        {...rest}
      />
    </Field>
  );
}
