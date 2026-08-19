import { useMemo, useCallback } from 'react';
import { CombatEntity, CellData } from '../../../game/types';
import { calculateCover, CoverResult } from '../../../game/coverMechanics';
import { parseEquipmentToList } from '../../../lib/mechanics/xpAndLootManager';
import { DRACONIC_ANCESTRIES, BACKGROUNDS_REFERENCE, FEATS_REFERENCE, CLASS_REFERENCE } from '../../../lib/api/references';
import { removeItemFromInventory, updateItemQuantity } from '../../../lib/api/characterService';

export interface UseHeroCapabilitiesProps {
  character: any;
  entities: CombatEntity[];
  grid: CellData[][];
  torches: { x: number; y: number }[];
  biome: string;
  isNight: boolean;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  onCharacterUpdated?: () => Promise<void> | void;
}

export function useHeroCapabilities({
  character,
  entities,
  grid,
  torches,
  biome,
  isNight,
  activeRevelation,
  onCharacterUpdated,
}: UseHeroCapabilitiesProps) {
  // Obter todos os talentos ativos do herói (combina background/origem, estilo de luta e talentos de nível)
  const getActiveFeats = useCallback((): string[] => {
    if (!character) return [];
    const rawList: string[] = [];

    // 1. Talento de Origem/Background
    const originStr = character.originFeat || character.origin_feat;
    if (originStr && typeof originStr === 'string') {
      originStr.split(',').forEach((f: string) => {
        const trimmed = f.trim();
        if (trimmed && !rawList.includes(trimmed)) rawList.push(trimmed);
      });
    }

    // 1b. Fallback pelo nome do Antecedente/Background
    const bgName = character.background || character.antecedente || character.backgrounds?.name;
    if (bgName && BACKGROUNDS_REFERENCE[bgName]?.feat) {
      const bgFeat = BACKGROUNDS_REFERENCE[bgName].feat;
      if (bgFeat && !rawList.includes(bgFeat)) rawList.push(bgFeat);
    }

    // 2. Talentos de Nível
    if (Array.isArray(character.feats)) {
      character.feats.forEach((f: string) => {
        if (f && typeof f === 'string' && !rawList.includes(f)) rawList.push(f);
      });
    }

    // 3. Escolhas de Nível (Apenas se começar explicitamente com 'Talento:')
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

    // 4. Características de classe adicionais
    if (character.character_features && Array.isArray(character.character_features) && character.character_features[0]) {
      const cf = character.character_features[0];
      if (Array.isArray(cf.feats)) {
        cf.feats.forEach((f: string) => {
          if (f && typeof f === 'string' && !rawList.includes(f)) rawList.push(f);
        });
      }
    }

    // Normalização para "Alerta"
    if (rawList.some(f => f && (f.trim().toLowerCase() === 'alert' || f.trim().toLowerCase() === 'alerta')) && !rawList.includes('Alerta')) {
      rawList.push('Alerta');
    }

    // 5. Determinar ÚNICO Estilo de Luta Ativo Mais Recente
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

    // Filtrar rawList removendo estilos de luta antigos
    const filteredList = rawList.filter(f => {
      if (isFightingStyleName(f)) {
        return activeFightingStyle && f.trim().toLowerCase() === activeFightingStyle.trim().toLowerCase();
      }
      return true;
    });

    // Garantir que o estilo de luta ativo está presente
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

    // Apenas itens EQUIPADOS nos slots de equipamento (ou no inventário com equip_slot preenchido) geram luz!
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

  // --- BAFORADA / ARMA DE SOPRO (DRACONATO) ---
  const isDragonborn = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('draconato') || race.includes('dragonborn') || Boolean(character.draconic_ancestry);
  }, [character]);

  const breathWeaponMaxUses = useMemo(() => {
    if (!isDragonborn) return 0;
    const level = Number(character?.level) || 1;
    return character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [isDragonborn, character]);

  const draconicFlightMaxUses = isDragonborn && (Number(character?.level) || 1) >= 5 ? 1 : 0;

  // --- FORMA GRANDE (GOLIAS) ---
  const isGoliath = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const gAncestry = (character.giant_ancestry || character.giantAncestry || '').toLowerCase();
    return race.includes('golias') || race.includes('goliath') ||
           traitsStr.includes('pedra') || traitsStr.includes('stone') ||
           gAncestry !== '';
  }, [character]);

  const largeFormMaxUses = isGoliath && (Number(character?.level) || 1) >= 5 ? 1 : 0;

  const breathWeaponDetails = useMemo(() => {
    if (!isDragonborn) return null;
    const level = Number(character?.level) || 1;
    const conMod = Math.floor(((character?.constitution || 10) - 10) / 2);
    const pb = character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
    const dc = 8 + conMod + pb;

    let diceCount = 1;
    if (level >= 17) diceCount = 4;
    else if (level >= 11) diceCount = 3;
    else if (level >= 5) diceCount = 2;

    const draconicAncestryStr = (character?.draconic_ancestry || character?.draconicAncestry || '').toLowerCase();
    const ancestry = DRACONIC_ANCESTRIES.find(a => 
      a.name.toLowerCase() === draconicAncestryStr ||
      draconicAncestryStr.includes(a.name.toLowerCase()) ||
      a.name.toLowerCase().includes(draconicAncestryStr)
    );
    const damageType = ancestry?.damageType || 'Fogo';

    return {
      dc,
      conMod,
      pb,
      diceCount,
      diceSides: 10,
      damageDice: `${diceCount}d10`,
      damageType,
      maxUses: pb
    };
  }, [isDragonborn, character]);

  // Pontos de Sorte (Talento Sortudo / Lucky - D&D 5.5e)
  const luckyMaxPoints = useMemo(() => {
    if (!character) return 2;
    const level = Number(character.level) || 1;
    return character.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [character]);

  const hasLuckyFeat = useMemo(() => {
    const activeFeats = getActiveFeats();
    return activeFeats.some(f => f.toLowerCase().includes('sortudo') || f.toLowerCase().includes('lucky'));
  }, [character]);

  const goliathAncestryMaxUses = useMemo(() => {
    if (!character) return 2;
    const level = Number(character.level) || 1;
    return character.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [character]);

  const isHalfling = useMemo(() => {
    if (!character) return false;
    const race = (character.race || character.charRace || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('pequenino') || race.includes('halfling') || traitsStr.includes('pequenino') || traitsStr.includes('halfling');
  }, [character]);

  const isHuman = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('humano') || race.includes('human');
  }, [character]);

  const isOrc = useMemo(() => {
    if (!character) return false;
    const race = (character.race || character.charRace || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('orc') || traitsStr.includes('orc');
  }, [character]);

  const adrenalineRushMaxUses = useMemo(() => {
    if (!isOrc) return 0;
    const level = Number(character?.level) || 1;
    return character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [isOrc, character]);

  const relentlessEnduranceMaxUses = isOrc ? 1 : 0;

  const isAasimar = character?.race === 'Aasimar' || character?.race === 'Aasimar (Guia do Mestre)';
  const healingHandsMaxUses = isAasimar ? 1 : 0;
  const celestialRevelationMaxUses = isAasimar && (character?.level || 1) >= 3 ? 1 : 0;

  const secondWindMaxUses = useMemo(() => {
    if (!character) return 2;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (className.includes('guerreiro') || className.includes('fighter')) {
      const level = Number(character.level) || 1;
      const classData = (CLASS_REFERENCE as any)['Fighter'];
      const progression = classData?.progression?.find((p: any) => p.level === level);
      return progression?.secondWind || 2;
    }
    if (Array.isArray(character.class_resources)) {
      const sw = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('fôlego') || name.includes('folego') || name.includes('second wind');
      });
      if (sw && typeof sw === 'object') {
        const val = Number(sw.max_uses || sw.uses || sw.max);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (character.second_wind_max) return Number(character.second_wind_max);
    if (character.second_wind_uses) return Number(character.second_wind_uses);

    const level = Number(character.level) || 1;
    return level >= 6 ? 2 : 1;
  }, [character]);

  const actionSurgeMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (Array.isArray(character.class_resources)) {
      const res = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('surto') || name.includes('action surge');
      });
      if (res && typeof res === 'object') {
        const val = Number(res.max || res.uses || res.max_uses);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (className.includes('guerreiro') || className.includes('fighter')) {
      return level >= 17 ? 2 : level >= 2 ? 1 : 0;
    }
    return 0;
  }, [character]);

  const rageMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (Array.isArray(character.class_resources)) {
      const res = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('fúria') || name.includes('furia') || name.includes('rage');
      });
      if (res && typeof res === 'object') {
        const val = Number(res.max || res.uses || res.max_uses);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (className.includes('bárbaro') || className.includes('barbarian')) {
      return level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2;
    }
    return 0;
  }, [character]);

  const channelDivinityMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (Array.isArray(character.class_resources)) {
      const res = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('canalizar') || name.includes('channel divinity');
      });
      if (res && typeof res === 'object') {
        const val = Number(res.max || res.uses || res.max_uses);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (className.includes('clérigo') || className.includes('cleric')) {
      return level >= 18 ? 4 : level >= 6 ? 3 : level >= 2 ? 2 : 0;
    }
    if (className.includes('paladino') || className.includes('paladin')) {
      return level >= 11 ? 3 : level >= 3 ? 2 : 0;
    }
    return 0;
  }, [character]);

  const spellSlotsMax = useMemo(() => {
    if (!character) return 2;
    if (character.spell_slots) {
      const val = Number(character.spell_slots);
      if (!isNaN(val) && val > 0) return val;
    }
    const level = Number(character.level) || 1;
    return Math.max(2, Math.min(6, level + 1));
  }, [character]);

  const indomitableMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (className.includes('guerreiro') || className.includes('fighter')) {
      return level >= 17 ? 3 : level >= 13 ? 2 : level >= 9 ? 1 : 0;
    }
    return 0;
  }, [character]);

  const superiorityDiceMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const subclass = (character.subclass || character.subclass_name || '').toLowerCase();
    if (subclass.includes('battle') || subclass.includes('mestre da batalha') || subclass.includes('battlemaster')) {
      return level >= 15 ? 6 : level >= 7 ? 5 : 4;
    }
    return 0;
  }, [character]);

  const bardicInspirationMaxUses = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('bardo') || className.includes('bard')) {
      return Math.max(1, Math.floor(((character.charisma || 10) - 10) / 2));
    }
    return 0;
  }, [character]);

  const layOnHandsMaxPool = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('paladino') || className.includes('paladin')) {
      return (Number(character.level) || 1) * 5;
    }
    return 0;
  }, [character]);

  const focusPointsMaxUses = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('monge') || className.includes('monk')) {
      const level = Number(character.level) || 1;
      return level >= 2 ? level : 0;
    }
    return 0;
  }, [character]);

  const wildShapeMaxUses = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('druida') || className.includes('druid')) {
      const level = Number(character.level) || 1;
      return level >= 17 ? 4 : level >= 6 ? 3 : level >= 2 ? 2 : 0;
    }
    return 0;
  }, [character]);

  const hasMagicCapability = useMemo(() => {
    if (!character) return false;
    let spellsList: any[] = [];
    if (Array.isArray(character.spells)) {
      spellsList = character.spells;
    } else if (typeof character.spells === 'string') {
      try { spellsList = JSON.parse(character.spells); } catch {}
    }
    if (spellsList && spellsList.length > 0) return true;

    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    const casterClasses = [
      'mago', 'wizard', 'bruxo', 'warlock', 'feiticeiro', 'sorcerer',
      'clérigo', 'cleric', 'druida', 'druid', 'bardo', 'bard',
      'paladino', 'paladin', 'patrulheiro', 'ranger'
    ];
    return casterClasses.some(c => className.includes(c));
  }, [character]);

  const hasSecondWindCapability = useMemo(() => {
    if (!character) return true;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    const martialClasses = [
      'guerreiro', 'fighter', 'paladino', 'paladin', 'bárbaro', 'barbarian',
      'monge', 'monk', 'patrulheiro', 'ranger', 'ladino', 'rogue'
    ];
    return martialClasses.some(c => className.includes(c)) || (character.class_resources && character.class_resources.length > 0);
  }, [character]);

  // Verificar se o ataque precisa de munição e qual tipo
  const checkAmmunitionRequirement = (atkToUse: any) => {
    if (!atkToUse) return null;
    const name = (atkToUse.name || '').toLowerCase();
    const properties = (atkToUse.properties || '').toLowerCase();

    const requiresAmmo = properties.includes('munição') || properties.includes('municao') || properties.includes('muni') ||
                         name.includes('arco') || name.includes('besta') || name.includes('funda') ||
                         name.includes('pistola') || name.includes('mosquete') || name.includes('blowgun') || name.includes('zarabatana') ||
                         name.includes('bow') || name.includes('crossbow') || name.includes('sling');

    if (!requiresAmmo) return null;

    if (name.includes('arco') || name.includes('bow')) {
      return { type: 'Flecha', pattern: /flecha|arrow/i };
    }
    if (name.includes('besta') || name.includes('crossbow')) {
      return { type: 'Virote de Besta', pattern: /virote|bolt/i };
    }
    if (name.includes('funda') || name.includes('sling')) {
      return { type: 'Munição de Funda', pattern: /bala|bullet|pedra|sling/i };
    }
    if (name.includes('pistola') || name.includes('mosquete') || name.includes('pistol') || name.includes('musket')) {
      return { type: 'Bala de Arma de Fogo', pattern: /bala|bullet/i };
    }
    if (name.includes('zarabatana') || name.includes('blowgun')) {
      return { type: 'Agulha', pattern: /agulha|needle|dardo/i };
    }

    return { type: 'Munição', pattern: /muni|flecha|virote|bala/i };
  };

  const getCharacterAmmoCount = (req: { type: string; pattern: RegExp }) => {
    if (!character || !character.character_inventory) return 0;
    const ammoItem = character.character_inventory.find((inv: any) => {
      const name = String(inv.items?.name || inv.name || inv.item_name || '').toLowerCase();
      return req.pattern.test(name);
    });
    if (!ammoItem) return 0;
    let qty = ammoItem.quantity || 1;
    if (qty === 1) {
      const itemName = String(ammoItem.items?.name || ammoItem.name || ammoItem.item_name || '');
      const match = itemName.match(/\((\d+)\)/);
      qty = match ? parseInt(match[1], 10) : (/bala de arma de fogo/i.test(itemName) ? 10 : 20);
    }
    return qty;
  };

  const consumeAmmunition = async (req: { type: string; pattern: RegExp }) => {
    if (!character || !character.character_inventory) return;
    const idx = character.character_inventory.findIndex((inv: any) => {
      const name = String(inv.items?.name || inv.name || inv.item_name || '').toLowerCase();
      return req.pattern.test(name);
    });
    if (idx === -1) return;

    const ammoItem = character.character_inventory[idx];
    let currentQty = ammoItem.quantity || 1;
    if (currentQty === 1) {
      const itemName = String(ammoItem.items?.name || ammoItem.name || ammoItem.item_name || '');
      const match = itemName.match(/\((\d+)\)/);
      currentQty = match ? parseInt(match[1], 10) : (/bala de arma de fogo/i.test(itemName) ? 10 : 20);
    }
    const newQty = currentQty - 1;

    try {
      if (newQty <= 0) {
        character.character_inventory.splice(idx, 1);
        if (character.id) await removeItemFromInventory(ammoItem.id);
      } else {
        ammoItem.quantity = newQty;
        if (character.id) await updateItemQuantity(ammoItem.id, newQty);
      }
      if (onCharacterUpdated) await onCharacterUpdated();
    } catch (e) {
      console.error('Erro ao consumir munição:', e);
    }
  };

  const consumeThrownWeapon = async (weaponName: string) => {
    if (!character || !character.character_inventory) return;
    const idx = character.character_inventory.findIndex((inv: any) => {
      const name = String(inv.items?.name || inv.name || inv.item_name || '').toLowerCase();
      return name.includes(weaponName.toLowerCase()) || weaponName.toLowerCase().includes(name);
    });
    if (idx === -1) return;

    const thrownItem = character.character_inventory[idx];
    const newQty = (thrownItem.quantity || 1) - 1;

    try {
      if (newQty <= 0) {
        character.character_inventory.splice(idx, 1);
        if (character.id) await removeItemFromInventory(thrownItem.id);
      } else {
        thrownItem.quantity = newQty;
        if (character.id) await updateItemQuantity(thrownItem.id, newQty);
      }
      if (onCharacterUpdated) await onCharacterUpdated();
    } catch (e) {
      console.error('Erro ao consumir arma de arremesso:', e);
    }
  };

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
    isDragonborn,
    breathWeaponMaxUses,
    draconicFlightMaxUses,
    isGoliath,
    largeFormMaxUses,
    breathWeaponDetails,
    luckyMaxPoints,
    hasLuckyFeat,
    goliathAncestryMaxUses,
    isHalfling,
    isHuman,
    isOrc,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    isAasimar,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
    secondWindMaxUses,
    actionSurgeMaxUses,
    rageMaxUses,
    channelDivinityMaxUses,
    spellSlotsMax,
    indomitableMaxUses,
    superiorityDiceMaxUses,
    bardicInspirationMaxUses,
    layOnHandsMaxPool,
    focusPointsMaxUses,
    wildShapeMaxUses,
    hasMagicCapability,
    hasSecondWindCapability,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    consumeAmmunition,
    consumeThrownWeapon,
  };
}
