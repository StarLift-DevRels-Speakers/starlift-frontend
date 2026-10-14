import type { ReactNode } from 'react';

/** Id of the hint/error paragraph rendered by Field, for aria-describedby. */
export function fieldMessageId(controlId: string) {
  return `${controlId}-message`;
}

/** Aria attributes linking a control to its Field message. */
export function fieldControlProps(controlId: string, { hint, error }: { hint?: ReactNode; error?: ReactNode }) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hint ? fieldMessageId(controlId) : undefined,
  };
}
