import React from 'react';
import { X } from 'lucide-react';
import { CharacterSheet } from '../../character/CharacterSheet';

interface CharacterInspectorOverlayProps {
  username: string;
  inspectedCharacter: any;
  setInspectedCharacter: (char: any | null) => void;
  loadCharacters: () => Promise<void>;
}

export const CharacterInspectorOverlay: React.FC<CharacterInspectorOverlayProps> = ({
  username,
  inspectedCharacter,
  setInspectedCharacter,
  loadCharacters,
}) => {
  return (
    <div
      id="admin-character-sheet-modal"
      className="fixed inset-0 z-60 bg-slate-900 overflow-y-auto p-2 sm:p-4 md:p-6 animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Barra superior de identificação do modo de inspeção admin */}
        <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase text-[10px]">
              Modo Administrador
            </span>
            <span className="text-slate-300">
              Inspecionando ficha de <strong className="text-amber-400 font-bold">{inspectedCharacter.name}</strong> (Dono: <strong className="text-slate-200 font-mono">@{username}</strong>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setInspectedCharacter(null)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Voltar aos Usuários</span>
          </button>
        </div>

        {/* Componente completo e oficial da Ficha de Personagem */}
        <CharacterSheet
          character={inspectedCharacter}
          isAdminView={true}
          onBack={() => setInspectedCharacter(null)}
          onCharacterUpdated={async () => {
            await loadCharacters();
          }}
        />
      </div>
    </div>
  );
};
