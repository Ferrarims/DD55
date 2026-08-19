import { CombatEntity } from '../../game/types';

export const isTargetInLine = (hero: CombatEntity, target: CombatEntity, directionTarget: CombatEntity, maxDist: number): boolean => {
  // Line is a ray from hero through directionTarget
  const dx = directionTarget.x - hero.x;
  const dy = directionTarget.y - hero.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return false;

  const ux = dx / length;
  const uy = dy / length;

  // Vector from hero to target
  const vx = target.x - hero.x;
  const vy = target.y - hero.y;

  // Project vector v onto unit vector u
  const projection = vx * ux + vy * uy;

  // Check if target is in the right direction and within distance
  if (projection < 0 || projection > maxDist) return false;

  // Check perpendicular distance from the ray
  const closestX = hero.x + ux * projection;
  const closestY = hero.y + uy * projection;
  const distToLine = Math.sqrt((target.x - closestX) ** 2 + (target.y - closestY) ** 2);

  // Consider targets within a small radius of the line (e.g., 0.5 squares)
  return distToLine <= 0.6;
};

export const isTargetInCone = (hero: CombatEntity, target: CombatEntity, directionTarget: CombatEntity, maxDist: number): boolean => {
  // Cone is a triangle from hero towards directionTarget
  const dx = directionTarget.x - hero.x;
  const dy = directionTarget.y - hero.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return false;

  const ux = dx / length;
  const uy = dy / length;

  // Vector from hero to target
  const vx = target.x - hero.x;
  const vy = target.y - hero.y;
  const vLength = Math.sqrt(vx * vx + vy * vy);
  if (vLength === 0) return true; // Hero position itself?

  // Check distance
  if (vLength > maxDist) return false;

  // Check angle. Cone angle is 90 degrees (45 each side)
  const dotProduct = (vx * ux + vy * uy) / (vLength * 1); // vLength is already normalized in numerator logic? wait no.
  // Actually, formula for angle between vectors u and v is: cos(theta) = (u . v) / (|u| * |v|)
  // u is unit vector, so |u| = 1.
  const cosTheta = (vx * ux + vy * uy) / vLength;
  // Clamp to [-1, 1] for acos
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
  const angle = Math.acos(clampedCosTheta);
  return angle <= Math.PI / 4; // 45 degrees
};
