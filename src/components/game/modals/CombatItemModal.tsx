import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { updateCharacter } from '../../../lib/api/characterService';

interface UsableItem {
  id: string;
  name: string;
  icon: string;
  actionCost: 'action' | 'bonus' | 'free';
  actionCostLabel: string;
  badgeColor: string;
  btnColor: string;
  description: string;
  effectType: string;
  customDetail?: string;
}

interface CombatItemModalProps {
  showItemModal: boolean;
  setShowItemModal: (show: boolean) => void;
  character: any;
  usableInventoryItems: UsableItem[];
  itemQuantities: Record<string, number>;
  totalRationsCount: number;
  activeEntity: any;
  entities: any[];
  handleUseItem: (item: any) => void;
  onCharacterUpdated?: () => void;
  forceUpdate?: () => void;
}

export const CombatItemModal: React.FC<CombatItemModalProps> = ({
  showItemModal,
  setShowItemModal,
  character,
  usableInventoryItems,
  itemQuantities,
  totalRationsCount,
  activeEntity,
  entities,
  handleUseItem,
  onCharacterUpdated,
  forceUpdate
}) => {
  useModalKeyboard({
    onCancel: () => setShowItemModal(false),
    onClose: () => setShowItemModal(false),
    onConfirm: () => {
      const firstAvailableItem = usableInventoryItems.find(item => {
        const qty = itemQuantities[item.id] ?? 1;
        const isHealItem = item.effectType === 'heal_minor' || item.effectType === 'heal_major' || item.effectType === 'kit';
        const isTent = item.effectType === 'tent' || item.effectType === 'sleeping_bag';
        const isFullHp = activeEntity?.currentHp >= activeEntity?.maxHp;
        const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
        const isActionBlocked = isTent ? false : (item.actionCost === 'bonus' ? !activeEntity?.hasBonusAction : !activeEntity?.hasAction);
        const isDisabled = isActionBlocked || qty <= 0 || (isHealItem && isFullHp) || (isTent && hasLivingMonsters);
        return !isDisabled;
      });

      if (firstAvailableItem) {
        handleUseItem({
          id: firstAvailableItem.id,
          name: firstAvailableItem.name,
          icon: firstAvailableItem.icon,
          actionCost: firstAvailableItem.actionCost,
          effectType: firstAvailableItem.effectType,
          customDetail: firstAvailableItem.customDetail
        });
      } else {
        setShowItemModal(false);
      }
    },
    disabled: !showItemModal,
  });

  if (!showItemModal) return null;


  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in cursor-pointer"
      onClick={() => setShowItemModal(false)}
    >
      <div
        className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-rose-400 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span>🎒</span> Inventário de Combate - Usar Itens
          </h3>
          <button
            onClick={() => setShowItemModal(false)}
            className="text-slate-400 hover:text-white font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Itens usáveis presentes no inventário de <strong className="text-amber-300">{character?.name || 'seu personagem'}</strong>:
        </p>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* 1. ITENS USÁVEIS E CONSUMÍVEIS */}
          <div className="space-y-2.5">
            {usableInventoryItems.length > 0 ? (
              usableInventoryItems.map((item, idx) => {
                const qty = itemQuantities[item.id] ?? 1;
                const isHealItem = item.effectType === 'heal_minor' || item.effectType === 'heal_major' || item.effectType === 'kit';
                const isTent = item.effectType === 'tent' || item.effectType === 'sleeping_bag';
                const isFullHp = activeEntity?.currentHp >= activeEntity?.maxHp;
                const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
                const isActionBlocked = isTent ? false : (item.actionCost === 'bonus' ? !activeEntity?.hasBonusAction : !activeEntity?.hasAction);
                const isDisabled = isActionBlocked || qty <= 0 || (isHealItem && isFullHp) || (isTent && hasLivingMonsters);

                return (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-700">{item.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2 flex-wrap">
                          <span>{item.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                            {item.actionCostLabel}
                          </span>
                          {isTent ? (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                              totalRationsCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {`Rações: ${totalRationsCount}`}
                            </span>
                          ) : (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                              qty > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {qty > 0 ? `Qtd: ${qty}` : 'Esgotado'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUseItem({
                        id: item.id,
                        name: item.name,
                        icon: item.icon,
                        actionCost: item.actionCost,
                        effectType: item.effectType,
                        customDetail: item.customDetail
                      })}
                      disabled={isDisabled}
                      title={
                        qty <= 0 ? 'Item esgotado' :
                        (isTent && hasLivingMonsters) ? 'Não é possível acampar com monstros vivos' :
                        (isHealItem && isFullHp) ? 'Você já está com a vida cheia' :
                        (!isTent && item.actionCost === 'bonus' && !activeEntity?.hasBonusAction) ? 'Sem Ação Bônus' :
                        (!isTent && item.actionCost === 'action' && !activeEntity?.hasAction) ? 'Sem Ação Principal' : ''
                      }
                      className={`px-3.5 py-2 font-bold text-xs text-white rounded-lg transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${item.btnColor}`}
                    >
                      {qty <= 0 ? 'Esgotado' :
                       (isTent && hasLivingMonsters) ? 'Inseguro' :
                       (isHealItem && isFullHp) ? 'Vida Cheia' :
                       'Usar Item'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
                <span className="text-2xl block">🎒</span>
                <p className="text-xs text-slate-400">
                  Nenhum consumível encontrado na bolsa de <strong className="text-amber-300">{character?.name || 'seu personagem'}</strong>.
                </p>
                <button
                  onClick={() => handleUseItem({
                    name: 'Poção de Cura',
                    icon: '🧪',
                    actionCost: 'bonus',
                    effectType: 'heal_minor'
                  })}
                  disabled={!activeEntity?.hasBonusAction || activeEntity?.currentHp >= activeEntity?.maxHp}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer"
                >
                  🧪 Usar Poção de Cura de Emergência (2d4+2)
                </button>
              </div>
            )}
          </div>

          {/* 2. FONTES DE LUZ E ILUMINAÇÃO */}
          {(() => {
            // Extrair todos os itens de luz disponíveis do inventário e do equipamento
            const lightMap = new Map<string, { id: string; name: string; quantity: number }>();

            if (Array.isArray(character?.character_inventory)) {
              character.character_inventory.forEach((inv: any) => {
                const rawName = String(inv.item?.name || inv.items?.name || inv.name || '').trim();
                if (!rawName) return;
                const lower = rawName.toLowerCase();
                if (/tocha|torch|lanterna|lantern|vela|candle|lampada|lamp|facho|foco|candeeiro|luminaria/i.test(lower)) {
                  const baseName = rawName.replace(/\s*\(\d+\)$/, '').trim();
                  const key = baseName.toLowerCase();
                  const qty = (inv.quantity || 1);
                  if (lightMap.has(key)) {
                    const ex = lightMap.get(key)!;
                    ex.quantity += qty;
                  } else {
                    lightMap.set(key, { id: inv.id || baseName, name: baseName, quantity: qty });
                  }
                }
              });
            }

            let rawEquip: string[] = [];
            if (Array.isArray(character?.equipment)) {
              rawEquip = character.equipment;
            } else if (typeof character?.equipment === 'string') {
              try {
                const parsed = JSON.parse(character.equipment);
                if (Array.isArray(parsed)) rawEquip = parsed;
                else rawEquip = [character.equipment];
              } catch {
                rawEquip = [character.equipment];
              }
            }

            rawEquip.forEach(itemStr => {
              if (!itemStr || typeof itemStr !== 'string') return;
              const parts = itemStr.split(/,\s*|\s+e\s+|\n/);
              parts.forEach(part => {
                const trimmed = part.trim();
                if (!trimmed) return;
                const lower = trimmed.toLowerCase();
                if (/tocha|torch|lanterna|lantern|vela|candle|lampada|lamp|facho|foco|candeeiro|luminaria/i.test(lower)) {
                  const match = trimmed.match(/^(\d+)\s*x?\s+(.+)$/i) || trimmed.match(/^(.+?)\s*\((\d+)\)$/i);
                  let qty = 1;
                  let base = trimmed;
                  if (match) {
                    qty = parseInt(match[1].match(/^\d+$/) ? match[1] : match[2], 10) || 1;
                    base = (match[1].match(/^\d+$/) ? match[2] : match[1]).trim();
                  }
                  base = base.replace(/\s*\(\d+\)$/, '').trim();
                  const key = base.toLowerCase();
                  if (!lightMap.has(key)) {
                    lightMap.set(key, { id: base, name: base, quantity: qty });
                  }
                }
              });
            });

            const lightItems = Array.from(lightMap.values());
            if (lightItems.length === 0) return null;

            const slots = character?.equipment_slots || {};
            const isLightEquipped = (itemName: string) => {
              const norm = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
              const base = norm.replace(/\s*\(\d+\)$/, '').trim();
              return Object.entries(slots).some(([slotKey, val]) => {
                if (!val || typeof val !== 'string') return false;
                const vNorm = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                const vBase = vNorm.replace(/\s*\(\d+\)$/, '').trim();
                return vNorm === norm || vBase === base || norm.includes(vBase) || vNorm.includes(base);
              });
            };

            const getLightInfo = (name: string) => {
              const lower = name.toLowerCase();
              if (lower.includes('facho') || lower.includes('bullseye') || lower.includes('foca')) {
                return {
                  icon: '🔦',
                  radiusLabel: 'Raio 18m (12 cel) • Facho Concentrado',
                  description: 'Projeta um facho direcionado de luz plena e intensa em masmorras e à noite.'
                };
              }
              if (lower.includes('coberta') || lower.includes('hooded')) {
                return {
                  icon: '🏮',
                  radiusLabel: 'Raio 12m (8 cel) • Luz Plena',
                  description: 'Emite luz brilhante protegida em todas as direções com capa ajustável.'
                };
              }
              if (lower.includes('tocha') || lower.includes('torch')) {
                return {
                  icon: '🔥',
                  radiusLabel: 'Raio 9m (6 cel) • Fogo Vivo',
                  description: 'Queima por 1 hora emitindo 9m de luz plena para afastar a escuridão.'
                };
              }
              if (lower.includes('lanterna') || lower.includes('lantern') || lower.includes('lampada') || lower.includes('lamp')) {
                return {
                  icon: '🪔',
                  radiusLabel: 'Raio 6.75m (4.5 cel) • Luz Clara',
                  description: 'Lâmpada contínua alimentada a óleo para exploração segura.'
                };
              }
              if (lower.includes('vela') || lower.includes('candle')) {
                return {
                  icon: '🕯️',
                  radiusLabel: 'Raio 3m (2 cel) • Luz Suave',
                  description: 'Chama suave de vela para leitura e visibilidade próxima no escuro.'
                };
              }
              return {
                icon: '✨',
                radiusLabel: 'Fonte de Luz Mágica / Radiante',
                description: 'Gera iluminação brilhante ao redor do personagem.'
              };
            };

            return (
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-base">🔥</span> Fontes de Luz &amp; Iluminação
                  </h4>
                  <span className="text-[10px] text-amber-400/80 font-medium">
                    Ilumina masmorras e noites
                  </span>
                </div>

                {lightItems.map((item) => {
                  const isEq = isLightEquipped(item.name);
                  const info = getLightInfo(item.name);

                  return (
                    <div
                      key={item.id || item.name}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow transition-all duration-200 ${
                        isEq
                          ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-2xl p-2 rounded-lg border shrink-0 ${
                          isEq ? 'bg-amber-900/60 border-amber-500/60 shadow animate-pulse' : 'bg-slate-900 border-slate-700'
                        }`}>
                          {info.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-100 flex items-center gap-2 flex-wrap">
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] bg-slate-800 text-amber-400 border border-slate-700 font-mono px-1.5 py-0.5 rounded font-black shrink-0">
                              x{item.quantity}
                            </span>
                            {isEq ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm flex items-center gap-1">
                                <span>⚡</span> Empunhada / Ativa
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800/80 text-slate-400 border border-slate-700/60">
                                Na Mochila
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                            {info.radiusLabel}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {info.description}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updatedSlots = { ...(character?.equipment_slots || {}) };
                          const norm = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                          const base = norm.replace(/\s*\(\d+\)$/, '').trim();

                          if (isEq) {
                            // Desequipar o item de luz
                            Object.keys(updatedSlots).forEach(key => {
                              const val = updatedSlots[key];
                              if (typeof val === 'string') {
                                const vNorm = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                                if (vNorm === norm || vNorm.includes(base) || norm.includes(vNorm)) {
                                  updatedSlots[key] = null;
                                }
                              }
                            });
                          } else {
                            // Equipar na mão secundária (empunhadura_2) e ativar como fonte de luz
                            updatedSlots.empunhadura_2 = item.name;
                            updatedSlots.fonte_luz = item.name;
                          }

                          if (character) {
                            character.equipment_slots = updatedSlots;
                          }
                          if (forceUpdate) forceUpdate();
                          updateCharacter(character?.id, { equipment_slots: updatedSlots }).then(() => {
                            if (onCharacterUpdated) onCharacterUpdated();
                          }).catch(e => console.warn(e));
                        }}
                        className={`px-3.5 py-2 font-black text-xs rounded-lg transition shrink-0 cursor-pointer shadow flex items-center gap-1.5 ${
                          isEq
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 shadow-md active:scale-95'
                            : 'bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600/50 active:scale-95'
                        }`}
                      >
                        <span>{isEq ? '✓ Guardar' : '🔥 Empunhar'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* 3. EXTRA: VESTUÁRIO E ROUPAS */}
          {(() => {
            const hasLivingMonstersForClothes = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
            if (hasLivingMonstersForClothes) return null;
            const clothingItems = (character?.character_inventory || []).filter((inv: any) => {
              const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
              return /roupa|veste|traje|manto/.test(name);
            });
            if (clothingItems.length === 0) return null;

            const equippedClothes = (character?.equipment_slots?.roupa_clima || '').toLowerCase();

            return (
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-slate-500 text-base">👕</span> Vestuário e Roupas
                </h4>
                {clothingItems.map((inv: any) => {
                  const name = inv.item?.name || inv.items?.name || inv.name || 'Roupa';
                  const isEq = equippedClothes === name.toLowerCase();
                  return (
                    <div key={inv.id || name} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shadow hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                            <span>{name}</span>
                            {isEq && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-900/50 text-amber-300 border border-amber-500/30">Equipada</span>}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">Use para suportar temperaturas do ambiente.</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updatedSlots = { ...(character?.equipment_slots || {}) };
                          if (isEq) {
                            updatedSlots.roupa_clima = null;
                          } else {
                            updatedSlots.roupa_clima = name;
                          }
                          if (character) {
                            character.equipment_slots = updatedSlots;
                          }
                          if (forceUpdate) forceUpdate();
                          updateCharacter(character?.id, { equipment_slots: updatedSlots }).then(() => {
                            if (onCharacterUpdated) onCharacterUpdated();
                          }).catch(e => console.warn(e));
                        }}
                        className={`px-3.5 py-2 font-bold text-xs rounded-lg transition shrink-0 cursor-pointer ${
                          isEq ? 'bg-amber-900 text-amber-300 border border-amber-600/50 hover:bg-amber-800' : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 shadow'
                        }`}
                      >
                        {isEq ? '✓ Despir' : 'Vestir'}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
