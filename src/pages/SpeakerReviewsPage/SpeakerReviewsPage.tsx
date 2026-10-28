import { useRef, useState } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import { rolePath } from '@/app/navigation';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { FeedbackList } from '@/components/feedback/FeedbackList/FeedbackList';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Badge, Button, Card, EmptyState, Grid, Input, LinkButton, Select, Stack, useToast } from '@/components/ui';
import { feedbackPath, feedbackUrl } from '@/features/feedback/link';
import { feedbackQuestions } from '@/features/feedback/questions';
import { useAppState } from '@/store/useAppStore';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerReviewsPage.module.scss';

/** Links to the public feedback form for each speech and the anonymous listener feedback received through them. */
export function SpeakerReviewsPage() {
  const { feedback, speeches } = useAppState();
  const { toast } = useToast();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const newestSpeeches = [...speeches].sort((a, b) => b.date.localeCompare(a.date));
  const [speechId, setSpeechId] = useState(newestSpeeches[0]?.id ?? '');
  // Tokens already issued in this visit, by speech: the backend returns the same token on every call.
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const token = tokens[speechId];
  const link = token ? feedbackUrl(token) : '';
  const speechLabel = (id: string) => {
    const speech = speeches.find((item) => item.id === id);
    return speech && `${speech.event} · ${formatLongDate(speech.date)}`;
  };

  const getLink = async () => {
    setPending(true);
    setError(undefined);
    try {
      const response = await api.feedbackLink(speechId);
      setTokens((current) => ({ ...current, [speechId]: response.token }));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast('Ссылка скопирована');
    } catch {
      // Clipboard can be blocked: select the text so it can be copied manually.
      linkInputRef.current?.select();
      toast('Не удалось скопировать автоматически — ссылка выделена, скопируйте вручную');
    }
  };

  return (
    <>
      <PageHeader
        title="Отзывы слушателей"
        description="Слушатели заполняют публичную форму без регистрации, не получая доступа к вашему профилю."
      />

      <Stack>
        <Grid columns={2}>
          <Card
            as="section"
            variant="ai"
            title="Ссылка для отзывов"
            titleAs="h2"
            description="У каждого выступления своя ссылка: отзывы сразу привязаны к нему."
            actions={<Badge>Бесплатно</Badge>}
          >
            {newestSpeeches.length === 0 ? (
              <EmptyState
                variant="plain"
                title="Сначала добавьте выступление"
                description="Ссылка на форму создается для конкретного выступления."
                action={<LinkButton to={rolePath('speaker', 'talks')} variant="soft" size="sm">К выступлениям</LinkButton>}
              />
            ) : (
              <Stack gap={3}>
                <Select
                  label="Выступление"
                  value={speechId}
                  onChange={(event) => setSpeechId(event.target.value)}
                  options={newestSpeeches.map((speech) => ({ value: speech.id, label: `${speech.event} · ${formatLongDate(speech.date)}` }))}
                />
                {error && <Alert tone="danger" role="alert">{error}</Alert>}
                {token ? (
                  <>
                    <Input ref={linkInputRef} label="Публичная ссылка (только форма)" value={link} readOnly onFocus={(e) => e.target.select()} />
                    <div className={styles.actions}>
                      <Button onClick={copyLink}>Скопировать ссылку</Button>
                      <LinkButton to={feedbackPath(token)} target="_blank" rel="noopener noreferrer" variant="secondary">
                        Проверить форму ↗
                      </LinkButton>
                    </div>
                  </>
                ) : (
                  <div>
                    <Button onClick={getLink} disabled={pending || !speechId}>Получить ссылку</Button>
                  </div>
                )}
              </Stack>
            )}
          </Card>

          <Card as="section" title="Сводка ответов" titleAs="h2">
            <Grid columns={2} responsive={false}>
              <StatCard label="Получено отзывов" value={feedback.length} />
              <StatCard label="Критериев в форме" value={feedbackQuestions.length} />
            </Grid>
            <p className={styles.note}>
              Оценка по данной форме не является NPS. Отзывы можно использовать при формировании персонального плана
              развития.
            </p>
          </Card>
        </Grid>

        <Card as="section" title="Полученные отзывы" titleAs="h2">
          <FeedbackList feedback={feedback} speechLabel={speechLabel} emptyText="Отзывов пока нет — поделитесь ссылкой со слушателями" />
        </Card>
      </Stack>
    </>
  );
}
