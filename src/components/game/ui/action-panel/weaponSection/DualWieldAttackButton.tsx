import React from 'react';
import { useGameContext } from '../../../context/GameContext';

export const DualWieldAttackButton: React.FC = () => {
  const {
    character,
    activeEntity,
    characterAttacks,
    selectedAttackIndex,
    handleTriggerHeroOffHandAttack,
    isTwoHandedWeaponLocal,
    isLightWeapon,
    weaponMasteryInfo
  } = useGameContext();

  if (!activeEntity || activeEntity.type !== 'hero') return null;

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

  const selectedAtk = characterAttacks[selectedAttackIndex] || characterAttacks[0];
  const w1Name = slots['empunhadura_1'] || 
                 selectedAtk?.name || 
                 character?.equipped_weapon || 
                 character?.equippedWeapon || 
                 'Arma Principal';

  const isW1TwoHanded = isTwoHandedWeaponLocal(w1Name, selectedAtk?.properties);
  const isW1Light = isLightWeapon(w1Name, selectedAtk?.properties);
  const hasMadeMainAttack = Boolean(activeEntity.hasAttackedThisTurn);

  const attackedWeapons = activeEntity.attackedWeaponNamesThisTurn || [];
  const allAttacksWereLight = attackedWeapons.length > 0 && attackedWeapons.every((name: string) => isLightWeapon(name));

  const selectedAtkName = selectedAtk?.name || '';
  const isW2Light = isLightWeapon(selectedAtkName, selectedAtk?.properties);
  const isW2Different = !attackedWeapons.includes(selectedAtkName);

  const showOffHand = !isW1TwoHanded && isW1Light && hasMadeMainAttack && allAttacksWereLight && isW2Light && isW2Different;

  if (!showOffHand) return null;

  const rawW2 = slots['empunhadura_2'] || character?.equipped_shield || '';
  const hasShieldEquipped = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));
  const w2Name = selectedAtk?.name || '';

  const usedPrimaryAtk = characterAttacks.find(a => attackedWeapons.includes(a.name));
  const isNickWeapon = selectedAtk?.mastery?.toLowerCase().includes('nick') || 
                       selectedAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                       usedPrimaryAtk?.mastery?.toLowerCase().includes('nick') ||
                       usedPrimaryAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                       (weaponMasteryInfo && weaponMasteryInfo.name.toLowerCase().includes('nick'));
  
  const canUseNick = Boolean(isNickWeapon && !activeEntity.usedNickThisTurn);
  const isOffHandEnabled = Boolean(activeEntity.hasBonusAction || canUseNick);

  return (
    <button
      onClick={() => handleTriggerHeroOffHandAttack()}
      disabled={!isOffHandEnabled}
      className={`w-full py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 shadow transition mt-1.5 ${
        !isOffHandEnabled
          ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
          : (canUseNick ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 border-emerald-300 shadow-md animate-pulse' : 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:to-orange-400 text-slate-950 border-amber-300 shadow-md animate-pulse')
      }`}
      title={
        !isOffHandEnabled
          ? 'Sua Ação Bônus já foi utilizada e a Maestria Nick não se aplica ou já foi gasta.'
          : (canUseNick ? `Atacar com ${w2Name} (Maestria Nick - Ação Livre)${hasShieldEquipped ? ' 🛡️(Inativo)' : ''}!` : `Atacar com ${w2Name} usando a Ação Bônus${hasShieldEquipped ? ' (Escudo ficará inativo e perderá o bônus de CA neste turno)' : ''}!`)
      }
    >
      <span className="truncate flex items-center gap-1.5 min-w-0">
        <span>{canUseNick ? '✨' : '⚔️'}</span>
        <span className="truncate font-extrabold">
          {`Atacar com 2ª Arma (${w2Name})${hasShieldEquipped ? ' 🛡️(Inativo)' : ''}`}
        </span>
      </span>
      <span className={`text-[10px] font-mono shrink-0 bg-slate-950/50 ${canUseNick ? 'text-emerald-300' : 'text-slate-100'} px-2 py-0.5 rounded flex items-center gap-1 border border-slate-800/40`}>
        <span className={`text-[9px] ${canUseNick ? 'text-emerald-300' : 'text-amber-300'} font-extrabold mr-1`}>{canUseNick ? 'NICK' : 'BÔNUS'}</span>
        <span className={`font-extrabold ${canUseNick ? 'text-emerald-300' : 'text-amber-300'}`}>⚔️x2</span>
      </span>
    </button>
  );
};
