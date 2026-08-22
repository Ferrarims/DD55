import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { WeaponAttackModifiers } from './weaponSection/WeaponAttackModifiers';
import { DualWieldAttackButton } from './weaponSection/DualWieldAttackButton';
import { QuickWeaponSwitcher } from './weaponSection/QuickWeaponSwitcher';

export const HeroWeaponAttackSection: React.FC = () => {
  const {
    activeEntity,
    isBattleOver,
    currentSelectedAttack,
    handleHeroAttack,
    gwmActive,
    isTwoHandedWeaponLocal,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    getActiveFeats,
  } = useGameContext();

  if (!activeEntity || activeEntity.type !== 'hero') return null;

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  const activeFeatsList = getActiveFeats();
  const hasGWMFeat = activeFeatsList.includes('Mestre em Armas Grandes') || activeFeatsList.includes('Great Weapon Master');

  const isCurrentWeaponTwoHanded = currentSelectedAttack?.properties?.toLowerCase().includes('duas mãos') || 
                                   currentSelectedAttack?.properties?.toLowerCase().includes('two-handed') || 
                                   (currentSelectedAttack?.name && isTwoHandedWeaponLocal(currentSelectedAttack.name, currentSelectedAttack.properties));
  const isCurrentAttackMelee = !(currentSelectedAttack?.properties?.toLowerCase().includes('munição') || currentSelectedAttack?.properties?.toLowerCase().includes('municao') || String(currentSelectedAttack?.range || '').toLowerCase().includes('/') || String(currentSelectedAttack?.name || '').toLowerCase().includes('arco') || String(currentSelectedAttack?.name || '').toLowerCase().includes('besta') || String(currentSelectedAttack?.name || '').toLowerCase().includes('funda'));

  const isGwmApplied = gwmActive && hasGWMFeat && isCurrentWeaponTwoHanded && isCurrentAttackMelee;

  const ammoReq = checkAmmunitionRequirement(currentSelectedAttack);
  const ammoCount = ammoReq ? getCharacterAmmoCount(ammoReq) : null;
  const isOutOfAmmo = ammoCount !== null && ammoCount <= 0;

  const baseAtkBonus = currentSelectedAttack?.attack_bonus !== undefined 
    ? currentSelectedAttack.attack_bonus 
    : (currentSelectedAttack?.bonus !== undefined 
        ? currentSelectedAttack.bonus 
        : activeEntity.attackBonus);
  const effectiveAtkBonus = baseAtkBonus - (isGwmApplied ? 5 : 0);
  const formattedAtkBonus = effectiveAtkBonus >= 0 ? `+${effectiveAtkBonus}` : `${effectiveAtkBonus}`;

  return (
    <>
      <WeaponAttackModifiers />

      {/* 1. Atacar com Arma Principal */}
      <button
        onClick={() => handleHeroAttack()}
        disabled={!isHeroTurn || (!activeEntity.hasAction && (activeEntity.attacksRemaining || 0) <= 0) || isOutOfAmmo}
        className={`w-full py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 shadow transition ${
          !isHeroTurn || (!activeEntity.hasAction && (activeEntity.attacksRemaining || 0) <= 0)
            ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            : isOutOfAmmo
              ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 opacity-85 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300'
        }`}
        title={isOutOfAmmo ? `Sem munição (${ammoReq?.type})` : `Atacar com ${currentSelectedAttack?.name || 'arma'} (Acerto: ${formattedAtkBonus})`}
      >
        <span className="truncate flex items-center gap-1.5 min-w-0">
          <span>⚔️</span>
          <span className="truncate">
            { (activeEntity.attacksRemaining || 0) > 0 ? `Ataque Extra (${currentSelectedAttack?.name || 'Arma'})` : `Atacar (${currentSelectedAttack?.name || 'Arma'})` }
            {isGwmApplied && <span className="text-rose-950 ml-1 font-extrabold bg-amber-300 px-1 py-0.5 rounded text-[9px]">-5 GWM</span>}
          </span>
          {ammoReq && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 flex items-center gap-1 ${
              isOutOfAmmo 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold animate-pulse' 
                : 'bg-slate-900 text-amber-400 border border-slate-800'
            }`}>
              <span>🏹</span> {ammoCount !== null ? ammoCount : 0}
            </span>
          )}
        </span>
        <span className="text-[10px] font-mono shrink-0 bg-slate-950/40 text-slate-100 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-800/40">
          <span className="font-extrabold text-amber-300" title="Bônus de Ataque (Acerto)">{formattedAtkBonus}</span>
          <span className="opacity-40">|</span>
          <span title="Dano">{isGwmApplied ? `${currentSelectedAttack?.damage || activeEntity.damageDice} +10` : (currentSelectedAttack?.damage || activeEntity.damageDice)}</span>
        </span>
      </button>

      <DualWieldAttackButton />

      <QuickWeaponSwitcher />
    </>
  );
};
