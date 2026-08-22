import { useEffect } from 'react';
import { PlayerStats } from '../../types';
import { getSpellSlotsForClass } from './creation/constants';
import { ClassSelection } from './creation/ClassSelection';
import { BackgroundSelection } from './creation/BackgroundSelection';
import { SpeciesSelection } from './creation/SpeciesSelection';
import { SkillsSelection } from './creation/SkillsSelection';
import { AbilitiesSelection } from './creation/AbilitiesSelection';
import { DetailsSelection } from './creation/DetailsSelection';
import { EquipmentSelection } from './creation/EquipmentSelection';
import { SpellsSelection } from './creation/SpellsSelection';
import { FinalReview } from './creation/FinalReview';
import { useCharacterCreationState } from './creation/hooks/useCharacterCreationState';
import {
  calculateModifier,
  getStandardClassEquipment
} from './creation/helpers/creationHelpers';
import { parseInventory, calculateTotalCoinsFromEquipment, parseAttacks } from '../../lib/mechanics/inventoryParser';
import { calculateResources, calculateRaceResources } from '../../lib/mechanics/resourcesParser';
import { formatEquipmentChoiceDescription } from '../../lib/mechanics/equipmentParser';

interface CharacterCreationProps {
  onComplete: (stats: PlayerStats) => void;
}

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const state = useCharacterCreationState({ onComplete });

  const {
    backgrounds, races, step, setStep, name, setName, alignment, setAlignment,
    classEqChoice, setClassEqChoice, bgEqChoice, setBgEqChoice, race, setRace,
    draconicAncestry, setDraconicAncestry, giantAncestry, setGiantAncestry, humanFeat, setHumanFeat,
    selectedSkills, setSelectedSkills, selectedTools, setSelectedTools,
    selectedCantrips, setSelectedCantrips, selectedSpells, setSelectedSpells, background, setBackground,
    charClass, setCharClass, fightingStyle, setFightingStyle, bgBonusMode, setBgBonusMode, bgBonuses,
    setBgBonuses, statMethod, setStatMethod, baseStats, setBaseStats, unassignedStandard,
    setUnassignedStandard, rolledScores, setRolledScores, unassignedRolls, setUnassignedRolls,
    isSubmitting, nameInputRef, firstStatSelectRef, currentBg, currentClass, currentRace,
    getPointsSpent, getFinalStat, rollStats, assignStat, getEquipmentAndAC,
    finalizeCharacter, isSpellcaster, totalSteps, isStepValid
  } = state;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isStepValid()) {
          e.preventDefault();
          if (step < totalSteps) {
            setStep((prev) => prev + 1);
          } else if (!isSubmitting) {
            finalizeCharacter();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, totalSteps, isSubmitting, isStepValid, finalizeCharacter, setStep]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl flex flex-col md:flex-row gap-8">
        
        {/* Left Panel: Form Steps */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-black tracking-tight text-amber-500">CRIAÇÃO DE PERSONAGEM</h1>
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(i => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === i ? 'bg-amber-500 text-slate-950' : step > i ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 border border-slate-700 text-slate-500'}`}>
                  {i}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            {step === 1 && (
              <ClassSelection 
                charClass={charClass} 
                setCharClass={setCharClass} 
                fightingStyle={fightingStyle}
                setFightingStyle={setFightingStyle}
              />
            )}

            {step === 2 && (
              <BackgroundSelection 
                backgrounds={backgrounds}
                background={background}
                setBackground={setBackground}
                bgBonusMode={bgBonusMode}
                setBgBonusMode={setBgBonusMode}
                bgBonuses={bgBonuses}
                setBgBonuses={setBgBonuses}
                currentBg={currentBg}
              />
            )}

            {step === 3 && (
              <SpeciesSelection 
                race={race}
                setRace={setRace}
                draconicAncestry={draconicAncestry}
                setDraconicAncestry={setDraconicAncestry}
                giantAncestry={giantAncestry}
                setGiantAncestry={setGiantAncestry}
                humanFeat={humanFeat}
                setHumanFeat={setHumanFeat}
                currentBg={currentBg}
              />
            )}

            {step === 4 && (
              <SkillsSelection
                charClass={charClass}
                currentBg={currentBg}
                currentRace={currentRace}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                selectedTools={selectedTools}
                setSelectedTools={setSelectedTools}
                onValidationChange={state.setIsSkillsValid}
              />
            )}

            {step === 5 && (
              <AbilitiesSelection 
                statMethod={statMethod}
                setStatMethod={setStatMethod}
                baseStats={baseStats}
                setBaseStats={setBaseStats}
                unassignedStandard={unassignedStandard}
                setUnassignedStandard={setUnassignedStandard}
                rolledScores={rolledScores}
                setRolledScores={setRolledScores}
                unassignedRolls={unassignedRolls}
                setUnassignedRolls={setUnassignedRolls}
                bgBonuses={bgBonuses}
                currentClass={currentClass}
                assignStat={assignStat as any}
                rollStats={rollStats}
                getPointsSpent={getPointsSpent}
                getFinalStat={getFinalStat}
                firstStatSelectRef={firstStatSelectRef}
              />
            )}

            {step === 6 && (
              <DetailsSelection 
                name={name}
                setName={setName}
                alignment={alignment}
                setAlignment={setAlignment}
                charClass={charClass}
                nameInputRef={nameInputRef}
              />
            )}

            {step === 7 && (
              <EquipmentSelection 
                charClass={charClass}
                currentClass={currentClass}
                currentBg={currentBg}
                classEqChoice={classEqChoice}
                setClassEqChoice={setClassEqChoice}
                bgEqChoice={bgEqChoice}
                setBgEqChoice={setBgEqChoice}
                getStandardClassEquipment={getStandardClassEquipment}
                formatEquipmentChoiceDescription={formatEquipmentChoiceDescription as any}
              />
            )}

            {step === 8 && isSpellcaster && (
              <SpellsSelection 
                charClass={charClass}
                selectedCantrips={selectedCantrips}
                setSelectedCantrips={setSelectedCantrips}
                selectedSpells={selectedSpells}
                setSelectedSpells={setSelectedSpells}
                spellSlots={getSpellSlotsForClass(charClass)}
              />
            )}

            {step === totalSteps && (
              <FinalReview 
                name={name}
                charClass={charClass}
                race={race}
                currentRace={currentRace}
                currentClass={currentClass}
                currentBg={currentBg}
                draconicAncestry={draconicAncestry}
                giantAncestry={giantAncestry}
                humanFeat={humanFeat}
                getEquipmentAndAC={getEquipmentAndAC}
                getFinalStat={getFinalStat}
                selectedCantrips={selectedCantrips}
                selectedSpells={selectedSpells}
                selectedSkills={selectedSkills || []}
                selectedTools={selectedTools || []}
                calculateModifier={calculateModifier}
                parseInventory={parseInventory as any}
                calculateTotalCoinsFromEquipment={calculateTotalCoinsFromEquipment as any}
                parseAttacks={parseAttacks as any}
                calculateResources={calculateResources}
                calculateRaceResources={calculateRaceResources}
              />
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800 mt-auto">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 bg-slate-900 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              Voltar
            </button>

            {step < totalSteps ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-30 flex items-center gap-2"
              >
                Próximo Passo <span>→</span>
              </button>
            ) : (
              <button 
                onClick={finalizeCharacter}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-500 text-slate-950 font-black tracking-widest uppercase rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span> Salvando...
                  </>
                ) : (
                  <>
                    Finalizar Personagem <span>⚔️</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
