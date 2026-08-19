import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';
import { CharacterMannequin } from '../../CharacterMannequin';

interface EquipmentSlotsModalProps {
  character: any;
  equipmentSlots: Record<string, string | null>;
  currentAc: number;
  onClose: () => void;
  handleAssignSlot: (slotKey: string, itemName: string | null) => void;
  getAvailableItemsForSlot: (slotKey: string, currentValue: string | null) => string[];
  isTwoHandedWeapon: (itemName: string) => boolean;
}

export const EquipmentSlotsModal: React.FC<EquipmentSlotsModalProps> = ({
  character,
  equipmentSlots,
  currentAc,
  onClose,
  handleAssignSlot,
  getAvailableItemsForSlot,
  isTwoHandedWeapon,
}) => {
  useModalKeyboard({
    onCancel: onClose,
    onClose,
    onConfirm: onClose,
  });

  return (

    <div 
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl p-3 max-w-5xl w-full my-auto space-y-2 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[98vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                Anatomia de Equipamento &amp; Slots do Corpo
              </h3>
              <p className="text-[10px] text-slate-400">
                Equipe e aloque seus itens do inventário nas zonas físicas do personagem ({character?.name || 'Herói'}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            ✕ Fechar
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
            <div className="lg:col-span-4 space-y-1.5 flex flex-col justify-between">
              {[
                { key: 'cabeca', label: 'Cabeça (Capacete / Tiara)', limit: '1 item', icon: '🪖' },
                { key: 'rosto_olhos', label: 'Rosto / Olhos (Óculos / Máscara)', limit: '1 item', icon: '👓' },
                { key: 'pescoco', label: 'Pescoço (Amuleto / Colar)', limit: '1 item', icon: '📿' },
                { key: 'corpo_torso', label: 'Corpo / Torso (Armadura / Túnica)', limit: '1 item', icon: '🛡️' },
                { key: 'cintura', label: 'Cintura (Cinto / Faixa)', limit: '1 item', icon: '🥋' },
                { key: 'pes', label: 'Pés (Botas / Sapatos)', limit: '1 par', icon: '🥾' },
              ].map((slot) => {
                const currentValue = equipmentSlots[slot.key] || '';
                const compatibleItems = getAvailableItemsForSlot(slot.key, currentValue);
                return (
                  <div
                    key={slot.key}
                    className={`p-1.5 rounded-lg border transition flex flex-col justify-between gap-1 ${
                      currentValue
                        ? 'bg-amber-950/25 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] text-slate-200 flex items-center gap-1 truncate">
                        <span>{slot.icon}</span>
                        <span className="truncate">{slot.label}</span>
                      </span>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-1 py-0.5 rounded shrink-0">
                        {slot.limit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={currentValue}
                        onChange={(e) => handleAssignSlot(slot.key, e.target.value)}
                        className={`w-full text-[11px] font-semibold rounded px-1.5 py-1 border focus:outline-none transition cursor-pointer ${
                          currentValue
                            ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-700/80 focus:border-amber-400'
                        }`}
                      >
                        <option value="" className="bg-slate-900 text-slate-200">-- [Vazio] Nenhum item --</option>
                        {compatibleItems.length === 0 ? (
                          <option value="" disabled className="bg-slate-900 text-slate-400">(Nenhum item compatível no inventário)</option>
                        ) : (
                          compatibleItems.map((item, idx) => (
                            <option key={`${item}-${idx}`} value={item} className="bg-slate-900 text-slate-200">
                              📦 {item}{isTwoHandedWeapon(item) ? ' ⚔️ (Duas Mãos)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                      {currentValue && (
                        <button
                          type="button"
                          onClick={() => handleAssignSlot(slot.key, null)}
                          className="px-1.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[9px] rounded transition shrink-0"
                          title="Desequipar deste espaço"
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[380px] overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-radial from-amber-500/10 via-slate-950/40 to-slate-950 pointer-events-none" />
                <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-20 text-[10px] text-slate-400 pointer-events-none">
                    <span className="bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded font-bold text-amber-400 shadow">{character?.class_name || 'Guerreiro'} • Nível {character?.level || 1}</span>
                    <span className="bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded font-bold text-emerald-400 shadow">CA: {currentAc}</span>
                </div>
                <div className="w-full h-[340px] flex items-center justify-center my-1 z-10">
                    <CharacterMannequin
                      character={character}
                      equipmentSlots={equipmentSlots}
                      onSlotClick={(slotKey) => handleAssignSlot(slotKey, null)}
                      showLabels={false}
                      className="w-full h-full"
                    />
                </div>
                <div className="absolute bottom-1.5 left-2 right-2 text-[10px] text-center text-slate-400 bg-slate-900/90 border border-slate-800 rounded py-0.5 px-2 backdrop-blur-sm z-20">
                    ✨
                    <span className="text-amber-400 font-bold ml-1">{Object.entries(equipmentSlots).filter(([k, v]) => k !== 'roupa_clima' && Boolean(v)).length} / 13</span> espaços equipados
                </div>
            </div>
            
            <div className="lg:col-span-4 space-y-1.5 flex flex-col justify-between">
              {[
                { key: 'ombros_costas', label: 'Ombros / Costas (Capa / Manto)', limit: '1 item', icon: '🧥' },
                { key: 'bracos_pulsos', label: 'Braços / Pulsos (Braçadeiras)', limit: '1 par', icon: '💪' },
                { key: 'maos_vestuario', label: 'Mãos / Luvas (Manoplas)', limit: '1 par', icon: '🧤' },
                { key: 'empunhadura_1', label: 'Empunhadura 1 (Arma Principal)', limit: '2 espaços', icon: '⚔️' },
                { key: 'empunhadura_2', label: 'Empunhadura 2 (Escudo / Tocha / Secundária)', limit: '2 espaços', icon: '🛡️' },
                { key: 'dedo_anel_1', label: 'Dedo 1 (Anel Mágico)', limit: '1 anel', icon: '💍' },
                { key: 'dedo_anel_2', label: 'Dedo 2 (Anel Mágico)', limit: '1 anel', icon: '💍' },
              ].map((slot) => {
                const currentValue = equipmentSlots[slot.key] || '';
                const compatibleItems = getAvailableItemsForSlot(slot.key, currentValue);
                return (
                  <div
                    key={slot.key}
                    className={`p-1.5 rounded-lg border transition flex flex-col justify-between gap-1 ${
                      currentValue
                        ? 'bg-amber-950/25 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] text-slate-200 flex items-center gap-1 truncate">
                        <span>{slot.icon}</span>
                        <span className="truncate">{slot.label}</span>
                      </span>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-1 py-0.5 rounded shrink-0">{slot.limit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={currentValue}
                        onChange={(e) => handleAssignSlot(slot.key, e.target.value)}
                        className={`w-full text-[11px] font-semibold rounded px-1.5 py-1 border focus:outline-none transition cursor-pointer ${
                          currentValue
                            ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-700/80 focus:border-amber-400'
                        }`}
                      >
                        <option value="" className="bg-slate-900 text-slate-200">-- [Vazio] Nenhum item --</option>
                        {compatibleItems.length === 0 ? (
                          <option value="" disabled className="bg-slate-900 text-slate-400">(Nenhum item compatível no inventário)</option>
                        ) : (
                          compatibleItems.map((item, idx) => (
                            <option key={`${item}-${idx}`} value={item} className="bg-slate-900 text-slate-200">
                              📦 {item}{isTwoHandedWeapon(item) ? ' ⚔️ (Duas Mãos)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                      {currentValue && (
                        <button
                          type="button"
                          onClick={() => handleAssignSlot(slot.key, null)}
                          className="px-1.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[9px] rounded transition shrink-0"
                          title="Desequipar deste espaço"
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0 text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">💡 Os itens selecionados nos espaços atualizam automaticamente a sua Classe de Armadura (CA) e atributos.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 ml-auto"
          >
            Concluir &amp; Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
