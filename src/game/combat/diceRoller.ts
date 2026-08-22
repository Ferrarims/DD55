import { CombatEntity } from '../types';

// Rolar dados com notação string (ex: '1d6+2', '2d8+3', ou fórmulas compostas como '1d8+1d6+4')
export function rollDiceString(diceStr: string): { total: number; rollDetails: string } {
  try {
    const sanitized = diceStr.replace(/\s+/g, '').toLowerCase();
    
    // Divide a string por '+' ou '-' mantendo os sinais para podermos processá-los individualmente
    const parts = sanitized
      .replace(/\+/g, ' +')
      .replace(/-/g, ' -')
      .trim()
      .split(/\s+/);

    let total = 0;
    const detailsList: string[] = [];
    
    for (const part of parts) {
      if (!part) continue;
      
      // Verificar se é um termo de dado, ex: "+2d6", "-1d4", "2d6", "1d8", etc.
      const diceRegex = /^([+-]?)(\d+)d(\d+)$/;
      const diceMatch = part.match(diceRegex);
      
      if (diceMatch) {
        const sign = diceMatch[1] || '+';
        const count = parseInt(diceMatch[2], 10);
        const sides = parseInt(diceMatch[3], 10);
        
        let termSum = 0;
        const rolls: number[] = [];
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * sides) + 1;
          rolls.push(r);
          termSum += r;
        }
        
        if (sign === '-') {
          total -= termSum;
          detailsList.push(`-(${rolls.join('+')})`);
        } else {
          total += termSum;
          const prefix = detailsList.length > 0 ? '+' : '';
          detailsList.push(`${prefix}(${rolls.join('+')})`);
        }
      } else {
        // É um modificador numérico fixo, ex: "+3", "-2", "4"
        const numRegex = /^([+-]?)(\d+)$/;
        const numMatch = part.match(numRegex);
        
        if (numMatch) {
          const sign = numMatch[1] || '+';
          const value = parseInt(numMatch[2], 10);
          
          if (sign === '-') {
            total -= value;
            detailsList.push(`-${value}`);
          } else {
            const prefix = detailsList.length > 0 ? '+' : '';
            total += value;
            detailsList.push(`${prefix}${value}`);
          }
        }
      }
    }
    
    const finalTotal = Math.max(1, total);
    const rollDetails = `${detailsList.join(' ')} = ${finalTotal}`;
    
    return { total: finalTotal, rollDetails };
  } catch {
    return { total: 4, rollDetails: '4' };
  }
}

// Converte uma string de dados para a sua versão crítica (dobrando a quantidade de todos os dados e mantendo os bônus fixos)
export function getCriticalDiceString(diceStr: string): string {
  try {
    const sanitized = diceStr.replace(/\s+/g, '');
    
    // Dobrar o número de dados de cada expressão <quantidade>d<lados> encontrada na string
    return sanitized.replace(/(\d+)d(\d+)/gi, (_match, countStr, sidesStr) => {
      const count = parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);
      return `${count * 2}d${sides}`;
    });
  } catch {
    return diceStr;
  }
}

