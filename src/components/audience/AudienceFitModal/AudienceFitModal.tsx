import type { AudienceFitCheckDto } from '@/api/types';
import { AudienceFitDetails } from '@/components/audience/AudienceFitDetails/AudienceFitDetails';
import { Button, Modal } from '@/components/ui';

export interface AudienceFitModalProps {
  check: AudienceFitCheckDto;
  onClose: () => void;
}

/** Details of one audience fit check. */
export function AudienceFitModal({ check, onClose }: AudienceFitModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Подходит ли материал аудитории"
      description={check.eventName ? `Мероприятие «${check.eventName}»` : undefined}
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Закрыть</Button>}
    >
      <AudienceFitDetails check={check} />
    </Modal>
  );
}
