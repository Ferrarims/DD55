import { useGridHazards, UseGridHazardsProps } from './useGridHazards';
import { useGridPowerupsAndRest, UseGridPowerupsAndRestProps } from './useGridPowerupsAndRest';

export type UseGridHazardsAndPowerupsProps = UseGridHazardsProps & UseGridPowerupsAndRestProps;

export function useGridHazardsAndPowerups(props: UseGridHazardsAndPowerupsProps) {
  const {
    checkHazards,
    checkPassiveHazardDetection,
    handleDisarmHazard,
    handleActiveSearch,
  } = useGridHazards(props);
  const { checkPowerupsAndRest } = useGridPowerupsAndRest(props);

  const checkGridTriggers = (entityId: string, tx: number, ty: number) => {
    checkHazards(entityId, tx, ty);
    checkPowerupsAndRest(entityId, tx, ty);
    checkPassiveHazardDetection(tx, ty);
  };

  return {
    checkGridTriggers,
    checkPassiveHazardDetection,
    handleDisarmHazard,
    handleActiveSearch,
  };
}
