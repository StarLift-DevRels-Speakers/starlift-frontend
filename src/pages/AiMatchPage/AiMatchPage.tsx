import { useState, type FormEvent } from 'react';
import { rolePath } from '@/app/navigation';
import { AiResultView } from '@/components/ai/AiResultView/AiResultView';
import { PaywallModal } from '@/components/billing/PaywallModal/PaywallModal';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Badge, Button, Card, Grid, Input, LinkButton, Select, Stack, useToast } from '@/components/ui';
import { aiOutcomeOptions, aiRight } from '@/features/ai/aiMatch';
import { isSubscriptionActive } from '@/features/billing/access';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import type { AiOutcome } from '@/types/domain';
import type { Role } from '@/types/role';
import { formatLongDate } from '@/utils/date';
import styles from './AiMatchPage.module.scss';

const copy: Record<Role, { title: string; description: string; formTitle: string; formNote: string }> = {
  speaker: {
    title: 'AI-подбор мероприятий',
    description: 'Поиск релевантных CFP по вашему опыту и предпочтениям.',
    formTitle: 'Параметры подбора',
    formNote: 'Используем сведения из профиля и выбранные дополнительные параметры.',
  },
  devrel: {
    title: 'AI-подбор спикеров',
    description: 'Подбор экспертов с учетом параметров мероприятия.',
    formTitle: 'Требования к спикеру',
    formNote: 'Используем заданные требования к мероприятию и доступные данные Спикеров.',
  },
};

const formatOptions: Record<Role, string[]> = {
  speaker: ['Любой', 'Онлайн', 'Офлайн'],
  devrel: ['Любой', 'Доклад', 'Воркшоп'],
};

const resultToasts: Record<AiOutcome, string> = {
  success: 'Подбор завершен, результат сформирован.',
  empty: 'Подбор завершен: совпадений нет. Запрос учтен.',
  insufficient: 'AI-операция не завершилась успешно. Право сохранено.',
  error: 'AI-операция не завершилась успешно. Право сохранено.',
};

export interface AiMatchPageProps {
  role: Role;
}

