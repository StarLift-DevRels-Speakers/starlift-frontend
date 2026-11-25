import { AnchorButton, Button, useToast, type ButtonSize, type ButtonVariant } from '@/components/ui';
import { downloadCalendar } from '@/features/schedule/calendarExport';
import type { ScheduledTalk } from '@/types/domain';

export interface CalendarActionsProps {
  talk: Pick<ScheduledTalk, 'eventId' | 'eventName' | 'googleCalendarUrl'>;
  size?: ButtonSize;
  /** Look of the Google Calendar button; the .ics button is always secondary. */
  variant?: ButtonVariant;
  className?: string;
}

/** «Add to Google Calendar» opens a prefilled event; «.ics» saves a file with the reminders for any calendar app. */
export function CalendarActions({ talk, size = 'sm', variant = 'soft', className }: CalendarActionsProps) {
  const { toast } = useToast();

  const download = async () => {
    const result = await downloadCalendar(talk.eventId);
    if (!result.ok) toast(result.error);
  };

  return (
    <span className={className}>
      <AnchorButton
        href={talk.googleCalendarUrl}
        size={size}
        variant={variant}
        iconLeft="📅"
        aria-label={`Добавить в Google Календарь: ${talk.eventName}`}
      >
        В Google Календарь
      </AnchorButton>{' '}
      <Button size={size} variant="secondary" onClick={download} aria-label={`Скачать .ics: ${talk.eventName}`}>
        .ics
      </Button>
    </span>
  );
}
