import { WeatherType, BiomeType } from './types';

export interface WeatherInfo {
  type: WeatherType;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  gameEffects: string[];
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const WEATHER_CONFIGS: Record<WeatherType, WeatherInfo> = {
  clear: {
    type: 'clear',
    label: 'Limpo',
    icon: '☀️',
    tagline: 'Céu aberto e visibilidade padrão',
    description: 'Sem alterações climáticas ou penalidades no mapa.',
    gameEffects: [
      'Visibilidade normal em todo o alcance',
      'Movimentação e ataques sem penalidades climáticas'
    ],
    color: 'text-amber-300',
    badgeBg: 'bg-amber-950/50',
    badgeBorder: 'border-amber-500/40'
  },
  rain: {
    type: 'rain',
    label: 'Chuva',
    icon: '🌧️',
    tagline: 'Chuva constante e terreno úmido',
    description: 'Gotas de chuva refrescam o campo de batalha. Visão além de 18m (12 quadrados) fica levemente obscurecida e superfícies ficam úmidas.',
    gameEffects: [
      'Gotas e poças de água dinâmicas caindo sobre o mapa',
      'Leve obscurecimento para alvos a longa distância (>18m)',
      'Superfície úmida facilita apagar chamas e reduz propagação de fogo'
    ],
    color: 'text-sky-300',
    badgeBg: 'bg-sky-950/60',
    badgeBorder: 'border-sky-500/50'
  },
  snow: {
    type: 'snow',
    label: 'Neve',
    icon: '❄️',
    tagline: 'Nevasca e frio cortante',
    description: 'Flocos de neve acumulam sobre o terreno. O frio intenso causa lentidão no deslocamento terrestre.',
    gameEffects: [
      'Flocos de neve flutuantes com névoa e geada gelada',
      'Frio Intenso: Deslocamento no solo reduzido em 1,5m (1 quadrado)',
      'Resistência natural a calor e bônus sutil a danos congelantes'
    ],
    color: 'text-cyan-200',
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-400/50'
  },
  wind: {
    type: 'wind',
    label: 'Vento',
    icon: '💨',
    tagline: 'Rajadas fortes e folhas voando',
    description: 'Ventos fortes sopram pelo campo de batalha. Ataques à distância com projéteis sofrem turbulência.',
    gameEffects: [
      'Folhas, poeira e linhas de vento em alta velocidade',
      'Vento Forte (D&D 5.5e): Desvantagem em projéteis além de 6m (4 quadrados)',
      'Voo contra a direção do vento consome o dobro de movimento'
    ],
    color: 'text-teal-300',
    badgeBg: 'bg-teal-950/60',
    badgeBorder: 'border-teal-500/50'
  },
  storm: {
    type: 'storm',
    label: 'Tempestade',
    icon: '⛈️',
    tagline: 'Chuva torrencial e relâmpagos',
    description: 'Tempestade severa com chuva pesada, rajadas de vento tempestuosas e relâmpagos que iluminam o mapa inteiro.',
    gameEffects: [
      'Chuva torrencial veloz e relâmpagos com trovões estrondosos',
      'Clarões dos raios iluminam temporariamente todo o mapa mesmo à noite',
      'Desvantagem em ataques à distância com armas de projéteis',
      'Percepção auditiva e visual reduzida além de 9m (6 quadrados)'
    ],
    color: 'text-indigo-300',
    badgeBg: 'bg-indigo-950/70',
    badgeBorder: 'border-indigo-500/60'
  },
  fog: {
    type: 'fog',
    label: 'Neblina',
    icon: '🌫️',
    tagline: 'Névoa densa e visibilidade reduzida',
    description: 'Bancos espessos de névoa cobrem a arena. A visão é limitada a curta distância e ataques distantes ficam fortemente obscurecidos.',
    gameEffects: [
      'Camadas volumétricas de névoa em deslocamento contínuo',
      'Obscurecimento Pesado (D&D 5.5e) além de 9m (6 quadrados)',
      'Ataques contra criaturas além de 9m sofrem Desvantagem por baixa visibilidade'
    ],
    color: 'text-slate-300',
    badgeBg: 'bg-slate-900/80',
    badgeBorder: 'border-slate-500/50'
  }
};

// Determina modificadores de rolagem com base no clima
export function getWeatherRollModifiers(
  weather: WeatherType,
  isRanged: boolean,
  distanceInCells: number,
  biome?: BiomeType,
  isPureProjectileWeapon: boolean = false
): { hasDisadvantage: boolean; reason?: string } {
  // Cavernas e Masmorras são subterrâneas/fechadas e não sofrem efeitos climáticos externos
  if (biome === 'Caverna' || biome === 'Masmorra') {
    return { hasDisadvantage: false };
  }

  // No Deserto, chuva, neve, tempestade e neblina não existem (apenas vento / tempestade de areia)
  if (biome === 'Deserto' && weather !== 'wind') {
    return { hasDisadvantage: false };
  }

  if (weather === 'wind' && isRanged && (isPureProjectileWeapon || distanceInCells > 4)) {
    return {
      hasDisadvantage: true,
      reason: 'Vento Forte (Desvantagem em projéteis a distância)'
    };
  }

  if (weather === 'storm' && isRanged && distanceInCells > 3) {
    return {
      hasDisadvantage: true,
      reason: 'Tempestade Severa (Chuva pesada e vento com desvantagem a distância)'
    };
  }

  if (weather === 'fog' && isRanged && distanceInCells > 6) {
    return {
      hasDisadvantage: true,
      reason: 'Neblina Densa (Obscurecimento pesado além de 9m)'
    };
  }

  return { hasDisadvantage: false };
}

// Renderização dos efeitos de partículas e atmosfera de Clima no Canvas
export function drawWeatherOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: WeatherType,
  isNight: boolean | number,
  biome: BiomeType,
  is3dMode: boolean,
  timeMs: number
) {
  // Ambientes fechados e subterrâneos (Cavernas e Masmorras) não têm clima externo (chuva, neve, vento, tempestade, etc.)
  if (weather === 'clear' || biome === 'Caverna' || biome === 'Masmorra') return;

  // No Deserto, apenas vento / ventania de areia ocorre (chuva, neve, tempestade e neblina são bloqueadas)
  if (biome === 'Deserto' && weather !== 'wind') return;

  const isNightBool = typeof isNight === 'number' ? isNight > 0.5 : isNight;

  ctx.save();

  // 1. CHUVA (RAIN)
  if (weather === 'rain') {
    // Leve filtro atmosférico azulado/úmido
    ctx.fillStyle = isNightBool ? 'rgba(15, 23, 42, 0.18)' : 'rgba(30, 58, 138, 0.08)';
    ctx.fillRect(0, 0, width, height);

    const rainDropCount = is3dMode ? 160 : 130;
    const slantX = is3dMode ? 0.35 : 0.22;
    const dropSpeed = 0.75;
    const dropLen = is3dMode ? 18 : 14;

    ctx.strokeStyle = isNightBool ? 'rgba(186, 230, 253, 0.45)' : 'rgba(147, 197, 253, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();

    for (let i = 0; i < rainDropCount; i++) {
      const seedX = (i * 997 + 123) % width;
      const seedY = (i * 613 + 456) % height;
      const speedMult = 0.85 + (i % 5) * 0.08;

      const curY = (seedY + timeMs * dropSpeed * speedMult) % (height + 40) - 20;
      const curX = (seedX + curY * slantX) % width;

      ctx.moveTo(curX, curY);
      ctx.lineTo(curX + dropLen * slantX, curY + dropLen);
    }
    ctx.stroke();

    // Pequenas ondulações/gotas caindo no chão
    ctx.strokeStyle = isNightBool ? 'rgba(186, 230, 253, 0.25)' : 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.0;
    const rippleCount = 14;
    for (let i = 0; i < rippleCount; i++) {
      const rippleTime = (timeMs * 0.002 + i * 0.3) % 1;
      const rx = (i * 733 + 89) % (width - 40) + 20;
      const ry = (i * 421 + 177) % (height - 60) + 30;
      const radius = rippleTime * (is3dMode ? 14 : 10);
      const alpha = (1 - rippleTime) * 0.5;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      if (is3dMode) {
        ctx.ellipse(rx, ry, radius * 1.6, radius * 0.8, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // 2. NEVE (SNOW)
  else if (weather === 'snow') {
    // Filtro gelado e vinheta fria
    const frostGrad = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.4,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    frostGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
    frostGrad.addColorStop(1, isNightBool ? 'rgba(147, 197, 253, 0.18)' : 'rgba(224, 242, 254, 0.22)');
    ctx.fillStyle = frostGrad;
    ctx.fillRect(0, 0, width, height);

    const snowCount = is3dMode ? 140 : 110;
    const fallSpeed = 0.12;

    for (let i = 0; i < snowCount; i++) {
      const seedX = (i * 853 + 71) % width;
      const seedY = (i * 479 + 233) % height;
      const sizeType = i % 4; // 0, 1, 2, 3
      const radius = sizeType === 3 ? 3.0 : sizeType === 2 ? 2.2 : sizeType === 1 ? 1.6 : 1.1;
      const speedMult = 0.6 + (i % 6) * 0.12;
      const swayOffset = Math.sin(timeMs * 0.0018 + i * 2.1) * (12 + (i % 8) * 3);

      const curY = (seedY + timeMs * fallSpeed * speedMult) % (height + 20) - 10;
      const curX = (seedX + swayOffset + (curY * 0.1)) % width;

      ctx.fillStyle = isNightBool
        ? (sizeType >= 2 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(224, 242, 254, 0.65)')
        : (sizeType >= 2 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(241, 245, 249, 0.8)');

      ctx.beginPath();
      ctx.arc(curX < 0 ? curX + width : curX, curY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. VENTO (WIND)
  else if (weather === 'wind') {
    // Linhas aerodinâmicas de rajada de vento
    const gustCount = 12;
    ctx.strokeStyle = isNightBool ? 'rgba(203, 213, 225, 0.25)' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.8;

    for (let i = 0; i < gustCount; i++) {
      const gustCycle = (timeMs * 0.0006 + i * 0.16) % 1;
      const startX = gustCycle * (width + 300) - 200;
      const startY = ((i * 389 + 50) % (height - 80)) + Math.sin(timeMs * 0.003 + i) * 15;
      const gustLen = 90 + (i % 4) * 40;

      ctx.save();
      ctx.globalAlpha = Math.sin(gustCycle * Math.PI) * 0.8;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + gustLen * 0.35, startY - 8,
        startX + gustLen * 0.7, startY + 8,
        startX + gustLen, startY
      );
      ctx.stroke();
      ctx.restore();
    }

    // Folhas e detritos voando em alta velocidade
    const leafCount = 36;
    for (let i = 0; i < leafCount; i++) {
      const leafCycle = (timeMs * 0.0008 * (1 + (i % 4) * 0.2) + i * 0.1) % 1;
      const lx = leafCycle * (width + 200) - 100;
      const ly = ((i * 547 + 73) % height) + Math.sin(timeMs * 0.004 + i) * 25;
      const rot = timeMs * 0.006 + i * 1.5;

      // Cor da folha varia com base no bioma
      let leafColor = '#84cc16'; // Verde floresta
      if (biome === 'Deserto') leafColor = '#f59e0b'; // Poeira / palha dourada
      else if (biome === 'Pântano') leafColor = '#0d9488'; // Alga / lodo escuro
      else if (i % 3 === 0) leafColor = '#eab308'; // Folha amarela
      else if (i % 3 === 1) leafColor = '#f97316'; // Folha laranja

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      ctx.fillStyle = leafColor;
      ctx.globalAlpha = 0.85;

      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 4. TEMPESTADE (STORM)
  else if (weather === 'storm') {
    // Céu e atmosfera tempestuosa pesada
    ctx.fillStyle = isNightBool ? 'rgba(2, 6, 23, 0.42)' : 'rgba(15, 23, 42, 0.28)';
    ctx.fillRect(0, 0, width, height);

    // Chuva torrencial pesada
    const heavyRainCount = is3dMode ? 240 : 180;
    const slantX = 0.45;
    const dropSpeed = 1.15;
    const dropLen = is3dMode ? 26 : 20;

    ctx.strokeStyle = isNightBool ? 'rgba(199, 210, 254, 0.55)' : 'rgba(165, 180, 252, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    for (let i = 0; i < heavyRainCount; i++) {
      const seedX = (i * 797 + 91) % width;
      const seedY = (i * 521 + 317) % height;
      const speedMult = 0.9 + (i % 4) * 0.15;

      const curY = (seedY + timeMs * dropSpeed * speedMult) % (height + 50) - 25;
      const curX = (seedX + curY * slantX) % width;

      ctx.moveTo(curX, curY);
      ctx.lineTo(curX + dropLen * slantX, curY + dropLen);
    }
    ctx.stroke();

    // Vento tempestuoso horizontal
    ctx.strokeStyle = 'rgba(224, 231, 255, 0.3)';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 8; i++) {
      const windCycle = (timeMs * 0.001 + i * 0.22) % 1;
      const wx = windCycle * (width + 300) - 150;
      const wy = (i * 613) % height;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + 120, wy + 15);
      ctx.stroke();
    }

    // RELÂMPAGOS PROCEDURAIS (LIGHTNING FLASHES & BOLTS)
    // Dispara relâmpago a cada ~5.5 segundos com duração de ~300ms
    const cyclePeriod = 5500;
    const cycleTime = timeMs % cyclePeriod;
    const isLightningActive = cycleTime < 320;

    if (isLightningActive) {
      const flashStage = cycleTime / 320; // 0 a 1
      let flashIntensity = 0;
      if (flashStage < 0.2) {
        flashIntensity = flashStage / 0.2; // Flash in rápido
      } else if (flashStage < 0.45) {
        flashIntensity = 1.0; // Pico
      } else {
        flashIntensity = 1.0 - (flashStage - 0.45) / 0.55; // Fade out
      }

      // 1. Clarão de tela inteiro
      ctx.save();
      ctx.fillStyle = `rgba(240, 249, 255, ${0.55 * flashIntensity})`;
      ctx.fillRect(0, 0, width, height);

      // 2. Raio elétrico ramificado desenhado no céu/canvas
      const boltStartX = (width * 0.3) + ((Math.floor(timeMs / cyclePeriod) * 317) % (width * 0.45));
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(boltStartX, 0);

      let curBx = boltStartX;
      let curBy = 0;
      const segments = 10;
      const segHeight = (height * 0.7) / segments;

      for (let s = 1; s <= segments; s++) {
        const segProgress = s / segments;
        if (segProgress > flashStage * 1.5) break;

        const jitter = (Math.sin(s * 17 + timeMs * 0.05) * 28);
        curBx += jitter;
        curBy += segHeight;
        ctx.lineTo(curBx, curBy);

        // Ramificação secundária
        if (s === 4 || s === 7) {
          ctx.moveTo(curBx, curBy);
          ctx.lineTo(curBx + jitter * 1.5, curBy + segHeight * 0.8);
          ctx.moveTo(curBx, curBy);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // 5. NEBLINA (FOG)
  else if (weather === 'fog') {
    // Camadas de névoa volumétrica suave flutuando pelo mapa
    const fogBankCount = 8;
    const fogSpeed = 0.015;

    for (let i = 0; i < fogBankCount; i++) {
      const bankCycle = (timeMs * fogSpeed * 0.001 + i * 0.28) % 1;
      const cx = bankCycle * (width + 600) - 300;
      const cy = ((i * 431 + 80) % height) + Math.sin(timeMs * 0.001 + i) * 20;
      const radiusX = 220 + (i % 4) * 60;
      const radiusY = 130 + (i % 3) * 40;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusX);
      const alphaCenter = isNightBool ? 0.28 : 0.35;
      grad.addColorStop(0, `rgba(226, 232, 240, ${alphaCenter})`);
      grad.addColorStop(0.55, `rgba(203, 213, 225, ${alphaCenter * 0.45})`);
      grad.addColorStop(1, 'rgba(203, 213, 225, 0)');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Vinheta de névoa periférica constante
    const fogVignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.35,
      width / 2, height / 2, Math.max(width, height) * 0.8
    );
    fogVignette.addColorStop(0, 'rgba(203, 213, 225, 0)');
    fogVignette.addColorStop(1, isNightBool ? 'rgba(15, 23, 42, 0.45)' : 'rgba(226, 232, 240, 0.45)');
    ctx.fillStyle = fogVignette;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}
