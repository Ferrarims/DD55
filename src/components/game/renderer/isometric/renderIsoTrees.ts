import { IsoPlantRenderParams } from './renderIsoCactus';

export function drawIsoTree({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  variant,
  w,
  h,
  biome,
  weather,
  isIndoorEnv,
}: IsoPlantRenderParams): void {
  const isGiant = w >= 3 || h >= 3 || scale >= 2.5 || variant.includes('giant');
  const isLarge = (w === 2 && h === 2) || scale >= 1.6 || variant.includes('large');
  const treeScale = scale;
  const baseY = objTopY + isoTileH * 0.55;

  // Sombra Projetada no Solo
  ctx.beginPath();
  ctx.ellipse(
    objIsoX,
    baseY + 2,
    isoTileW * (isGiant ? 1.2 : isLarge ? 0.75 : 0.38) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1)),
    isoTileH * (isGiant ? 0.65 : isLarge ? 0.42 : 0.22),
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.fill();

  if (variant === 'pine_tree') {
    const pineH = isoTileH * 1.5 * treeScale;
    const pineW = isoTileW * 0.45 * treeScale;

    ctx.fillStyle = '#451a03';
    ctx.fillRect(objIsoX - isoTileW * 0.04 * treeScale, baseY - pineH * 0.25, isoTileW * 0.08 * treeScale, pineH * 0.25);

    const tiers = [
      { y: baseY - pineH * 0.18, w: pineW * 0.95, h: pineH * 0.35 },
      { y: baseY - pineH * 0.45, w: pineW * 0.75, h: pineH * 0.35 },
      { y: baseY - pineH * 0.72, w: pineW * 0.52, h: pineH * 0.38 }
    ];

    tiers.forEach(({ y, w: tw, h: th }) => {
      ctx.beginPath();
      ctx.moveTo(objIsoX, y - th);
      ctx.lineTo(objIsoX - tw, y);
      ctx.lineTo(objIsoX + tw, y);
      ctx.closePath();
      ctx.fillStyle = '#064e3b';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(objIsoX, y - th);
      ctx.lineTo(objIsoX - tw, y);
      ctx.lineTo(objIsoX, y - th * 0.1);
      ctx.closePath();
      ctx.fillStyle = '#10b981';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(objIsoX, y - th);
      ctx.lineTo(objIsoX + tw, y);
      ctx.lineTo(objIsoX, y - th * 0.1);
      ctx.closePath();
      ctx.fillStyle = '#047857';
      ctx.fill();

      if (!isIndoorEnv && weather === 'snow') {
        ctx.beginPath();
        ctx.moveTo(objIsoX, y - th);
        ctx.lineTo(objIsoX - tw * 0.65, y - th * 0.35);
        ctx.lineTo(objIsoX + tw * 0.65, y - th * 0.35);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });
  } else if (biome === 'Pântano' || variant.includes('swamp') || variant.includes('mangrove')) {
    const trunkW = isoTileW * (isGiant ? 0.22 : isLarge ? 0.14 : 0.09) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
    const trunkH = isoTileH * (isGiant ? 2.8 : isLarge ? 1.8 : 1.1) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
    const trunkTopY = baseY - trunkH;

    ctx.strokeStyle = '#291e0a';
    ctx.lineWidth = trunkW * 0.9;
    ctx.beginPath();
    ctx.moveTo(objIsoX, baseY - trunkH * 0.3);
    ctx.lineTo(objIsoX - trunkW * 2.5, baseY);
    ctx.moveTo(objIsoX, baseY - trunkH * 0.3);
    ctx.lineTo(objIsoX + trunkW * 2.5, baseY);
    ctx.stroke();

    ctx.lineWidth = trunkW * 1.8;
    ctx.beginPath();
    ctx.moveTo(objIsoX, baseY);
    ctx.quadraticCurveTo(objIsoX - isoTileW * 0.15 * treeScale, baseY - trunkH * 0.5, objIsoX, trunkTopY);
    ctx.stroke();

    const swampRadius = isoTileW * (isGiant ? 0.45 : isLarge ? 0.32 : 0.22) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
    const swampClusters = [
      { dx: -swampRadius * 1.1, dy: -trunkH * 0.1, r: swampRadius * 0.95 },
      { dx: swampRadius * 1.1, dy: -trunkH * 0.15, r: swampRadius * 0.9 },
      { dx: -swampRadius * 0.5, dy: -trunkH * 0.45, r: swampRadius * 1.05 },
      { dx: swampRadius * 0.6, dy: -trunkH * 0.4, r: swampRadius * 1.0 },
      { dx: 0, dy: -trunkH * 0.7, r: swampRadius * 1.15 },
    ];

    swampClusters.forEach(({ dx, dy, r }) => {
      const cx = objIsoX + dx;
      const cy = trunkTopY + dy;

      ctx.beginPath();
      ctx.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
      ctx.fillStyle = '#022c22';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#0f766e';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#14b8a6';
      ctx.fill();

      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy + r * 0.5);
      ctx.lineTo(cx - r * 0.3, cy + r * 1.3);
      ctx.moveTo(cx + r * 0.2, cy + r * 0.6);
      ctx.lineTo(cx + r * 0.2, cy + r * 1.4);
      ctx.stroke();
    });
  } else {
    const trunkW = isoTileW * (isGiant ? 0.24 : isLarge ? 0.15 : 0.08) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
    const trunkH = isoTileH * (isGiant ? 2.7 : isLarge ? 1.7 : 1.0) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
    const trunkTopY = baseY - trunkH;

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(objIsoX - trunkW * 2.8, baseY);
    ctx.lineTo(objIsoX - trunkW, baseY - trunkH * 0.2);
    ctx.lineTo(objIsoX + trunkW, baseY - trunkH * 0.2);
    ctx.lineTo(objIsoX + trunkW * 2.8, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.fillRect(objIsoX - trunkW, trunkTopY, trunkW, trunkH);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(objIsoX, trunkTopY, trunkW, trunkH);

    ctx.lineWidth = trunkW * 1.1;
    ctx.strokeStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(objIsoX, trunkTopY + trunkH * 0.35);
    ctx.lineTo(objIsoX - isoTileW * (isGiant ? 0.45 : isLarge ? 0.3 : 0.2), trunkTopY + trunkH * 0.1);
    ctx.moveTo(objIsoX, trunkTopY + trunkH * 0.25);
    ctx.lineTo(objIsoX + isoTileW * (isGiant ? 0.5 : isLarge ? 0.32 : 0.22), trunkTopY);
    ctx.stroke();

    const tuftR = isoTileW * (isGiant ? 0.48 : isLarge ? 0.34 : 0.23) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
    const clusters = [
      { dx: -tuftR * 0.95, dy: -trunkH * 0.15, r: tuftR * 0.95 },
      { dx: tuftR * 1.05, dy: -trunkH * 0.1, r: tuftR * 0.9 },
      { dx: -tuftR * 0.5, dy: -trunkH * 0.45, r: tuftR * 1.08 },
      { dx: tuftR * 0.6, dy: -trunkH * 0.42, r: tuftR * 1.02 },
      { dx: 0, dy: -trunkH * 0.75, r: tuftR * 1.2 },
      { dx: 0, dy: -trunkH * 0.3, r: tuftR * 1.1 },
    ];

    if (isGiant) {
      clusters.push(
        { dx: -tuftR * 1.6, dy: -trunkH * 0.35, r: tuftR * 0.8 },
        { dx: tuftR * 1.7, dy: -trunkH * 0.3, r: tuftR * 0.85 }
      );
    }

    clusters.forEach(({ dx, dy, r }) => {
      const cx = objIsoX + dx;
      const cy = trunkTopY + dy;

      ctx.beginPath();
      ctx.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
      ctx.fillStyle = '#14532d';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#15803d';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = (!isIndoorEnv && weather === 'snow') ? '#ffffff' : '#22c55e';
      ctx.fill();

      ctx.fillStyle = (!isIndoorEnv && weather === 'snow') ? '#f1f5f9' : '#86efac';
      ctx.fillRect(cx - r * 0.3, cy - r * 0.4, 2, 2);
      ctx.fillRect(cx + r * 0.1, cy - r * 0.2, 2, 2);
    });
  }
}
