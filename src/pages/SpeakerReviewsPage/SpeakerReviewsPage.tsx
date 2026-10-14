import { useRef } from 'react';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { FeedbackList } from '@/components/feedback/FeedbackList/FeedbackList';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Badge, Button, Card, Grid, Input, LinkButton, Stack, useToast } from '@/components/ui';
import { feedbackPath, feedbackUrl } from '@/features/feedback/link';
import { feedbackQuestions } from '@/features/feedback/questions';
import { useDemoState } from '@/store/useDemoStore';
import styles from './SpeakerReviewsPage.module.scss';

/** Speaker's public feedback link and the anonymous listener feedback received through it. */
export function SpeakerReviewsPage() {
  const { feedback, feedbackToken } = useDemoState();
  const { toast } = useToast();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const link = feedbackUrl(feedbackToken);

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
            description="Передайте ссылку слушателям после выступления."
            actions={<Badge>Бесплатно</Badge>}
          >
            <Stack gap={3}>
              <Input ref={linkInputRef} label="Публичная ссылка (только форма)" value={link} readOnly onFocus={(e) => e.target.select()} />
              <div className={styles.actions}>
                <Button onClick={copyLink}>Скопировать ссылку</Button>
                <LinkButton to={feedbackPath(feedbackToken)} target="_blank" rel="noopener noreferrer" variant="secondary">
                  Проверить форму ↗
                </LinkButton>
              </div>
              <p className={styles.fineprint}>
                Демонстрационный вариант ссылки на спикера. Возможность отдельной ссылки на каждое выступление еще не
                согласована.
              </p>
            </Stack>
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
          <FeedbackList feedback={feedback} emptyText="Отзывов пока нет — поделитесь ссылкой со слушателями" />
        </Card>
      </Stack>
    </>
  );
}
