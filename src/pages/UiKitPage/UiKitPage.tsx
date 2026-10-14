import { useState, type ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  Meter,
  Modal,
  OptionGroup,
  Radio,
  Select,
  Skeleton,
  Table,
  Tabs,
  Textarea,
  useToast,
} from '@/components/ui';
import styles from './UiKitPage.module.scss';

interface Application {
  id: number;
  event: string;
  member: string;
  type: string;
  status: ReactNode;
}

const applications: Application[] = [
  { id: 1, event: 'Java Community Evening', member: 'Иван Иванов', type: 'Заявка', status: <Badge tone="warning">На рассмотрении</Badge> },
  { id: 2, event: 'Backend Meetup', member: 'Елена Левина', type: 'Приглашение', status: <Badge>Принято</Badge> },
  { id: 3, event: 'Cloud Talks', member: 'Мария Кузнецова', type: 'Заявка', status: <Badge tone="muted">Черновик</Badge> },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** Temporary preview of all UI components until real pages are added. */
export function UiKitPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [usefulness, setUsefulness] = useState<string>();

  return (
    <main className={styles.page}>
      <h1>StarLift UI</h1>

      <Section title="Кнопки">
        <div className={styles.row}>
          <Button onClick={() => toast('Основное действие выполнено')}>Основная</Button>
          <Button variant="secondary">Вторичная</Button>
          <Button variant="soft">Мягкая</Button>
          <Button variant="text">Текстовая →</Button>
          <Button variant="danger" onClick={() => setModalOpen(true)}>Удалить</Button>
          <Button disabled>Недоступна</Button>
        </div>
        <div className={styles.row}>
          <Button size="sm">Small · 32px</Button>
          <Button>Medium · 40px</Button>
          <Button size="lg">Large · 48px</Button>
        </div>
      </Section>

      <Section title="Поля и формы">
        <div className={styles.grid}>
          <Input label="Название мероприятия" required hint="Обязательное поле для сохранения заявки" placeholder="Java Community Evening" />
          <Select
            label="Формат"
            placeholder="Выберите формат"
            options={[
              { value: 'offline', label: 'Очное мероприятие' },
              { value: 'online', label: 'Онлайн' },
              { value: 'hybrid', label: 'Гибридное' },
            ]}
          />
          <Input label="Адрес электронной почты" type="email" defaultValue="ivan@" error="Укажите корректный адрес" />
          <Input label="Недоступное поле" disabled defaultValue="Только чтение" />
        </div>
        <Textarea label="Комментарий" hint="Необязательное поле. Не заменяет обязательные требования." />
        <div className={styles.row}>
          <Checkbox label="Готов(а) получать уведомления внутри StarLift" defaultChecked />
          <Checkbox label="Недоступно" disabled />
        </div>
        <fieldset className={styles.fieldset}>
          <legend>Формат участия</legend>
          <Radio name="participation" label="Любой" defaultChecked />
          <Radio name="participation" label="Очный" />
          <Radio name="participation" label="Онлайн" hint="Без поездок" />
        </fieldset>
        <OptionGroup
          legend="1. Насколько полезным было выступление?"
          value={usefulness}
          onChange={setUsefulness}
          options={[
            { value: 'very', label: 'Очень полезно' },
            { value: 'rather', label: 'Скорее полезно' },
            { value: 'little', label: 'Мало полезной информации' },
          ]}
        />
      </Section>

      <Section title="Навигация по вкладкам">
        <Tabs
          label="Роль"
          items={[
            { value: 'speaker', label: 'Спикер', content: <p>Подбор мероприятий по темам и опыту из профиля.</p> },
            { value: 'devrel', label: 'DevRel', content: <p>Подбор спикеров по требованиям мероприятия.</p> },
            { value: 'listener', label: 'Слушатель', content: null, disabled: true },
          ]}
        />
      </Section>

      <Section title="Метки, аватары, прогресс">
        <div className={styles.row}>
          <Badge>Опубликовано</Badge>
          <Badge tone="muted">Черновик</Badge>
          <Badge tone="warning">На рассмотрении</Badge>
          <Badge tone="ai">AI-рекомендация</Badge>
          <Badge tone="danger">Отклонено</Badge>
        </div>
        <div className={styles.row}>
          <Avatar name="Елена Левина" size="sm" />
          <Avatar name="Елена Левина" />
          <Avatar name="Иван Иванов" size="lg" />
        </div>
        <Meter label="Заполненность профиля" value={68} showLabel />
      </Section>

      <Section title="Карточки">
        <div className={styles.grid}>
          <Card title="Карточка информации" description="Текст, метаданные, контекстное действие.">
            <div className={styles.row}>
              <Badge tone="muted">Backend</Badge>
              <Badge tone="muted">Онлайн</Badge>
            </div>
          </Card>
          <Card variant="ai" title="Карточка AI" description="Причины рекомендации и ограничения.">
            <div className={styles.row}>
              <Badge tone="ai">Обоснованная рекомендация</Badge>
              <Button size="sm" variant="soft">Показать основания</Button>
            </div>
          </Card>
          <Card variant="flat" title="Плоская карточка" description="Без тени — для вложенных блоков." />
        </div>
      </Section>

      <Section title="Таблица">
        <Table
          caption="Заявки и приглашения"
          rows={applications}
          getRowKey={(row) => row.id}
          columns={[
            { key: 'event', header: 'Мероприятие' },
            { key: 'member', header: 'Участник' },
            { key: 'type', header: 'Тип' },
            { key: 'status', header: 'Статус' },
            { key: 'action', header: 'Действие', align: 'end', render: () => <Button variant="text" size="sm">Открыть →</Button> },
          ]}
        />
      </Section>

      <Section title="Системные сообщения">
        <Alert title="Успешно" icon="✓">Черновик сохранён. Права публикации не расходуются.</Alert>
        <Alert tone="warning" title="Недостаточно данных">
          Добавьте сведения о докладах и выступлениях, чтобы повысить точность рекомендаций.
        </Alert>
        <Alert tone="danger" title="Ошибка операции">AI-подбор не выполнен. Пробный запрос сохранён.</Alert>
      </Section>

      <Section title="Состояния интерфейса">
        <div className={styles.grid}>
          <Card title="Формируем рекомендации" aria-busy="true">
            <div className={styles.stack}>
              <Skeleton width="70%" />
              <Skeleton />
              <Skeleton width="45%" />
            </div>
          </Card>
          <EmptyState
            icon="⌕"
            title="Совпадений не найдено"
            description="Попробуйте изменить фильтры или расширить тематику."
            action={<Button variant="secondary" size="sm">Изменить критерии</Button>}
          />
          <EmptyState
            icon="◈"
            title="Нужна подписка"
            description="План развития доступен Спикеру только по действующей подписке."
            action={<Button variant="soft" size="sm">Посмотреть тариф</Button>}
          />
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Удалить объект?"
        description="В продукте опасное действие требует отдельного подтверждения. В этой библиотеке ничего не удаляется."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button
              variant="danger"
              onClick={() => {
                setModalOpen(false);
                toast('Подтверждение в демонстрационном режиме');
              }}
            >
              Удалить
            </Button>
          </>
        }
      />
    </main>
  );
}
