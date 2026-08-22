import { UseHeroCombatActionsProps } from './types';
import { useDivineHeroActions } from './divineNatural/useDivineHeroActions';
import { useNaturalAndMonkActions } from './divineNatural/useNaturalAndMonkActions';

export function useDivineAndNaturalActions(props: UseHeroCombatActionsProps) {
  const {
    handleHeroChannelDivinity,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
  } = useDivineHeroActions(props);

  const {
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
  } = useNaturalAndMonkActions(props);

  return {
    handleHeroChannelDivinity,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
  };
}
