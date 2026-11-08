import { useId, useState, type FormEvent } from 'react';
import type { AudienceLevel, AudienceProfileDto, AudienceProfileUpdate, AudienceSegment, VisualExpectation } from '@/api/types';
import { Alert, Button, Grid, Input, Modal, Select, Stack, Textarea } from '@/components/ui';
import {
  AUDIENCE_LEVELS,
  AUDIENCE_SEGMENTS,
  formatLines,
  levelLabels,
  parseLevels,
  parseLines,
  parseOptionalInt,
  profileToUpdate,
  segmentLabels,
  visualLabels,
} from '@/features/audience/audienceFit';

export interface AudienceProfileFormModalProps {
  profile: AudienceProfileDto | null;
  onClose: () => void;
  onSave: (update: AudienceProfileUpdate) => Promise<{ ok: true } | { ok: false; error: string }>;
}

type ListField = 'roles' | 'domains' | 'expectations' | 'assumedKnowledge' | 'turnoffs';

const LIST_FIELDS: ReadonlyArray<{ field: ListField; label: string }> = [
  { field: 'roles', label: 'Кто в зале (роли)' },
  { field: 'domains', label: 'Технологии и области' },
  { field: 'expectations', label: 'Чего ждут от доклада' },
  { field: 'assumedKnowledge', label: 'Что уже знают' },
  { field: 'turnoffs', label: 'Что оттолкнёт' },
];

/** DevRel corrects the inferred audience; the backend keeps it until the DevRel resets it. */
export function AudienceProfileFormModal({ profile, onClose, onSave }: AudienceProfileFormModalProps) {
  const formId = useId();
  const initial = profileToUpdate(profile);
  const [summary, setSummary] = useState(initial.summary);
  const [segment, setSegment] = useState<AudienceSegment | ''>(initial.primarySegment ?? '');
  const [segmentLabel, setSegmentLabel] = useState(initial.segmentLabel);
  const [ageFrom, setAgeFrom] = useState(initial.ageFrom == null ? '' : String(initial.ageFrom));
  const [ageTo, setAgeTo] = useState(initial.ageTo == null ? '' : String(initial.ageTo));
  const [visual, setVisual] = useState<VisualExpectation | ''>(initial.visualExpectation ?? '');
  const [levels, setLevels] = useState<Record<AudienceLevel, string>>(() => {
    const values = {} as Record<AudienceLevel, string>;
    for (const level of AUDIENCE_LEVELS) values[level] = initial.levels[level] ? String(initial.levels[level]) : '';
    return values;
  });
  const [lists, setLists] = useState<Record<ListField, string>>(() => ({
    roles: formatLines(initial.roles),
    domains: formatLines(initial.domains),
    expectations: formatLines(initial.expectations),
    assumedKnowledge: formatLines(initial.assumedKnowledge),
    turnoffs: formatLines(initial.turnoffs),
  }));
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!segment) {
      setError('Выберите, кто преимущественно будет в зале');
      return;
    }
    setPending(true);
    const result = await onSave({
      summary: summary.trim(),
      primarySegment: segment,
      segmentLabel: segmentLabel.trim(),
      ageFrom: parseOptionalInt(ageFrom),
      ageTo: parseOptionalInt(ageTo),
      visualExpectation: visual || null,
      levels: parseLevels(levels),
      roles: parseLines(lists.roles),
      domains: parseLines(lists.domains),
      expectations: parseLines(lists.expectations),
      assumedKnowledge: parseLines(lists.assumedKnowledge),
      turnoffs: parseLines(lists.turnoffs),
    });
    setPending(false);
    if (!result.ok) setError(result.error);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Уточнить аудиторию"
      description="Спикеры увидят этот профиль, и по нему будут проверяться их доклады и презентации."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" form={formId} disabled={pending}>Сохранить</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <Stack gap={3}>
          {error && <Alert tone="danger" role="alert">{error}</Alert>}
          <Grid columns={2}>
            <Select
              label="Кто преимущественно в зале"
              required
              placeholder="Выберите аудиторию"
              value={segment}
              onChange={(e) => setSegment(e.target.value as AudienceSegment | '')}
              options={AUDIENCE_SEGMENTS.map((value) => ({ value, label: segmentLabels[value] }))}
            />
            <Input
              label="Точнее"
              placeholder="Например, студенты IT-направлений"
              value={segmentLabel}
              onChange={(e) => setSegmentLabel(e.target.value)}
            />
            <Input label="Возраст от" type="number" min={6} max={99} value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)} hint="Необязательно" />
            <Input label="Возраст до" type="number" min={6} max={99} value={ageTo} onChange={(e) => setAgeTo(e.target.value)} />
          </Grid>
          <Select
            label="Наглядность слайдов"
            placeholder="По аудитории"
            value={visual}
            onChange={(e) => setVisual(e.target.value as VisualExpectation | '')}
            options={(['high', 'medium', 'low'] as const).map((value) => ({ value, label: visualLabels[value] }))}
          />
          <Textarea label="Кратко об аудитории" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
          <Grid columns={2}>
            {AUDIENCE_LEVELS.map((level) => (
              <Input
                key={level}
                label={`${levelLabels[level]}, %`}
                type="number"
                min={0}
                max={100}
                value={levels[level]}
                onChange={(e) => setLevels((current) => ({ ...current, [level]: e.target.value }))}
              />
            ))}
          </Grid>
          {LIST_FIELDS.map(({ field, label }) => (
            <Textarea
              key={field}
              label={label}
              hint="По одному пункту в строке"
              rows={2}
              value={lists[field]}
              onChange={(e) => setLists((current) => ({ ...current, [field]: e.target.value }))}
            />
          ))}
        </Stack>
      </form>
    </Modal>
  );
}
