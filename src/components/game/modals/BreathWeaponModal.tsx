import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { BreathShapeSelector } from './breathWeapon/BreathShapeSelector';
import { BreathTargetList } from './breathWeapon/BreathTargetList';

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
  breathWeaponDetails,
  breathWeaponUses,
  breathWeaponMaxUses,
  breathWeaponShape,
  setBreathWeaponShape,
  selectedBreathTargets,
  setSelectedBreathTargets,
  entities,
  activeEntity,
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

        <BreathShapeSelector
          breathWeaponShape={breathWeaponShape}
          setBreathWeaponShape={setBreathWeaponShape}
          activeEntity={activeEntity}
          entities={entities}
          character={character}
          activeLargeForm={activeLargeForm}
          getDistanceBetweenEntities={getDistanceBetweenEntities}
          setSelectedBreathTargets={setSelectedBreathTargets}
        />

        <BreathTargetList
          entities={entities}
          activeEntity={activeEntity}
          character={character}
          activeLargeForm={activeLargeForm}
          breathWeaponShape={breathWeaponShape}
          selectedBreathTargets={selectedBreathTargets}
          setSelectedBreathTargets={setSelectedBreathTargets}
          isEntityVisible={isEntityVisible}
          getDistanceBetweenEntities={getDistanceBetweenEntities}
          shouldHideEntityDetails={shouldHideEntityDetails}
          isTargetInLine={isTargetInLine}
          isTargetInCone={isTargetInCone}
        />

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
            onClick={onConfirmAction}
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
