import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { MediaFormModal } from '@/components/media/MediaFormModal/MediaFormModal';
import { Alert, Button, Card, EmptyState, IconTile, ListItem, Modal, Stack, useToast } from '@/components/ui';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import type { MediaFile } from '@/types/domain';
import { formatFileSize } from '@/utils/file';
import styles from './MediaPage.module.scss';

/** Speaker's media files for talks and speeches; uploads are simulated. */
export function MediaPage() {
  const { media, talks } = useDemoState();
  const { deleteMedia } = useDemoActions();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [fileToDelete, setFileToDelete] = useState<MediaFile>();

  // `?new=1` opens the add form, so the dialog can be linked to.
  const formOpen = params.get('new') === '1';
  const openForm = () => setParams({ new: '1' }, { replace: true });
  const closeForm = () => setParams({}, { replace: true });

  const talkName = new Map(talks.map((talk) => [talk.id, talk.name]));

  const confirmDelete = () => {
    if (!fileToDelete) return;
    deleteMedia(fileToDelete.id);
    setFileToDelete(undefined);
    toast('Медиафайл исключен из списка');
  };

  return (
    <>
      <PageHeader
        title="Медиафайлы"
        description="Материалы собственных докладов и выступлений."
        actions={<Button onClick={openForm}>+ Добавить файл</Button>}
      />

      <Card as="section" aria-label="Список медиафайлов">
        <Stack gap={3}>
          <Alert tone="neutral">
            Форматы и максимальные размеры файлов подлежат согласованию в спецификации API. В макете загрузка
            имитируется, файлы не отправляются на сервер.
          </Alert>

          {media.length > 0 ? (
            <ul className={styles.list}>
              {media.map((file) => (
                <ListItem
                  key={file.id}
                  leading={<IconTile>📎</IconTile>}
                  title={file.name}
                  meta={`${talkName.get(file.talkId) ?? 'Без доклада'} · ${formatFileSize(file.sizeBytes)}`}
                  trailing={
                    <Button variant="danger" size="sm" aria-label={`Удалить: ${file.name}`} onClick={() => setFileToDelete(file)}>
                      Удалить
                    </Button>
                  }
                />
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

      <Modal
        open={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(undefined)}
        title="Удалить медиафайл?"
        description={fileToDelete && `Файл «${fileToDelete.name}» будет исключен из списка.`}
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
