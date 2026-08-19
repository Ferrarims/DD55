import React, { useEffect } from 'react';

export interface UseModalKeyboardOptions {
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function useModalKeyboard({
  onClose,
  onConfirm,
  onCancel,
  disabled = false,
}: UseModalKeyboardOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTextarea = target?.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (onCancel) {
          onCancel();
        } else if (onClose) {
          onClose();
        }
      } else if (e.key === 'Enter') {
        // Se estiver em textarea, respeita a quebra de linha padrão a menos que seja Ctrl+Enter
        if (isTextarea && !e.ctrlKey && !e.metaKey) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (onConfirm) {
          onConfirm();
        } else if (onCancel) {
          onCancel();
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onConfirm, onCancel, disabled]);
}

interface ModalKeyboardHandlerProps {
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const ModalKeyboardHandler: React.FC<ModalKeyboardHandlerProps> = ({
  onClose,
  onConfirm,
  onCancel,
  disabled = false,
}) => {
  useModalKeyboard({ onClose, onConfirm, onCancel, disabled });
  return null;
};

