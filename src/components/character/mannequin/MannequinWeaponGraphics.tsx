import { renderMeleeGraphic } from './weapons/MeleeWeaponGraphics';
import { renderRangedOrSpecialGraphic } from './weapons/RangedAndSpecialGraphics';

export function renderWeaponGraphic(itemName: string | null, hand: 'main' | 'off') {
  if (!itemName) return null;
  const lower = itemName.toLowerCase();
  const handX = hand === 'main' ? 30 : 210;

  // Primeiro verifica escudos, tochas, lanternas e armas de longo alcance/haste
  const rangedOrSpecial = renderRangedOrSpecialGraphic(lower, handX, hand);
  if (rangedOrSpecial) return rangedOrSpecial;

  // Caso contrário, renderiza arma corpo a corpo (espadas, machados, martelos, adagas, etc.)
  return renderMeleeGraphic(lower, handX, hand);
}
