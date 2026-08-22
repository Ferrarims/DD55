import React from 'react';
import { useGameContext } from '../../../context/GameContext';

export const QuickWeaponSwitcher: React.FC = () => {
  const {
    character,
    characterAttacks,
    selectedAttackIndex,
    currentSelectedAttack,
    handleSelectWeapon,
    versatileTwoHandedWeapons,
    isTwoHandedWeaponLocal,
    isVersatileWeapon,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    heroACDetails,
    isFullscreenMap
  } = useGameContext();

  if (!characterAttacks || characterAttacks.length <= 1) return null;

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
  const rawW2 = slots['empunhadura_2'] || character?.equipped_shield || '';
  const hasShieldEquipped = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));

  return (
    <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-y-1">
      <div className="text-[10px] font-bold text-amber-400 flex justify-between items-center px-0.5">
        <span>🗡️ Trocar Arma <span className="text-slate-300 font-normal">({currentSelectedAttack?.name || 'Arma'})</span>:</span>
        <span className="text-[9px] text-slate-400 font-normal">
          CA: <strong className="text-amber-300 font-bold">{heroACDetails.ac}</strong>
          {heroACDetails.twoHandedWeaponBlockedShield && <span className="text-rose-400 ml-1">(Escudo Off)</span>}
          {heroACDetails.shieldPenalty && <span className="text-amber-400 ml-1">(Escudo Inativo)</span>}
        </span>
      </div>
      <div className={`grid ${isFullscreenMap ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
        {characterAttacks.map((atk: any, idx: number) => {
          const isSelected = selectedAttackIndex === idx;
          const curAmmoReq = checkAmmunitionRequirement(atk);
          const curAmmoCount = curAmmoReq ? getCharacterAmmoCount(curAmmoReq) : null;
          const atkBonusVal = atk.attack_bonus !== undefined ? atk.attack_bonus : (atk.bonus !== undefined ? atk.bonus : 0);
          const formattedBonus = atkBonusVal >= 0 ? `+${atkBonusVal}` : `${atkBonusVal}`;

          const isWeaponTwoHanded = isTwoHandedWeaponLocal(atk.name, atk.properties) || (isVersatileWeapon(atk.name, atk.properties) && Boolean(versatileTwoHandedWeapons[atk.name]));
          const isShieldBlocked = hasShieldEquipped && isWeaponTwoHanded;

          return (
            <button
              key={idx}
              onClick={() => handleSelectWeapon(idx)}
              className={`px-1.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-between border truncate ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={`Equipar ${atk.name} (Acerto: ${formattedBonus}, Dano: ${atk.damage})${isShieldBlocked ? ' - 🛡️ Escudo ficará inativo' : ''}${curAmmoReq ? ` - Munição: ${curAmmoCount} restante` : ''}`}
            >
              <span className="truncate flex items-center gap-1 min-w-0">
                <span className="truncate">{isSelected ? '⚔️ ' : ''}{atk.name}</span>
                {isShieldBlocked && (
                  <span className="px-1 rounded text-[8px] font-mono shrink-0 bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Escudo inativo ao usar 2ª arma">
                    🛡️ Inativo
                  </span>
                )}
                {curAmmoReq && (
                  <span className={`px-1 rounded text-[8px] font-mono shrink-0 ${
                    curAmmoCount !== null && curAmmoCount > 0 
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/35 font-extrabold animate-pulse'
                  }`}>
                    {curAmmoCount !== null ? `${curAmmoCount}🏹` : '0🏹'}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-mono shrink-0 ml-1 flex items-center gap-0.5">
                <span className="text-amber-400 font-extrabold">{formattedBonus}</span>
                <span className="opacity-40">|</span>
                <span className="opacity-80">{atk.damage}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
