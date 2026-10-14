/** Short review reference shown to people, e.g. "F1"; generated ids are shortened. */
export function feedbackRef(id: string): string {
  return id.slice(0, 6).toUpperCase();
}
