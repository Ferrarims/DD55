import { updateCharacter } from '../../../../../lib/api/characterService';
import { getMod } from '../../../../../lib/mechanics/hpCalculator';
import { calculateResources, calculateRaceResources } from '../../../../../lib/mechanics/resourcesParser';

interface UseRestActionsProps {
  character: any;
  effectiveLevel: number;
  currentHp: number;
  setCurrentHp: (hp: number) => void;
  setCurrentExhaustion: (ex: number) => void;
  setSaveMessage: (msg: string | null) => void;
  onCharacterUpdated?: () => void;
  selectedSubclass?: string;
  classResources: any[];
}

export const useRestActions = ({
  character,
  effectiveLevel,
  currentHp,
  setCurrentHp,
  setCurrentExhaustion,
  setSaveMessage,
  onCharacterUpdated,
  selectedSubclass,
  classResources,
}: UseRestActionsProps) => {
  // Descanso Curto
  const handleShortRest = async (hitDiceToSpend: number) => {
    if (hitDiceToSpend <= 0) return;
    const conMod = getMod(character.constitution || 10);
    const hitDieMatch = (character.hit_dice || '1d10').match(/d(\d+)/i);
    const hitDieVal = hitDieMatch ? parseInt(hitDieMatch[1], 10) : 10;

    let totalHealed = 0;
    const rolls: number[] = [];
    for (let i = 0; i < hitDiceToSpend; i++) {
      const roll = Math.floor(Math.random() * hitDieVal) + 1;
      rolls.push(roll);
      totalHealed += Math.max(1, roll + conMod);
    }

    const currentHdNum = typeof character.hit_dice_current === 'number' ? character.hit_dice_current : effectiveLevel;
    const newHdNum = Math.max(0, currentHdNum - hitDiceToSpend);
    const maxHp = character.max_hp || 10;
    const newHp = Math.min(maxHp, currentHp + totalHealed);
    const actualHeal = newHp - currentHp;

    const refreshedResources = classResources.map((res: any) => {
      const name = res.name.toLowerCase();
      if (
        name.includes('fôlego') ||
        name.includes('wind') ||
        name.includes('surto') ||
        name.includes('surge') ||
        name.includes('superioridade') ||
        name.includes('manobra') ||
        name.includes('fúria') ||
        name.includes('canalizar divindade') ||
        name.includes('druidic') ||
        name.includes('forma selvagem') ||
        name.includes('ki') ||
        name.includes('foco') ||
        name.includes('psiônicos') ||
        name.includes('sopro') ||
        name.includes('resistência da pedra') ||
        name.includes('salto das nuvens') ||
        name.includes('queimadura do fogo') ||
        name.includes('frio do gelo') ||
        name.includes('queda da colina') ||
        name.includes('trovão da tempestade')
      ) {
        return { ...res, used: 0 };
      }
      return res;
    });

    character.current_hp = newHp;
    character.hit_dice_current = newHdNum;
    character.class_resources = refreshedResources;
    setCurrentHp(newHp);

    if (character.id) {
      await updateCharacter(character.id, {
        current_hp: newHp,
        hit_dice_current: newHdNum,
        class_resources: refreshedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(
      `☕ [DESCANSO CURTO]: Gastou ${hitDiceToSpend} Dado(s) de Vida. Recuperou ${actualHeal} PV (Rolagens: [${rolls.join(
        ', '
      )}] + ${conMod * hitDiceToSpend} CON). Recursos curtos recuperados!`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Descanso Longo
  const handleLongRest = async () => {
    const maxHp = character.max_hp || 10;
    const fullLevel = effectiveLevel;
    const newHd = fullLevel;

    const stats = {
      str: character.strength || 10,
      dex: character.dexterity || 10,
      con: character.constitution || 10,
      int: character.intelligence || 10,
      wis: character.wisdom || 10,
      cha: character.charisma || 10,
    };
    let refreshedResources = calculateResources(
      character.class_name || 'Guerreiro',
      fullLevel,
      stats,
      selectedSubclass || character.subclass || 'Champion'
    );
    const raceRes = calculateRaceResources(
      character.race || '',
      fullLevel,
      character.draconic_ancestry,
      character.giant_ancestry || character.giantAncestry
    );
    raceRes.forEach(rr => {
      if (!refreshedResources.some(cr => cr.name.toLowerCase() === rr.name.toLowerCase())) {
        refreshedResources.push(rr);
      }
    });

    refreshedResources = refreshedResources.map(res => ({ ...res, used: 0 }));

    character.current_hp = maxHp;
    character.temp_hp = 0;
    character.hit_dice_current = newHd;
    character.class_resources = refreshedResources;
    character.exhaustion_level = 0;
    setCurrentHp(maxHp);
    setCurrentExhaustion(0);

    if (character.id) {
      await updateCharacter(character.id, {
        current_hp: maxHp,
        temp_hp: 0,
        hit_dice_current: newHd,
        class_resources: refreshedResources,
        exhaustion_level: 0,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(
      `🌙 [DESCANSO LONGO]: Vida e Dados de Vida restaurados ao máximo (${maxHp} PV), e TODOS os recursos redefinidos!`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  return {
    handleShortRest,
    handleLongRest,
  };
};
