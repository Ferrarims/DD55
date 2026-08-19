import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';
import {
  FIGHTER_SUBCLASSES,
  FEATS_REFERENCE,
} from '../../../../lib/api/references';
import { StatKey, STAT_NAMES, FIGHTING_STYLES } from '../constants';

interface LevelUpModalProps {
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
  calculateTotalMaxHp: (base: number, race: string, level: number, feats: string[]) => number;
  hpBreakdown: any;
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
  calculateTotalMaxHp,
  hpBreakdown,
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

          {/* Escolha 1: Subclasse (no Nível 3 ou se não selecionada ainda) */}
          {needsSubclassChoice && (
            <div className="bg-slate-950/90 p-2.5 rounded-lg border border-amber-500/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <span>🛡️</span> Escolha de Subclasse (Nível {subclassLevel}+)
                </h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.5 rounded font-bold">
                  Permanente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {Array.from(
                  new Map(
                    Object.entries(FIGHTER_SUBCLASSES).map(([subKey, subInfo]: [string, any]) => [
                      subInfo.name,
                      { subKey, subInfo },
                    ])
                  ).values()
                ).map(({ subKey, subInfo }) => {
                  const isSelected =
                    levelUpSubclass === subKey ||
                    levelUpSubclass === subInfo.name ||
                    (levelUpSubclass === 'Champion' && subInfo.id === 'Champion');
                  const icon =
                    subInfo.id === 'BattleMaster' || subKey.includes('Battle') || subInfo.name.includes('Batalha')
                      ? '🎯'
                      : subInfo.id === 'Champion' || subKey.includes('Champion') || subInfo.name.includes('Campe')
                      ? '🏆'
                      : subInfo.id === 'EldritchKnight' || subKey.includes('Eldritch') || subInfo.name.includes('Arcano') || subInfo.name.includes('Místico')
                      ? '⚡'
                      : '🧠';
                  const level3Features = subInfo.features?.filter((f: any) => f.level === 3) || [];

                  return (
                    <button
                      key={subKey}
                      type="button"
                      onClick={() => setLevelUpSubclass(subKey)}
                      className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/80'
                          : 'bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                            <span>{icon}</span>
                            <span className="leading-tight">{subInfo.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider flex-shrink-0">
                              ✓ Selecionada
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                          {subInfo.description}
                        </p>
                      </div>

                      {level3Features.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-800/80 space-y-0.5">
                          <span className="text-[9px] font-bold text-amber-400/90 uppercase tracking-wider block">
                            Recursos de Nível 3:
                          </span>
                          <div className="text-[9px] text-slate-300 font-medium space-y-0.5">
                            {level3Features.map((f: any, fIdx: number) => (
                              <div key={fIdx} className="truncate">
                                • <strong className="text-amber-200">{f.name}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Escolha 2: Estilo de Luta (Versatilidade Marcial do Guerreiro) */}
          {needsFightingStyleChoice && (
            <div className="bg-slate-950/90 p-3 rounded-lg border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚔️</span> Estilo de Luta do Guerreiro (Talentos de Combate)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Versatilidade Marcial: Você pode manter seu estilo atual ou trocá-lo ao avançar de nível.
                  </p>
                </div>
                <span className="text-[10px] bg-slate-900 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium">
                  {character.fighting_style
                    ? levelUpFightingStyle === character.fighting_style
                      ? `Estilo Atual: ${character.fighting_style}`
                      : `Trocando: ${character.fighting_style} ➔ ${levelUpFightingStyle}`
                    : 'Escolha de Nível'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {FIGHTING_STYLES.map(fs => {
                  const isSelected = levelUpFightingStyle === fs.name;
                  const isCurrent = character.fighting_style === fs.name;

                  return (
                    <button
                      key={fs.id}
                      type="button"
                      disabled={fs.disabled}
                      onClick={() => !fs.disabled && setLevelUpFightingStyle(fs.name)}
                      className={`p-3 rounded-lg border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        fs.disabled
                          ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400 font-medium'
                          : 'bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-base shrink-0">{(fs as any).icon || '⚔️'}</span>
                            <span className={`font-bold text-xs leading-tight ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                              {fs.name}
                            </span>
                          </div>
                          {fs.disabled ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-500/30 shrink-0">
                              🔒 Em Grupo
                            </span>
                          ) : isSelected ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold shrink-0">
                              ✓ {isCurrent ? 'Atual' : 'Novo'}
                            </span>
                          ) : null}
                        </div>

                        <div className="text-[10.5px] text-slate-300 leading-relaxed">
                          {fs.disabled ? fs.disabledReason || fs.desc : fs.desc}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
                        <span className="text-amber-400/80 font-medium">Talento de Estilo de Luta</span>
                        <span className="text-slate-500">D&amp;D 5.5e (2024)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Escolha 3: Aumento de Valor de Habilidade (ASI) ou Talento */}
          {isCurrentLevelAsi && (
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
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAsiMode('single')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        asiMode === 'single'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      +2 em um Atributo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAsiMode('double');
                        if (asiStat1 === asiStat2) {
                          setAsiStat2(asiStat1 === 'str' ? 'con' : 'str');
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        asiMode === 'double'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      +1 em dois Atributos
                    </button>
                  </div>

                  {asiMode === 'single' ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                      {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as StatKey[]).map(st => {
                        const currentVal =
                          character[
                            st === 'str'
                              ? 'strength'
                              : st === 'dex'
                              ? 'dexterity'
                              : st === 'con'
                              ? 'constitution'
                              : st === 'int'
                              ? 'intelligence'
                              : st === 'wis'
                              ? 'wisdom'
                              : 'charisma'
                          ] || 10;
                        const isAtMax = currentVal >= 20;
                        const isSelected = asiStat1 === st;

                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={isAtMax}
                            onClick={() => setAsiStat1(st)}
                            className={`p-1.5 rounded border text-center transition flex flex-col justify-between items-center ${
                              isAtMax
                                ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-[9px] font-bold uppercase">{STAT_NAMES[st]}</div>
                            <div className="text-[10px]">
                              {isAtMax ? (
                                <span className="text-red-400 font-bold text-[9px]">20 (MÁX)</span>
                              ) : (
                                <span>
                                  {currentVal} ➔{' '}
                                  <strong className="text-emerald-400">
                                    {Math.min(20, currentVal + 2)}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                        {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as StatKey[]).map(st => {
                          const currentVal =
                            character[
                              st === 'str'
                                ? 'strength'
                                : st === 'dex'
                                ? 'dexterity'
                                : st === 'con'
                                ? 'constitution'
                                : st === 'int'
                                ? 'intelligence'
                                : st === 'wis'
                                ? 'wisdom'
                                : 'charisma'
                            ] || 10;
                          const isAtMax = currentVal >= 20;
                          const isSelected = asiStat1 === st || asiStat2 === st;

                          const handleToggleDouble = () => {
                            if (isAtMax) return;
                            if (st === asiStat1) {
                              setAsiStat1(asiStat2);
                              setAsiStat2(st);
                              return;
                            }
                            if (st === asiStat2) {
                              return;
                            }
                            setAsiStat1(asiStat2);
                            setAsiStat2(st);
                          };

                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={isAtMax}
                              onClick={handleToggleDouble}
                              className={`p-1.5 rounded border text-center transition flex flex-col justify-between items-center ${
                                isAtMax
                                  ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-md'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-[9px] font-bold uppercase">{STAT_NAMES[st]}</div>
                              <div className="text-[10px]">
                                {isAtMax ? (
                                  <span className="text-red-400 font-bold text-[9px]">20 (MÁX)</span>
                                ) : (
                                  <span>
                                    {currentVal} ➔{' '}
                                    <strong className={isSelected ? 'text-emerald-400' : 'text-slate-400'}>
                                      {Math.min(20, currentVal + 1)}
                                    </strong>
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1 pt-0.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">
                    Selecione o Talento D&amp;D 5.5e (2024)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 max-h-32 overflow-y-auto pr-1">
                    {Object.values(FEATS_REFERENCE)
                      .filter((ft: any) => ft.category === 'Geral')
                      .map((ft: any) => {
                        const isFightingStyleFeat = ft.category === 'Estilo de Luta';
                        const charHasFightingStyle = [
                          'guerreiro',
                          'fighter',
                          'paladino',
                          'paladin',
                          'patrulheiro',
                          'ranger',
                        ].some(c => (character.class_name || '').toLowerCase().includes(c));
                        const isBlocked = isFightingStyleFeat && !charHasFightingStyle;

                        return (
                          <button
                            key={ft.name}
                            type="button"
                            disabled={isBlocked}
                            onClick={() => !isBlocked && setSelectedFeatName(ft.name)}
                            className={`p-1 rounded border text-left transition flex flex-col ${
                              isBlocked
                                ? 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                                : selectedFeatName === ft.name
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-[10px] text-amber-300 flex justify-between items-center">
                              <span>{ft.name}</span>
                              {isFightingStyleFeat && (
                                <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1 rounded">
                                  Estilo
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5 leading-tight line-clamp-2">
                              {isBlocked
                                ? '⚠️ Requer característica Estilo de Luta da classe'
                                : ft.description || ft.benefit}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grid para PV e Habilidades lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Seção Dado de Vida e Ganho de HP */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <span>🎲</span> Dado de Vida &amp; PV
                </h3>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-semibold border border-slate-700">
                  {hitDieStr.startsWith('d') ? hitDieStr : `d${hitDieVal}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {/* Opção Média */}
                <button
                  type="button"
                  onClick={() => setHpGainMode('avg')}
                  className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                    hpGainMode === 'avg'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-[10px] uppercase text-amber-400 flex items-center gap-1">
                      📊 Média
                    </span>
                    {hpGainMode === 'avg' && (
                      <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black tracking-wider uppercase">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white my-0.5">
                    + {avgHpGain} PV
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">
                    {Math.floor(hitDieVal / 2) + 1} Base + CON
                  </div>
                </button>

                {/* Opção Rolar */}
                <div
                  onClick={() => {
                    setHpGainMode('roll');
                    if (rolledValue === null && !isRolling) {
                      handleRollHitDie();
                    }
                  }}
                  className={`p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                    hpGainMode === 'roll'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                      🎲 Rolar
                    </span>
                    <div className="flex items-center gap-1">
                      {rolledValue !== null && (
                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-1 rounded border border-emerald-700/50">
                          Dado: {rolledValue}
                        </span>
                      )}
                      {hpGainMode === 'roll' && (
                        <span className="text-[8px] bg-emerald-400 text-slate-950 px-1 py-0.2 rounded font-black tracking-wider uppercase">
                          Selecionado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-base font-black text-white my-0.5">
                    {rolledValue !== null ? `+ ${rolledHpGain} PV` : `+ ${avgHpGain} PV`}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRollHitDie();
                    }}
                    disabled={isRolling}
                    className="w-full mt-0.5 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[9px] rounded transition shadow flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <span>
                      {isRolling
                        ? 'Rolando...'
                        : rolledValue !== null
                        ? `Rolar Novamente (1${hitDieStr.startsWith('d') ? hitDieStr : `d${hitDieVal}`})`
                        : `Rolar 1${hitDieStr.startsWith('d') ? hitDieStr : `d${hitDieVal}`}`}
                    </span>
                  </button>
                </div>
              </div>

              {(() => {
                const previewFeats = getCharacterActiveFeats(character);
                if (
                  isCurrentLevelAsi &&
                  levelUpAsiChoice === 'feat' &&
                  selectedFeatName &&
                  !previewFeats.includes(selectedFeatName)
                ) {
                  previewFeats.push(selectedFeatName);
                }
                const previewHasTough = previewFeats.some(f => /vigoroso|tough/i.test(f || ''));
                const currentMax = Number(character.max_hp) || 10;
                const dwarfBonusForNextLevel = isDwarf ? 1 : 0;
                const toughBonusForNextLevel = previewHasTough ? 2 : 0;
                const nextMaxHp =
                  currentMax + activeHpGain + dwarfBonusForNextLevel + toughBonusForNextLevel;

                return (
                  <div className="bg-slate-900/90 px-2.5 py-2 rounded border border-slate-800 flex flex-col gap-1.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Novo Máximo de PV:
                      </span>
                      <span className="font-black text-amber-300 flex items-center gap-1.5">
                        <span className="text-slate-500 line-through decoration-slate-600/50">
                          {currentMax}
                        </span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-emerald-400 text-sm font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                          {nextMaxHp} PV
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1 text-[9px] text-slate-500 font-medium border-t border-slate-800/50 pt-1">
                      <span className="bg-slate-950 px-1 rounded text-slate-400">
                        {currentMax} PV atuais
                      </span>
                      <span>+</span>
                      <div className="flex items-center gap-1 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50">
                        <span className="text-emerald-400 font-bold">
                          {hpGainMode === 'avg'
                            ? Math.floor(hitDieVal / 2) + 1
                            : rolledValue !== null
                            ? rolledValue
                            : Math.floor(hitDieVal / 2) + 1}
                        </span>
                        <span className="text-[8px] opacity-60 uppercase">
                          {hpGainMode === 'avg' ? 'Média' : 'Dado'}
                        </span>
                      </div>
                      <span>+</span>
                      <div className="flex items-center gap-1 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50">
                        <span className="text-sky-400 font-bold">
                          {conMod >= 0 ? `+${conMod}` : conMod}
                        </span>
                        <span className="text-[8px] opacity-60 uppercase">Con</span>
                      </div>
                      {isDwarf && (
                        <>
                          <span>+</span>
                          <div className="flex items-center gap-1 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/30">
                            <span className="text-amber-400 font-bold">+1</span>
                            <span className="text-[8px] opacity-60 uppercase">Raça</span>
                          </div>
                        </>
                      )}
                      {previewHasTough && (
                        <>
                          <span>+</span>
                          <div className="flex items-center gap-1 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/30">
                            <span className="text-amber-400 font-bold">+2</span>
                            <span className="text-[8px] opacity-60 uppercase">Talento</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Seção 2: Habilidades do Nível */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>✨</span> Habilidades (Nível {nextLevel})
              </h3>
              <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
                {Array.isArray(nextProgression?.features) && nextProgression.features.length > 0 ? (
                  nextProgression.features.map((feat: any, idx: number) => {
                    const featName =
                      typeof feat === 'string'
                        ? feat
                        : feat?.name || 'Habilidade de Classe';
                    const featDesc =
                      typeof feat === 'object' && feat?.description ? feat.description : null;
                    return (
                      <div key={idx} className="flex flex-col text-[10px]">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{featName}</span>
                        </div>
                        {featDesc && (
                          <p className="text-[9px] text-slate-400 pl-3 leading-snug line-clamp-2">
                            {featDesc}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] font-bold text-slate-100 flex items-start gap-1">
                    <span className="text-amber-400">•</span>
                    <span>
                      {typeof newFeaturesText === 'string'
                        ? newFeaturesText
                        : 'Recursos de classe atualizados para o novo nível.'}
                    </span>
                  </div>
                )}
              </div>

              {(nextProgression as any)?.spellSlots && (
                <div className="text-[9px] bg-purple-950/50 border border-purple-800/50 p-1.5 rounded text-purple-200">
                  ✨ <strong>Espaços de Magia:</strong> Atualizados para o Nível {nextLevel}!
                </div>
              )}
            </div>
          </div>
        </div>
        {/* End of Scrollable Content */}

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
