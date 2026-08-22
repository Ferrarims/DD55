import { useCallback } from 'react';
import { CombatEntity, CellData } from '../../../../game/types';
import { calculateCover, CoverResult } from '../../../../game/coverMechanics';
import { BACKGROUNDS_REFERENCE, FEATS_REFERENCE } from '../../../../lib/api/references';

export interface UseHeroVisibilityProps {
  character: any;
  entities: CombatEntity[];
  grid: CellData[][];
  torches: { x: number; y: number }[];
  biome: string;
  isNight: boolean;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
}

export function useHeroVisibility({
  character,
  entities,
  grid,
  torches,
  biome,
  isNight,
  activeRevelation,
}: UseHeroVisibilityProps) {
  const getActiveFeats = useCallback((): string[] => {
    if (!character) return [];
    const rawList: string[] = [];

    const originStr = character.originFeat || character.origin_feat;
    if (originStr && typeof originStr === 'string') {
      originStr.split(',').forEach((f: string) => {
        const trimmed = f.trim();
        if (trimmed && !rawList.includes(trimmed)) rawList.push(trimmed);
      });
    }

    const bgName = character.background || character.antecedente || character.backgrounds?.name;
    if (bgName && BACKGROUNDS_REFERENCE[bgName]?.feat) {
      const bgFeat = BACKGROUNDS_REFERENCE[bgName].feat;
      if (bgFeat && !rawList.includes(bgFeat)) rawList.push(bgFeat);
    }

    if (Array.isArray(character.feats)) {
      character.feats.forEach((f: string) => {
        if (f && typeof f === 'string' && !rawList.includes(f)) rawList.push(f);
      });
    }

    if (Array.isArray(character.level_choices)) {
      character.level_choices.forEach((lc: any) => {
        if (lc.asiOrFeat && typeof lc.asiOrFeat === 'string') {
          const str = lc.asiOrFeat.trim();
          if (str.toLowerCase().startsWith('talento:')) {
            const featNameMatch = str.replace(/^Talento\s*:\s*/i, '').trim();
            if (featNameMatch && !rawList.includes(featNameMatch)) {
              rawList.push(featNameMatch);
            }
          }
        }
      });
    }

    if (character.character_features && Array.isArray(character.character_features) && character.character_features[0]) {
      const cf = character.character_features[0];
      if (Array.isArray(cf.feats)) {
        cf.feats.forEach((f: string) => {
          if (f && typeof f === 'string' && !rawList.includes(f)) rawList.push(f);
        });
      }
    }

    if (rawList.some(f => f && (f.trim().toLowerCase() === 'alert' || f.trim().toLowerCase() === 'alerta')) && !rawList.includes('Alerta')) {
      rawList.push('Alerta');
    }

    const FIGHTING_STYLES_LIST = [
      'Arquearia', 'Combate com Armas Grandes', 'Combate com Duas Armas', 'Combate Desarmado', 
      'Defensivo', 'Duelismo', 'Interceptação', 'Luta às Cegas', 'Protetivo',
      'Archery', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Two-Weapon Fighting'
    ];
    const isFightingStyleName = (name: string): boolean => {
      if (!name || typeof name !== 'string') return false;
      const n = name.trim().toLowerCase();
      return FIGHTING_STYLES_LIST.some(fs => fs.toLowerCase() === n) || FEATS_REFERENCE[name]?.category === 'Estilo de Luta';
    };

    let activeFightingStyle = '';
    if (Array.isArray(character.level_choices) && character.level_choices.length > 0) {
      const sortedChoices = [...character.level_choices].sort((a, b) => (b.level || 0) - (a.level || 0));
      const latestLcStyle = sortedChoices.find(lc => lc.fightingStyle)?.fightingStyle;
      if (latestLcStyle) {
        activeFightingStyle = latestLcStyle;
      }
    }
    if (!activeFightingStyle) {
      activeFightingStyle = character.fighting_style || character.fightingStyle || character.character_features?.[0]?.fighting_style || character.character_features?.[0]?.fightingStyle || '';
    }

    const filteredList = rawList.filter(f => {
      if (isFightingStyleName(f)) {
        return activeFightingStyle && f.trim().toLowerCase() === activeFightingStyle.trim().toLowerCase();
      }
      return true;
    });

    if (activeFightingStyle && !filteredList.some(f => f.trim().toLowerCase() === activeFightingStyle.trim().toLowerCase())) {
      filteredList.push(activeFightingStyle);
    }

    return filteredList;
  }, [character]);

  const getHeroLightRadiusInCells = useCallback((): number => {
    if (!character) return 0;
    let slots: Record<string, string | null> = {};
    if (character.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try {
          slots = JSON.parse(character.equipment_slots);
        } catch {
          slots = {};
        }
      } else {
        slots = character.equipment_slots;
      }
    } else if (character.equipmentSlots) {
      slots = character.equipmentSlots;
    }

    const equippedItemNames: string[] = [];

    if (slots) {
      Object.values(slots).forEach(val => {
        if (typeof val === 'string' && val.trim() !== '') {
          equippedItemNames.push(val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());
        }
      });
    }

    if (Array.isArray(character.character_inventory)) {
      character.character_inventory.forEach((inv: any) => {
        if (inv.equip_slot) {
          const name = String(inv.items?.name || inv.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          if (name && !equippedItemNames.includes(name)) {
            equippedItemNames.push(name);
          }
        }
      });
    }

    const hasEquippedLight = (term: string) => equippedItemNames.some(name => name.includes(term));

    const hasFocaFacho = hasEquippedLight('facho') || hasEquippedLight('foca-facho') || hasEquippedLight('bullseye');
    const hasCoberta = hasEquippedLight('coberta') || hasEquippedLight('coberto') || hasEquippedLight('hooded');
    const hasTocha = hasEquippedLight('tocha') || hasEquippedLight('torch');
    const hasLampada = hasEquippedLight('lampada') || hasEquippedLight('lanterna') || hasEquippedLight('lamp');
    const hasVela = hasEquippedLight('vela') || hasEquippedLight('candle');

    if (hasFocaFacho) return 12.0;
    if (hasCoberta) return 8.0;
    if (hasTocha) return 6.0;
    if (hasLampada) return 4.5;
    if (activeRevelation === 'Consumo Radiante') {
      return 4.0;
    }
    if (hasVela) return 2.0;
    return 0;
  }, [character, activeRevelation]);

  const heroHasBlindFighting = useCallback((): boolean => {
    const activeFeatsList = getActiveFeats();
    return activeFeatsList.some(f => {
      const n = (f || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      return n.includes('luta as cegas') || n.includes('blind fighting');
    });
  }, [getActiveFeats]);

  const isEntityVisible = useCallback((ent: CombatEntity): boolean => {
    if (ent.type === 'hero') return true;
    const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
    const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (hero) {
      const distToHero = Math.max(Math.abs(ent.x - hero.x), Math.abs(ent.y - hero.y));
      if (heroHasBlindFighting() && distToHero <= 2) {
        return true;
      }
      if (!isDarkEnv) return true;

      if (torches.some(t => Math.max(Math.abs(ent.x - t.x), Math.abs(ent.y - t.y)) <= 4)) return true;

      if (distToHero <= getHeroLightRadiusInCells()) return true;
      if (hero.hasDarkvision) {
        const dvCells = (hero.darkvisionRange || 18) / 1.5;
        if (distToHero <= dvCells) return true;
      }
    } else {
      if (!isDarkEnv) return true;
      if (torches.some(t => Math.max(Math.abs(ent.x - t.x), Math.abs(ent.y - t.y)) <= 4)) return true;
    }
    return false;
  }, [biome, isNight, entities, torches, heroHasBlindFighting, getHeroLightRadiusInCells]);

  const isEntityVisibleByBlindFightingOnly = useCallback((ent: CombatEntity): boolean => {
    if (ent.type === 'hero') return false;
    const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
    const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));
    if (!isDarkEnv) return false;

    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero) return false;

    const distToHero = Math.max(Math.abs(ent.x - hero.x), Math.abs(ent.y - hero.y));
    if (!heroHasBlindFighting() || distToHero > 2) return false;

    if (torches.some(t => Math.max(Math.abs(ent.x - t.x), Math.abs(ent.y - t.y)) <= 4)) return false;
    if (distToHero <= getHeroLightRadiusInCells()) return false;
    if (hero.hasDarkvision) {
      const dvCells = (hero.darkvisionRange || 18) / 1.5;
      if (distToHero <= dvCells) return false;
    }
    return true;
  }, [biome, isNight, entities, heroHasBlindFighting, torches, getHeroLightRadiusInCells]);

  const shouldHideEntityDetails = useCallback((ent: CombatEntity): boolean => {
    if (ent.type !== 'monster') return false;
    return !isEntityVisible(ent) || isEntityVisibleByBlindFightingOnly(ent);
  }, [isEntityVisible, isEntityVisibleByBlindFightingOnly]);

  const getEntityCover = useCallback((targetEntity: CombatEntity): CoverResult => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero || targetEntity.type !== 'monster' || targetEntity.isDead) {
      return { degree: 'none', acBonus: 0, dexSaveBonus: 0, description: 'Sem Cobertura' };
    }
    return calculateCover(hero, targetEntity, grid, entities);
  }, [entities, grid]);

  const isMonsterDefeated = useCallback((ent: CombatEntity): boolean => {
    if (ent.type !== 'monster') return true;
    if (!character) return false;
    const bestiary = character.defeated_monsters || character.defeatedMonsters || {};
    const cleanName = ent.name.replace(/ #?\d+$/, '').trim().toLowerCase();
    return Object.keys(bestiary).some(k => k.toLowerCase().replace(/ #?\d+$/, '').trim() === cleanName);
  }, [character]);

  const shouldHideMonsterStats = useCallback((ent: CombatEntity): boolean => {
    if (ent.type !== 'monster') return false;
    if (shouldHideEntityDetails(ent)) return true;
    return !isMonsterDefeated(ent);
  }, [shouldHideEntityDetails, isMonsterDefeated]);

  return {
    getActiveFeats,
    getHeroLightRadiusInCells,
    heroHasBlindFighting,
    isEntityVisible,
    isEntityVisibleByBlindFightingOnly,
    shouldHideEntityDetails,
    getEntityCover,
    isMonsterDefeated,
    shouldHideMonsterStats,
  };
}
