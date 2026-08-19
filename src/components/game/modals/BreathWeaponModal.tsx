import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface BreathWeaponModalProps {
  showBreathWeaponModal: boolean;
  setShowBreathWeaponModal: (show: boolean) => void;
  pendingAttackInfo?: any;
  breathWeaponDetails: any;
  breathWeaponUses: number;
  breathWeaponMaxUses: number;
  breathWeaponShape: 'cone' | 'line';
  setBreathWeaponShape: React.Dispatch<React.SetStateAction<'cone' | 'line'>>;
  selectedBreathTargets: string[];
  setSelectedBreathTargets: React.Dispatch<React.SetStateAction<string[]>>;
  entities: any[];
  activeEntity: any;
  activeEntityIndex: number;
  character: any;
  activeLargeForm: boolean;
  isEntityVisible: (entity: any) => boolean;
  getDistanceBetweenEntities: (e1: any, e2: any, race?: string, isLarge?: boolean) => number;
  shouldHideEntityDetails: (entity: any) => boolean;
  isTargetInLine: (source: any, target: any, primaryTarget: any, maxDist: number) => boolean;
  isTargetInCone: (source: any, target: any, primaryTarget: any, maxDist: number) => boolean;
  handleExecuteBreathWeapon: (shape: 'cone' | 'line', targets: any[], primaryTarget: any) => void;
}

