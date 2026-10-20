import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { AiResultCard } from '@/components/ai/AiResultCard/AiResultCard';
import { EventDetailsModal } from '@/components/events/EventDetailsModal/EventDetailsModal';
import { Alert, Avatar, Badge, Button, Card, EmptyState, LinkButton, Stack } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import { isCfpOpen } from '@/features/events/events';
import { useDemoState } from '@/store/useDemoStore';
import type { AiResult } from '@/types/domain';
import type { Role } from '@/types/role';
import { formatLongDate } from '@/utils/date';
import styles from './AiResultView.module.scss';

export interface AiResultViewProps {
  role: Role;
  result: AiResult;
  /** DevRel: open the invitation form for the matched speaker. */
  onInvite?: () => void;
}

/** Last AI matching result in any of its states. Demo matches illustrate the format, not real scoring. */
export function AiResultView({ role, result, onInvite }: AiResultViewProps) {
  const { events, billing, profiles } = useDemoState();
  const speaker = profiles.speaker;
  // The event opens in place, so the speaker stays on the AI matching page.
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  if (result.kind === 'insufficient') {
    return (
      <Alert tone="warning" title="Недостаточно данных">
        Недостаточно данных для надежного подбора. Дополните {role === 'speaker' ? 'профиль и темы' : 'требования к мероприятию'}.
        Пробный запрос не израсходован.
      </Alert>
    );
  }

  if (result.kind === 'error') {
    return (
      <Alert tone="danger" title="Не удалось выполнить">
        AI-модуль временно недоступен. Операция не завершена; право не израсходовано.
      </Alert>
    );
  }

  if (result.kind === 'empty') {
    return (
      <EmptyState
        variant="plain"
        title="Подходящих вариантов не найдено"
        description="Это корректный пустой результат: совпадения не придумываются. Запрос учтен; попробуйте изменить параметры."
      />
    );
  }

  if (role === 'speaker') {
    const published = events.filter((event) => event.state === 'published');
    // Only events still accepting applications are suggested.
    const matches = published.filter((event) => isCfpOpen(event));
    const openEvent = published.find((event) => event.id === openEventId);
    return (
      <Stack gap={3}>
        <Alert>Пример результата интеллектуального подбора. Основания приведены только для демонстрации формата.</Alert>
        {matches.length === 0 && (
          <EmptyState
            variant="plain"
            title="Мероприятий с открытым CFP сейчас нет"
            description="Подходящие мероприятия появятся здесь, когда откроется прием заявок."
          />
        )}
        {matches.map((event) => (
          <AiResultCard
            key={event.id}
            title={event.name}
            subtitle={`${event.topic} · ${event.city} · CFP до ${event.cfp ? formatLongDate(event.cfp) : '—'}`}
            reasons={{ title: 'Почему подходит', items: ['Тематика близка к профилю Спикера', 'Доступен открытый CFP'] }}
            caveats={{ title: 'Что уточнить', items: ['Точные требования к опыту выступлений', 'Подтверждение доступности на дату'] }}
            actions={
              <Button size="sm" onClick={() => setOpenEventId(event.id)}>Открыть мероприятие</Button>
            }
          />
        ))}
        {openEvent && <EventDetailsModal event={openEvent} onClose={() => setOpenEventId(null)} />}
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <Alert>Демонстрационный результат, не фактическая оценка компетенций. «Слабые сигналы» — отдельная подписочная возможность.</Alert>
      <AiResultCard
        leading={<Avatar name={speaker.name} decorative />}
        title={speaker.name}
        subtitle={`${speaker.position} · ${speaker.city}`}
        reasons={{ title: 'Основания', items: ['Совпадение: Java и backend', 'Есть история выступлений'] }}
        caveats={{ title: 'Ограничения', items: ['Не подтверждена доступность на дату', 'Нет подтвержденных сведений о части требований'] }}
        actions={
          <>
            <LinkButton to={`${rolePath('devrel', 'catalog')}/${speaker.id}`} variant="secondary" size="sm">Карточка Спикера</LinkButton>
            <Button size="sm" onClick={onInvite}>Пригласить</Button>
          </>
        }
      />
      {isSubscriptionActive(billing.devrel) ? (
        <Card variant="flat" title="↗ Слабые сигналы" actions={<Badge tone="ai">В подписке</Badge>} className={styles.signals}>
          <p className={styles.note}>
            Потенциальные косвенные признаки: регулярность выступлений, развитие тематики. Веса, пороги и оценка
            потенциала пока не утверждены.
          </p>
        </Card>
      ) : (
        <Alert icon="↗">
          <span className={styles.inline}>
            Выявление слабых сигналов доступно с подпиской DevRel.
            <LinkButton to={rolePath('devrel', 'billing')} variant="secondary" size="sm">Посмотреть тариф</LinkButton>
          </span>
        </Alert>
      )}
    </Stack>
  );
}
