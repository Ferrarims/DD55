import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';
import { StatKey } from '../constants';
import { LevelUpSubclassChoice } from './levelUp/LevelUpSubclassChoice';
import { LevelUpFightingStyleChoice } from './levelUp/LevelUpFightingStyleChoice';
import { LevelUpAsiAndFeatChoice } from './levelUp/LevelUpAsiAndFeatChoice';
import { LevelUpHpAndFeaturesSection } from './levelUp/LevelUpHpAndFeaturesSection';

export interface LevelUpModalProps {
  showLevelUpModal: boolean;
  setShowLevelUpModal: (show: boolean) => void;
  icon: string;
  currentLevel: number;
  nextLevel: number;
  character: any;
  needsSubclassChoice: boolean;
  subclassLevel: number;
  levelUpSubclass: string;
  setLevelUpSubclass: (sub: string) => void;
  needsFightingStyleChoice: boolean;
  levelUpFightingStyle: string;
  setLevelUpFightingStyle: (fs: string) => void;
  isCurrentLevelAsi: boolean;
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
  hitDieStr: string;
  hpGainMode: 'avg' | 'roll';
  setHpGainMode: (m: 'avg' | 'roll') => void;
  avgHpGain: number;
  rolledValue: number | null;
  rolledHpGain: number;
  handleRollHitDie: () => void;
  isRolling: boolean;
  getCharacterActiveFeats: (char: any) => string[];
  calculateTotalMaxHp?: (base: number, race: string, level: number, feats: string[]) => number;
  hpBreakdown?: any;
  activeHpGain: number;
  hitDieVal: number;
  conMod: number;
  isDwarf: boolean;
  newFeaturesText: string;
  nextProgression: any;
  handleConfirmLevelUp: () => void;
  isLevelingUp: boolean;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  showLevelUpModal,
  setShowLevelUpModal,
  icon,
  currentLevel,
  nextLevel,
  character,
  needsSubclassChoice,
  subclassLevel,
  levelUpSubclass,
  setLevelUpSubclass,
  needsFightingStyleChoice,
  levelUpFightingStyle,
  setLevelUpFightingStyle,
  isCurrentLevelAsi,
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
  hitDieStr,
  hpGainMode,
  setHpGainMode,
  avgHpGain,
  rolledValue,
  rolledHpGain,
  handleRollHitDie,
  isRolling,
  getCharacterActiveFeats,
  activeHpGain,
  hitDieVal,
  conMod,
  isDwarf,
  newFeaturesText,
  nextProgression,
  handleConfirmLevelUp,
  isLevelingUp,
}) => {
  useModalKeyboard({
    onCancel: () => setShowLevelUpModal(false),
    onClose: () => setShowLevelUpModal(false),
    onConfirm: () => {
      if (!isLevelingUp) {
        handleConfirmLevelUp();
      }
    },
    disabled: !showLevelUpModal,
  });

  if (!showLevelUpModal) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 overflow-y-auto"
      onClick={() => setShowLevelUpModal(false)}
    >
      <div
        className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border-2 border-amber-400/80 rounded-xl p-3 max-w-5xl w-[98vw] shadow-2xl flex flex-col max-h-[96vh] animate-in fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="text-xl">{icon}</span>
            <div>
              <h2
                className="text-sm font-black text-amber-300"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                EVOLUÇÃO PARA O NÍVEL {nextLevel}
              </h2>
              <p className="text-[10px] text-slate-300">
                {character.name} ({character.class_name}) • Nível {currentLevel} ➔ Nível {nextLevel}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLevelUpModal(false)}
            className="text-slate-400 hover:text-white text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2 my-2">
          {/* Aviso Regra Oficial: Escolhas Permanentes */}
          <div className="bg-amber-950/60 border border-amber-500/50 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-base">🔒</span>
            <p className="text-[10px] text-amber-200 leading-tight">
              <strong>Atenção:</strong> Escolhas de subclasse, estilo de luta, talento e PV são{' '}
              <strong>finais e inalteráveis</strong> após a confirmação.
            </p>
          </div>

          <LevelUpSubclassChoice
            needsSubclassChoice={needsSubclassChoice}
            subclassLevel={subclassLevel}
            levelUpSubclass={levelUpSubclass}
            setLevelUpSubclass={setLevelUpSubclass}
          />

          <LevelUpFightingStyleChoice
            needsFightingStyleChoice={needsFightingStyleChoice}
            character={character}
            levelUpFightingStyle={levelUpFightingStyle}
            setLevelUpFightingStyle={setLevelUpFightingStyle}
          />

          <LevelUpAsiAndFeatChoice
            isCurrentLevelAsi={isCurrentLevelAsi}
            nextLevel={nextLevel}
            character={character}
            levelUpAsiChoice={levelUpAsiChoice}
            setLevelUpAsiChoice={setLevelUpAsiChoice}
            asiMode={asiMode}
            setAsiMode={setAsiMode}
            asiStat1={asiStat1}
            setAsiStat1={setAsiStat1}
            asiStat2={asiStat2}
            setAsiStat2={setAsiStat2}
            selectedFeatName={selectedFeatName}
            setSelectedFeatName={setSelectedFeatName}
          />

          <LevelUpHpAndFeaturesSection
            hitDieStr={hitDieStr}
            hitDieVal={hitDieVal}
            hpGainMode={hpGainMode}
            setHpGainMode={setHpGainMode}
            avgHpGain={avgHpGain}
            rolledValue={rolledValue}
            rolledHpGain={rolledHpGain}
            handleRollHitDie={handleRollHitDie}
            isRolling={isRolling}
            character={character}
            isCurrentLevelAsi={isCurrentLevelAsi}
            levelUpAsiChoice={levelUpAsiChoice}
            selectedFeatName={selectedFeatName}
            getCharacterActiveFeats={getCharacterActiveFeats}
            isDwarf={isDwarf}
            activeHpGain={activeHpGain}
            conMod={conMod}
            nextLevel={nextLevel}
            nextProgression={nextProgression}
            newFeaturesText={newFeaturesText}
          />
        </div>

        {/* Botões do Modal (Fixed Footer) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/30 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowLevelUpModal(false)}
            className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmLevelUp}
            disabled={isLevelingUp}
            className="px-4 py-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded shadow transition flex items-center gap-1 disabled:opacity-50"
          >
            <span>{isLevelingUp ? 'Salvando...' : `🔒 Confirmar Evolução (Nível ${nextLevel})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
