import { api } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import type { ActionResult } from '@/store/appContext';

/**
 * Saves the speaker's upcoming speeches (or one of them) as an .ics file. Google Calendar imports it via
 * «Настройки → Импорт и экспорт»; Apple Calendar and Outlook open it directly with the reminders included.
 */
export async function downloadCalendar(eventId?: string): Promise<ActionResult> {
  let blob: Blob;
  try {
    blob = await api.scheduleCalendar(eventId);
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = eventId ? `starlift-${eventId.slice(0, 8)}.ics` : 'starlift-speeches.ics';
  document.body.append(link);
  link.click();
  link.remove();
  // Safari cancels the download if the URL is revoked in the same task.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true };
}
