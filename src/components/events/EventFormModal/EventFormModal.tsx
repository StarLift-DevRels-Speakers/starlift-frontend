import { useId, useState, type FormEvent } from 'react';
import { Alert, Button, Grid, Input, Modal, Select, Stack, Textarea, useToast } from '@/components/ui';
import type { EventInput } from '@/store/demoContext';
import { useDemoActions } from '@/store/useDemoStore';
import type { EventFormat, TechEvent } from '@/types/domain';
import { daysFromToday, todayKey } from '@/utils/date';

const FORMATS: EventFormat[] = ['Офлайн', 'Онлайн', 'Гибрид'];

export interface EventFormModalProps {
  /** Event to edit; omitted when creating a new draft. */
  event?: TechEvent;
  onClose: () => void;
}

function initialValues(event?: TechEvent): EventInput {
  return {
    name: event?.name ?? '',
    topic: event?.topic ?? '',
    date: event?.date ?? daysFromToday(35),
    cfp: event?.cfp ?? daysFromToday(22),
    city: event?.city ?? '',
    audience: event?.audience ?? '',
    format: event?.format ?? 'Офлайн',
    description: event?.description ?? '',
  };
}

/** Earliest selectable day: today, or the saved past value so it can stay unchanged. */
function minDay(saved: string | undefined, today: string): string {
  return saved && saved < today ? saved : today;
}

/** Create or edit a DevRel's event; saving a draft is free, publishing is a separate step. */
export function EventFormModal({ event, onClose }: EventFormModalProps) {
  const { saveEvent } = useDemoActions();
  const { toast } = useToast();
  const formId = useId();
  const [values, setValues] = useState(() => initialValues(event));
  const [error, setError] = useState<string>();
  const today = todayKey();

  const set =<Key extends keyof EventInput>(key: Key, value: EventInput[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError(undefined);
  };

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const result = saveEvent(values, event?.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    toast('Мероприятие сохранено');
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={event ? 'Изменить мероприятие' : 'Новый черновик мероприятия'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" form={formId}>{event ? 'Сохранить изменения' : 'Создать черновик'}</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <Stack gap={4}>
          <Alert tone="neutral">Создание и изменение черновика бесплатно. Публикация выполняется отдельно после проверки прав.</Alert>
          {error && <Alert tone="danger" role="alert">{error}</Alert>}

          <Grid columns={2}>
            <Input label="Название мероприятия" required value={values.name} onChange={(e) => set('name', e.target.value)} />
            <Input label="Тематика" required value={values.topic} onChange={(e) => set('topic', e.target.value)} />
            <Input
              label="Дата мероприятия"
              type="date"
              required
              min={minDay(event?.date, today)}
              value={values.date}
              onChange={(e) => set('date', e.target.value)}
            />
            <Input
              label="Дедлайн CFP"
              type="date"
              min={minDay(event?.cfp, today)}
              max={values.date}
              hint="Не позже даты мероприятия"
              value={values.cfp ?? ''}
              onChange={(e) => set('cfp', e.target.value || undefined)}
            />
            <Input label="Город" value={values.city} onChange={(e) => set('city', e.target.value)} />
            <Input label="Аудитория" value={values.audience} onChange={(e) => set('audience', e.target.value)} />
            <Select
              label="Формат"
              value={values.format}
              onChange={(e) => set('format', e.target.value as EventFormat)}
              options={FORMATS.map((format) => ({ value: format, label: format }))}
            />
          </Grid>

          <Textarea
            label="Описание"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Stack>
      </form>
    </Modal>
  );
}
