import React from 'react';

interface BreathTargetListProps {
  entities: any[];
  activeEntity: any;
  character: any;
  activeLargeForm: boolean;
  breathWeaponShape: 'cone' | 'line';
  selectedBreathTargets: string[];
  setSelectedBreathTargets: React.Dispatch<React.SetStateAction<string[]>>;
  isEntityVisible: (entity: any) => boolean;
  getDistanceBetweenEntities: (e1: any, e2: any, race?: string, isLarge?: boolean) => number;
  shouldHideEntityDetails: (entity: any) => boolean;
  isTargetInLine: (source: any, target: any, primaryTarget: any, maxDist: number) => boolean;
  isTargetInCone: (source: any, target: any, primaryTarget: any, maxDist: number) => boolean;
}

export const BreathTargetList: React.FC<BreathTargetListProps> = ({
  entities,
  activeEntity,
  character,
  activeLargeForm,
  breathWeaponShape,
  selectedBreathTargets,
  setSelectedBreathTargets,
  isEntityVisible,
  getDistanceBetweenEntities,
  shouldHideEntityDetails,
  isTargetInLine,
  isTargetInCone,
}) => {
  const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
  if (aliveMonsters.length === 0) {
    return <p className="text-xs text-slate-500 italic p-2">Nenhum inimigo visível na arena.</p>;
  }
  const maxDist = breathWeaponShape === 'cone' ? 3 : 6;

  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-2">
        2. Selecione os Inimigos Atingidos:
      </label>
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
    </div>
  );
};
