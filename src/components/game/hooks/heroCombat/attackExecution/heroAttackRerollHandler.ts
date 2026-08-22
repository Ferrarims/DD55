import { CombatEntity } from '../../../../../game/types';
import { executeAttack } from '../../../../../game/combatEngine';

export function handleHeroAttackRerollModals({
  atkRes,
  isHalfling,
  hasHeroicInspiration,
  targetEntity,
  atkName,
  heroWithFeats,
  activeAdvantageMode,
  atkBonus,
  dmgDice,
  atkToUse,
  options,
  weaponMasteryInfo,
  gwmActive,
  isMelee,
  isTwoHanded,
  isDarkEnv,
  torches,
  heroLightRadius,
  hero,
  entities,
  grid,
  setPendingHalflingLuckInfo,
  setPendingHeroicInspirationInfo,
  applyAttackResult,
}: {
  atkRes: any;
  isHalfling: boolean;
  hasHeroicInspiration: boolean;
  targetEntity: CombatEntity;
  atkName: string;
  heroWithFeats: CombatEntity;
  activeAdvantageMode: any;
  atkBonus: number;
  dmgDice: string;
  atkToUse: any;
  options?: any;
  weaponMasteryInfo?: any;
  gwmActive: boolean;
  isMelee: boolean;
  isTwoHanded: boolean;
  isDarkEnv: boolean;
  torches: any[];
  heroLightRadius: number;
  hero: CombatEntity;
  entities: CombatEntity[];
  grid: any[][];
  setPendingHalflingLuckInfo: (info: any) => void;
  setPendingHeroicInspirationInfo: (info: any) => void;
  applyAttackResult: (res: any) => void;
}): boolean {
  if (isHalfling && !atkRes.isTotalCover && atkRes.isFumble) {
    setPendingHalflingLuckInfo({
      title: `Sorte de Pequenino: Ataque contra ${targetEntity.name}`,
      description: `Você rolou um 1 natural (falha crítica) no ataque com ${atkName}!`,
      rollDetails: `${atkRes.logTitle}\n${atkRes.logDetail}`,
      onReroll: () => {
        const newAtkRes = executeAttack(heroWithFeats, targetEntity, activeAdvantageMode, {
          name: atkName, attackBonus: atkBonus, damageDice: dmgDice, damageType: atkToUse?.damage_type || 'Físico',
          mastery: options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined),
          properties: atkToUse?.properties || undefined, range: atkToUse?.range || undefined, gwmToggled: gwmActive && isMelee && isTwoHanded, sharpshooterToggled: false
        }, { isDarkEnvironment: isDarkEnv, torches, heroLightRadius, heroX: hero.x, heroY: hero.y }, entities, grid);
        applyAttackResult(newAtkRes);
      },
      onDecline: () => { applyAttackResult(atkRes); }
    });
    return true;
  }

  if (!atkRes.hit && !atkRes.isTotalCover && hasHeroicInspiration) {
    setPendingHeroicInspirationInfo({
      type: 'attack',
      title: `Ataque contra ${targetEntity.name}`,
      description: `Seu ataque com ${atkName} errou o alvo!`,
      rollDetails: `${atkRes.logTitle}\n${atkRes.logDetail}`,
      onReroll: () => {
        const newAtkRes = executeAttack(heroWithFeats, targetEntity, 'advantage', {
          name: atkName, attackBonus: atkBonus, damageDice: dmgDice, damageType: atkToUse?.damage_type || 'Físico',
          mastery: options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined),
          properties: atkToUse?.properties || undefined, range: atkToUse?.range || undefined, gwmToggled: gwmActive && isMelee && isTwoHanded, sharpshooterToggled: false
        }, { isDarkEnvironment: isDarkEnv, torches, heroLightRadius, heroX: hero.x, heroY: hero.y }, entities, grid);
        applyAttackResult(newAtkRes);
      },
      onDecline: () => { applyAttackResult(atkRes); }
    });
    return true;
  }

  return false;
}
