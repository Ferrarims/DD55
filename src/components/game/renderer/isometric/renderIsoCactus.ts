export interface IsoPlantRenderParams {
  ctx: CanvasRenderingContext2D;
  objIsoX: number;
  objTopY: number;
  isoTileW: number;
  isoTileH: number;
  scale: number;
  variant: string;
  w: number;
  h: number;
  biome?: string;
  weather?: string;
  isIndoorEnv: boolean;
}

export function drawIsoCactus({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  variant,
  w,
  h,
}: IsoPlantRenderParams): void {
  const isGrove = w >= 2 || h >= 2 || variant.includes('grove');
  const cactusScale = scale;
  const baseY = objTopY + isoTileH * 0.55;
  const cactusH = isoTileH * (isGrove ? 1.9 : 1.35) * (cactusScale / (isGrove ? 1.8 : 1));
  const stemR = isoTileW * (isGrove ? 0.11 : 0.085) * (cactusScale / (isGrove ? 1.8 : 1));
  const stemW = stemR * 2;

  ctx.beginPath();
  ctx.ellipse(objIsoX, baseY + 2, isoTileW * (isGrove ? 0.65 : 0.32), isoTileH * (isGrove ? 0.35 : 0.18), 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  const drawSaguaroStem = (cx: number, cy: number, ch: number, cw: number, hasFlower: boolean) => {
    const topYPos = cy - ch;
    const cr = cw / 2;

    ctx.lineWidth = cw + 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, topYPos);
    ctx.stroke();

    ctx.lineWidth = cw;
    ctx.strokeStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, topYPos);
    ctx.stroke();

    ctx.lineWidth = cw * 0.35;
    ctx.strokeStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(cx + cr * 0.35, cy);
    ctx.lineTo(cx + cr * 0.35, topYPos);
    ctx.stroke();

    ctx.lineWidth = cw * 0.28;
    ctx.strokeStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(cx - cr * 0.35, cy);
    ctx.lineTo(cx - cr * 0.35, topYPos);
    ctx.stroke();

    const armW = cw * 0.78;
    const arm1StartY = cy - ch * 0.45;
    const arm1MidX = cx - isoTileW * 0.18 * (cactusScale / (isGrove ? 1.8 : 1));
    const arm1TopY = cy - ch * 0.8;

    ctx.lineWidth = armW + 2;
    ctx.strokeStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(cx, arm1StartY);
    ctx.quadraticCurveTo(arm1MidX, arm1StartY, arm1MidX, arm1TopY);
    ctx.stroke();

    ctx.lineWidth = armW;
    ctx.strokeStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(cx, arm1StartY);
    ctx.quadraticCurveTo(arm1MidX, arm1StartY, arm1MidX, arm1TopY);
    ctx.stroke();

    if (hasFlower) {
      ctx.beginPath();
      ctx.arc(cx, topYPos - 2, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, topYPos - 2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    }
  };

  if (isGrove) {
    drawSaguaroStem(objIsoX - isoTileW * 0.22, baseY, cactusH * 0.75, stemW * 0.85, false);
    drawSaguaroStem(objIsoX + isoTileW * 0.24, baseY, cactusH * 0.65, stemW * 0.8, true);
    drawSaguaroStem(objIsoX, baseY, cactusH, stemW, true);
  } else {
    drawSaguaroStem(objIsoX, baseY, cactusH, stemW, true);
  }
}
