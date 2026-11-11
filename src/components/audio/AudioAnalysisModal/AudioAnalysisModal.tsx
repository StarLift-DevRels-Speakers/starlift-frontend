import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import type { AudioAnalysisDto, AudioAnalysisSummaryDto, AudioReportDto } from '@/api/types';
import { Alert, Badge, Button, EmptyState, Modal, Stack, Tabs } from '@/components/ui';
import { analysisError, analysisLabels, audioTime, candidateCounts, candidateLabels, candidateTime, isAnalysing } from '@/features/audio/audioAnalysis';
import type { MediaFile } from '@/types/domain';
import styles from './AudioAnalysisModal.module.scss';

interface Props {
  file: MediaFile;
  job: AudioAnalysisSummaryDto;
  onClose: () => void;
  onRun: () => void;
  starting: boolean;
}

export function AudioAnalysisModal({ file, job, onClose, onRun, starting }: Props) {
  const [detail, setDetail] = useState<AudioAnalysisDto>();
  const [error, setError] = useState<string>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.audioAnalysis(job.analysisId).then((result) => {
      if (!cancelled) { setDetail(result); setError(undefined); }
    }).catch((reason: unknown) => { if (!cancelled) setError(errorMessage(reason)); });
    return () => { cancelled = true; };
  }, [job.analysisId, job.status, version]);

  const pending = isAnalysing(job.status);
  return (
    <Modal open focusTitle onClose={onClose} title="Анализ речи" description={file.name} size="lg" className={styles.modal}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Закрыть</Button>
        {!pending && <Button variant="soft" onClick={onRun} disabled={starting}>{starting ? 'Запускаем…' : 'Повторить анализ'}</Button>}
      </>}
    >
      <Stack gap={4}>
        <Badge tone={pending ? 'ai' : job.status === 'FAILED' ? 'danger' : 'brand'}>{analysisLabels[job.status]}</Badge>
        {pending && <Alert role="status">{job.status === 'QUEUED' ? 'Запись ждёт обработки. Можно закрыть окно и вернуться позже.' : 'Распознаём речь и ищем фрагменты для разбора. Можно закрыть окно: результат сохранится.'}</Alert>}
        {job.status === 'FAILED' && <Alert tone="danger" role="alert">{analysisError(job.errorCode)}</Alert>}
        {error && <Alert tone="danger" role="alert">{error} <Button variant="text" size="sm" onClick={() => setVersion((value) => value + 1)}>Повторить загрузку</Button></Alert>}
        {!pending && job.status === 'SUCCEEDED' && !detail && !error && <p role="status">Загружаем отчёт…</p>}
        {detail?.status === 'SUCCEEDED' && detail.report && <AudioResult fileId={file.id} report={detail.report} />}
      </Stack>
    </Modal>
  );
}

