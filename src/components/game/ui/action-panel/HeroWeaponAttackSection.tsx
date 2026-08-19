import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { parseEquipmentToList } from '../../../../lib/mechanics/xpAndLootManager';

export const HeroWeaponAttackSection: React.FC = () => {
  const {
    character,
    activeEntity,
    isBattleOver,
    characterAttacks,
    selectedAttackIndex,
    currentSelectedAttack,
    handleSelectWeapon,
    handleHeroAttack,
    handleTriggerHeroOffHandAttack,
    versatileTwoHandedWeapons,
    setVersatileTwoHandedWeapons,
    gwmActive,
    setGwmActive,
    sharpshooterActive,
    setSharpshooterActive,
    isTwoHandedWeaponLocal,
    isVersatileWeapon,
    isLightWeapon,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    getActiveFeats,
    heroACDetails,
    isFullscreenMap,
    weaponMasteryInfo
  } = useGameContext();

  if (!activeEntity || activeEntity.type !== 'hero') return null;

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  const activeFeatsList = getActiveFeats();
  const hasGWMFeat = activeFeatsList.includes('Mestre em Armas Grandes') || activeFeatsList.includes('Great Weapon Master');
  const hasSharpshooterFeat = activeFeatsList.includes('Mestre-Atirador') || activeFeatsList.includes('Sharpshooter');

  const isCurrentWeaponTwoHanded = currentSelectedAttack?.properties?.toLowerCase().includes('duas mãos') || 
                                   currentSelectedAttack?.properties?.toLowerCase().includes('two-handed') || 
                                   (currentSelectedAttack?.name && isTwoHandedWeaponLocal(currentSelectedAttack.name, currentSelectedAttack.properties));
  const isCurrentAttackMelee = !(currentSelectedAttack?.properties?.toLowerCase().includes('munição') || currentSelectedAttack?.properties?.toLowerCase().includes('municao') || String(currentSelectedAttack?.range || '').toLowerCase().includes('/') || String(currentSelectedAttack?.name || '').toLowerCase().includes('arco') || String(currentSelectedAttack?.name || '').toLowerCase().includes('besta') || String(currentSelectedAttack?.name || '').toLowerCase().includes('funda'));
  const isCurrentAttackRanged = !isCurrentAttackMelee;

  const showGwmToggle = hasGWMFeat && isCurrentWeaponTwoHanded && isCurrentAttackMelee;
  const showSSToggle = hasSharpshooterFeat && isCurrentAttackRanged;

  const isGwmApplied = gwmActive && isCurrentWeaponTwoHanded && isCurrentAttackMelee;
  const isSharpshooterApplied = sharpshooterActive && isCurrentAttackRanged;

  const ammoReq = checkAmmunitionRequirement(currentSelectedAttack);
  const ammoCount = ammoReq ? getCharacterAmmoCount(ammoReq) : null;
  const isOutOfAmmo = ammoCount !== null && ammoCount <= 0;

  const baseAtkBonus = currentSelectedAttack?.attack_bonus !== undefined 
    ? currentSelectedAttack.attack_bonus 
    : (currentSelectedAttack?.bonus !== undefined 
        ? currentSelectedAttack.bonus 
        : activeEntity.attackBonus);
  const effectiveAtkBonus = baseAtkBonus - (isGwmApplied || isSharpshooterApplied ? 5 : 0);
  const formattedAtkBonus = effectiveAtkBonus >= 0 ? `+${effectiveAtkBonus}` : `${effectiveAtkBonus}`;

  // Off-hand attack calculations
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
    <>
      {/* Botão de escolha de empunhadura para armas versáteis */}
      {currentSelectedAttack && isVersatileWeapon(currentSelectedAttack.name, currentSelectedAttack.properties) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 my-1 shadow-md">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              ⚖️ Empunhadura ({currentSelectedAttack.name})
            </span>
            <span className="text-[9.5px] text-slate-400 leading-tight mt-0.5">
              {versatileTwoHandedWeapons[currentSelectedAttack.name] 
                ? 'Usando com 2 Mãos: Dano aumentado, 🛡️ Escudo Inativo.' 
                : 'Usando com 1 Mão: Dano padrão, 🛡️ Escudo Ativo.'}
            </span>
          </div>
          <button
            onClick={() => {
              const name = currentSelectedAttack.name;
              setVersatileTwoHandedWeapons(prev => ({
                ...prev,
                [name]: !prev[name]
              }));
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition border shrink-0 ${
              versatileTwoHandedWeapons[currentSelectedAttack.name]
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Alternar entre empunhar com 1 mão (com escudo) ou 2 mãos (maior dano, sem escudo)"
          >
            {versatileTwoHandedWeapons[currentSelectedAttack.name] ? '⚔️ 2 Mãos' : '🛡️ 1 Mão'}
          </button>
        </div>
      )}

      {/* Painel de Talentos Ativos de Combate (GWM / Sharpshooter) */}
      {(showGwmToggle || showSSToggle) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 my-1 shadow-md">
          <div className="text-[10px] font-bold text-amber-400 flex items-center justify-between">
            <span>💥 AJUSTE DE TALENTO EM COMBATE:</span>
            <span className="text-[9px] text-slate-400 font-mono">D&D 5.5e (2024)</span>
          </div>
          
          {showGwmToggle && (
            <label className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 transition p-2 rounded-lg border border-slate-800 cursor-pointer">
              <div className="flex flex-col text-left mr-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  ⚔️ Mestre em Armas Grandes
                </span>
                <span className="text-[9.5px] text-slate-400 leading-tight mt-0.5">
                  Ativar Golpe Poderoso: <strong className="text-rose-400">-5 Acerto</strong> para ganhar <strong className="text-emerald-400">+10 Dano</strong>.
                </span>
              </div>
              <input
                type="checkbox"
                checked={gwmActive}
                onChange={(e) => {
                  setGwmActive(e.target.checked);
                  if (e.target.checked) setSharpshooterActive(false);
                }}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer shrink-0"
              />
            </label>
          )}

          {showSSToggle && (
            <label className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 transition p-2 rounded-lg border border-slate-800 cursor-pointer">
              <div className="flex flex-col text-left mr-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  🏹 Mestre-Atirador (Sharpshooter)
                </span>
                <span className="text-[9.5px] text-slate-400 leading-tight mt-0.5">
                  Ativar Disparo Preciso: <strong className="text-rose-400">-5 Acerto</strong> para ganhar <strong className="text-emerald-400">+10 Dano</strong>.
                </span>
              </div>
              <input
                type="checkbox"
                checked={sharpshooterActive}
                onChange={(e) => {
                  setSharpshooterActive(e.target.checked);
                  if (e.target.checked) setGwmActive(false);
                }}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer shrink-0"
              />
            </label>
          )}
        </div>
      )}

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
            {isSharpshooterApplied && <span className="text-rose-950 ml-1 font-extrabold bg-amber-300 px-1 py-0.5 rounded text-[9px]">-5 SS</span>}
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
          <span title="Dano">{isGwmApplied || isSharpshooterApplied ? `${currentSelectedAttack?.damage || activeEntity.damageDice} +10` : (currentSelectedAttack?.damage || activeEntity.damageDice)}</span>
        </span>
      </button>

      {/* 1.2 Ataque com Mão Inapta / 2ª Arma (Ação Bônus / Nick) */}
      {showOffHand && (
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
      )}

      {/* 1.1 Quick Weapon Switcher during battle */}
      {(characterAttacks?.length || 0) > 1 && (
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
      )}
    </>
  );
};
