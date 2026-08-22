import {
  drawEntityHealthBar,
  drawConditionIcons,
  drawCoverBadge
} from '../drawHelpers';

export interface Render2DEntitiesProps {
  ctx: CanvasRenderingContext2D;
  entities: any[];
  cameraX: number;
  cameraY: number;
  cols: number;
  rows: number;
  cellSize: number;
  activeEntity: any;
  character: any;
  activeLargeForm?: boolean;
  getEntitySizeInSquares: (size?: string) => number;
  RACES_REFERENCE: Record<string, any>;
  isEntityVisible: (ent: any) => boolean;
  isEntityVisibleByBlindFightingOnly: (ent: any) => boolean;
  getEntityCover: (ent: any) => { degree: string; acBonus: number };
  shouldHideEntityDetails: (ent: any) => boolean;
}

export function render2DEntities({
  ctx,
  entities,
  cameraX,
  cameraY,
  cols,
  rows,
  cellSize,
  activeEntity,
  character,
  activeLargeForm,
  getEntitySizeInSquares,
  RACES_REFERENCE,
  isEntityVisible,
  isEntityVisibleByBlindFightingOnly,
  getEntityCover,
  shouldHideEntityDetails
}: Render2DEntitiesProps): void {
  entities.forEach(ent => {
    if (ent.isDead) return;
    if (!isEntityVisible(ent)) return;
    const c = ent.x - cameraX;
    const r = ent.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;

    const sizeInSquares = getEntitySizeInSquares(
      ent.type === 'hero' 
        ? (activeLargeForm ? 'Grande' : (ent.size || (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')))
        : (ent.size || 'Médio')
    );
    const groundPx = c * cellSize + (sizeInSquares * cellSize) / 2;
    const groundPy = r * cellSize + (sizeInSquares * cellSize) / 2;
    const radius = (sizeInSquares * cellSize) * 0.38;

    // Destacar Pegada no Solo para Entidades Grandes
    if (ent.type === 'hero' && activeLargeForm) {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.fillRect(c * cellSize, r * cellSize, sizeInSquares * cellSize, sizeInSquares * cellSize);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(c * cellSize, r * cellSize, sizeInSquares * cellSize, sizeInSquares * cellSize);
      ctx.restore();
    }

    const isFlying = Boolean(ent.conditions?.includes('Voando'));
    const flyOffset = isFlying ? (sizeInSquares * cellSize) * 0.45 : 0;
    const px = groundPx;
    const py = groundPy - flyOffset;

    // Sombra no Chão se estiver Voando
    if (isFlying) {
      ctx.beginPath();
      ctx.ellipse(groundPx, groundPy, radius * 0.75, radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(groundPx, groundPy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.restore();

      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('3m 🕊️', groundPx + radius + 2, (groundPy + py) / 2);
    }

    // Anel do Turno Ativo
    if (activeEntity && activeEntity.id === ent.id) {
      ctx.beginPath();
      ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = ent.type === 'hero' ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Círculo do Token
    const isBlindOnly = isEntityVisibleByBlindFightingOnly(ent);
    const isHidden = ent.conditions?.includes('Invisível');

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = isBlindOnly ? '#111827' : (isHidden ? 'rgba(15, 23, 42, 0.45)' : (ent.color || (ent.type === 'hero' ? '#2563eb' : '#dc2626')));
    ctx.fill();

    ctx.strokeStyle = isHidden ? '#14b8a6' : (isFlying ? '#38bdf8' : (isBlindOnly ? '#e2e8f0' : '#ffffff'));
    ctx.lineWidth = isHidden ? 3 : (isFlying ? 2.5 : 2);
    if (isHidden) {
      ctx.setLineDash([3, 3]);
    }
    ctx.stroke();
    if (isHidden) {
      ctx.setLineDash([]);
    }

    // Ícone do Token
    ctx.font = `${(sizeInSquares * cellSize) * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = isHidden ? 0.5 : 1.0;
    ctx.fillText(isBlindOnly ? '❓' : ent.icon, px, py);
    ctx.globalAlpha = 1.0;

    // Indicador de Cobertura 2D para monstros
    if (ent.type === 'monster' && !ent.isDead) {
      const coverRes = getEntityCover(ent);
      if (coverRes.degree !== 'none') {
        const badgeText = coverRes.degree === 'total' ? '🛡️ Cobertura' : coverRes.acBonus > 0 ? `🛡️ +${coverRes.acBonus} (Cobertura)` : '🛡️ (Cobertura)';
        drawCoverBadge(ctx, px, py, radius, badgeText);
      }
    }

    // Barra de Vida e Condições
    if (!shouldHideEntityDetails(ent)) {
      const barW = (sizeInSquares * cellSize) * 0.8;
      const barH = 5;
      const barX = px - barW / 2;
      const barY = py - radius - 8;

      drawEntityHealthBar(ctx, barX, barY, barW, barH, ent.currentHp, ent.maxHp);
      
      if (ent.conditions && ent.conditions.length > 0) {
        drawConditionIcons(ctx, px, barY - 2, ent.conditions, (sizeInSquares * cellSize) * 0.25);
      }
    }
  });
}
