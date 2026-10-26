import { useState } from 'react';
import { Button, Modal, useToast } from '@/components/ui';
import { useAppActions } from '@/store/useAppStore';

/** Discards the test purchases (billing is still a browser-side demo) after a confirmation. */
export function ResetDemoButton({ className }: { className?: string }) {
  const { resetDemoBilling } = useAppActions();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button variant="text" size="sm" className={className} onClick={() => setConfirmOpen(true)}>
        Сбросить тестовые покупки
      </Button>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Сбросить тестовые покупки?"
        description="Подписки, разовые права и результаты AI-подбора вернутся к исходному состоянию. Доклады, заявки, мероприятия и отзывы хранятся на сервере и не изменятся."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Отмена</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemoBilling();
                setConfirmOpen(false);
                toast('Тестовые покупки сброшены');
              }}
            >
              Сбросить
            </Button>
          </>
        }
      />
    </>
  );
}
