import { useState, useMemo, useEffect } from 'react';
import { CombatEntity, CombatLog } from '../../../../game/types';
import { isLightWeapon } from '../../../../game/combatEngine';
import { useUsableInventoryItems } from './heroCombat/useUsableInventoryItems';
import { useCharacterAttacks } from './heroCombat/useCharacterAttacks';
import { useHeroArmorClass } from './heroCombat/useHeroArmorClass';
import { useCombatSummary } from './heroCombat/useCombatSummary';

export interface UseHeroCombatStatsAndWeaponsProps {
  character: any;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  activeEntityIndex: number;
  versatileTwoHandedWeapons: Record<string, boolean>;
  getActiveFeats: () => string[];
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
  addCombatLog: (actorName: string, title: string, detail: string, type?: CombatLog['type'] | 'spell') => void;
  isVersatileWeapon: (atkName: string, properties?: string) => boolean;
  getVersatileDamage: (atkName: string, properties?: string) => string;
}

export function useHeroCombatStatsAndWeapons({
  character,
  entities,
  setEntities,
  activeEntityIndex,
  versatileTwoHandedWeapons,
  getActiveFeats,
  shouldHideEntityDetails,
  addCombatLog,
  isVersatileWeapon,
  getVersatileDamage
}: UseHeroCombatStatsAndWeaponsProps) {
  const [selectedAttackIndex, setSelectedAttackIndex] = useState<number>(0);
  const [hasChangedWeaponThisTurn, setHasChangedWeaponThisTurn] = useState<boolean>(false);

  // Usable inventory items & rations
  const { usableInventoryItems, totalRationsCount } = useUsableInventoryItems(character?.equipment);

  // Attacks & weapon mastery
  const { characterAttacks, getWeaponMastery } = useCharacterAttacks({
    character,
    versatileTwoHandedWeapons,
    getActiveFeats,
    isVersatileWeapon,
    getVersatileDamage
  });

  const currentSelectedAttack = characterAttacks[selectedAttackIndex] || characterAttacks[0] || null;

  // Armor Class details
  const { heroACDetails } = useHeroArmorClass({
    character,
    currentSelectedAttack,
    entities,
    getActiveFeats,
    versatileTwoHandedWeapons
  });

  // Combat summary
  const { combatSummary } = useCombatSummary({
    entities,
    character,
    shouldHideEntityDetails
  });

  // Reset weapon change state on new turn
  useEffect(() => {
    if (entities[activeEntityIndex]?.type === 'hero') {
      setHasChangedWeaponThisTurn(false);
    }
  }, [activeEntityIndex, entities]);

  const handleSelectWeapon = (idx: number) => {
    const currentWeapon = characterAttacks[selectedAttackIndex] || characterAttacks[0];
    const targetWeapon = characterAttacks[idx];

    const isCurrentLight = currentWeapon ? isLightWeapon(currentWeapon.name, currentWeapon.properties) : false;
    const isTargetLight = targetWeapon ? isLightWeapon(targetWeapon.name, targetWeapon.properties) : false;

    const isDualWieldingSwitch = isCurrentLight && isTargetLight;

    if (hasChangedWeaponThisTurn && !isDualWieldingSwitch) {
      addCombatLog('Sistema', 'Ação Inválida', 'Você já interagiu com seu inventário de armas neste turno. Só é permitido trocar de arma uma vez por turno.', 'system');
      return;
    }
    setSelectedAttackIndex(idx);
    if (!isDualWieldingSwitch) {
      setHasChangedWeaponThisTurn(true);
    }
    const heroEntity = entities.find(e => e.type === 'hero');
    if (heroEntity) {
      addCombatLog(heroEntity.name, 'Trocou de Arma', `Equipou ${characterAttacks[idx]?.name || 'Arma'}.`, 'system');
    }
  };

  // Sincronizar o estado da entidade do herói no combate quando a arma, CA ou talentos mudarem
  useEffect(() => {
    if (!entities || entities.length === 0) return;
    const activeFeatsList = getActiveFeats();
    const heroStats = {
      str: character?.strength ?? character?.str ?? 10,
      dex: character?.dexterity ?? character?.dex ?? 10,
      con: character?.constitution ?? character?.con ?? 10,
      int: character?.intelligence ?? character?.int ?? 10,
      wis: character?.wisdom ?? character?.wis ?? 10,
      cha: character?.charisma ?? character?.cha ?? 10
    };
    setEntities(prev => {
      let changed = false;
      const next = prev.map(e => {
        if (e.type === 'hero') {
          const newAc = heroACDetails.ac;
          const newDamage = currentSelectedAttack?.damage || e.damageDice;
          const newBonus = currentSelectedAttack?.attack_bonus !== undefined ? Number(currentSelectedAttack.attack_bonus) : e.attackBonus;
          const featsMismatch = !e.feats || e.feats.length !== activeFeatsList.length || !activeFeatsList.every(f => e.feats?.includes(f));
          const statsMismatch = !e.stats || e.stats.dex !== heroStats.dex || e.stats.str !== heroStats.str;

          if (e.armor_class !== newAc || e.ac !== newAc || e.damageDice !== newDamage || e.attackBonus !== newBonus || featsMismatch || statsMismatch) {
            changed = true;
            return {
              ...e,
              armor_class: newAc,
              ac: newAc,
              damageDice: newDamage,
              attackBonus: newBonus,
              stats: heroStats,
              feats: activeFeatsList,
              fightingStyle: character?.fighting_style || character?.fightingStyle || e.fightingStyle
            };
          }
        }
        return e;
      });
      return changed ? next : prev;
    });
  }, [heroACDetails.ac, currentSelectedAttack?.name, currentSelectedAttack?.damage, currentSelectedAttack?.attack_bonus, character, getActiveFeats, setEntities]);

  // Informações da Maestria em Arma
  const weaponMasteryInfo = useMemo(() => {
    return getWeaponMastery(currentSelectedAttack);
  }, [currentSelectedAttack, getWeaponMastery]);

  return {
    usableInventoryItems,
    totalRationsCount,
    characterAttacks,
    selectedAttackIndex,
    setSelectedAttackIndex,
    hasChangedWeaponThisTurn,
    setHasChangedWeaponThisTurn,
    currentSelectedAttack,
    heroACDetails,
    combatSummary,
    handleSelectWeapon,
    weaponMasteryInfo
  };
}
