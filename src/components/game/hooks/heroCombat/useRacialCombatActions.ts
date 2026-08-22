import { UseHeroCombatActionsProps } from './types';
import { useOrcAndAasimarActions } from './racial/useOrcAndAasimarActions';
import { useDragonbornBreathAction } from './racial/useDragonbornBreathAction';

export function useRacialCombatActions(props: UseHeroCombatActionsProps) {
  const orcAndAasimar = useOrcAndAasimarActions(props);
  const dragonbornBreath = useDragonbornBreathAction(props);

  return {
    ...orcAndAasimar,
    ...dragonbornBreath,
  };
}
