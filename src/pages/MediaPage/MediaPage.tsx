import { useState } from 'react';
import { errorMessage } from '@/api/client';
import { AudioAnalysisModal } from '@/components/audio/AudioAnalysisModal/AudioAnalysisModal';
import type { AudienceFitCheckDto } from '@/api/types';
import { AudienceFitBadge } from '@/components/audience/AudienceFitBadge/AudienceFitBadge';
import { AudienceFitModal } from '@/components/audience/AudienceFitModal/AudienceFitModal';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import { MediaFormModal } from '@/components/media/MediaFormModal/MediaFormModal';
import { Alert, Badge, Button, Card, EmptyState, IconTile, ListItem, Modal, Stack, useToast } from '@/components/ui';
import { analysisLabels, isAnalysing, isAudioFile } from '@/features/audio/audioAnalysis';
import { useAudioAnalyses } from '@/features/audio/useAudioAnalyses';
import { latestBy } from '@/features/audience/audienceFit';
import { useAudienceFitChecks } from '@/features/audience/useAudience';
import { useAppActions, useAppState } from '@/store/useAppStore';
import type { MediaFile } from '@/types/domain';
import { formatFileSize } from '@/utils/file';
import styles from './MediaPage.module.scss';

/** Speaker's media files for talks and speeches, stored on the backend. */
export function MediaPage() {
  const { media, talks } = useAppState();
  const { deleteMedia } = useAppActions();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [fileToDelete, setFileToDelete] = useState<MediaFile>();
  const { checks, reload: reloadChecks } = useAudienceFitChecks();
  const [openedCheck, setOpenedCheck] = useState<AudienceFitCheckDto>();
  const audio = useAudioAnalyses(media.some((file) => isAudioFile(file.name)));
  const openedAudio = media.find((file) => file.id === params.get('analysis'));
  const openedJob = audio.jobs.find((job) => job.mediaId === openedAudio?.id);
  const openAudio = (mediaId: string) => setParams((current) => { current.set('analysis', mediaId); return current; });
  const closeAudio = () => setParams((current) => { current.delete('analysis'); return current; }, { replace: true });
  const runAudio = async (mediaId: string) => {
    try {
      await audio.start(mediaId);
      openAudio(mediaId);
    } catch (error) { toast(errorMessage(error)); }
  };
  // The newest check of each file per event: a presentation is checked for every event its talk is submitted to.
  const fileChecks = [...latestBy(checks, (check) => (check.mediaId ? `${check.mediaId}:${check.eventId}` : null)).values()];

  // `?new=1` opens the add form, so the dialog can be linked to.
  const formOpen = params.get('new') === '1';
  const openForm = () => setParams({ new: '1' }, { replace: true });
  const closeForm = () => {
    setParams({}, { replace: true });
    // An upload to a submitted talk starts checks on the backend: show them as pending.
    setTimeout(reloadChecks, 1500);
    audio.reload();
  };

  const talkName = new Map(talks.map((talk) => [talk.id, talk.name]));

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    const result = await deleteMedia(fileToDelete.id);
    setFileToDelete(undefined);
    toast(result.ok ? 'Медиафайл удален' : result.error);
    if (result.ok) audio.reload();
  };

  return (
    <>
      <PageHeader
        title="Медиафайлы"
        description="Материалы собственных докладов и выступлений."
        actions={<Button onClick={openForm}>+ Добавить файл</Button>}
      />

      <Card as="section" title="Библиотека" titleAs="h2">
        <Stack gap={3}>
          <Alert tone="neutral">
            Файлы хранятся на сервере: презентации, документы, тексты, изображения и аудио до 50 МБ.
          </Alert>
          {media.some((file) => isAudioFile(file.name)) && <Alert tone="info" title="Анализ речи">
            Запись репетиции или выступления на русском: MP3, WAV, OGG, M4A без видео, до 60 минут.
            Получите расшифровку, темп, паузы и фрагменты для переслушивания. Основной сценарий — один спикер.
          </Alert>}
          {audio.error && <Alert tone="warning" role="alert">Не удалось обновить статусы анализа. {audio.error} <Button variant="text" size="sm" onClick={audio.reload}>Обновить</Button></Alert>}
          <Alert tone="info" title="✦ Проверка под аудиторию">
            Презентацию (PDF, PPTX) или текст выступления (DOCX, TXT, MD) доклада, поданного на мероприятие, AI сразу проверит
            на соответствие ожидаемой аудитории. Результат появится у файла и в уведомлениях.
          </Alert>

          {media.length > 0 ? (
            <ul className={styles.list}>
              {media.map((file) => (
                <ListItem
                  key={file.id}
                  leading={<IconTile><WorkspaceIcon name="file" /></IconTile>}
                  title={file.name}
                  meta={`${talkName.get(file.talkId) ?? 'Без доклада'} · ${formatFileSize(file.sizeBytes)}`}
                  trailing={
                    <Button variant="danger" size="sm" aria-label={`Удалить: ${file.name}`} onClick={() => setFileToDelete(file)}>
                      Удалить
                    </Button>
                  }
                >
                  {isAudioFile(file.name) && (() => {
                    const job = audio.jobs.find((item) => item.mediaId === file.id);
                    return <div className={styles.checks}>
                      {job && <Badge tone={isAnalysing(job.status) ? 'ai' : job.status === 'FAILED' ? 'danger' : 'brand'}>{analysisLabels[job.status]}</Badge>}
                      <Button variant="soft" size="sm" disabled={audio.loading || audio.starting || Boolean(audio.error)}
                        aria-label={`${job ? 'Открыть анализ речи' : 'Анализировать речь'}: ${file.name}`}
                        onClick={() => job ? openAudio(file.id) : void runAudio(file.id)}>
                        {audio.loading ? 'Загружаем статус…' : job ? 'Открыть анализ' : audio.starting ? 'Запускаем…' : 'Анализировать речь'}
                      </Button>
                    </div>;
                  })()}
                  {fileChecks.some((check) => check.mediaId === file.id) && (
                    <div className={styles.checks}>
                      {fileChecks.filter((check) => check.mediaId === file.id).map((check) => (
                        <AudienceFitBadge key={check.id} check={check} context={check.eventName ?? undefined} onOpen={() => setOpenedCheck(check)} />
                      ))}
                    </div>
                  )}
                </ListItem>
              ))}
            </ul>
          ) : (
            <EmptyState
              variant="plain"
              title="Медиафайлов пока нет"
              description="Добавьте слайды, записи и другие материалы докладов."
              action={<Button size="sm" onClick={openForm}>+ Добавить файл</Button>}
            />
          )}
        </Stack>
      </Card>

      {formOpen && <MediaFormModal onClose={closeForm} />}

      {openedAudio && openedJob && <AudioAnalysisModal key={openedJob.analysisId} file={openedAudio} job={openedJob}
        onClose={closeAudio} onRun={() => void runAudio(openedAudio.id)} starting={audio.starting} />}

      {openedCheck && (
        <AudienceFitModal
          check={checks.find((check) => check.id === openedCheck.id) ?? openedCheck}
          onClose={() => setOpenedCheck(undefined)}
        />
      )}

      <Modal
        open={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(undefined)}
        title="Удалить медиафайл?"
        description={fileToDelete && `Файл «${fileToDelete.name}» будет удален с сервера.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFileToDelete(undefined)}>Отмена</Button>
            <Button variant="danger" onClick={confirmDelete}>Удалить</Button>
          </>
        }
      />
    </>
  );
}
