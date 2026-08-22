import React from 'react';
import { CombatEntity } from '../../../../game/types';
import { isLightWeapon } from '../../../../game/combatEngine';

export interface OffHandCheckResult {
  canProceed: boolean;
  offHandWeaponName: string;
  hasShieldEquipped: boolean;
  rawW2: string;
}

export function validateOffHandAttack(
  hero: CombatEntity,
  character: any,
  selectedAtkName: string,
  selectedAtk: any,
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>,
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void
): OffHandCheckResult {
  const attackedWeapons = hero.attackedWeaponNamesThisTurn || [];
  const allAttacksWereLight = attackedWeapons.length > 0 && attackedWeapons.every((name: string) => isLightWeapon(name));

  if (!allAttacksWereLight) {
    addCombatLog(
      'Mestre do Jogo',
      '⚠️ Ataque com Mão Inapta Bloqueado',
      'Você só pode realizar o ataque com a segunda arma se todos os seus ataques anteriores neste turno tiverem sido feitos com armas leves!',
      'system'
    );
    return { canProceed: false, offHandWeaponName: '', hasShieldEquipped: false, rawW2: '' };
  }

  if (!isLightWeapon(selectedAtkName) || attackedWeapons.includes(selectedAtkName)) {
    addCombatLog(
      'Mestre do Jogo',
      '⚠️ Seleção de Arma Inválida',
      'Você precisa selecionar uma arma leve diferente da que usou para seus ataques principais para realizar o ataque com a segunda arma!',
      'system'
    );
    return { canProceed: false, offHandWeaponName: '', hasShieldEquipped: false, rawW2: '' };
  }

  let slots: Record<string, string | null> = {};
  if (character?.equipment_slots) {
    if (typeof character.equipment_slots === 'string') {
      try { slots = JSON.parse(character.equipment_slots); } catch {}
    } else {
      slots = character.equipment_slots;
    }
  } else if (character?.equipmentSlots) {
    slots = character.equipmentSlots;
  }

  const offHandWeaponName = selectedAtkName || slots['empunhadura_2'] || '';
  const w1Name = attackedWeapons[0] || slots['empunhadura_1'] || selectedAtk?.name || character?.equipped_weapon || character?.equippedWeapon || 'Arma Principal';
  const rawW2 = slots['empunhadura_2'] || character?.equipped_shield || '';
  const hasShieldEquipped = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));

  if (!offHandWeaponName || offHandWeaponName.toLowerCase().trim() === w1Name.toLowerCase().trim()) {
    setFloatingTexts(prev => [...prev, {
      id: Math.random().toString(),
      x: hero.x,
      y: hero.y,
      text: !offHandWeaponName ? '⚠️ Escolha arma na troca!' : '⚠️ Arma igual à principal!',
      color: '#f87171',
      progress: 0
    }]);
    return { canProceed: false, offHandWeaponName, hasShieldEquipped, rawW2 };
  }

  return { canProceed: true, offHandWeaponName, hasShieldEquipped, rawW2 };
}
