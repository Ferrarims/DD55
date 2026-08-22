/**
 * Fachada consolidada de funções utilitárias de desenho 2D (Draw Helpers).
 */

export {
  drawEntityHealthBar,
  drawConditionIcons,
  drawCoverBadge,
  drawFloatingText,
} from './helpers/drawEntityHelpers';

export {
  drawTorchGlow,
  draw2DCactus,
  draw2DTree,
  draw2DRock,
  drawDifficultTerrain2D,
} from './helpers/drawEnvironmentHelpers';

export {
  drawHazard2D,
  drawPowerup2D,
  drawTeleportRange,
} from './helpers/drawObjectHelpers';
