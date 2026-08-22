import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface TargetSelectionModalProps {
  showTargetModal: boolean;
  setShowTargetModal: (show: boolean) => void;
  targetCandidates: any[];
  pendingAttackInfo: any;
  setPendingAttackInfo: (info: any) => void;
  activeEntity: any;
  character: any;
  activeLargeForm: boolean;
  getDistanceBetweenEntities: (e1: any, e2: any, race?: string, isLarge?: boolean) => number;
  shouldHideEntityDetails: (entity: any) => boolean;
  shouldHideMonsterStats: (entity: any) => boolean;
  getEntityCover: (entity: any) => any;
  handleHeroAttack: (atk: any, target: any) => void;
  handleHeroOffHandAttack: (atk: any, target: any) => void;
  handleHeroCleaveAttack: (atk: any, target: any) => void;
  handleHeroMagicSpell: (target: any) => void;
  handleUseItem: (itemWithTarget: any) => void;
}

export const TargetSelectionModal: React.FC<TargetSelectionModalProps> = ({
  showTargetModal,
  setShowTargetModal,
  targetCandidates,
  pendingAttackInfo,
  setPendingAttackInfo,
  activeEntity,
  character,
  activeLargeForm,
  getDistanceBetweenEntities,
  shouldHideEntityDetails,
  shouldHideMonsterStats,
  getEntityCover,
  handleHeroAttack,
  handleHeroOffHandAttack,
  handleHeroCleaveAttack,
  handleHeroMagicSpell,
  handleUseItem
}) => {
  const handleSelectTarget = (target: any) => {
    setShowTargetModal(false);
    const info = pendingAttackInfo;
    setPendingAttackInfo(null);
    if (!info || info.type === 'weapon' || info.type === 'attack') {
      handleHeroAttack(info?.overrideAtk, target);
    } else if (info.type === 'offhand') {
      handleHeroOffHandAttack(info.overrideAtk, target);
    } else if (info.type === 'cleave') {
      handleHeroCleaveAttack(info.overrideAtk, target);
    } else if (info.type === 'magic') {
      handleHeroMagicSpell(target);
    } else if (info.type === 'bomb') {
      handleUseItem({ ...info.item, targetEntity: target });
    }
  };

  useModalKeyboard({
    onCancel: () => {
      setShowTargetModal(false);
      setPendingAttackInfo(null);
    },
    onClose: () => {
      setShowTargetModal(false);
      setPendingAttackInfo(null);
    },
    onConfirm: () => {
      if (targetCandidates && targetCandidates.length > 0) {
        handleSelectTarget(targetCandidates[0]);
      } else {
        setShowTargetModal(false);
        setPendingAttackInfo(null);
      }
    },
    disabled: !showTargetModal || targetCandidates.length === 0,
  });

  if (!showTargetModal || targetCandidates.length === 0) return null;


  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in cursor-pointer"
      onClick={() => {
        setShowTargetModal(false);
        setPendingAttackInfo(null);
      }}
    >
      <div
        className="bg-slate-900 border border-amber-500/60 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <span>🎯</span> Selecionar Alvo do Ataque
          </h3>
          <button
            onClick={() => {
              setShowTargetModal(false);
              setPendingAttackInfo(null);
            }}
            className="text-slate-400 hover:text-white font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Existem <strong className="text-amber-300">{targetCandidates.length} inimigos</strong> ao alcance do seu ataque. Selecione qual inimigo deseja atacar:
        </p>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {targetCandidates.map((m, idx) => {
            const dist = activeEntity ? getDistanceBetweenEntities(activeEntity, m, character?.race, activeLargeForm) : 1;
            const hpPercent = Math.max(0, (m.currentHp / m.maxHp) * 100);
            const isHidden = shouldHideEntityDetails(m);
            const hideStats = shouldHideMonsterStats(m);
            const nameToDisplay = isHidden ? 'Inimigo Oculto' : m.name;
            const iconToDisplay = isHidden ? '❓' : m.icon;
            const acToDisplay = hideStats ? '??' : m.armor_class;

            return (
              <button
                key={`${m.id || 'target'}-${idx}`}
                onClick={() => handleSelectTarget(m)}
                className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-amber-500/60 transition flex items-center justify-between gap-3 group text-left shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800 group-hover:scale-105 transition shrink-0">
                    {iconToDisplay}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-slate-100 flex items-center gap-2">
                      <span className="truncate">{nameToDisplay}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono shrink-0">
                        CA: {acToDisplay}
                      </span>
                      {!m.isDead && (() => {
                        const coverRes = getEntityCover(m);
                        if (coverRes && coverRes.degree !== 'none') {
                          return (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 shrink-0">
                              {coverRes.degree === 'total' ? '🛡️ Cobertura' : coverRes.acBonus > 0 ? `🛡️ +${coverRes.acBonus} (Cobertura)` : '🛡️ (Cobertura)'}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all ${
                            hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 font-mono shrink-0">
                        {hideStats ? '??/?? PV' : `${m.currentHp}/${m.maxHp} PV`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>📍 Distância: <strong className="text-amber-300">{(dist * 1.5).toFixed(1)}m</strong> ({dist} cel)</span>
                      <span>📍 Pos: ({m.x}, {m.y})</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-3 py-2 bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition shadow flex items-center gap-1">
                    ⚔️ Atacar
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-800">
          <button
            onClick={() => {
              setShowTargetModal(false);
              setPendingAttackInfo(null);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
