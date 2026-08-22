import { UseHeroCombatActionsProps } from './heroCombat/types';
import { useHeroAttackExecution } from './heroCombat/useHeroAttackExecution';
import { useWeaponAndMovementActions } from './heroCombat/useWeaponAndMovementActions';
import { useOffHandCombatActions } from './heroCombat/useOffHandCombatActions';
import { useFighterAndBarbarianActions } from './heroCombat/useFighterAndBarbarianActions';
import { useDivineAndNaturalActions } from './heroCombat/useDivineAndNaturalActions';
import { useRacialCombatActions } from './heroCombat/useRacialCombatActions';
import { useSpellsAndMasteryActions } from './heroCombat/useSpellsAndMasteryActions';

export type { UseHeroCombatActionsProps };

/**
 * Hook orquestrador de ações de combate do herói.
 * Conecta e delega para os submódulos especializados em heroCombat/:
 * - useHeroAttackExecution (execução de ataque, arremesso, munição, acertos)
 * - useWeaponAndMovementActions (ataque principal, disparada, cleave)
 * - useOffHandCombatActions (duas armas, mão inapta, maestria Nick)
 * - useFighterAndBarbarianActions (mente tática, indomável, ataque imprudente, manobras)
 * - useDivineAndNaturalActions (canalizar divindade, mãos curativas/imposição, forma selvagem, ki, inspiração)
 * - useRacialCombatActions (habilidades raciais de orc, aasimar, draconato)
 * - useSpellsAndMasteryActions (magias e maestrias)
 */
export function useHeroCombatActions(props: UseHeroCombatActionsProps) {
  const { processHeroAttackExecution } = useHeroAttackExecution(props);
  const weaponAndMovement = useWeaponAndMovementActions(props, { processHeroAttackExecution });
  const offHand = useOffHandCombatActions(props, { processHeroAttackExecution });
  const fighterAndBarbarian = useFighterAndBarbarianActions(props);
  const divineAndNatural = useDivineAndNaturalActions(props);
  const racial = useRacialCombatActions(props);
  const spellsAndMastery = useSpellsAndMasteryActions(props, { processHeroAttackExecution });

  return {
    processHeroAttackExecution,
    ...weaponAndMovement,
    ...offHand,
    ...racial,
    ...fighterAndBarbarian,
    ...divineAndNatural,
    ...spellsAndMastery,
  };
}
