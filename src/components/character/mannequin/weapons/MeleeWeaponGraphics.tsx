import React from 'react';

export function renderMeleeGraphic(lower: string, handX: number, hand: 'main' | 'off') {
  const isMain = hand === 'main';

  // 1. MANGUAL / ESTRELA DA MANHÃ
  if (lower.includes('magual') || lower.includes('mangual') || lower.includes('flail') || lower.includes('estrela da manha') || lower.includes('morningstar')) {
    const fx = handX;
    const ballX = isMain ? 10 : 230;
    const ballY = 142;
    return (
      <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
        <line x1={fx} y1="185" x2={fx} y2="270" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <line x1={fx} y1="210" x2={fx} y2="245" stroke="#b45309" strokeWidth="7" />
        <circle cx={fx} cy="180" r="5" fill="none" stroke="#f59e0b" strokeWidth="2" />
        <path d={`M ${fx} 175 Q ${isMain ? fx - 10 : fx + 10} 158 ${ballX} ${ballY}`} fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="3 3" />
        <circle cx={ballX} cy={ballY} r="14" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
        <polygon points={`${ballX},${ballY - 22} ${ballX - 4},${ballY - 12} ${ballX + 4},${ballY - 12}`} fill="#f59e0b" />
        <polygon points={`${ballX},${ballY + 22} ${ballX - 4},${ballY + 12} ${ballX + 4},${ballY + 12}`} fill="#f59e0b" />
        <polygon points={`${ballX - 22},${ballY} ${ballX - 12},${ballY - 4} ${ballX - 12},${ballY + 4}`} fill="#f59e0b" />
        <polygon points={`${ballX + 22},${ballY} ${ballX + 12},${ballY - 4} ${ballX + 12},${ballY + 4}`} fill="#f59e0b" />
        <polygon points={`${ballX - 15},${ballY - 15} ${ballX - 8},${ballY - 6} ${ballX - 4},${ballY - 10}`} fill="#f59e0b" />
        <polygon points={`${ballX + 15},${ballY - 15} ${ballX + 8},${ballY - 6} ${ballX + 4},${ballY - 10}`} fill="#f59e0b" />
        <circle cx={ballX} cy={ballY} r="5" fill="#fef08a" />
      </g>
    );
  }

  // 2. FOICE
  if (lower.includes('foice') || lower.includes('scythe') || lower.includes('sickle')) {
    const sx = handX;
    return (
      <g className="drop-shadow-[0_0_16px_rgba(239,68,68,0.85)]">
        <line x1={sx} y1="40" x2={sx} y2="330" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
        {isMain ? (
          <path d="M 30 40 C -25 25, -45 80, -20 120 C -15 100, -10 65, 30 50 Z" fill="url(#steelGradient)" stroke="#ef4444" strokeWidth="2" />
        ) : (
          <path d="M 210 40 C 265 25, 285 80, 260 120 C 255 100, 250 65, 210 50 Z" fill="url(#steelGradient)" stroke="#ef4444" strokeWidth="2" />
        )}
        <circle cx={sx} cy="40" r="5" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
      </g>
    );
  }

  // 3. MACHADINHA / MACHADO DE MÃO
  if (lower.includes('machadinha') || lower.includes('handaxe') || lower.includes('hatchet') || lower.includes('machado de mão') || lower.includes('machado de mao')) {
    const hx = handX;
    return (
      <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]">
        <line x1={hx} y1="165" x2={hx} y2="255" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
        <line x1={hx} y1="210" x2={hx} y2="235" stroke="#b45309" strokeWidth="5.5" />
        {isMain ? (
          <path d="M 30 165 C 10 156, 4 175, 8 198 C 14 210, 30 200, 30 200 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        ) : (
          <path d="M 210 165 C 230 156, 236 175, 232 198 C 226 210, 210 200, 210 200 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        )}
        <circle cx={hx} cy="165" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      </g>
    );
  }

  // 4. MACHADO DE BATALHA / MACHADO GRANDE
  if (lower.includes('machado') || lower.includes('axe')) {
    const ax = handX;
    return (
      <g className="drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]">
        <line x1={ax} y1="125" x2={ax} y2="285" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
        <line x1={ax} y1="210" x2={ax} y2="245" stroke="#b45309" strokeWidth="6.5" />
        {isMain ? (
          <path d="M 30 130 C 2 118, -8 145, -2 182 C 5 202, 30 185, 30 185 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
        ) : (
          <path d="M 210 130 C 238 118, 248 145, 242 182 C 235 202, 210 185, 210 185 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
        )}
        <polygon points={isMain ? "30,135 42,152 30,168" : "210,135 198,152 210,168"} fill="#94a3b8" stroke="#f59e0b" strokeWidth="1" />
        <polygon points={`${ax},125 ${ax - 4},112 ${ax + 4},112`} fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1" />
      </g>
    );
  }

  // 5. MARTELO LEVE
  if (lower.includes('martelo leve') || lower.includes('light hammer')) {
    const hx = handX;
    return (
      <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]">
        <line x1={hx} y1="170" x2={hx} y2="255" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
        <rect x={hx - 14} y="168" width="28" height="18" rx="3" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        <polygon points={`${hx + 14},168 ${hx + 22},177 ${hx + 14},186`} fill="#cbd5e1" stroke="#f59e0b" strokeWidth="1" />
        <line x1={hx - 14} y1="177" x2={hx + 14} y2="177" stroke="#fef08a" strokeWidth="1.5" />
      </g>
    );
  }

  // 6. MARTELO DE GUERRA / MAÇA / CLAVA
  if (lower.includes('martelo') || lower.includes('hammer') || lower.includes('maca') || lower.includes('mace') || lower.includes('clava') || lower.includes('club') || lower.includes('marreta')) {
    const hx = handX;
    return (
      <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.75)]">
        <line x1={hx} y1="125" x2={hx} y2="280" stroke="#78350f" strokeWidth="6.5" strokeLinecap="round" />
        <rect x={hx - 22} y="125" width="44" height="30" rx="4" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2.5" />
        <line x1={hx - 22} y1="140" x2={hx + 22} y2="140" stroke="#fef08a" strokeWidth="2" />
        <polygon points={`${hx},112 ${hx - 7},125 ${hx + 7},125`} fill="#f59e0b" />
        <rect x={hx - 26} y="131" width="4" height="18" fill="#f59e0b" />
        <rect x={hx + 22} y="131" width="4" height="18" fill="#f59e0b" />
      </g>
    );
  }

  // 7. ADAGA / FACA
  if (lower.includes('adaga') || lower.includes('dagger') || lower.includes('faca') || lower.includes('dardo')) {
    const dx = handX;
    return (
      <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]">
        <polygon points={`${dx},142 ${dx - 7},200 ${dx + 7},200`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1={dx} y1="145" x2={dx} y2="200" stroke="#ffffff" strokeWidth="1" />
        <path d={`M ${dx - 12} 200 Q ${dx} 196 ${dx + 12} 200`} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1={dx} y1="200" x2={dx} y2="235" stroke="#78350f" strokeWidth="4" />
        <circle cx={dx} cy="238" r="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      </g>
    );
  }

  // 8. ESPADA PADRÃO
  const sx = handX;
  return (
    <g className="drop-shadow-[0_0_14px_rgba(245,158,11,0.75)]">
      <polygon points={`${sx},90 ${sx - 7},200 ${sx + 7},200`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1={sx} y1="98" x2={sx} y2="200" stroke="#ffffff" strokeWidth="1.5" />
      <line x1={sx - 16} y1="200" x2={sx + 16} y2="200" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      <line x1={sx} y1="200" x2={sx} y2="245" stroke="#78350f" strokeWidth="4.5" />
      <circle cx={sx} cy="248" r="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
    </g>
  );
}
