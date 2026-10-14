/** In-app path of the public feedback form. */
export function feedbackPath(token: string): string {
  return `/feedback/${token}`;
}

/** Absolute link the speaker shares with listeners. */
export function feedbackUrl(token: string): string {
  return `${window.location.origin}${feedbackPath(token)}`;
}