export const BreathWeaponModal: React.FC<BreathWeaponModalProps> = ({
  showBreathWeaponModal,
  setShowBreathWeaponModal,
  pendingAttackInfo,
  breathWeaponDetails,
  breathWeaponUses,
  breathWeaponMaxUses,
  breathWeaponShape,
  setBreathWeaponShape,
  selectedBreathTargets,
  setSelectedBreathTargets,
  entities,
  activeEntity,
  activeEntityIndex,
  character,
  activeLargeForm,
  isEntityVisible,
  getDistanceBetweenEntities,
  shouldHideEntityDetails,
  isTargetInLine,
  isTargetInCone,
  handleExecuteBreathWeapon
}) => {
  const currentHero = activeEntity || entities.find(e => e.type === 'hero');

  const onConfirmAction = () => {
    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    const maxDist = breathWeaponShape === 'cone' ? 3 : 6;
    const primaryTarget = entities.find(e => e.id === selectedBreathTargets[0]);

    const targets = aliveMonsters.filter(m => {
      if (!selectedBreathTargets.includes(m.id)) return false;
      if (!currentHero) return true;
      if (!primaryTarget || m.id === primaryTarget.id) return true;

      return breathWeaponShape === 'line'
        ? isTargetInLine(currentHero, m, primaryTarget, maxDist)
        : isTargetInCone(currentHero, m, primaryTarget, maxDist);
    });

    if (targets.length > 0 && breathWeaponUses > 0) {
      handleExecuteBreathWeapon(breathWeaponShape, targets, primaryTarget);
    } else {
      setShowBreathWeaponModal(false);
    }
  };

  useModalKeyboard({
    onCancel: () => setShowBreathWeaponModal(false),
    onClose: () => setShowBreathWeaponModal(false),
    onConfirm: onConfirmAction,
    disabled: !showBreathWeaponModal,
  });

  if (!showBreathWeaponModal) return null;


  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in cursor-pointer"
      onClick={() => setShowBreathWeaponModal(false)}
    >
      <div
        className="bg-slate-900 border border-amber-500/60 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <span>🔥</span> Arma de Sopro (Baforada Dracônica)
          </h3>
          <button
            onClick={() => setShowBreathWeaponModal(false)}
            className="text-slate-400 hover:text-white font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-xs space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Tipo de Dano: <strong className="text-amber-300">{breathWeaponDetails?.damageType}</strong></span>
            <span>Dano: <strong className="text-amber-300">{breathWeaponDetails?.damageDice}</strong></span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Resistência: <strong className="text-amber-300">CD {breathWeaponDetails?.dc} Destreza (8 + PB + CON)</strong></span>
            <span>Usos Restantes: <strong className="text-amber-300">{breathWeaponUses}/{breathWeaponMaxUses}</strong></span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 italic">
            Cada criatura na área deve fazer um Teste de Resistência de Destreza com <strong className="text-amber-300">CD {breathWeaponDetails?.dc}</strong> (Fórmula: 8 + Bônus Proficiência [{breathWeaponDetails?.pb}] + Mod. Constituição [{breathWeaponDetails?.conMod !== undefined && breathWeaponDetails.conMod >= 0 ? `+${breathWeaponDetails.conMod}` : breathWeaponDetails?.conMod}]). Sofrerá dano total se falhar ou metade do dano se passar.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            1. Escolha a Forma da Baforada:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setBreathWeaponShape('cone');
                const maxDist = 3; // 4.5m
                if (activeEntity) {
                  setSelectedBreathTargets(prev => prev.filter(id => {
                    const m = entities.find(e => e.id === id);
                    if (!m) return false;
                    const dist = getDistanceBetweenEntities(activeEntity, m, character?.race, activeLargeForm);
                    return dist <= maxDist;
                  }));
                }
              }}
              className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                breathWeaponShape === 'cone'
                  ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-2 ring-amber-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">📐</span>
              <span>Cone (4,5m / 15ft)</span>
              <span className="text-[10px] text-slate-400 font-normal">Máx: 3 quadrados (4,5m)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBreathWeaponShape('line');
                const maxDist = 6; // 9m
                if (activeEntity) {
                  setSelectedBreathTargets(prev => prev.filter(id => {
                    const m = entities.find(e => e.id === id);
                    if (!m) return false;
                    const dist = getDistanceBetweenEntities(activeEntity, m, character?.race, activeLargeForm);
                    return dist <= maxDist;
                  }));
                }
              }}
              className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                breathWeaponShape === 'line'
                  ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-2 ring-amber-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">📏</span>
              <span>Linha (9m / 30ft)</span>
              <span className="text-[10px] text-slate-400 font-normal">Máx: 6 quadrados (9m)</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            2. Selecione os Inimigos Atingidos:
          </label>
          {(() => {
            const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
            if (aliveMonsters.length === 0) {
              return <p className="text-xs text-slate-500 italic p-2">Nenhum inimigo visível na arena.</p>;
            }
            const maxDist = breathWeaponShape === 'cone' ? 3 : 6;
            return (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {aliveMonsters.map((m, idx) => {
                  const isSelected = selectedBreathTargets.includes(m.id);
                  const dist = activeEntity ? getDistanceBetweenEntities(activeEntity, m, character?.race, activeLargeForm) : 1;
                  const isInRange = dist <= maxDist;

                  let isInsideArea = false;
                  if (isInRange && activeEntity) {
                    if (selectedBreathTargets.length === 0) {
                      isInsideArea = true;
                    } else {
                      const primaryTarget = entities.find(e => e.id === selectedBreathTargets[0]);
                      if (primaryTarget) {
                        isInsideArea = breathWeaponShape === 'line'
                          ? isTargetInLine(activeEntity, m, primaryTarget, maxDist)
                          : isTargetInCone(activeEntity, m, primaryTarget, maxDist);
                      }
                    }
                  }
                  const canSelect = isInRange && (selectedBreathTargets.length === 0 || isInsideArea || isSelected);
                  const isHidden = shouldHideEntityDetails(m);
                  const nameToDisplay = isHidden ? 'Inimigo Oculto' : m.name;
                  const iconToDisplay = isHidden ? '❓' : m.icon;

                  return (
                    <button
                      key={`${m.id || 'breath-target'}-${idx}`}
                      type="button"
                      disabled={!canSelect}
                      onClick={() => {
                        if (!canSelect) return;
                        if (isSelected) {
                          setSelectedBreathTargets(prev => prev.filter(id => id !== m.id));
                        } else {
                          setSelectedBreathTargets(prev => [...prev, m.id]);
                        }
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 transition text-left cursor-pointer ${
                        !canSelect
                          ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-950/60 border-amber-500 text-amber-100'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{iconToDisplay}</span>
                        <div>
                          <div className="font-bold text-xs">{nameToDisplay}</div>
                          <div className="text-[10px] text-slate-400">
                            Distância: {(dist * 1.5).toFixed(1)}m {!canSelect && <span className="text-rose-400 font-bold">(Fora da Área)</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        !canSelect
                          ? 'bg-slate-900 text-slate-600'
                          : isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {!canSelect ? 'Fora da Área' : isSelected ? '✓ Selecionado' : '+ Selecionar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowBreathWeaponModal(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
              const maxDist = breathWeaponShape === 'cone' ? 3 : 6;
              const primaryTarget = entities.find(e => e.id === selectedBreathTargets[0]);

              const targets = aliveMonsters.filter(m => {
                if (!selectedBreathTargets.includes(m.id)) return false;
                if (!activeEntity) return true;
                if (!primaryTarget || m.id === primaryTarget.id) return true;

                return breathWeaponShape === 'line'
                  ? isTargetInLine(activeEntity, m, primaryTarget, maxDist)
                  : isTargetInCone(activeEntity, m, primaryTarget, maxDist);
              });
              if (targets.length === 0) {
                alert('Selecione ao menos um inimigo válido em alcance e na área da baforada!');
                return;
              }
              handleExecuteBreathWeapon(breathWeaponShape, targets, primaryTarget);
            }}
            disabled={breathWeaponUses <= 0 || !activeEntity?.hasAction}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black text-xs rounded-lg transition shadow-lg flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>🔥</span> EXALAR BAFORADA
          </button>
        </div>
      </div>
    </div>
  );
};
