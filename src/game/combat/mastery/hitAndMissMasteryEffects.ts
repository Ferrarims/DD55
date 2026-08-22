import { CombatEntity } from '../../types';

export function resolveHitMasteryEffects({
  mLower,
  attacker,
  defender,
  attackerDisplayName,
  defenderDisplayName,
  grid,
  allEntities,
}: {
  mLower: string;
  attacker: CombatEntity;
  defender: CombatEntity;
  attackerDisplayName: string;
  defenderDisplayName: string;
  grid?: any[][];
  allEntities?: CombatEntity[];
}): string {
  let masteryEffectLog = '';
  const strMod = attacker.stats ? Math.floor((attacker.stats.str - 10) / 2) : 0;
  const dexMod = attacker.stats ? Math.floor((attacker.stats.dex - 10) / 2) : 0;
  const abilityMod = Math.max(1, Math.max(strMod, dexMod));
  const pb = attacker.pb || 2;
  const dc = 8 + pb + abilityMod;

  if (mLower.includes('topple') || mLower.includes('derrubar')) {
    const conMod = defender.stats ? Math.floor((defender.stats.con - 10) / 2) : 1;
    const defExhaustion = defender.exhaustionLevel || 0;
    const conRoll = Math.floor(Math.random() * 20) + 1;
    const conSave = conRoll + conMod - (defExhaustion * 2);
    const success = conSave >= dc;

    if (!success) {
      if (!defender.conditions.includes('Caído')) {
        defender.conditions.push('Caído');
      }
      masteryEffectLog = ` 💥 [DERRUBAR] ${defenderDisplayName} falhou na salvaguarda de CON (Rolou ${conSave} vs CD ${dc}) e ficou CAÍDO!`;
    } else {
      masteryEffectLog = ` 🛡️ [DERRUBAR] ${defenderDisplayName} resistiu ao efeito (CON ${conSave} vs CD ${dc}).`;
    }
  } else if (mLower.includes('sap') || mLower.includes('drenar') || mLower.includes('enfraquecer')) {
    if (!defender.conditions.includes('Drenado')) {
      defender.conditions.push('Drenado');
    }
    masteryEffectLog = ` 🛡️ [DRENAR] Impôs a condição Drenado a ${defenderDisplayName}! A próxima jogada de ataque dele terá Desvantagem.`;
  } else if (mLower.includes('vex') || mLower.includes('afligir') || mLower.includes('vexar')) {
    if (!defender.conditions.includes('Afligido')) {
      defender.conditions.push('Afligido');
    }
    masteryEffectLog = ` 🎯 [AFLIGIR] Marcou ${defenderDisplayName}! Concede VANTAGEM na sua próxima jogada de ataque contra este alvo.`;
  } else if (mLower.includes('slow') || mLower.includes('lentidão') || mLower.includes('lentidao')) {
    if (!defender.conditions.includes('Lento')) {
      defender.conditions.push('Lento');
    }
    masteryEffectLog = ` 🐢 [LENTIDÃO] Reduziu o deslocamento de ${defenderDisplayName} em 3 metros (2 células) até seu próximo turno!`;
  } else if (mLower.includes('push') || mLower.includes('empurrar')) {
    if (!defender.conditions.includes('Empurrado')) {
      defender.conditions.push('Empurrado');
    }
    
    const dx = defender.x - attacker.x;
    const dy = defender.y - attacker.y;
    const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
    
    let actualPushDistance = 0;
    let currentX = defender.x;
    let currentY = defender.y;
    
    for (let step = 0; step < 2; step++) {
      const nextX = currentX + stepX;
      const nextY = currentY + stepY;
      
      if (nextX < 0 || nextY < 0) break;
      if (grid && (nextY >= grid.length || nextX >= grid[0].length)) break;
      if (grid && grid[nextY] && grid[nextY][nextX]) {
        const cell = grid[nextY][nextX];
        if (cell.terrain === 'wall' || cell.movementCost === Infinity) break;
      }
      
      if (allEntities) {
        const collision = allEntities.some(ent => 
          !ent.isDead && 
          ent.id !== defender.id && 
          ent.id !== attacker.id && 
          ent.x === nextX && 
          ent.y === nextY
        );
        if (collision) break;
      }
      
      currentX = nextX;
      currentY = nextY;
      actualPushDistance++;
    }
    
    if (actualPushDistance > 0) {
      defender.x = currentX;
      defender.y = currentY;
      const meters = actualPushDistance * 1.5;
      masteryEffectLog = ` 💥 [EMPURRAR] Empurrou ${defenderDisplayName} ${meters} metros (${actualPushDistance} células) para trás!`;
    } else {
      masteryEffectLog = ` 💥 [EMPURRAR] Tentou empurrar ${defenderDisplayName}, mas ele foi bloqueado por um obstáculo ou criatura!`;
    }
  } else if (mLower.includes('grapple') || mLower.includes('agarrar')) {
    const strModDef = defender.stats ? Math.floor((defender.stats.str - 10) / 2) : 1;
    const dexModDef = defender.stats ? Math.floor((defender.stats.dex - 10) / 2) : 1;
    const defenseMod = Math.max(strModDef, dexModDef);
    const defExhaustion = defender.exhaustionLevel || 0;
    const saveRoll = Math.floor(Math.random() * 20) + 1;
    const saveTotal = saveRoll + defenseMod - (defExhaustion * 2);
    const success = saveTotal >= dc;

    if (!success) {
      if (!defender.conditions.includes('Agarrado')) {
        defender.conditions.push('Agarrado');
      }
      defender.grappledById = attacker.id;
      masteryEffectLog = ` ✊ [AGARRAR] ${defenderDisplayName} falhou em resistir (FOR/DEX ${saveTotal} vs CD ${dc}) e ficou AGARRADO por ${attackerDisplayName}!`;
    } else {
      masteryEffectLog = ` 🛡️ [AGARRAR] ${defenderDisplayName} evitou ser agarrado (FOR/DEX ${saveTotal} vs CD ${dc}).`;
    }
  } else if (mLower.includes('cleave') || mLower.includes('trespassar') || mLower.includes('fender')) {
    masteryEffectLog = ` 🪓 [TRESPASSAR] Você pode realizar um ataque corporal extra contra outro alvo a até 1.5m!`;
  } else if (mLower.includes('nick') || mLower.includes('ágil') || mLower.includes('agil') || mLower.includes('golpe rápido')) {
    masteryEffectLog = ` ⚡ [ÁGIL] Você pode desferir o ataque adicional da propriedade Leve como parte da sua ação Atacar!`;
  }

  return masteryEffectLog;
}

export function resolveMissMasteryEffects({
  mLower,
  attacker,
  defenderDisplayName,
}: {
  mLower: string;
  attacker: CombatEntity;
  defenderDisplayName: string;
}): { damage: number; damageDetails: string; masteryEffectLog: string; hit: boolean; isGraze: boolean } | null {
  if (mLower.includes('graze') || mLower.includes('garantido') || mLower.includes('rozar') || mLower.includes('arranhar')) {
    const strMod = attacker.stats ? Math.floor((attacker.stats.str - 10) / 2) : 0;
    const dexMod = attacker.stats ? Math.floor((attacker.stats.dex - 10) / 2) : 0;
    const abilityMod = Math.max(1, Math.max(strMod, dexMod));
    
    return {
      damage: abilityMod,
      damageDetails: `${abilityMod} (mod. de atributo)`,
      hit: true,
      isGraze: true,
      masteryEffectLog: ` 💥 [GARANTIDO] Mesmo errando o golpe, causou ${abilityMod} de Dano de Raspão em ${defenderDisplayName}!`,
    };
  }

  return null;
}
