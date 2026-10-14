import { useState } from 'react';
import { Button, Modal, useToast } from '@/components/ui';
import { useDemoActions } from '@/store/useDemoStore';

/** Restores the initial demo data after a confirmation (it discards every change). */
export function ResetDemoButton({ className }: { className?: string }) {
  const { resetDemo } = useDemoActions();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button variant="text" size="sm" className={className} onClick={() => setConfirmOpen(true)}>
        Сбросить демо
      </Button>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Сбросить демонстрационные данные?"
        description="Заявки, приглашения, мероприятия, покупки и отзывы вернутся к исходному состоянию. Ссылка на форму отзыва изменится."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Отмена</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setConfirmOpen(false);
                toast('Демонстрационные данные сброшены');
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
