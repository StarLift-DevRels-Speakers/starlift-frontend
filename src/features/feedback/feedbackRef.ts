/** Short review reference shown to people, e.g. "F1"; generated ids are shortened to their tail, which differs between reviews. */
export function feedbackRef(id: string): string {
  return id.length > 6 ? id.replace(/-/g, '').slice(-6).toUpperCase() : id.toUpperCase();
}
