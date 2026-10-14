import type { FeedbackQuestionKey } from '@/types/domain';

export interface FeedbackQuestion {
  key: FeedbackQuestionKey;
  title: string;
  /** Answers are stored as indexes of these options. */
  options: [string, string, string];
}

// Five single-choice questions of the public listener form (from the mockup).
export const feedbackQuestions: FeedbackQuestion[] = [
  { key: 'utility', title: 'Насколько полезным было выступление?', options: ['Очень полезно', 'Скорее полезно', 'Мало полезной информации'] },
  { key: 'clarity', title: 'Насколько понятной была подача материала?', options: ['Все понятно', 'Иногда было сложно', 'Материал был непонятен'] },
  { key: 'examples', title: 'Хватило ли практических примеров?', options: ['Да, примеров достаточно', 'Хотелось бы больше', 'Практических примеров не было'] },
  { key: 'pace', title: 'Как оцениваете темп выступления?', options: ['Комфортный', 'Слишком быстрый', 'Слишком медленный'] },
  { key: 'engagement', title: 'Насколько интересной была подача?', options: ['Очень интересно', 'Местами интересно', 'Было сложно удерживать внимание'] },
];
