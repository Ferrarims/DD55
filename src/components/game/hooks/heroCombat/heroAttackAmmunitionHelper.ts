import React from 'react';
import { CombatEntity, LootItem } from '../../../../game/types';
import { adjustDamageForDex, hasThrownProperty } from '../../../../game/combatUtils';

export interface ThrownOrAmmoResult {
  atkBonus: number;
  dmgDice: string;
  isThrownAttack: boolean;
  canProceed: boolean;
}

export function handleThrownOrAmmunition(
  atkToUse: any,
  hero: CombatEntity,
  targetEntity: CombatEntity,
  dist: number,
  character: any,
  consumeThrownWeapon: (name: string) => void,
  consumeAmmunition: (ammoReq: { type: string; count?: number }) => void,
  checkAmmunitionRequirement: (atk: any) => { type: string; count?: number } | null,
  getCharacterAmmoCount: (ammoReq: { type: string; count?: number }) => number,
  setDroppedLoot: React.Dispatch<React.SetStateAction<LootItem[]>>,
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void
): ThrownOrAmmoResult {
  const strMod = Math.floor(((character?.strength || 10) - 10) / 2);
  const dexMod = Math.floor(((character?.dexterity || 10) - 10) / 2);

  let atkBonus = atkToUse?.attack_bonus !== undefined ? Number(atkToUse.attack_bonus) : hero.attackBonus;
  let dmgDice = atkToUse?.damage || hero.damageDice;

  const hasThrown = hasThrownProperty(atkToUse);
  const isThrownAttack = hasThrown && dist > 1;

  if (isThrownAttack) {
    atkBonus = atkBonus - strMod + dexMod;
    dmgDice = adjustDamageForDex(dmgDice, strMod, dexMod);

    const thrownWeaponName = atkToUse?.name || 'Adaga';
    const weaponIcon = thrownWeaponName.toLowerCase().includes('machadinha') ? '🪓' :
                       thrownWeaponName.toLowerCase().includes('dardo') ? '🎯' : '🗡️';

    consumeThrownWeapon(thrownWeaponName);
    setDroppedLoot(prev => [...prev, {
      id: `thrown_${Date.now()}_${Math.random()}`,
      x: targetEntity.x,
      y: targetEntity.y,
      item: {
        id: `item_thrown_${Date.now()}`,
        name: thrownWeaponName,
        type: 'weapon',
        icon: weaponIcon,
        rarity: 'comum',
        value: 10,
        description: `Arma arremessada recuperável (${thrownWeaponName}). Pise no local para recuperá-la para o inventário.`
      },
      isCollected: false
    }]);
    addCombatLog(
      'Mestre do Jogo',
      '🪓 Arma Arremessada',
      `Você arremessou ${thrownWeaponName}! Ela caiu no chão em (${targetEntity.x}, ${targetEntity.y}) e poderá ser recuperada ao pisar no local.`,
      'loot'
    );
  } else {
    const ammoReq = checkAmmunitionRequirement(atkToUse);
    if (ammoReq) {
      const count = getCharacterAmmoCount(ammoReq);
      if (count <= 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Sem Munição!', `Você não possui ${ammoReq.type} para usar ${atkToUse?.name || 'sua arma'}!`, 'system');
        return { atkBonus, dmgDice, isThrownAttack, canProceed: false };
      }
      consumeAmmunition(ammoReq);

      if (Math.random() < 0.5) {
        setDroppedLoot(prev => [...prev, {
          id: `ammo_recovered_${Date.now()}_${Math.random()}`,
          x: targetEntity.x,
          y: targetEntity.y,
          item: {
            id: `item_ammo_${Date.now()}`,
            name: `1x ${ammoReq.type}`,
            type: 'weapon',
            icon: '🏹',
            rarity: 'comum',
            value: 1,
            description: `Munição recuperada após o disparo (${ammoReq.type}).`
          },
          isCollected: false
        }]);
        addCombatLog(
          'Mestre do Jogo',
          '🏹 Munição Recuperada',
          `Uma unidade de ${ammoReq.type} foi disparada e caiu no chão em (${targetEntity.x}, ${targetEntity.y}). Poderá ser coletada!`,
          'loot'
        );
      }
    }
  }

  return { atkBonus, dmgDice, isThrownAttack, canProceed: true };
}
