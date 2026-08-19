import { UseCanvasRendererProps } from './rendererTypes';

interface DrawIsometricEntitiesProps {
  ctx: CanvasRenderingContext2D;
  props: UseCanvasRendererProps;
  mapC: number;
  mapR: number;
  isoX: number;
  topY: number;
  isoTileW: number;
  isoTileH: number;
}

export function drawIsometricEntities({
  ctx,
  props,
  mapC,
  mapR,
  isoX,
  topY,
  isoTileW,
  isoTileH,
}: DrawIsometricEntitiesProps): void {
  const {
    entities,
    character,
    activeLargeForm,
    getEntitySizeInSquares,
    RACES_REFERENCE,
    activeEntity,
    getEntityCover,
    shouldHideEntityDetails,
    isEntityVisible,
  } = props;

  // Renderizar Entidades (Herói e Monstros) no topo do Bloco 3D
  const entsOnCell = entities.filter(e => !e.isDead && e.x === mapC && e.y === mapR && isEntityVisible(e));
  entsOnCell.forEach(ent => {
    // Tamanho em quadrados (ex: 2 para Golias em Forma Grande ou Criaturas Grandes)
    const entSizeInSq = getEntitySizeInSquares(
      ent.type === 'hero'
        ? (activeLargeForm ? 'Grande' : (ent.size || (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')))
        : (ent.size || 'Médio')
    );

    // Escala visual do Token 3D (Golias em Forma Grande cresce drasticamente)
    const scaleFactor = entSizeInSq === 2 ? 1.85 : entSizeInSq === 3 ? 2.5 : entSizeInSq >= 4 ? 3.2 : 1.0;

    // Ajuste do centro isométrico para entidades de tamanho 2x2 ou maior
    const centerShift = (entSizeInSq - 1) * (isoTileH / 2);
    const entIsoX = isoX;
    const entTopY = topY + centerShift;

    const isFlying = Boolean(ent.conditions?.includes('Voando'));
    const flyOffset = isFlying ? isoTileH * 1.5 : 0; // Elevação correspondente a 3m de altura
    const groundY = entTopY + isoTileH * 0.3;
    const entY = groundY - flyOffset;

    // Sombra Elíptica no Chão (escalada para Golias Grande / monstros grandes)
    ctx.beginPath();
    ctx.ellipse(
      entIsoX,
      entTopY + isoTileH * 0.5,
      (isFlying ? isoTileW * 0.22 : isoTileW * 0.32) * scaleFactor,
      (isFlying ? isoTileH * 0.18 : isoTileH * 0.28) * scaleFactor,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = isFlying ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Aura Titânica de Pedras e Ouro quando o Golias está em Forma Grande em 3D
    if (ent.type === 'hero' && activeLargeForm) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(entIsoX, entY + 4, isoTileW * 0.45 * scaleFactor, isoTileH * 0.32 * scaleFactor, 0, 0, Math.PI * 2);
      const goliathGlow = ctx.createRadialGradient(entIsoX, entY + 4, 0, entIsoX, entY + 4, isoTileW * 0.45 * scaleFactor);
      goliathGlow.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      goliathGlow.addColorStop(0.65, 'rgba(217, 119, 6, 0.2)');
      goliathGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = goliathGlow;
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    }

    // Conector Visual de Elevação de Altitude (Linha de Voo 3m)
    if (isFlying) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5 * Math.min(1.5, scaleFactor);
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(entIsoX, entTopY + isoTileH * 0.5);
      ctx.lineTo(entIsoX, entY + 4);
      ctx.stroke();
      ctx.restore();

      // Rótulo de Altitude "3m" no ar
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('3m 🕊️', entIsoX + isoTileW * 0.24 * scaleFactor, (entTopY + isoTileH * 0.5 + entY) / 2);
    }

    // Pedestal / Base 3D do Token
    const tokenBaseColor = ent.type === 'hero' ? (activeLargeForm ? '#b45309' : '#2563eb') : '#dc2626';
    ctx.beginPath();
    ctx.ellipse(entIsoX, entY + 4, isoTileW * 0.28 * scaleFactor, isoTileH * 0.22 * scaleFactor, 0, 0, Math.PI * 2);
    ctx.fillStyle = tokenBaseColor;
    ctx.fill();
    ctx.strokeStyle = isFlying ? '#38bdf8' : (activeLargeForm ? '#fbbf24' : '#ffffff');
    ctx.lineWidth = activeLargeForm ? 3 : (isFlying ? 2 : 1.5);
    ctx.stroke();

    // Anel do Turno Ativo
    if (activeEntity && activeEntity.id === ent.id) {
      ctx.beginPath();
      ctx.ellipse(entIsoX, entY + 4, isoTileW * 0.35 * scaleFactor, isoTileH * 0.28 * scaleFactor, 0, 0, Math.PI * 2);
      ctx.strokeStyle = ent.type === 'hero' ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 3 * Math.min(1.5, scaleFactor);
      ctx.stroke();
    }

    // Ícone Billboard do Token 3D (Cresce em quase 2x para o Golias em Forma Grande)
    ctx.font = `${isoTileH * 1.1 * scaleFactor}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ent.icon, entIsoX, entY - isoTileH * 0.3 * scaleFactor);

    // Indicador de Cobertura 3D para monstros
    if (ent.type === 'monster' && !ent.isDead) {
      const coverRes = getEntityCover(ent);
      if (coverRes.degree !== 'none') {
        ctx.save();
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        const badgeText = coverRes.degree === 'total' ? '🛡️ Cobertura' : coverRes.acBonus > 0 ? `🛡️ +${coverRes.acBonus} (Cobertura)` : '🛡️ (Cobertura)';
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        const textWidth = ctx.measureText(badgeText).width + 8;
        ctx.fillRect(entIsoX - textWidth / 2, entY - isoTileH * 0.75 * scaleFactor - 8, textWidth, 16);
        ctx.strokeRect(entIsoX - textWidth / 2, entY - isoTileH * 0.75 * scaleFactor - 8, textWidth, 16);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(badgeText, entIsoX, entY - isoTileH * 0.75 * scaleFactor);
        ctx.restore();
      }
    }

    // Barra de Vida e Rótulos 3D Flutuantes sobre o Personagem
    if (!shouldHideEntityDetails(ent)) {
      const barW = isoTileW * 0.65 * Math.min(1.6, scaleFactor);
      const barH = 5 * Math.min(1.4, scaleFactor);
      const barX = entIsoX - barW / 2;
      const barY = entY - isoTileH * (0.8 + 0.35 * scaleFactor);

      const hpPercent = Math.max(0, ent.currentHp / ent.maxHp);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpPercent, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(barX, barY, barW, barH);

      // Indicador "FORMA GRANDE" em destaque para o Golias Gigante
      if (ent.type === 'hero' && activeLargeForm) {
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.strokeText('🪨 FORMA GRANDE', entIsoX, barY - 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('🪨 FORMA GRANDE', entIsoX, barY - 12);
        ctx.restore();
      }

      // Condições
      if (ent.conditions && ent.conditions.length > 0) {
        let condIcons = '';
        if (ent.conditions.includes('Amedrontado')) condIcons += '😱';
        if (ent.conditions.includes('Caído')) condIcons += '💥';
        if (ent.conditions.includes('Atordoado')) condIcons += '💫';
        if (ent.conditions.includes('Envenenado')) condIcons += '🤢';
        if (ent.conditions.includes('Voando')) condIcons += '🕊️';
        if (condIcons) {
          ctx.font = `${isoTileH * 0.45 * Math.min(1.3, scaleFactor)}px sans-serif`;
          const condY = (ent.type === 'hero' && activeLargeForm) ? barY - 26 : barY - 4;
          ctx.fillText(condIcons, entIsoX, condY);
        }
      }
    }
  });
}
