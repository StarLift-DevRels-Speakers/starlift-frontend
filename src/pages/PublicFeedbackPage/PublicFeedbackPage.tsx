import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { ApiError, errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import type { PublicFeedbackForm } from '@/api/types';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { Alert, Badge, Button, Card, OptionGroup, Stack, Textarea } from '@/components/ui';
import { feedbackQuestions } from '@/features/feedback/questions';
import type { FeedbackQuestionKey } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './PublicFeedbackPage.module.scss';

type Answers = Partial<Record<FeedbackQuestionKey, number>>;

/** `null` — the link is unknown; `undefined` — still loading. */
type FormState = PublicFeedbackForm | null | undefined;

/**
 * Anonymous listener form opened by the link to one speech: no account, no app shell,
 * and nothing about the speaker's profile is shown.
 */
export function PublicFeedbackPage() {
  const { token = '' } = useParams();
  const [form, setForm] = useState<FormState>();
  const [answers, setAnswers] = useState<Answers>({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.publicFeedbackForm(token)
      .then((data) => !cancelled && setForm(data))
      .catch((caught: unknown) => {
        if (cancelled) return;
        if (caught instanceof ApiError && caught.status === 404) setForm(null);
        else setError(errorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const complete = feedbackQuestions.every((question) => [0, 1, 2].includes(answers[question.key] ?? -1));
    if (!complete) {
      setError('Ответьте на все пять вопросов');
      return;
    }
    setPending(true);
    try {
      await api.submitPublicFeedback(token, answers as Record<FeedbackQuestionKey, number>, comment.trim());
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  const startOver = () => {
    setAnswers({});
    setComment('');
    setError(undefined);
    setSubmitted(false);
  };

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <div className={styles.brand}>
          <BrandLogo />
          <Badge tone="muted">Публичная форма</Badge>
        </div>

        <Card>
          {form === undefined ? (
            <div className={styles.message} role="status">
              {error ? <Alert tone="danger" role="alert">{error}</Alert> : <p className={styles.muted}>Загрузка формы…</p>}
            </div>
          ) : form === null ? (
            <div className={styles.message}>
              <h1 className={styles.title}>Ссылка недействительна</h1>
              <p className={styles.muted}>По этой ссылке форма обратной связи недоступна.</p>
            </div>
          ) : submitted ? (
            <div className={styles.success} role="status">
              <span className={styles.check} aria-hidden="true">✓</span>
              <h1 className={styles.title}>Спасибо за отзыв!</h1>
              <p className={styles.muted}>Ваши ответы переданы спикеру анонимно.</p>
              <Button variant="secondary" onClick={startOver}>Оставить еще один отзыв</Button>
            </div>
          ) : (
            <>
              <p className={styles.eyebrow}>Обратная связь</p>
              <h1 className={styles.title}>Оцените выступление</h1>
              <p className={styles.muted}>
                «{form.topic}» · {form.eventName}{form.date && `, ${formatLongDate(form.date)}`}
              </p>
              <p className={styles.muted}>
                Выберите ответы на пять вопросов. Комментарий можно оставить по желанию. Регистрация не требуется.
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <Stack gap={3}>
                  {feedbackQuestions.map((question, index) => (
                    <div key={question.key} className={styles.question}>
                      <OptionGroup
                        legend={`${index + 1}. ${question.title} *`}
                        name={question.key}
                        required
                        value={answers[question.key]?.toString() ?? ''}
                        onChange={(value) => {
                          setAnswers((current) => ({ ...current, [question.key]: Number(value) }));
                          setError(undefined);
                        }}
                        options={question.options.map((label, optionIndex) => ({ value: String(optionIndex), label }))}
                      />
                    </div>
                  ))}

                  <Textarea
                    label="6. Ваш комментарий или пожелания спикеру (необязательно)"
                    placeholder="Что понравилось? Что можно улучшить?"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />

                  {error && <Alert tone="danger" role="alert">{error}</Alert>}
                  <Button type="submit" size="lg" fullWidth disabled={pending}>Отправить отзыв</Button>
                  <p className={styles.fineprint}>
                    Доступна только форма отзыва. Профиль, портфолио и контактные сведения Спикера по этой ссылке не
                    раскрываются.
                  </p>
                </Stack>
              </form>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
