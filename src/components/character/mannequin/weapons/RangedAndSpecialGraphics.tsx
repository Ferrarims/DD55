import React from 'react';

export function renderRangedOrSpecialGraphic(lower: string, handX: number, hand: 'main' | 'off') {
  const isMain = hand === 'main';

  // 1. ESCUDO
  if (lower.includes('escudo') || lower.includes('shield') || lower.includes('broquel')) {
    const cx = hand === 'main' ? 42 : 198;
    const cy = 230;
    return (
      <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
        <path
          d={`M ${cx - 24} ${cy - 32} L ${cx + 24} ${cy - 32} L ${cx + 20} ${cy + 12} Q ${cx} ${cy + 42} ${cx - 20} ${cy + 12} Z`}
          fill="url(#shieldMetallicGradient)"
          stroke="#f59e0b"
          strokeWidth="2.5"
        />
        <path
          d={`M ${cx - 20} ${cy - 28} L ${cx + 20} ${cy - 28} L ${cx + 17} ${cy + 8} Q ${cx} ${cy + 34} ${cx - 17} ${cy + 8} Z`}
          fill="rgba(15, 23, 42, 0.85)"
          stroke="#fbbf24"
          strokeWidth="1.5"
        />
        <circle cx={cx} cy={cy - 8} r="10" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        <path d={`M ${cx - 4} ${cy - 8} L ${cx + 4} ${cy - 8} M ${cx} ${cy - 12} L ${cx} ${cy - 4}`} stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy - 8} r="3" fill="#fef08a" />
      </g>
    );
  }

  // 2. LANTERNA
  if (lower.includes('lanterna') || lower.includes('lantern') || lower.includes('facho') || lower.includes('foco') || lower.includes('lampada') || lower.includes('lamp')) {
    const lx = handX;
    const ly = 225;
    const beamPath = isMain
      ? "M 20 215 L -80 120 L -80 330 Z"
      : "M 220 215 L 320 120 L 320 330 Z";
    
    return (
      <g className="drop-shadow-[0_0_20px_rgba(253,224,71,0.9)]">
        <path d={beamPath} fill={isMain ? "url(#lanternBeamLeft)" : "url(#lanternBeamRight)"} className="animate-pulse" />
        <rect x={lx - 10} y={ly - 18} width="20" height="26" rx="4" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        <rect x={lx - 7} y={ly - 14} width="14" height="18" rx="2" fill="#fef08a" stroke="#fbbf24" strokeWidth="1" />
        <circle cx={lx} cy={ly - 5} r="4" fill="#ffffff" className="animate-ping" />
        <circle cx={lx} cy={ly - 5} r="3" fill="#fef08a" />
        <path d={`M ${lx - 8} ${ly - 18} Q ${lx} ${ly - 28} ${lx + 8} ${ly - 18}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <rect x={lx - 11} y={ly + 8} width="22" height="4" rx="1" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
      </g>
    );
  }

  // 3. TOCHA / VELA
  if (lower.includes('tocha') || lower.includes('torch') || lower.includes('vela') || lower.includes('candle')) {
    const tx = handX;
    const torchBeam = isMain
      ? "M 30 140 L -60 50 L -60 250 Z"
      : "M 210 140 L 300 50 L 300 250 Z";
    return (
      <g className="drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]">
        <path d={torchBeam} fill={isMain ? "url(#torchBeamLeft)" : "url(#torchBeamRight)"} className="opacity-80 animate-pulse" />
        <line x1={tx} y1="160" x2={tx} y2="270" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <rect x={tx - 8} y="150" width="16" height="20" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
        <path d={`M ${tx - 12} 150 Q ${tx - 18} 110 ${tx} 90 Q ${tx + 18} 110 ${tx + 12} 150 Z`} fill="url(#fireGradient)" />
        <path d={`M ${tx - 7} 150 Q ${tx - 10} 125 ${tx} 110 Q ${tx + 10} 125 ${tx + 7} 150 Z`} fill="#fef08a" />
      </g>
    );
  }

  // 4. TRIDENTE
  if (lower.includes('tridente') || lower.includes('trident')) {
    const tx = handX;
    return (
      <g className="drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]">
        <line x1={tx} y1="30" x2={tx} y2="335" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        <line x1={tx} y1="30" x2={tx} y2="335" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
        <polygon points={`${tx},18 ${tx - 5},52 ${tx + 5},52`} fill="url(#steelGradient)" stroke="#38bdf8" strokeWidth="1.5" />
        <path d={`M ${tx - 18} 42 Q ${tx - 18} 22 ${tx - 12} 20 L ${tx - 8} 52 Z`} fill="url(#steelGradient)" stroke="#38bdf8" strokeWidth="1.5" />
        <path d={`M ${tx + 18} 42 Q ${tx + 18} 22 ${tx + 12} 20 L ${tx + 8} 52 Z`} fill="url(#steelGradient)" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x={tx - 18} y="52" width="36" height="6" rx="2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        <circle cx={tx} cy="38" r="4" fill="#38bdf8" />
      </g>
    );
  }

  // 5. ALABARDA
  if (lower.includes('alabarda') || lower.includes('halberd')) {
    const hx = handX;
    return (
      <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
        <line x1={hx} y1="25" x2={hx} y2="340" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
        <polygon points={`${hx},12 ${hx - 6},55 ${hx + 6},55`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        {isMain ? (
          <path d="M 30 55 C 5 45, -5 65, 0 98 C 10 108, 30 88, 30 88 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
        ) : (
          <path d="M 210 55 C 235 45, 245 65, 240 98 C 230 108, 210 88, 210 88 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
        )}
        {isMain ? (
          <path d="M 30 65 Q 48 68 52 82 L 30 78 Z" fill="#94a3b8" stroke="#f59e0b" strokeWidth="1" />
        ) : (
          <path d="M 210 65 Q 192 68 188 82 L 210 78 Z" fill="#94a3b8" stroke="#f59e0b" strokeWidth="1" />
        )}
      </g>
    );
  }

  // 6. LANÇA / PIQUE / AZAGAIA
  if (lower.includes('lanca') || lower.includes('lança') || lower.includes('spear') || lower.includes('pique') || lower.includes('pike') || lower.includes('javelin') || lower.includes('azagaia')) {
    const lx = handX;
    return (
      <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
        <line x1={lx} y1="30" x2={lx} y2="340" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        <line x1={lx} y1="30" x2={lx} y2="340" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
        <path d={`M ${lx} 18 Q ${lx - 12} 45 ${lx - 5} 68 L ${lx + 5} 68 Q ${lx + 12} 45 ${lx} 18 Z`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1={lx} y1="20" x2={lx} y2="68" stroke="#ffffff" strokeWidth="1.5" />
        <path d={`M ${lx - 6} 68 L ${lx - 10} 92 L ${lx} 85 L ${lx + 10} 92 L ${lx + 6} 68 Z`} fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
      </g>
    );
  }

  // 7. ZARABATANA
  if (lower.includes('zarabatana') || lower.includes('blowgun') || lower.includes('blowpipe')) {
    const zx = handX;
    const dartX = isMain ? zx - 35 : zx + 35;
    return (
      <g className="drop-shadow-[0_0_14px_rgba(74,222,128,0.85)]">
        <line x1={zx} y1="130" x2={zx} y2="280" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
        <line x1={zx} y1="130" x2={zx} y2="280" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={zx} cy="160" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx={zx} cy="200" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx={zx} cy="240" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <ellipse cx={zx} cy="280" rx="6" ry="3" fill="#b45309" stroke="#fbbf24" strokeWidth="1" />
        <line x1={zx} y1="130" x2={dartX} y2="95" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points={`${dartX},90 ${dartX - 4},98 ${dartX + 4},98`} fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        <circle cx={dartX} cy="99" r="2.5" fill="#fef08a" />
      </g>
    );
  }

  // 8. CAJADO / VARINHA / CETRO
  if (lower.includes('cajado') || lower.includes('staff') || lower.includes('varinha') || lower.includes('wand') || lower.includes('cetro')) {
    const sx = handX;
    return (
      <g className="drop-shadow-[0_0_18px_rgba(56,189,248,0.85)]">
        <line x1={sx} y1="80" x2={sx} y2="315" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        <path d={`M ${sx - 3} 115 Q ${sx + 4} 180 ${sx - 2} 265`} stroke="#b45309" strokeWidth="2" fill="none" />
        <circle cx={sx} cy="78" r="14" fill="url(#magicOrbGradient)" stroke="#fef08a" strokeWidth="2" />
        <circle cx={sx} cy="78" r="18" fill="rgba(56, 189, 248, 0.25)" className="animate-pulse" />
        <ellipse cx={sx} cy="78" rx="22" ry="7" fill="none" stroke="#38bdf8" strokeWidth="1.5" transform={`rotate(25 ${sx} 78)`} />
      </g>
    );
  }

  // 9. ARCO
  if (lower.includes('arco') || lower.includes('bow')) {
    const bowX = isMain ? 24 : 216;
    const arcControl = isMain ? 0 : 240;
    return (
      <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
        <path d={`M ${bowX} 110 Q ${arcControl} 225 ${bowX} 340`} fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        <path d={`M ${bowX} 110 Q ${arcControl} 225 ${bowX} 340`} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={bowX} y1="110" x2={bowX} y2="340" stroke="#fef08a" strokeWidth="1.5" />
        <line x1={isMain ? 8 : 232} y1="225" x2={isMain ? 68 : 172} y2="225" stroke="#fbbf24" strokeWidth="2.5" />
        <polygon points={isMain ? "72,225 62,220 62,230" : "168,225 178,220 178,230"} fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1" />
        <path d={isMain ? "M 10 220 L 4 225 L 10 230" : "M 230 220 L 236 225 L 230 230"} fill="#ef4444" />
      </g>
    );
  }

  // 10. BESTA
  if (lower.includes('besta') || lower.includes('crossbow')) {
    const bx = handX;
    return (
      <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
        <line x1={bx} y1="270" x2={bx} y2="168" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        <path d={`M ${bx - 32} 178 Q ${bx} 162 ${bx + 32} 178`} fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
        <path d={`M ${bx - 31} 178 L ${bx} 205 L ${bx + 31} 178`} fill="none" stroke="#fef08a" strokeWidth="1.5" />
        <line x1={bx} y1="205" x2={bx} y2="150" stroke="#fbbf24" strokeWidth="2.5" />
        <polygon points={`${bx},143 ${bx - 5},154 ${bx + 5},154`} fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1" />
      </g>
    );
  }

  return null;
}
