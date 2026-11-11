import type { AudioAnalysisSummaryDto, AudioReportDto, SpeechCandidateType } from '@/api/types';

export const isAudioFile = (name: string) => /\.(mp3|wav|ogg|m4a)$/i.test(name);
export const isAnalysing = (status: AudioAnalysisSummaryDto['status']) => status === 'QUEUED' || status === 'RUNNING';

export const analysisLabels: Record<AudioAnalysisSummaryDto['status'], string> = {
  QUEUED: 'В очереди', RUNNING: 'Анализируем…', SUCCEEDED: 'Анализ готов', FAILED: 'Не удалось проанализировать',
};

export const candidateLabels: Record<SpeechCandidateType, string> = {
  filler: 'Слова-паразиты', repeat: 'Повторы', hesitation: 'Заминка в тексте',
};

const errors: Record<string, string> = {
  DOWNLOAD_FAILED: 'Не удалось получить запись. Попробуйте запустить анализ ещё раз.',
  INVALID_AUDIO: 'Не удалось прочитать аудио. Поддерживаются MP3, WAV, OGG и M4A без видео, до 50 МБ и 60 минут.',
  ANALYSIS_FAILED: 'Не удалось обработать запись. Попробуйте ещё раз.',
  ANALYSIS_TIMEOUT: 'Обработка заняла слишком много времени. Попробуйте более короткую запись.',
  LEASE_EXPIRED: 'Обработка прервалась. Запустите анализ ещё раз.',
};

export const analysisError = (code: string | null) => errors[code ?? ''] ?? 'Не удалось выполнить анализ. Попробуйте ещё раз.';

/** Time within an audio recording, not a wall-clock date. */
export function audioTime(ms: number): string {
  const seconds = Math.floor(Math.max(0, Number.isFinite(ms) ? ms : 0) / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Legacy candidates only refer to a segment; zero is a valid word timestamp. */
export function candidateTime(candidate: AudioReportDto['candidates'][number], report: AudioReportDto): number | undefined {
  if (candidate.startMs != null && Number.isFinite(candidate.startMs) && candidate.startMs >= 0) return candidate.startMs;
  return report.transcript.find((segment) => segment.id === candidate.segmentId)?.startMs;
}

export function candidateCounts(report: AudioReportDto): Record<SpeechCandidateType, number> {
  const counts = { filler: 0, repeat: 0, hesitation: 0 };
  for (const candidate of report.candidates ?? []) {
    if (candidate.type in counts) counts[candidate.type]++;
  }
  return counts;
}
