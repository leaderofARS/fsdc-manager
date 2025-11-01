'use client';

import { secondaryBtnStyles, successBtnStyles } from '@/app/commonStyles';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/lib/utils';
import React, { ReactElement } from 'react';
import { CustomOptionForm } from './CustomOptionForm';
import { ProjectAction } from '@/consts';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { useParams } from 'next/navigation';

interface ICustomFieldData {
  id: string;
  // define other fields if they exist in your project
}

interface Props {
  title: string;
  triggerLabel?: string;
  triggerBtn?: ReactElement<{ onClick?: () => void }>; // ✅ Fix here
  handleSubmit?: (data: Omit<ICustomFieldData, 'id'>) => void;
  action?: 'create-new-project' | 'update-project';
}

export const CreateCustomFieldOptionModal = ({
  title,
  triggerLabel,
  triggerBtn,
  handleSubmit,
}: Props) => {
  const { projectId } = useParams();
  const { isModalOpen, openModal, closeModal } = useModalDialog();
  const { can } = useProjectAccess({ projectId: projectId as string });

  const handleSubmitData = (data: Omit<ICustomFieldData, 'id'>) => {
    if (typeof handleSubmit === 'function') {
      handleSubmit(data);
      closeModal();
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(isOpen) => !isOpen && closeModal()}
    >
      <DialogTrigger asChild>
        {triggerBtn ? (
          React.cloneElement(triggerBtn, { onClick: openModal })
        ) : can?.(ProjectAction.UPDATE_OPTIONS) ? (
          <Button className={cn(successBtnStyles)} onClick={openModal}>
            {triggerLabel}
          </Button>
        ) : null}
      </DialogTrigger>

      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle> {/* ✅ fixes accessibility warning */}
        </DialogHeader>

        <Separator className="mb-4" />

        <CustomOptionForm
          onSubmit={handleSubmitData}
          submitBtnLabel="Save"
          cancelButton={
            <Button className={cn(secondaryBtnStyles)} onClick={closeModal}>
              Cancel
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
