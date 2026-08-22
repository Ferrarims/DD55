import { useMemo } from 'react';
import { CombatEntity } from '../../../../../game/types';
import { getDistanceBetweenEntities } from '../../../../../game/combatUtils';

export interface UseImpendingAttackDetailsProps {
  entities: CombatEntity[];
  recklessAttackActive: boolean;
  currentSelectedAttack: any;
  character: any;
  activeLargeForm: boolean;
  weather: 'clear' | 'rain' | 'fog' | 'snow' | 'storm' | 'heatwave' | 'wind';
  isEntityVisible: (ent: CombatEntity) => boolean;
  getActiveFeats: () => string[];
}

export function useImpendingAttackDetails({
  entities,
  recklessAttackActive,
  currentSelectedAttack,
  character,
  activeLargeForm,
  weather,
  isEntityVisible,
  getActiveFeats,
}: UseImpendingAttackDetailsProps) {
  return useMemo(() => {
    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return null;

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return null;

    const primaryTarget = [...aliveMonsters].sort((a, b) => {
      const distA = getDistanceBetweenEntities(hero, a, character?.race, activeLargeForm);
      const distB = getDistanceBetweenEntities(hero, b, character?.race, activeLargeForm);
      return distA - distB;
    })[0];

    const advantageSources: string[] = [];
    const disadvantageSources: string[] = [];

    if (recklessAttackActive) {
      advantageSources.push('Ataque Imprudente Ativo');
    }

    const heroConditions = hero.conditions || [];
    if (heroConditions.includes('Drenado') || heroConditions.includes('Sapped')) {
      disadvantageSources.push('Drenado (Sap de Maestria)');
    }
    if (heroConditions.some(c => c === 'Envenenado' || c === 'Poisoned')) {
      disadvantageSources.push('Você está Envenenado');
    }
    if (heroConditions.some(c => c === 'Cego' || c === 'Blinded')) {
      disadvantageSources.push('Você está Cego');
    }
    if (heroConditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
      disadvantageSources.push('Você está Restringido');
    }
    if (heroConditions.some(c => c === 'Caído' || c === 'Prone')) {
      disadvantageSources.push('Você está Caído');
    }
    if (heroConditions.some(c => c === 'Invisível' || c === 'Invisible')) {
      advantageSources.push('Você está Invisível');
    }
    if (heroConditions.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened')) {
      disadvantageSources.push('Você está Amedrontado');
    }

    if (currentSelectedAttack) {
      const pStr = String(currentSelectedAttack.properties || '').toLowerCase();
      const nStr = String(currentSelectedAttack.name || '').toLowerCase();
      const isHeavyWeapon = pStr.includes('heavy') || pStr.includes('pesada') || nStr.includes('machado grande') || nStr.includes('espada grande') || nStr.includes('arco longo') || nStr.includes('besta pesada') || nStr.includes('malho') || nStr.includes('alabarda') || nStr.includes('glaive');
      
      if (isHeavyWeapon) {
        const rStr = String(currentSelectedAttack.range || '').toLowerCase();
        const isPureRangedName = nStr.includes('arco') || nStr.includes('besta') || nStr.includes('funda') || 
          nStr.includes('bow') || nStr.includes('crossbow') || nStr.includes('sling') || nStr.includes('dardo') || nStr.includes('dart');
        const hasThrown = rStr.includes('arremesso') || pStr.includes('arremesso') || pStr.includes('thrown') || isPureRangedName;
        const hasMeleeBase = rStr.startsWith('1,5m') || rStr.startsWith('1.5m') || rStr.startsWith('3m') || rStr.startsWith('3.0m') || rStr.includes('toque') || rStr.includes('touch');
        const isPureRanged = isPureRangedName || (
          (rStr.includes('/') || rStr.includes('munição') || pStr.includes('munição') || pStr.includes('ammunition')) && 
          !hasMeleeBase && 
          !hasThrown
        );

        const isMeleeHeavy = !isPureRanged;
        const strScore = hero.stats?.str !== undefined ? hero.stats.str : (character?.strength !== undefined ? character.strength : 10);
        const dexScore = hero.stats?.dex !== undefined ? hero.stats.dex : (character?.dexterity !== undefined ? character.dexterity : 10);
        
        if (isMeleeHeavy && strScore < 13) {
          disadvantageSources.push(`Arma Pesada (Força ${strScore} < 13)`);
        } else if (!isMeleeHeavy && dexScore < 13) {
          disadvantageSources.push(`Arma Pesada À Distância (Destreza ${dexScore} < 13)`);
        }
      }
    }

    let targetName = primaryTarget.name;
    let distance = getDistanceBetweenEntities(hero, primaryTarget, character?.race, activeLargeForm);
    let autoCritPossible = false;

    const tgtConditions = primaryTarget.conditions || [];
    if (tgtConditions.includes('Afligido') || tgtConditions.includes('Vexed') || tgtConditions.includes('Vex')) {
      advantageSources.push(`Alvo Afligido (Vex de Maestria)`);
    }
    if (tgtConditions.some(c => c === 'Caído' || c === 'Prone')) {
      if (distance <= 1) {
        advantageSources.push('Alvo Caído (Corpo a Corpo)');
      } else {
        disadvantageSources.push('Alvo Caído (À Distância)');
      }
    }
    if (tgtConditions.some(c => c === 'Cego' || c === 'Blinded')) {
      advantageSources.push('Alvo está Cego');
    }
    if (tgtConditions.some(c => c === 'Paralisado' || c === 'Paralyzed')) {
      advantageSources.push('Alvo está Paralisado');
      if (distance <= 1) autoCritPossible = true;
    }
    if (tgtConditions.some(c => c === 'Inconsciente' || c === 'Unconscious')) {
      advantageSources.push('Alvo está Inconsciente');
      if (distance <= 1) autoCritPossible = true;
    }
    if (tgtConditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
      advantageSources.push('Alvo está Restringido');
    }
    if (tgtConditions.some(c => c === 'Atordoado' || c === 'Stunned')) {
      advantageSources.push('Alvo está Atordoado');
    }
    if (tgtConditions.some(c => c === 'Invisível' || c === 'Invisible')) {
      disadvantageSources.push('Alvo está Invisível');
    }

    if (currentSelectedAttack) {
      const pStr = String(currentSelectedAttack.properties || '').toLowerCase();
      const nStr = String(currentSelectedAttack.name || '').toLowerCase();
      const rStr = String(currentSelectedAttack.range || '').toLowerCase();
      const isPureRanged = nStr.includes('arco') || nStr.includes('besta') || nStr.includes('funda') || 
        nStr.includes('bow') || nStr.includes('crossbow') || nStr.includes('sling') || nStr.includes('dardo') || 
        rStr.includes('munição') || rStr.includes('ammunition') || (!rStr.startsWith('1,5m') && !rStr.startsWith('1.5m') && (rStr.includes('m') || rStr.includes('/')));
      
      const activeFeatsList = typeof getActiveFeats === 'function' ? getActiveFeats() : (hero.feats || character?.feats || []);
      const hasSharpshooter = activeFeatsList.some((f: string) => {
        if (typeof f !== 'string') return false;
        const n = f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        return n.includes('mestre-atirador') || n.includes('mestre atirador') || n.includes('sharpshooter');
      });

      if (isPureRanged) {
        const hasAdjacentThreat = aliveMonsters.some(enemy => {
          const d = Math.max(Math.abs(hero.x - enemy.x), Math.abs(hero.y - enemy.y));
          return d <= 1;
        });
        if (hasAdjacentThreat && !hasSharpshooter) {
          disadvantageSources.push('Combate Próximo (Inimigo adjacente)');
        }
      }

      if (weather === 'wind' && isPureRanged) {
        disadvantageSources.push('Vento Forte (Desvantagem em projéteis)');
      } else if (weather === 'storm' && isPureRanged) {
        disadvantageSources.push('Tempestade Severa (Desvantagem em ataques à distância)');
      } else if (weather === 'fog' && distance > 6) {
        disadvantageSources.push('Neblina Densa (Alvo além de 9m fortemente obscurecido)');
      }
    }

    let state: 'normal' | 'advantage' | 'disadvantage' = 'normal';
    if (advantageSources.length > 0 && disadvantageSources.length > 0) {
      state = 'normal';
    } else if (advantageSources.length > 0) {
      state = 'advantage';
    } else if (disadvantageSources.length > 0) {
      state = 'disadvantage';
    }

    return {
      state,
      advantageSources,
      disadvantageSources,
      targetName,
      autoCritPossible
    };
  }, [entities, recklessAttackActive, currentSelectedAttack, character, activeLargeForm, weather, isEntityVisible, getActiveFeats]);
}