function AudioResult({ fileId, report }: { fileId: string; report: AudioReportDto }) {
  const player = useRef<HTMLAudioElement>(null);
  const seekTarget = useRef<number | null>(null);
  const [url, setUrl] = useState<string>();
  const [audioError, setAudioError] = useState<string>();
  const [version, setVersion] = useState(0);
  const [position, setPosition] = useState(0);
  const counts = candidateCounts(report);
  const frequent = report.candidateSummary?.find((summary) => summary.type === 'filler')?.byText ?? [];

  useEffect(() => {
    let cancelled = false;
    api.mediaUrl(fileId).then((value) => {
      if (!cancelled) { setUrl(value); setAudioError(undefined); }
    }).catch((reason: unknown) => { if (!cancelled) setAudioError(errorMessage(reason)); });
    return () => { cancelled = true; };
  }, [fileId, version]);

  const seek = (ms: number) => {
    const audio = player.current;
    if (!audio || !Number.isFinite(ms)) return;
    const seconds = Math.max(0, Math.min(ms, report.durationMs) / 1000);
    seekTarget.current = seconds;
    if (audio.readyState >= 1) {
      audio.currentTime = seconds;
      seekTarget.current = null;
      void audio.play().catch(() => setAudioError('Нажмите «Воспроизвести» в плеере, чтобы прослушать фрагмент.'));
    } else audio.load();
    setPosition(ms);
  };

  const timeButton = (ms: number | undefined, label?: string) => (
    <Button variant="text" size="sm" disabled={ms == null || !url || Boolean(audioError)} onClick={() => ms != null && seek(ms)}
      aria-label={`Слушать ${label ?? 'фрагмент'} с ${audioTime(ms ?? 0)}`}>
      {ms == null ? 'Без таймкода' : audioTime(ms)}
    </Button>
  );

  return (
    <Stack gap={4}>
      <audio ref={player} src={url} controls preload="metadata" className={styles.player} aria-label="Аудиозапись выступления"
        onTimeUpdate={() => setPosition((player.current?.currentTime ?? 0) * 1000)}
        onLoadedMetadata={() => {
          const audio = player.current;
          if (audio && seekTarget.current != null) {
            audio.currentTime = seekTarget.current;
            seekTarget.current = null;
            void audio.play().catch(() => undefined);
          }
        }}
        onError={() => setAudioError('Не удалось воспроизвести запись. Обновите ссылку или попробуйте другой браузер.')}
      />
      {audioError && <Alert tone="warning">{audioError} <Button variant="text" size="sm" onClick={() => setVersion((value) => value + 1)}>Обновить ссылку</Button></Alert>}
      <div className={styles.metrics}>
        <div><strong>{audioTime(report.durationMs)}</strong><span>Длительность</span></div>
        <div><strong>{report.wordCount}</strong><span>Слов</span></div>
        <div><strong>{report.wordsPerMinute == null ? '—' : Math.round(report.wordsPerMinute)}</strong><span>Слов в минуту</span></div>
        <div><strong>{report.pauses.length}</strong><span>Пауз от {((report.minPauseMs ?? 700) / 1000).toLocaleString('ru-RU')} с</span></div>
      </div>
      <Alert tone="neutral">Слова-паразиты, повторы и заминки найдены по расшифровке. Переслушайте контекст: они могут быть уместны. Таймкоды автоматические.</Alert>
      {Boolean(report.tempo?.length) && <Tempo report={report} />}
      <Tabs label="Результаты анализа речи" items={[
        { value: 'candidates', label: `Находки (${report.candidates.length})`, content: <>
          <div className={styles.counts}>{Object.entries(counts).map(([type, count]) => <Badge key={type} tone="muted">{candidateLabels[type as keyof typeof counts]}: {count}</Badge>)}</div>
          {frequent.length > 0 && <p className={styles.summary}>Частые выражения: {frequent.slice(0,5).map((item) => `«${item.text}» × ${item.count}`).join(', ')}.</p>}
          {report.wordCount > 0 && <p className={styles.summary}>Кандидатов в слова-паразиты на 100 слов: {(counts.filler * 100 / report.wordCount).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}.</p>}
          {report.candidates.length ? <ul className={styles.list}>{report.candidates.map((candidate, index) => <li key={index}>
            {timeButton(candidateTime(candidate, report), candidate.text)}
            <div><strong>«{candidate.text}»</strong><span className={styles.caption}>{candidateLabels[candidate.type]}{candidate.startMs == null || candidate.timingSource === 'estimated' ? ' · время приблизительное' : ''}</span></div>
          </li>)}</ul> : <EmptyState variant="plain" title="Текстовых находок нет" description="В расшифровке не отмечены слова-паразиты, повторы или заминки." />}
        </> },
        { value: 'pauses', label: `Паузы (${report.pauses.length})`, content: report.pauses.length ? <ul className={styles.list}>{report.pauses.map((pause, index) => <li key={index}>
          {timeButton(pause.startMs, 'паузу')}<span>{(pause.durationMs / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} с без обнаруженной речи</span>
        </li>)}</ul> : <EmptyState variant="plain" title="Длинных пауз нет" description="Паузы выше выбранного порога не найдены." /> },
        { value: 'transcript', label: 'Расшифровка', content: <ul className={styles.list}>{report.transcript.map((segment) => <li key={segment.id} data-active={position >= segment.startMs && position < segment.endMs || undefined}>
          {timeButton(segment.startMs)}<p>{segment.text}</p>
        </li>)}</ul> },
      ]} />
    </Stack>
  );
}

function Tempo({ report }: { report: AudioReportDto }) {
  const rows = (report.tempo ?? []).filter((row) => Number.isFinite(row.wordsPerMinute));
  if (!rows.length || report.durationMs <= 0) return null;
  const max = Math.max(1, ...rows.map((row) => row.wordsPerMinute));
  const points = rows.map((row) => `${20 + 560 * (row.startMs + row.endMs) / 2 / report.durationMs},${100 - 80 * row.wordsPerMinute / max}`).join(' ');
  return <figure className={styles.tempo}>
    <figcaption>Темп по ходу записи · слов/мин, окна 10 с</figcaption>
    <svg viewBox="0 0 600 135" role="img" aria-label={`Темп по ходу записи, максимум ${Math.round(max)} слов в минуту`}>
      <line x1="20" y1="100" x2="580" y2="100" />
      <polyline points={points} />
      <text x="20" y="125">0:00</text><text x="580" y="125" textAnchor="end">{audioTime(report.durationMs)}</text>
      <text x="20" y="13">{Math.round(max)}</text>
    </svg>
  </figure>;
}
