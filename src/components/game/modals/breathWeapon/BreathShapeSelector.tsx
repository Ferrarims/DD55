import React from 'react';

interface BreathShapeSelectorProps {
  breathWeaponShape: 'cone' | 'line';
  setBreathWeaponShape: React.Dispatch<React.SetStateAction<'cone' | 'line'>>;
  activeEntity: any;
  entities: any[];
  character: any;
  activeLargeForm: boolean;
  getDistanceBetweenEntities: (e1: any, e2: any, race?: string, isLarge?: boolean) => number;
  setSelectedBreathTargets: React.Dispatch<React.SetStateAction<string[]>>;
}

export const BreathShapeSelector: React.FC<BreathShapeSelectorProps> = ({
  breathWeaponShape,
  setBreathWeaponShape,
  activeEntity,
  entities,
  character,
  activeLargeForm,
  getDistanceBetweenEntities,
  setSelectedBreathTargets,
}) => {
  return (
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
  );
};