/** AI matching: events for a speaker, speakers for a DevRel. Paid after the free trial. */
export function AiMatchPage({ role }: AiMatchPageProps) {
  const { billing: allBilling, aiResults, events, profiles } = useDemoState();
  const { runAiMatch } = useDemoActions();
  const { toast } = useToast();
  const isSpeaker = role === 'speaker';
  const billing = allBilling[role];
  const subscribed = isSubscriptionActive(billing);
  const result = aiResults[role];
  const skills = profiles.speaker.skills;

  const [topics, setTopics] = useState(isSpeaker ? skills : 'Java, Backend');
  const [region, setRegion] = useState('Россия');
  const [audience, setAudience] = useState('Senior');
  const [eventId, setEventId] = useState('');
  const [format, setFormat] = useState(formatOptions[role][0]);
  const [outcome, setOutcome] = useState<AiOutcome>('success');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const run = () => {
    const response = runAiMatch(role, topics, outcome);
    if (response.ok) toast(resultToasts[outcome]);
    else if (response.reason === 'paywall') setPaywallOpen(true);
    else toast(response.error);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run();
  };

  return (
    <>
      <PageHeader
        title={copy[role].title}
        description={copy[role].description}
        actions={
          <Badge tone={subscribed ? 'brand' : 'ai'}>
            {subscribed ? 'Подписка активна' : billing.trialUsed ? 'Пробный запрос использован' : '1 бесплатный пробный запрос'}
          </Badge>
        }
      />

      <Stack>
        <Grid columns={2}>
          <Card
            as="section"
            variant="ai"
            title={copy[role].formTitle}
            titleAs="h2"
            description={copy[role].formNote}
            actions={<Badge tone="ai">AI-функция</Badge>}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap={3}>
                {isSpeaker ? (
                  <>
                    <Alert tone="neutral" icon="◉">
                      <span className={styles.inline}>
                        Профиль: {skills}.
                        <LinkButton to={rolePath('speaker', 'profile')} variant="text" size="sm">Изменить</LinkButton>
                      </span>
                    </Alert>
                    <Input
                      label="Темы (можно уточнить)"
                      required
                      placeholder="Например, Java, backend"
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                    />
                    <Grid columns={2}>
                      <Input label="Регион" placeholder="Например, Россия" value={region} onChange={(e) => setRegion(e.target.value)} />
                      <Select
                        label="Формат"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        options={formatOptions.speaker.map((option) => ({ value: option, label: option }))}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Select
                      label="Мероприятие"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      options={[
                        { value: '', label: 'Без привязки к мероприятию' },
                        ...events.filter((event) => event.owner === 'devrel').map((event) => ({ value: event.id, label: event.name })),
                      ]}
                    />
                    <Input label="Тематика / компетенции" required value={topics} onChange={(e) => setTopics(e.target.value)} />
                    <Grid columns={2}>
                      <Input label="Уровень аудитории" value={audience} onChange={(e) => setAudience(e.target.value)} />
                      <Select
                        label="Формат"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        options={formatOptions.devrel.map((option) => ({ value: option, label: option }))}
                      />
                    </Grid>
                  </>
                )}

                <Select
                  label="Режим демонстрации результата"
                  hint="Позволяет проверить состояния интерфейса. Не является бизнес-параметром AI."
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as AiOutcome)}
                  options={aiOutcomeOptions}
                />

                <div className={styles.buttons}>
                  <Button type="submit">✦ Запустить AI-подбор</Button>
                  <LinkButton to={rolePath(role, 'billing')} variant="secondary">Тарифы и покупки</LinkButton>
                </div>
              </Stack>
            </form>
          </Card>

          <Stack>
            <Card as="section" title="Ваш доступ" titleAs="h2">
              <ul className={styles.rows}>
                <li>
                  <span>Подписка</span>
                  <Badge tone={subscribed ? 'brand' : 'muted'}>{subscribed ? 'Активна' : 'Нет подписки'}</Badge>
                </li>
                <li>
                  <span>Бесплатная попытка</span>
                  <Badge tone={billing.trialUsed ? 'muted' : 'brand'}>{billing.trialUsed ? 'Использована' : 'Доступна'}</Badge>
                </li>
                <li>
                  <span>Купленные попытки</span>
                  <strong>{billing.rights[aiRight[role]]}</strong>
                </li>
              </ul>
              <p className={styles.note}>
                Очередность доступа: подписка → бесплатная попытка → разовая покупка. Списание после успешного результата.
              </p>
            </Card>

            <Card as="section" title="Как оценивается результат" titleAs="h2">
              <ul className={styles.rules}>
                <li>Показываем причины совпадения по имеющимся данным.</li>
                <li>Отмечаем неизвестные параметры и ограничения.</li>
                <li>Не создаем неподтвержденные факты.</li>
                {!isSpeaker && <li>Слабые сигналы доступны только по подписке и описываются отдельно от обычного AI-подбора.</li>}
              </ul>
            </Card>
          </Stack>
        </Grid>

        {result && (
          <Card
            as="section"
            title="Последний результат"
            titleAs="h2"
            actions={<span className={styles.note}>{formatLongDate(result.at)}</span>}
            aria-live="polite"
          >
            <AiResultView role={role} result={result} onInvite={() => setInviteOpen(true)} />
          </Card>
        )}
      </Stack>

      {paywallOpen && (
        <PaywallModal
          role={role}
          right={aiRight[role]}
          onClose={() => setPaywallOpen(false)}
          onPurchased={() => {
            setPaywallOpen(false);
            run();
          }}
        />
      )}

      {inviteOpen && <InviteSpeakerModal speakerName={profiles.speaker.name} onClose={() => setInviteOpen(false)} />}
    </>
  );
}
