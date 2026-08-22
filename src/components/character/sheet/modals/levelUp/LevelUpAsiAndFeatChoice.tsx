import React from 'react';
import { StatKey } from '../../constants';
import { LevelUpAsiSelector } from './asiAndFeats/LevelUpAsiSelector';
import { LevelUpFeatSelector } from './asiAndFeats/LevelUpFeatSelector';

export interface LevelUpAsiAndFeatChoiceProps {
  isCurrentLevelAsi: boolean;
  nextLevel: number;
  character: any;
  levelUpAsiChoice: 'asi' | 'feat';
  setLevelUpAsiChoice: (c: 'asi' | 'feat') => void;
  asiMode: 'single' | 'double';
  setAsiMode: (m: 'single' | 'double') => void;
  asiStat1: StatKey;
  setAsiStat1: (s: StatKey) => void;
  asiStat2: StatKey;
  setAsiStat2: (s: StatKey) => void;
  selectedFeatName: string;
  setSelectedFeatName: (f: string) => void;
}

export const LevelUpAsiAndFeatChoice: React.FC<LevelUpAsiAndFeatChoiceProps> = ({
  isCurrentLevelAsi,
  nextLevel,
  character,
  levelUpAsiChoice,
  setLevelUpAsiChoice,
  asiMode,
  setAsiMode,
  asiStat1,
  setAsiStat1,
  asiStat2,
  setAsiStat2,
  selectedFeatName,
  setSelectedFeatName,
}) => {
  if (!isCurrentLevelAsi) return null;

  return (
    <div className="bg-slate-950/90 p-2.5 rounded-lg border border-amber-500/40 space-y-1.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <span>✨</span> Aumento de Atributo ou Talento (Nível {nextLevel})
        </h3>
        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.5 rounded font-bold">
          Benefício Especial
        </span>
      </div>

      <div className="flex items-center gap-2 bg-slate-900 p-0.5 rounded border border-slate-800">
        <button
          type="button"
          onClick={() => setLevelUpAsiChoice('asi')}
          className={`flex-1 py-1 text-[10px] font-bold rounded transition ${
            levelUpAsiChoice === 'asi'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💪 Atributos (+2 ou +1/+1)
        </button>
        <button
          type="button"
          onClick={() => setLevelUpAsiChoice('feat')}
          className={`flex-1 py-1 text-[10px] font-bold rounded transition ${
            levelUpAsiChoice === 'feat'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎯 Talento Especial
        </button>
      </div>

      {levelUpAsiChoice === 'asi' ? (
        <LevelUpAsiSelector
          character={character}
          asiMode={asiMode}
          setAsiMode={setAsiMode}
          asiStat1={asiStat1}
          setAsiStat1={setAsiStat1}
          asiStat2={asiStat2}
          setAsiStat2={setAsiStat2}
        />
      ) : (
        <LevelUpFeatSelector
          character={character}
          selectedFeatName={selectedFeatName}
          setSelectedFeatName={setSelectedFeatName}
        />
      )}
    </div>
  );
};
