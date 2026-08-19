import { UseCanvasRendererProps } from './rendererTypes';

export function drawSkyAndAtmosphere(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  props: UseCanvasRendererProps
): void {
  const { biome, nightProgress, weather } = props;
  const isIndoorEnv = biome === 'Caverna' || biome === 'Masmorra';

  // Renderizar Fundo de Atmosfera e Céu (Dia / Crepúsculo / Noite / Subterrâneo) em 3D com transição gradual
  if (nightProgress < 0.99 && !isIndoorEnv) {
    // Céu Diurno / Entardecer / Amanhecer
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (nightProgress > 0.01) {
      // Crepúsculo gradual (tons alaranjados, púrpuras e azuis profundos)
      skyGrad.addColorStop(0, `rgb(${Math.floor(20 + (1 - nightProgress) * 30)}, ${Math.floor(15 + (1 - nightProgress) * 100)}, ${Math.floor(30 + (1 - nightProgress) * 140)})`);
      skyGrad.addColorStop(0.45, `rgb(${Math.floor(140 - nightProgress * 100)}, ${Math.floor(60 + (1 - nightProgress) * 60)}, ${Math.floor(20 + (1 - nightProgress) * 80)})`);
      skyGrad.addColorStop(1, `rgb(${Math.floor(220 - nightProgress * 120)}, ${Math.floor(170 - nightProgress * 100)}, ${Math.floor(100 + nightProgress * 20)})`);
    } else {
      // Dia Pleno
      if (!isIndoorEnv && weather === 'snow') {
        skyGrad.addColorStop(0, '#64748b');
        skyGrad.addColorStop(0.4, '#94a3b8');
        skyGrad.addColorStop(1, '#e2e8f0');
      } else if (biome === 'Floresta') {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.45, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd');
      } else if (biome === 'Deserto') {
        skyGrad.addColorStop(0, '#92400e');
        skyGrad.addColorStop(0.4, '#d97706');
        skyGrad.addColorStop(1, '#fef08a');
      } else if (biome === 'Pântano') {
        skyGrad.addColorStop(0, '#042f2e');
        skyGrad.addColorStop(0.45, '#0f766e');
        skyGrad.addColorStop(1, '#5eead4');
      } else {
        skyGrad.addColorStop(0, '#1e293b');
        skyGrad.addColorStop(1, '#334155');
      }
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol visível com opacidade proporcional (desvanece no crepúsculo)
    if (nightProgress < 0.85) {
      ctx.save();
      const sunX = canvas.width * 0.82;
      const sunY = canvas.height * 0.16;
      const sunAlpha = Math.max(0, 1 - nightProgress * 1.2);
      ctx.globalAlpha = sunAlpha;

      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 140);
      if (weather === 'snow') {
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sunGlow.addColorStop(0.35, 'rgba(226, 232, 240, 0.5)');
        sunGlow.addColorStop(1, 'rgba(226, 232, 240, 0)');
      } else {
        sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        sunGlow.addColorStop(0.35, 'rgba(251, 191, 36, 0.45)');
        sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      }
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Noite Plena ou Subterrâneo
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (isIndoorEnv) {
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(1, '#090d16');
    } else {
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.5, '#090d16');
      skyGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Lua e Estrelas visíveis à noite e no crepúsculo (com opacidade gradual)
  if (nightProgress > 0.15 && !isIndoorEnv) {
    ctx.save();
    const moonX = canvas.width * 0.82;
    const moonY = canvas.height * 0.14;
    const moonAlpha = Math.min(1, (nightProgress - 0.15) / 0.4);
    ctx.globalAlpha = Math.max(0, moonAlpha);

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 70);
    moonGlow.addColorStop(0, 'rgba(241, 245, 249, 0.9)');
    moonGlow.addColorStop(0.3, 'rgba(203, 213, 225, 0.4)');
    moonGlow.addColorStop(1, 'rgba(148, 163, 184, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const starList = [
      [0.12, 0.08], [0.24, 0.16], [0.38, 0.06], [0.48, 0.22], [0.58, 0.1],
      [0.68, 0.18], [0.78, 0.05], [0.88, 0.25], [0.95, 0.12], [0.18, 0.28]
    ];
    starList.forEach(([sx, sy]) => {
      ctx.fillRect(canvas.width * sx, canvas.height * sy, 2, 2);
    });
    ctx.restore();
  }
}
