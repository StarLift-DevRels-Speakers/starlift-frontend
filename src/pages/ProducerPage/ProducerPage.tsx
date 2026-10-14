import { useEffect, useRef, useState } from 'react';
import { rolePath } from '@/app/navigation';
import { PurchaseConfirmModal } from '@/components/billing/PurchaseConfirmModal/PurchaseConfirmModal';
import { FeedbackList } from '@/components/feedback/FeedbackList/FeedbackList';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { AnswerDistributionCard } from '@/components/producer/AnswerDistributionCard/AnswerDistributionCard';
import { BuildPlanCard } from '@/components/producer/BuildPlanCard/BuildPlanCard';
import { ConfirmedPatternsCard } from '@/components/producer/ConfirmedPatternsCard/ConfirmedPatternsCard';
import { DataReadinessCard } from '@/components/producer/DataReadinessCard/DataReadinessCard';
import { DataUsageCard } from '@/components/producer/DataUsageCard/DataUsageCard';
import { PlanDetailsCard } from '@/components/producer/PlanDetailsCard/PlanDetailsCard';
import { PlanHistoryCard } from '@/components/producer/PlanHistoryCard/PlanHistoryCard';
import { ProducerKpis } from '@/components/producer/ProducerKpis/ProducerKpis';
import { ProducerPaywallCard } from '@/components/producer/ProducerPaywallCard/ProducerPaywallCard';
import { ProducerSources } from '@/components/producer/ProducerSources/ProducerSources';
import { SpeakerDevelopmentCard } from '@/components/producer/SpeakerDevelopmentCard/SpeakerDevelopmentCard';
import { Alert, Badge, Button, Card, LinkButton, Modal, Stack, useToast } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import { collectFacts, countLabel, PLAN_SECTION_ID, reviewAnchorId } from '@/features/producer/producer';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import styles from './ProducerPage.module.scss';

/** Speaker's AI producer: source data, confirmed patterns and versioned 30/60-day plans (subscription). */
export function ProducerPage() {
  const demo = useDemoState();
  const { buildProducerPlan } = useDemoActions();
  const { toast } = useToast();
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [notReadyOpen, setNotReadyOpen] = useState(false);
  const scrollToPlan = useRef(false);

  const hasSubscription = isSubscriptionActive(demo.billing.speaker);
  const facts = collectFacts(demo);
  const latestPlan = demo.plans.at(-1);

  // After a new version is built, bring the plan into view like the mockup does.
  useEffect(() => {
    if (!scrollToPlan.current) return;
    scrollToPlan.current = false;
    const section = document.getElementById(PLAN_SECTION_ID);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section?.focus({ preventScroll: true });
  }, [latestPlan?.id]);

  const buildPlan = () => {
    const result = buildProducerPlan();
    if (result.ok) {
      scrollToPlan.current = true;
      toast('Детализированный демонстрационный план сформирован');
    } else if (result.reason === 'paywall') {
      setPurchaseOpen(true);
    } else {
      setNotReadyOpen(true);
    }
  };

  return (
    <>
      <PageHeader
        title="ИИ-продюсер"
        description="Расширенная аналитика: исходные данные, доказательства, ограничения, план действий и история версий."
        actions={<Badge tone="ai">PRODUCER</Badge>}
      />

      <Stack>
        <SpeakerDevelopmentCard profile={demo.profiles.speaker} hasSubscription={hasSubscription} />
        <ProducerKpis facts={facts} />

        <div className={styles.split}>
          <DataReadinessCard facts={facts} />
          <DataUsageCard />
        </div>

        {hasSubscription ? (
          <>
            <BuildPlanCard hasPlans={demo.plans.length > 0} ready={facts.ready} onBuild={buildPlan} />
            <AnswerDistributionCard facts={facts} />
            <ConfirmedPatternsCard facts={facts} />
            {latestPlan ? (
              <PlanDetailsCard plan={latestPlan} />
            ) : (
              <Card
                as="section"
                title="План пока не сформирован"
                titleAs="h2"
                description="Нажмите «Сформировать план развития» выше. После этого появятся подтвержденные выводы, действия на 30/60 дней и ссылки на исходные отзывы."
              />
            )}
            <PlanHistoryCard plans={demo.plans} />
          </>
        ) : (
          <ProducerPaywallCard onSubscribe={() => setPurchaseOpen(true)} />
        )}

        <div className={styles.split}>
          <ProducerSources facts={facts} talks={demo.talks} />
        </div>

        {hasSubscription && (
          <Card
            as="section"
            title="Отзывы и первичные подтверждения"
            titleAs="h2"
            actions={<Badge tone="muted">{countLabel(facts.feedback.length, ['запись', 'записи', 'записей'])}</Badge>}
            description="Именно эти записи используются для счетчиков. Нажмите идентификатор в выводе выше, чтобы перейти к конкретному отзыву."
          >
            <FeedbackList feedback={facts.feedback} anchorId={reviewAnchorId} />
            <p className={styles.fineprint}>
              Отзывы собраны по общей ссылке на Спикера. Здесь нет достоверной привязки к конкретному выступлению.
            </p>
          </Card>
        )}

        <Alert tone="neutral">
          Разработка ИИ-продюсера входит в ТЗ StarLift. Демонстрационные записи, счетчики и планы в этом макете не являются
          результатами настоящей модели или подтвержденными оценками человека.
        </Alert>
      </Stack>

      {purchaseOpen && (
        <PurchaseConfirmModal
          role="speaker"
          type="subscription"
          onCancel={() => setPurchaseOpen(false)}
          onPurchased={() => {
            setPurchaseOpen(false);
            toast('Тестовая подписка оформлена. Реальной оплаты не было.');
          }}
        />
      )}

      <Modal
        open={notReadyOpen}
        onClose={() => setNotReadyOpen(false)}
        title="Недостаточно исходных данных"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNotReadyOpen(false)}>Закрыть</Button>
            <LinkButton to={rolePath('speaker', 'reviews')}>Перейти к отзывам</LinkButton>
          </>
        }
      >
        <Alert tone="warning">
          Для демонстрационного анализа нужны минимум три отзыва слушателей за год, один доклад и запись о выступлении.
          Добавьте факты и попробуйте еще раз.
        </Alert>
      </Modal>
    </>
  );
}
