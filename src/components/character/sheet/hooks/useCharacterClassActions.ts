import { useState, useMemo } from 'react';
import { updateCharacter } from '../../../../lib/api/characterService';
import { getMod } from '../../../../lib/mechanics/hpCalculator';
import { calculateResources, calculateRaceResources } from '../../../../lib/mechanics/resourcesParser';

export const useCharacterClassActions = (
  character: any,
  currentHp: number,
  setCurrentHp: (hp: number) => void,
  setCurrentExhaustion: (ex: number) => void,
  setSaveMessage: (msg: string | null) => void,
  onCharacterUpdated?: () => void,
  selectedSubclass?: string
) => {
  const effectiveLevel = character.level || 1;
  const pb = 2 + Math.floor((effectiveLevel - 1) / 4);

  const classResources = useMemo(() => {
    const stats = {
      str: character.strength || 10,
      dex: character.dexterity || 10,
      con: character.constitution || 10,
      int: character.intelligence || 10,
      wis: character.wisdom || 10,
      cha: character.charisma || 10,
    };
    const freshResources = calculateResources(
      character.class_name || 'Guerreiro',
      effectiveLevel,
      stats,
      selectedSubclass || character.subclass || 'Champion'
    );
    const raceRes = calculateRaceResources(
      character.race || '',
      effectiveLevel,
      character.draconic_ancestry,
      character.giant_ancestry || character.giantAncestry
    );
    raceRes.forEach(rr => {
      if (!freshResources.some(cr => cr.name.toLowerCase() === rr.name.toLowerCase())) {
        freshResources.push(rr);
      }
    });

    const existingResources = Array.isArray(character.class_resources) ? character.class_resources : [];

    const merged = freshResources.map(fresh => {
      const existing = existingResources.find((e: any) => e && e.name && e.name.toLowerCase() === fresh.name.toLowerCase());
      const usedCount = existing && typeof existing.used === 'number' ? existing.used : 0;
      return {
        ...fresh,
        used: Math.min(fresh.max, Math.max(0, usedCount))
      };
    });

    existingResources.forEach((e: any) => {
      if (e && e.name && !merged.some(m => m.name.toLowerCase() === e.name.toLowerCase())) {
        merged.push({ ...e, used: typeof e.used === 'number' ? e.used : 0 });
      }
    });

    return merged;
  }, [character, effectiveLevel, selectedSubclass]);

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

  // Segundo Fôlego / Recuperar Fôlego
  const handleUseSecondWind = async () => {
    const res = classResources.find((r: any) => {
      const name = (r?.name || '').toLowerCase();
      return name.includes('segundo fôlego') || name.includes('recuperar fôlego') || name.includes('retomar o fôlego') || name.includes('second wind');
    });
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não tem mais usos de Recuperar Fôlego disponíveis!');
      return;
    }

    const maxHp = character.max_hp || 10;
    if (currentHp >= maxHp) {
      alert('Seus pontos de vida já estão em 100%! Não é possível usar o Recuperar Fôlego com a vida cheia.');
      return;
    }

    const roll = Math.floor(Math.random() * 10) + 1;
    const lvl = effectiveLevel;
    const totalHealed = roll + lvl;
    const newHp = Math.min(maxHp, currentHp + totalHealed);
    const actualHeal = newHp - currentHp;

    const updatedResources = classResources.map((r: any) => {
      const name = (r?.name || '').toLowerCase();
      if (name.includes('segundo fôlego') || name.includes('recuperar fôlego') || name.includes('retomar o fôlego') || name.includes('second wind')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });

    character.current_hp = newHp;
    character.class_resources = updatedResources;
    setCurrentHp(newHp);

    if (character.id) {
      await updateCharacter(character.id, {
        current_hp: newHp,
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(`🌬️ [RECUPERAR FÔLEGO]: Curou ${actualHeal} PV (1d10 [${roll}] + Nível [${lvl}])!`);
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Surto de Ação
  const handleUseActionSurge = async () => {
    alert('⚡ [SURTO DE AÇÃO]: Esta habilidade só pode ser ativada durante um combate na arena!');
  };

  // Indomável
  const handleUseIndomitable = async () => {
    const res = classResources.find((r: any) => r.name.toLowerCase().includes('indomável'));
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não tem mais usos de Indomável disponíveis!');
      return;
    }

    const lvl = effectiveLevel;
    const updatedResources = classResources.map((r: any) => {
      if (r.name.toLowerCase().includes('indomável')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });
    character.class_resources = updatedResources;

    if (character.id) {
      await updateCharacter(character.id, {
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(`🛡️ [INDOMÁVEL]: Rorrole a Salvaguarda que falhou com um bônus adicional de +${lvl} no novo teste!`);
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Intercepção
  const handleUseInterception = () => {
    const roll = Math.floor(Math.random() * 10) + 1;
    const totalReduced = roll + pb;
    setSaveMessage(
      `🛡️ [INTERCEPÇÃO]: Reação ativada! Reduziu o dano sofrido pelo aliado próximo em ${totalReduced} (1d10 [${roll}] + PB [+${pb}]).`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Proteção
  const handleUseProtection = () => {
    setSaveMessage(
      '🛡️ [PROTEÇÃO]: Reação ativada! O ataque do inimigo contra seu aliado adjacente foi feito com DESVANTAGEM.'
    );
    setTimeout(() => setSaveMessage(null), 5000);
  };

  // Luta Desarmada
  const handleUseUnarmedGrappleDamage = () => {
    const roll = Math.floor(Math.random() * 4) + 1;
    setSaveMessage(
      `👊 [LUTA DESARMADA]: Início de turno! Causou automaticamente ${roll} de dano contundente (1d4) à criatura agarrada por você.`
    );
    setTimeout(() => setSaveMessage(null), 5000);
  };

  // Manobra de Mestre de Batalha
  const handleUseManeuver = async (maneuverName: string) => {
    const res = classResources.find(
      (r: any) => r.name.toLowerCase().includes('superioridade') || r.name.toLowerCase().includes('manobra')
    );
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não possui mais Dados de Superioridade disponíveis!');
      return;
    }

    const dieSize = effectiveLevel >= 18 ? 12 : effectiveLevel >= 10 ? 10 : 8;
    const roll = Math.floor(Math.random() * dieSize) + 1;

    const updatedResources = classResources.map((r: any) => {
      if (r.name.toLowerCase().includes('superioridade') || r.name.toLowerCase().includes('manobra')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });
    character.class_resources = updatedResources;

    if (character.id) {
      await updateCharacter(character.id, {
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(
      `⚔️ [MANOBRA: ${maneuverName.toUpperCase()}]: Dado de Superioridade rolado: d${dieSize} [${roll}] adicionado ao efeito!`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Poder Psiônico (Guerreiro Psíquico)
  const handleUsePsiPower = async (powerName: string) => {
    const res = classResources.find(
      (r: any) => r.name.toLowerCase().includes('energia psiônica') || r.name.toLowerCase().includes('psionic')
    );
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não possui mais Dados de Energia Psiônica disponíveis!');
      return;
    }

    const dieSize = effectiveLevel >= 17 ? 12 : effectiveLevel >= 11 ? 10 : effectiveLevel >= 5 ? 8 : 6;
    const roll = Math.floor(Math.random() * dieSize) + 1;
    const intMod = getMod(character.intelligence || 10);

    const updatedResources = classResources.map((r: any) => {
      if (r.name.toLowerCase().includes('energia psiônica') || r.name.toLowerCase().includes('psionic')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });
    character.class_resources = updatedResources;

    if (character.id) {
      await updateCharacter(character.id, {
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(
      `🧠 [PODER PSIÔNICO: ${powerName.toUpperCase()}]: Dado de Energia Psiônica gasto: d${dieSize} [${roll}] + INT [+${intMod}] = ${
        roll + intMod
      }!`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  return {
    classResources,
    handleShortRest,
    handleLongRest,
    handleUseSecondWind,
    handleUseActionSurge,
    handleUseIndomitable,
    handleUseInterception,
    handleUseProtection,
    handleUseUnarmedGrappleDamage,
    handleUseManeuver,
    handleUsePsiPower,
  };
};