// Rolar dados de dano considerando talentos (Feats) do combatente
export function rollDamageDiceWithFeats(
  diceStr: string,
  attacker: CombatEntity,
  isCritical: boolean,
  damageType?: string,
  weaponName?: string,
  weaponProperties?: string,
  isMeleeAttack?: boolean
): { total: number; rollDetails: string } {
  try {
    const sanitized = diceStr.replace(/\s+/g, '').toLowerCase();
    
    const hasGWF = attacker.feats?.includes('Combate com Armas Grandes') || 
                   attacker.feats?.includes('Great Weapon Fighting') ||
                   (attacker as any).fightingStyle === 'Combate com Armas Grandes' ||
                   (attacker as any).fighting_style === 'Combate com Armas Grandes';

    const hasPiercer = attacker.feats?.includes('Perfurador') || attacker.feats?.includes('Piercer');
    const hasTavernBrawler = attacker.feats?.includes('Valentão de Taverna') || attacker.feats?.includes('Tavern Brawler');
    const hasIrresistible = attacker.feats?.includes('Dádiva do Ataque Irresistível') || attacker.feats?.includes('Epic Boon of Irresistible Offense');

    const wName = (weaponName || '').toLowerCase();
    const wProps = (weaponProperties || '').toLowerCase();

    // Determina se a arma é de ataque à distância (Ranged)
    const isRangedWeapon = wProps.includes('munição') || wProps.includes('ammunition') || wProps.includes('distância') || wProps.includes('ranged') ||
      wName.includes('arco') || wName.includes('besta') || wName.includes('funda') || wName.includes('bow') || 
      wName.includes('crossbow') || wName.includes('sling') || wName.includes('dardo') || wName.includes('cerbatana') || wName.includes('shuriken');

    // Somente armas/ataques corpo a corpo qualificam-se para Combate com Armas Grandes
    const isMelee = (isMeleeAttack !== false) && !isRangedWeapon;

    // Verificar se a arma é empunhada com duas mãos
    const isExplicitTwoHanded = wProps.includes('duas mãos') || wProps.includes('two-handed') || wProps.includes('2 mãos') ||
      wName.includes('duas mãos') || wName.includes('two-handed') || wName.includes('bastarda') || 
      wName.includes('alabarda') || wName.includes('montante') || wName.includes('glaive') || 
      wName.includes('pique') || wName.includes('malho') || wName.includes('machado grande') || 
      wName.includes('espada grande') || wName.includes('greatsword') || wName.includes('greataxe') || 
      wName.includes('maul') || wName.includes('halberd') || wName.includes('marreta');

    const isVersatile = wProps.includes('versátil') || wProps.includes('versatile') || 
      wName.includes('espada longa') || wName.includes('longsword') || 
      wName.includes('machado de batalha') || wName.includes('battleaxe') || 
      wName.includes('martelo de guerra') || wName.includes('warhammer') || 
      wName.includes('tridente') || wName.includes('cajado');

    // Arma versátil é empunhada em 2 mãos se não houver escudo no equipamento
    let isVersatileTwoHanded = false;
    if (isVersatile) {
      let slots: Record<string, string | null> = {};
      if (attacker.equipment_slots) {
        if (typeof attacker.equipment_slots === 'string') {
          try { slots = JSON.parse(attacker.equipment_slots); } catch {}
        } else {
          slots = attacker.equipment_slots as any;
        }
      }
      const shieldEquipped = slots['empunhadura_2'] || slots['empunhadura_1'];
      const hasShield = shieldEquipped && (shieldEquipped.toLowerCase().includes('escudo') || shieldEquipped.toLowerCase().includes('shield'));
      if (!hasShield) {
        isVersatileTwoHanded = true;
      }
    }

    const isTwoHandedMelee = isMelee && (isExplicitTwoHanded || isVersatileTwoHanded);

    const parts = sanitized
      .replace(/\+/g, ' +')
      .replace(/-/g, ' -')
      .trim()
      .split(/\s+/);

    let total = 0;
    const detailsList: string[] = [];
    let piercerUsed = false;

    for (const part of parts) {
      if (!part) continue;
      
      const diceRegex = /^([+-]?)(\d+)d(\d+)$/;
      const diceMatch = part.match(diceRegex);
      
      if (diceMatch) {
        const sign = diceMatch[1] || '+';
        const count = parseInt(diceMatch[2], 10);
        const sides = parseInt(diceMatch[3], 10);
        
        let termSum = 0;
        const rolls: number[] = [];
        
        for (let i = 0; i < count; i++) {
          let r = Math.floor(Math.random() * sides) + 1;

          // 1. Combate com Armas Grandes (GWF): re-rola 1 ou 2 somente em armas corpo a corpo empunhadas com duas mãos
          if (hasGWF && isTwoHandedMelee && (r === 1 || r === 2)) {
            r = Math.floor(Math.random() * sides) + 1;
          }

          // 2. Valentão de Taverna: re-rola 1 em ataques desarmados
          const isUnarmed = weaponName?.toLowerCase().includes('desarmado') || diceStr.includes('unarmed');
          if (hasTavernBrawler && isUnarmed && r === 1) {
            r = Math.floor(Math.random() * sides) + 1;
          }

          // 3. Perfurador: re-rola 1 ou 2 em dano perfurante (uma vez por ataque)
          const isPiercing = damageType?.toLowerCase().includes('perfurante') || damageType?.toLowerCase().includes('piercing');
          if (hasPiercer && isPiercing && !piercerUsed && (r === 1 || r === 2)) {
            r = Math.floor(Math.random() * sides) + 1;
            piercerUsed = true;
          }

          rolls.push(r);
          termSum += r;
        }
        
        if (sign === '-') {
          total -= termSum;
          detailsList.push(`-(${rolls.join('+')})`);
        } else {
          total += termSum;
          const prefix = detailsList.length > 0 ? '+' : '';
          detailsList.push(`${prefix}(${rolls.join('+')})`);
        }
      } else {
        const numRegex = /^([+-]?)(\d+)$/;
        const numMatch = part.match(numRegex);
        
        if (numMatch) {
          const sign = numMatch[1] || '+';
          const value = parseInt(numMatch[2], 10);
          
          if (sign === '-') {
            total -= value;
            detailsList.push(`-${value}`);
          } else {
            const prefix = detailsList.length > 0 ? '+' : '';
            total += value;
            detailsList.push(`${prefix}${value}`);
          }
        }
      }
    }

    // 4. Dádiva do Ataque Irresistível: dano crítico causa dano destrutivo a mais (+2d10)
    if (isCritical && hasIrresistible) {
      const extraD10 = Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1;
      total += extraD10;
      detailsList.push(`+(${extraD10}) [Dádiva Destrutiva]`);
    }
    
    const finalTotal = Math.max(1, total);
    const rollDetails = `${detailsList.join(' ')} = ${finalTotal}`;
    
    return { total: finalTotal, rollDetails };
  } catch {
    return rollDiceString(diceStr);
  }
}
