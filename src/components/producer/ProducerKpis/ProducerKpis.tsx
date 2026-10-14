import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { Grid } from '@/components/ui';
import { recentSpeechCount, type ProducerFacts } from '@/features/producer/producer';

/** Source data at a glance; NPS is not computed by this feedback form. */
export function ProducerKpis({ facts }: { facts: ProducerFacts }) {
  return (
    <Grid columns={3} aria-label="Исходные данные">
      <StatCard label="Отзывы / 12 месяцев" value={facts.feedback.length} hint="Максимум 80 в выборке" />
      <StatCard label="Доклады" value={facts.talkCount} hint="Описания и темы" />
      <StatCard label="Выступления" value={facts.speeches.length} hint="Последние 12 записей" />
      <StatCard label="Активные CFP" value={facts.openCfp.length} hint="Только неистекшие сроки" />
      <StatCard label="Активность / 90 дней" value={recentSpeechCount(facts)} hint="Прошедшие выступления" />
      <StatCard label="NPS" value="—" hint="Не рассчитывается по этой форме" />
    </Grid>
  );
}
