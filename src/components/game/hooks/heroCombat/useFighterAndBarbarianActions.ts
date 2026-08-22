import { UseHeroCombatActionsProps } from './types';
import { useFighterTacticalActions } from './fighterBarbarian/useFighterTacticalActions';
import { useBarbarianAndManeuverActions } from './fighterBarbarian/useBarbarianAndManeuverActions';

export function useFighterAndBarbarianActions(props: UseHeroCombatActionsProps) {
  const {
    handleHeroTacticalMind,
    handleAcceptTacticalMindAlert,
    handleDeclineTacticalMindAlert,
    handleHeroIndomitable,
  } = useFighterTacticalActions(props);

  const {
    handleHeroRecklessAttack,
    handleHeroManeuver,
  } = useBarbarianAndManeuverActions(props);

  return {
    handleHeroTacticalMind,
    handleAcceptTacticalMindAlert,
    handleDeclineTacticalMindAlert,
    handleHeroIndomitable,
    handleHeroRecklessAttack,
    handleHeroManeuver,
  };
}
