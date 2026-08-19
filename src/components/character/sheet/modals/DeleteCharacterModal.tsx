import React, { useState } from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';

interface DeleteCharacterModalProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  character: any;
  onDelete?: (id: string) => void;
}

export const DeleteCharacterModal: React.FC<DeleteCharacterModalProps> = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  character,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      if (onDelete && character?.id) {
        await onDelete(character.id);
      }
      setShowDeleteConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  useModalKeyboard({
    onCancel: () => !deleting && setShowDeleteConfirm(false),
    onClose: () => !deleting && setShowDeleteConfirm(false),
    onConfirm: handleDelete,
    disabled: !showDeleteConfirm || deleting,
  });

  if (!showDeleteConfirm) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => !deleting && setShowDeleteConfirm(false)}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-400">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-bold text-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
            Excluir Ficha do Personagem?
          </h3>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          Deseja realmente apagar o personagem <strong className="text-amber-400">"{character?.name || 'Personagem'}"</strong>? Esta ação não poderá ser desfeita.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 ${
              deleting
                ? 'bg-slate-700 text-slate-300 border border-slate-600 cursor-not-allowed opacity-90'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {deleting ? 'Excluindo...' : '🗑️ Sim, Excluir Ficha'}
          </button>
        </div>
      </div>
    </div>
  );
};
