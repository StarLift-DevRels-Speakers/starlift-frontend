import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { SpeechFormModal } from '@/components/talks/SpeechFormModal/SpeechFormModal';
import { TalkFormModal } from '@/components/talks/TalkFormModal/TalkFormModal';
import { Button, Card, EmptyState, Grid, IconTile, ListItem, Stack } from '@/components/ui';
import { useDemoState } from '@/store/useDemoStore';
import { formatLongDate } from '@/utils/date';
import styles from './TalksPage.module.scss';

/** Speaker's talks and the history of speeches given with them. */
export function TalksPage() {
  const { talks, speeches } = useDemoState();
  const [params, setParams] = useSearchParams();
  const [speechFormOpen, setSpeechFormOpen] = useState(false);

  // `?new=1` opens the talk form (used by "+ Добавить доклад" on the dashboard), `?edit=<id>` an existing talk.
  const editedTalk = talks.find((talk) => talk.id === params.get('edit'));
  const talkFormOpen = params.get('new') === '1' || Boolean(editedTalk);
  const openTalkForm = (talkId?: string) => setParams(talkId ? { edit: talkId } : { new: '1' }, { replace: true });
  const closeTalkForm = () => setParams({}, { replace: true });

  const talkName = new Map(talks.map((talk) => [talk.id, talk.name]));
  const newestSpeeches = [...speeches].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title="Доклады и выступления"
        description="Храните описания докладов и записи о состоявшихся выступлениях."
        actions={<Button onClick={() => openTalkForm()}>+ Создать доклад</Button>}
      />

      <Stack>
        <Grid columns={2}>
          <Card as="section" title="Мои доклады" titleAs="h2">
            {talks.length > 0 ? (
              <ul className={styles.list}>
                {talks.map((talk) => (
                  <ListItem
                    key={talk.id}
                    leading={<IconTile>▤</IconTile>}
                    title={talk.name}
                    meta={
                      <>
                        <span className={styles.caption}>{talk.topic}</span>
                        {talk.description && <span>{talk.description}</span>}
                      </>
                    }
                    trailing={
                      <Button variant="secondary" size="sm" aria-label={`Изменить: ${talk.name}`} onClick={() => openTalkForm(talk.id)}>
                        Изменить
                      </Button>
                    }
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                variant="plain"
                title="Докладов пока нет"
                description="Доклады нужны для заявок на CFP и точного AI-подбора."
                action={<Button size="sm" onClick={() => openTalkForm()}>+ Создать доклад</Button>}
              />
            )}
          </Card>

          <Card
            as="section"
            title="История выступлений"
            titleAs="h2"
            actions={<Button variant="soft" size="sm" onClick={() => setSpeechFormOpen(true)}>+ Добавить</Button>}
          >
            {newestSpeeches.length > 0 ? (
              <ul className={styles.list}>
                {newestSpeeches.map((speech) => (
                  <ListItem
                    key={speech.id}
                    leading={<IconTile>🎤</IconTile>}
                    title={speech.event}
                    meta={`${formatLongDate(speech.date)} · ${talkName.get(speech.talkId) ?? 'Доклад'}`}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState variant="plain" title="Выступлений пока нет" description="Добавьте прошедшие выступления — они видны DevRel в каталоге." />
            )}
          </Card>
        </Grid>

      </Stack>

      {talkFormOpen && <TalkFormModal talk={editedTalk} onClose={closeTalkForm} />}
      {speechFormOpen && <SpeechFormModal onClose={() => setSpeechFormOpen(false)} />}
    </>
  );
}
