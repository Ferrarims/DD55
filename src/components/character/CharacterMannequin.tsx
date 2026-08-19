import React from 'react';
import { isTwoHandedWeapon } from '../../lib/mechanics/acCalculator';

interface CharacterMannequinProps {
  character?: any;
  equipmentSlots: Record<string, string | null>;
  onSlotClick?: (slotKey: string) => void;
  className?: string;
  showLabels?: boolean;
}

export const CharacterMannequin: React.FC<CharacterMannequinProps> = ({
  character,
  equipmentSlots = {},
  onSlotClick,
  className = '',
  showLabels = false,
}) => {
  // Helpers para identificar tipo de equipamento
  const getSlotItem = (key: string) => equipmentSlots[key] || null;

  const mainHandItem = getSlotItem('empunhadura_1');
  const offHandItem = getSlotItem('empunhadura_2');

  const isMain2H = mainHandItem ? isTwoHandedWeapon(mainHandItem) : false;
  const isOff2H = offHandItem ? isTwoHandedWeapon(offHandItem) : false;

  // Renderizar a arma/escudo/item gráfico da empunhadura
  const renderWeaponGraphic = (itemName: string | null, hand: 'main' | 'off') => {
    if (!itemName) return null;
    const lower = itemName.toLowerCase();
    
    // Coordenadas base da mão:
    // Mão Principal (Esquerda do visual / Mão direita do personagem): x = 30, y = 225
    // Mão Secundária (Direita do visual / Mão esquerda do personagem): x = 210, y = 225
    const handX = hand === 'main' ? 30 : 210;
    const handY = 225;

    // 1. ESCUDO (SHIELD / BROQUEL / TOWER SHIELD)
    if (lower.includes('escudo') || lower.includes('shield') || lower.includes('broquel')) {
      const cx = hand === 'main' ? 42 : 198;
      const cy = 230;
      return (
        <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
          {/* Corpo do Escudo em Formato Pipa/Aquecedor */}
          <path
            d={`M ${cx - 24} ${cy - 32} L ${cx + 24} ${cy - 32} L ${cx + 20} ${cy + 12} Q ${cx} ${cy + 42} ${cx - 20} ${cy + 12} Z`}
            fill="url(#shieldMetallicGradient)"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          {/* Borda Reforçada */}
          <path
            d={`M ${cx - 20} ${cy - 28} L ${cx + 20} ${cy - 28} L ${cx + 17} ${cy + 8} Q ${cx} ${cy + 34} ${cx - 17} ${cy + 8} Z`}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
          {/* Umbo Central (Boss) com Brasão Mágico */}
          <circle cx={cx} cy={cy - 8} r="10" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="1.5" />
          <path d={`M ${cx - 4} ${cy - 8} L ${cx + 4} ${cy - 8} M ${cx} ${cy - 12} L ${cx} ${cy - 4}`} stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy - 8} r="3" fill="#fef08a" />
        </g>
      );
    }

    // 2. LANTERNA COM FACHO DE LUZ (LANTERN / FLASHLIGHT / LAMPADA)
    if (lower.includes('lanterna') || lower.includes('lantern') || lower.includes('facho') || lower.includes('foco') || lower.includes('lampada') || lower.includes('lamp')) {
      const isMain = hand === 'main';
      const lx = handX;
      const ly = 225;
      const beamPath = isMain
        ? "M 20 215 L -80 120 L -80 330 Z"
        : "M 220 215 L 320 120 L 320 330 Z";
      
      return (
        <g className="drop-shadow-[0_0_20px_rgba(253,224,71,0.9)]">
          {/* Facho Projetado de Luz (Illumination Cone) */}
          <path
            d={beamPath}
            fill={isMain ? "url(#lanternBeamLeft)" : "url(#lanternBeamRight)"}
            className="animate-pulse"
          />
          {/* Corpo Brass da Lanterna */}
          <rect x={lx - 10} y={ly - 18} width="20" height="26" rx="4" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Vidro Interno com Luz Radiante */}
          <rect x={lx - 7} y={ly - 14} width="14" height="18" rx="2" fill="#fef08a" stroke="#fbbf24" strokeWidth="1" />
          {/* Lâmpada/Chama Mística */}
          <circle cx={lx} cy={ly - 5} r="4" fill="#ffffff" className="animate-ping" />
          <circle cx={lx} cy={ly - 5} r="3" fill="#fef08a" />
          {/* Alça e Cúpula da Lanterna */}
          <path d={`M ${lx - 8} ${ly - 18} Q ${lx} ${ly - 28} ${lx + 8} ${ly - 18}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
          <rect x={lx - 11} y={ly + 8} width="22" height="4" rx="1" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
        </g>
      );
    }

    // 3. TOCHA / VELA (TORCH / CANDLE)
    if (lower.includes('tocha') || lower.includes('torch') || lower.includes('vela') || lower.includes('candle')) {
      const tx = handX;
      const isMain = hand === 'main';
      const torchBeam = isMain
        ? "M 30 140 L -60 50 L -60 250 Z"
        : "M 210 140 L 300 50 L 300 250 Z";
      return (
        <g className="drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]">
          {/* Facho do Fogo */}
          <path d={torchBeam} fill={isMain ? "url(#torchBeamLeft)" : "url(#torchBeamRight)"} className="opacity-80 animate-pulse" />
          {/* Haste da Tocha */}
          <line x1={tx} y1="160" x2={tx} y2="270" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          {/* Envoltório de Pano */}
          <rect x={tx - 8} y="150" width="16" height="20" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Chamas Animadas/Vivas */}
          <path d={`M ${tx - 12} 150 Q ${tx - 18} 110 ${tx} 90 Q ${tx + 18} 110 ${tx + 12} 150 Z`} fill="url(#fireGradient)" />
          <path d={`M ${tx - 7} 150 Q ${tx - 10} 125 ${tx} 110 Q ${tx + 10} 125 ${tx + 7} 150 Z`} fill="#fef08a" />
        </g>
      );
    }

    // 4. MANGUAL / MAGUAL / ESTRELA DA MANHÃ (FLAIL / MORNINGSTAR)
    if (lower.includes('magual') || lower.includes('mangual') || lower.includes('flail') || lower.includes('estrela da manha') || lower.includes('morningstar')) {
      const fx = handX;
      const isMain = hand === 'main';
      const ballX = isMain ? 10 : 230;
      const ballY = 142;
      return (
        <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
          {/* Cabo de Madeira Reforçado com Couro */}
          <line x1={fx} y1="185" x2={fx} y2="270" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          <line x1={fx} y1="210" x2={fx} y2="245" stroke="#b45309" strokeWidth="7" />
          {/* Argola da Cabeceira */}
          <circle cx={fx} cy="180" r="5" fill="none" stroke="#f59e0b" strokeWidth="2" />
          {/* Corrente Encurvada de Ferro */}
          <path d={`M ${fx} 175 Q ${isMain ? fx - 10 : fx + 10} 158 ${ballX} ${ballY}`} fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="3 3" />
          {/* Cabeça da Esfera Puntiaguda */}
          <circle cx={ballX} cy={ballY} r="14" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
          {/* Espinhos da Estrela da Manhã */}
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

    // 5. TRIDENTE (TRIDENT)
    if (lower.includes('tridente') || lower.includes('trident')) {
      const tx = handX;
      return (
        <g className="drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]">
          {/* Haste do Tridente */}
          <line x1={tx} y1="30" x2={tx} y2="335" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
          <line x1={tx} y1="30" x2={tx} y2="335" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          {/* Dente Central */}
          <polygon points={`${tx},18 ${tx - 5},52 ${tx + 5},52`} fill="url(#steelGradient)" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Dentes Curvos Laterais */}
          <path d={`M ${tx - 18} 42 Q ${tx - 18} 22 ${tx - 12} 20 L ${tx - 8} 52 Z`} fill="url(#steelGradient)" stroke="#38bdf8" strokeWidth="1.5" />
          <path d={`M ${tx + 18} 42 Q ${tx + 18} 22 ${tx + 12} 20 L ${tx + 8} 52 Z`} fill="url(#steelGradient)" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Base / Conector de Ouro */}
          <rect x={tx - 18} y="52" width="36" height="6" rx="2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
          <circle cx={tx} cy="38" r="4" fill="#38bdf8" />
        </g>
      );
    }

    // 6. ALABARDA (HALBERD)
    if (lower.includes('alabarda') || lower.includes('halberd')) {
      const hx = handX;
      const isMain = hand === 'main';
      return (
        <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
          {/* Haste Longa */}
          <line x1={hx} y1="25" x2={hx} y2="340" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
          {/* Lança de Topo */}
          <polygon points={`${hx},12 ${hx - 6},55 ${hx + 6},55`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Lâmina do Machado de Alabarda */}
          {isMain ? (
            <path d="M 30 55 C 5 45, -5 65, 0 98 C 10 108, 30 88, 30 88 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
          ) : (
            <path d="M 210 55 C 235 45, 245 65, 240 98 C 230 108, 210 88, 210 88 Z" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2" />
          )}
          {/* Gancho Piercing Oposto */}
          {isMain ? (
            <path d="M 30 65 Q 48 68 52 82 L 30 78 Z" fill="#94a3b8" stroke="#f59e0b" strokeWidth="1" />
          ) : (
            <path d="M 210 65 Q 192 68 188 82 L 210 78 Z" fill="#94a3b8" stroke="#f59e0b" strokeWidth="1" />
          )}
        </g>
      );
    }

    // 7. LANÇA / PIQUE / AZAGAIA / JAVELIN (SPEAR / PIKE)
    if (lower.includes('lanca') || lower.includes('lança') || lower.includes('spear') || lower.includes('pique') || lower.includes('pike') || lower.includes('javelin') || lower.includes('azagaia')) {
      const lx = handX;
      return (
        <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
          {/* Haste Longa da Lança */}
          <line x1={lx} y1="30" x2={lx} y2="340" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
          <line x1={lx} y1="30" x2={lx} y2="340" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          {/* Ponta em Folha */}
          <path
            d={`M ${lx} 18 Q ${lx - 12} 45 ${lx - 5} 68 L ${lx + 5} 68 Q ${lx + 12} 45 ${lx} 18 Z`}
            fill="url(#steelGradient)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <line x1={lx} y1="20" x2={lx} y2="68" stroke="#ffffff" strokeWidth="1.5" />
          {/* Borla de Couro Vermelho */}
          <path d={`M ${lx - 6} 68 L ${lx - 10} 92 L ${lx} 85 L ${lx + 10} 92 L ${lx + 6} 68 Z`} fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
        </g>
      );
    }

    // 8. FOICE / GUAIÇARA (SCYTHE / SICKLE)
    if (lower.includes('foice') || lower.includes('scythe') || lower.includes('sickle')) {
      const sx = handX;
      const isMain = hand === 'main';
      return (
        <g className="drop-shadow-[0_0_16px_rgba(239,68,68,0.85)]">
          {/* Cabo Curvo da Foice */}
          <line x1={sx} y1="40" x2={sx} y2="330" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
          {/* Lâmina Sombria em Meia-Lua */}
          {isMain ? (
            <path d="M 30 40 C -25 25, -45 80, -20 120 C -15 100, -10 65, 30 50 Z" fill="url(#steelGradient)" stroke="#ef4444" strokeWidth="2" />
          ) : (
            <path d="M 210 40 C 265 25, 285 80, 260 120 C 255 100, 250 65, 210 50 Z" fill="url(#steelGradient)" stroke="#ef4444" strokeWidth="2" />
          )}
          <circle cx={sx} cy="40" r="5" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
        </g>
      );
    }

    // 9. MACHADINHA / MACHADO DE MÃO (HANDAXE / HATCHET)
    if (lower.includes('machadinha') || lower.includes('handaxe') || lower.includes('hatchet') || lower.includes('machado de mão') || lower.includes('machado de mao')) {
      const hx = handX;
      const isMain = hand === 'main';
      return (
        <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]">
          {/* Cabo Curto e Leve de Madeira */}
          <line x1={hx} y1="165" x2={hx} y2="255" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
          <line x1={hx} y1="210" x2={hx} y2="235" stroke="#b45309" strokeWidth="5.5" />
          {/* Lâmina Compacta de Machadinha */}
          {isMain ? (
            <path
              d="M 30 165 C 10 156, 4 175, 8 198 C 14 210, 30 200, 30 200 Z"
              fill="url(#steelGradient)"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
          ) : (
            <path
              d="M 210 165 C 230 156, 236 175, 232 198 C 226 210, 210 200, 210 200 Z"
              fill="url(#steelGradient)"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
          )}
          {/* Topo Rematado */}
          <circle cx={hx} cy="165" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        </g>
      );
    }

    // 10. MACHADO DE BATALHA / MACHADO GRANDE (AXE / BATTLEAXE / GREATAXE)
    if (lower.includes('machado') || lower.includes('axe')) {
      const ax = handX;
      const isMain = hand === 'main';
      return (
        <g className="drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]">
          {/* Cabo Longo de Madeira com Empunhadura de Couro */}
          <line x1={ax} y1="125" x2={ax} y2="285" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
          <line x1={ax} y1="210" x2={ax} y2="245" stroke="#b45309" strokeWidth="6.5" />
          {/* Lâmina Larga do Machado de Batalha */}
          {isMain ? (
            <path
              d="M 30 130 C 2 118, -8 145, -2 182 C 5 202, 30 185, 30 185 Z"
              fill="url(#steelGradient)"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M 210 130 C 238 118, 248 145, 242 182 C 235 202, 210 185, 210 185 Z"
              fill="url(#steelGradient)"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          )}
          {/* Espigão no Topo */}
          <polygon points={isMain ? "30,135 42,152 30,168" : "210,135 198,152 210,168"} fill="#94a3b8" stroke="#f59e0b" strokeWidth="1" />
          <polygon points={`${ax},125 ${ax - 4},112 ${ax + 4},112`} fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1" />
        </g>
      );
    }

    // 11. ZARABATANA (BLOWGUN / BLOWPIPE)
    if (lower.includes('zarabatana') || lower.includes('blowgun') || lower.includes('blowpipe')) {
      const zx = handX;
      const isMain = hand === 'main';
      const dartX = isMain ? zx - 35 : zx + 35;
      return (
        <g className="drop-shadow-[0_0_14px_rgba(74,222,128,0.85)]">
          {/* Tubo Elegante de Bambu/Cana */}
          <line x1={zx} y1="130" x2={zx} y2="280" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
          <line x1={zx} y1="130" x2={zx} y2="280" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
          {/* Anéis de Bambu/Amarração */}
          <circle cx={zx} cy="160" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx={zx} cy="200" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx={zx} cy="240" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Bocal da Zarabatana */}
          <ellipse cx={zx} cy="280" rx="6" ry="3" fill="#b45309" stroke="#fbbf24" strokeWidth="1" />
          {/* Dardo Venenoso Disparado com Facho de Vento */}
          <line x1={zx} y1="130" x2={dartX} y2="95" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 2" />
          <polygon points={`${dartX},90 ${dartX - 4},98 ${dartX + 4},98`} fill="#22c55e" stroke="#15803d" strokeWidth="1" />
          {/* Pluma Traseira do Dardo */}
          <circle cx={dartX} cy="99" r="2.5" fill="#fef08a" />
        </g>
      );
    }

    // 12. MARTELO LEVE (LIGHT HAMMER - Menor e mais ágil que o Martelo de Guerra)
    if (lower.includes('martelo leve') || lower.includes('light hammer')) {
      const hx = handX;
      return (
        <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]">
          {/* Cabo Curto e Agilizado */}
          <line x1={hx} y1="170" x2={hx} y2="255" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
          {/* Cabeça de Martelo Leve e Compacta */}
          <rect x={hx - 14} y="168" width="28" height="18" rx="3" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Cabeça Penada / Bico de Impacto Oposto */}
          <polygon points={`${hx + 14},168 ${hx + 22},177 ${hx + 14},186`} fill="#cbd5e1" stroke="#f59e0b" strokeWidth="1" />
          <line x1={hx - 14} y1="177" x2={hx + 14} y2="177" stroke="#fef08a" strokeWidth="1.5" />
        </g>
      );
    }

    // 13. MARTELO DE GUERRA / MAÇA / CLAVA / MARRETA (WARHAMMER / MAUL / MACE / CLUB / HAMMER GRANDE)
    if (lower.includes('martelo') || lower.includes('hammer') || lower.includes('maca') || lower.includes('mace') || lower.includes('clava') || lower.includes('club') || lower.includes('marreta')) {
      const hx = handX;
      return (
        <g className="drop-shadow-[0_0_15px_rgba(245,158,11,0.75)]">
          {/* Cabo Longo e Robusto de Guerra */}
          <line x1={hx} y1="125" x2={hx} y2="280" stroke="#78350f" strokeWidth="6.5" strokeLinecap="round" />
          {/* Cabeça Grande Pesada com Ranhuras */}
          <rect x={hx - 22} y="125" width="44" height="30" rx="4" fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1={hx - 22} y1="140" x2={hx + 22} y2="140" stroke="#fef08a" strokeWidth="2" />
          {/* Espigão de Impacto e Dentes Laterais */}
          <polygon points={`${hx},112 ${hx - 7},125 ${hx + 7},125`} fill="#f59e0b" />
          <rect x={hx - 26} y="131" width="4" height="18" fill="#f59e0b" />
          <rect x={hx + 22} y="131" width="4" height="18" fill="#f59e0b" />
        </g>
      );
    }

    // 11. CAJADO / VARINHA / CETRO (STAFF / WAND / SCEPTER)
    if (lower.includes('cajado') || lower.includes('staff') || lower.includes('varinha') || lower.includes('wand') || lower.includes('cetro')) {
      const sx = handX;
      return (
        <g className="drop-shadow-[0_0_18px_rgba(56,189,248,0.85)]">
          {/* Haste de Madeira */}
          <line x1={sx} y1="80" x2={sx} y2="315" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
          <path d={`M ${sx - 3} 115 Q ${sx + 4} 180 ${sx - 2} 265`} stroke="#b45309" strokeWidth="2" fill="none" />
          {/* Orbe Mágico Pulsante */}
          <circle cx={sx} cy="78" r="14" fill="url(#magicOrbGradient)" stroke="#fef08a" strokeWidth="2" />
          <circle cx={sx} cy="78" r="18" fill="rgba(56, 189, 248, 0.25)" className="animate-pulse" />
          {/* Anel Arcano de Órbita */}
          <ellipse cx={sx} cy="78" rx="22" ry="7" fill="none" stroke="#38bdf8" strokeWidth="1.5" transform={`rotate(25 ${sx} 78)`} />
        </g>
      );
    }

    // 12. ARCO (BOW / LONGBOW / SHORTBOW)
    if (lower.includes('arco') || lower.includes('bow')) {
      const isMain = hand === 'main';
      const bowX = isMain ? 24 : 216;
      const arcControl = isMain ? 0 : 240;
      return (
        <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
          {/* Limbo do Arco Recurvo */}
          <path
            d={`M ${bowX} 110 Q ${arcControl} 225 ${bowX} 340`}
            fill="none"
            stroke="#78350f"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d={`M ${bowX} 110 Q ${arcControl} 225 ${bowX} 340`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Corda Tensionada */}
          <line x1={bowX} y1="110" x2={bowX} y2="340" stroke="#fef08a" strokeWidth="1.5" />
          {/* Flecha Nocada */}
          <line x1={isMain ? 8 : 232} y1="225" x2={isMain ? 68 : 172} y2="225" stroke="#fbbf24" strokeWidth="2.5" />
          <polygon
            points={isMain ? "72,225 62,220 62,230" : "168,225 178,220 178,230"}
            fill="#e2e8f0"
            stroke="#f59e0b"
            strokeWidth="1"
          />
          <path d={isMain ? "M 10 220 L 4 225 L 10 230" : "M 230 220 L 236 225 L 230 230"} fill="#ef4444" />
        </g>
      );
    }

    // 13. BESTA (CROSSBOW)
    if (lower.includes('besta') || lower.includes('crossbow')) {
      const bx = handX;
      return (
        <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
          {/* Coronha / Fuste */}
          <line x1={bx} y1="270" x2={bx} y2="168" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
          {/* Arco Transversal */}
          <path d={`M ${bx - 32} 178 Q ${bx} 162 ${bx + 32} 178`} fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          {/* Corda */}
          <path d={`M ${bx - 31} 178 L ${bx} 205 L ${bx + 31} 178`} fill="none" stroke="#fef08a" strokeWidth="1.5" />
          {/* Virote */}
          <line x1={bx} y1="205" x2={bx} y2="150" stroke="#fbbf24" strokeWidth="2.5" />
          <polygon points={`${bx},143 ${bx - 5},154 ${bx + 5},154`} fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1" />
        </g>
      );
    }

    // 14. ADAGA / FACA (DAGGER / KNIFE)
    if (lower.includes('adaga') || lower.includes('dagger') || lower.includes('faca') || lower.includes('dardo')) {
      const dx = handX;
      return (
        <g className="drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]">
          {/* Lâmina Dupla */}
          <polygon points={`${dx},142 ${dx - 7},200 ${dx + 7},200`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1={dx} y1="145" x2={dx} y2="200" stroke="#ffffff" strokeWidth="1" />
          {/* Guarda e Cabo */}
          <path d={`M ${dx - 12} 200 Q ${dx} 196 ${dx + 12} 200`} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <line x1={dx} y1="200" x2={dx} y2="235" stroke="#78350f" strokeWidth="4" />
          <circle cx={dx} cy="238" r="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        </g>
      );
    }

    // 15. ESPADA / CIMITARRA / RAPIERA / GLÁDIO / KATANA (SWORD / LONGSWORD / SCIMITAR)
    const sx = handX;
    return (
      <g className="drop-shadow-[0_0_14px_rgba(245,158,11,0.75)]">
        {/* Lâmina da Espada */}
        <polygon points={`${sx},90 ${sx - 7},200 ${sx + 7},200`} fill="url(#steelGradient)" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1={sx} y1="98" x2={sx} y2="200" stroke="#ffffff" strokeWidth="1.5" />
        {/* Guarda-Mão */}
        <line x1={sx - 16} y1="200" x2={sx + 16} y2="200" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        {/* Cabo e Pomo */}
        <line x1={sx} y1="200" x2={sx} y2="245" stroke="#78350f" strokeWidth="4.5" />
        <circle cx={sx} cy="248" r="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
      </g>
    );
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 400"
        className="w-full h-full max-h-[420px] drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]"
      >
        <defs>
          {/* Gradientes Anatômicos e de Equipamentos */}
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="armorGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#cbd5e1" />
            <stop offset="80%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="shieldMetallicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id="magicOrbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Gradientes do Facho de Luz da Lanterna e Tocha */}
          <linearGradient id="lanternBeamLeft" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.75)" />
            <stop offset="40%" stopColor="rgba(253, 224, 71, 0.4)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>

          <linearGradient id="lanternBeamRight" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.75)" />
            <stop offset="40%" stopColor="rgba(253, 224, 71, 0.4)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>

          <linearGradient id="torchBeamLeft" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="rgba(249, 115, 22, 0.7)" />
            <stop offset="50%" stopColor="rgba(234, 179, 8, 0.35)" />
            <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
          </linearGradient>

          <linearGradient id="torchBeamRight" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(249, 115, 22, 0.7)" />
            <stop offset="50%" stopColor="rgba(234, 179, 8, 0.35)" />
            <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
          </linearGradient>
        </defs>

        {/* Círculos da Aura Mística e Grade de Fundo */}
        <circle cx="120" cy="60" r="38" fill="none" stroke="currentColor" className="text-amber-500/20" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="120" cy="210" r="150" fill="none" stroke="currentColor" className="text-slate-800/50" strokeWidth="1" />
        <line x1="120" y1="20" x2="120" y2="380" stroke="currentColor" className="text-slate-800/30" strokeWidth="0.8" strokeDasharray="2 4" />

        {/* ============================================================ */}
        {/* 1. OMBROS E COSTAS (CAPA / MANTO / CLOAK) - Camada de Fundo */}
        {/* ============================================================ */}
        {getSlotItem('ombros_costas') && (
          <g
            className="cursor-pointer group drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            onClick={() => onSlotClick?.('ombros_costas')}
          >
            {/* Tecido Fluindo da Capa Atrás das Costas */}
            <path
              d="M 75 102 C 55 135, 40 250, 32 360 L 208 360 C 200 250, 185 135, 165 102 Z"
              fill="rgba(120, 53, 15, 0.75)"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Dobras e Sombras do Manto */}
            <path d="M 90 120 C 80 200, 70 290, 65 360" fill="none" stroke="#78350f" strokeWidth="2.5" />
            <path d="M 150 120 C 160 200, 170 290, 175 360" fill="none" stroke="#78350f" strokeWidth="2.5" />
            <path d="M 120 125 L 120 360" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 4" />
            {/* Broche do Manto no Peito */}
            <circle cx="120" cy="106" r="6" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
          </g>
        )}

        {/* ============================================================ */}
        {/* 2. SILHUETA HUMANA ANATÔMICA BASE (Sem Equipamentos)          */}
        {/* ============================================================ */}
        <g className="transition-opacity duration-300">
          {/* Pescoço & Músculos Trapézio */}
          <path d="M 104 70 L 98 100 L 142 100 L 136 70 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
          <path d="M 112 72 Q 120 80 128 72" fill="none" stroke="#64748b" strokeWidth="1" />

          {/* Cabeça Humana (Formato Anatomicamente Modelado) */}
          <path
            d="M 120 28 C 102 28, 96 42, 96 60 C 96 76, 108 84, 120 84 C 132 84, 144 76, 144 60 C 144 42, 138 28, 120 28 Z"
            fill="url(#skinGradient)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Orelhas */}
          <ellipse cx="94" cy="58" rx="3" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <ellipse cx="146" cy="58" rx="3" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
          {/* Traços do Rosto (Sobrancelhas, Nariz, Boca, Linha de Queixo) */}
          <path d="M 110 52 L 116 50 M 130 52 L 124 50" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 120 52 L 120 62 L 123 63" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="114" y1="71" x2="126" y2="71" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

          {/* Peitoral & Deltoides (Ombros Anatomicamente Largos) */}
          {/* Ombros / Deltoides */}
          <path d="M 98 100 C 80 102, 68 112, 68 126 C 68 138, 76 142, 82 142 L 98 138 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
          <path d="M 142 100 C 160 102, 172 112, 172 126 C 172 138, 164 142, 158 142 L 142 138 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

          {/* Torso & Abdômen (V-Taper Muscular Humano) */}
          <path
            d="M 98 100 L 142 100 L 158 140 L 150 200 L 90 200 L 82 140 Z"
            fill="url(#skinGradient)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Definição dos Músculos Peitorais & Abdominais */}
          <path d="M 98 100 C 98 128, 118 130, 120 130 C 122 130, 142 128, 142 100" fill="none" stroke="#64748b" strokeWidth="1.2" />
          <line x1="120" y1="100" x2="120" y2="195" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="105" y1="148" x2="135" y2="148" stroke="#64748b" strokeWidth="1" />
          <line x1="107" y1="168" x2="133" y2="168" stroke="#64748b" strokeWidth="1" />

          {/* Quadril / Pelve */}
          <path d="M 90 200 L 150 200 L 146 226 L 94 226 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

          {/* Braço Esquerdo (Bíceps, Tríceps, Antebraço e Mão) */}
          <path d="M 72 138 L 54 180 L 66 182 L 80 144 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
          <circle cx="60" cy="181" r="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <path d="M 54 180 L 32 225 L 42 228 L 66 182 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
          <circle cx="30" cy="225" r="7" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

          {/* Braço Direito (Bíceps, Tríceps, Antebraço e Mão) */}
          <path d="M 168 138 L 186 180 L 174 182 L 160 144 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
          <circle cx="180" cy="181" r="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <path d="M 186 180 L 208 225 L 198 228 L 174 182 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
          <circle cx="210" cy="225" r="7" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

          {/* Pernas Anatômicas (Coxas com Quadríceps, Joelhos e Panturrilhas) */}
          {/* Coxa Esquerda */}
          <path d="M 94 226 L 86 310 L 108 310 L 118 226 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
          <ellipse cx="97" cy="310" rx="9" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
          {/* Panturrilha & Canela Esquerda */}
          <path d="M 88 314 L 80 370 L 104 370 L 106 314 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
          <path d="M 72 370 L 106 370 L 106 382 L 68 382 Z" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Coxa Direita */}
          <path d="M 146 226 L 154 310 L 132 310 L 122 226 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
          <ellipse cx="143" cy="310" rx="9" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
          {/* Panturrilha & Canela Direita */}
          <path d="M 152 314 L 160 370 L 136 370 L 134 314 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
          <path d="M 134 370 L 168 370 L 172 382 L 134 382 Z" fill="#334155" stroke="#64748b" strokeWidth="1" />
        </g>

        {/* ============================================================ */}
        {/* 3. ARMADURA DE CORPO / TORSO (CORPO_TORSO)                   */}
        {/* ============================================================ */}
        {getSlotItem('corpo_torso') ? (
          <g
            className="cursor-pointer group drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            onClick={() => onSlotClick?.('corpo_torso')}
          >
            {/* Pauldrons / Ombreiras da Armadura */}
            <path d="M 98 98 C 76 96, 62 108, 64 128 C 72 138, 92 136, 98 128 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 142 98 C 164 96, 178 108, 176 128 C 168 138, 148 136, 142 128 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />

            {/* Peitoral Moldado Anatomicamente (Cuirass) */}
            <path
              d="M 98 98 L 142 98 L 156 142 L 148 198 L 92 198 L 84 142 Z"
              fill="url(#armorGoldGradient)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            {/* Frisos Metálicos de Alto Relevo */}
            <path d="M 98 98 C 110 120, 130 120, 142 98" fill="none" stroke="#fef08a" strokeWidth="2" />
            <path d="M 104 135 L 136 135 M 106 155 L 134 155 M 108 175 L 132 175" stroke="#fef08a" strokeWidth="1.5" />
            <line x1="120" y1="98" x2="120" y2="198" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Faixas / Saia de Armadura (Tassets / Fauld) */}
            <path d="M 92 198 L 148 198 L 152 230 L 88 230 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <line x1="110" y1="198" x2="106" y2="230" stroke="#78350f" strokeWidth="1.5" />
            <line x1="130" y1="198" x2="134" y2="230" stroke="#78350f" strokeWidth="1.5" />

            {/* Grevas das Coxas */}
            <path d="M 94 230 L 86 308 L 108 308 L 118 230 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 146 230 L 154 308 L 132 308 L 122 230 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
          </g>
        ) : null}

        {/* ============================================================ */}
        {/* 4. BRAÇADEIRAS / PULSOS (BRACOS_PULSOS)                      */}
        {/* ============================================================ */}
        {getSlotItem('bracos_pulsos') && (
          <g
            className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            onClick={() => onSlotClick?.('bracos_pulsos')}
          >
            {/* Braçadeira Esquerda */}
            <path d="M 54 180 L 32 225 L 42 228 L 66 182 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <line x1="48" y1="190" x2="38" y2="218" stroke="#78350f" strokeWidth="2" />

            {/* Braçadeira Direita */}
            <path d="M 186 180 L 208 225 L 198 228 L 174 182 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <line x1="192" y1="190" x2="202" y2="218" stroke="#78350f" strokeWidth="2" />
          </g>
        )}

        {/* ============================================================ */}
        {/* 5. LUVAS / MANOPLAS (MAOS_VESTUARIO)                         */}
        {/* ============================================================ */}
        {getSlotItem('maos_vestuario') ? (
          <g
            className="cursor-pointer group drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]"
            onClick={() => onSlotClick?.('maos_vestuario')}
          >
            <circle cx="30" cy="225" r="9" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="210" cy="225" r="9" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
          </g>
        ) : null}

        {/* ============================================================ */}
        {/* 6. ANÉIS MÁGICOS (DEDO_ANEL_1 & DEDO_ANEL_2)                 */}
        {/* ============================================================ */}
        <g>
          {getSlotItem('dedo_anel_1') && (
            <g className="cursor-pointer" onClick={() => onSlotClick?.('dedo_anel_1')}>
              <circle cx="20" cy="232" r="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="20" cy="232" r="2" fill="#38bdf8" />
            </g>
          )}
          {getSlotItem('dedo_anel_2') && (
            <g className="cursor-pointer" onClick={() => onSlotClick?.('dedo_anel_2')}>
              <circle cx="220" cy="232" r="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="220" cy="232" r="2" fill="#ef4444" />
            </g>
          )}
        </g>

        {/* ============================================================ */}
        {/* 7. CINTO / FAIXA (CINTURA)                                   */}
        {/* ============================================================ */}
        {getSlotItem('cintura') && (
          <g
            className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            onClick={() => onSlotClick?.('cintura')}
          >
            {/* Faixa de Couro Envolvente */}
            <rect x="86" y="192" width="68" height="18" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            {/* Fivela de Ouro Mística */}
            <rect x="108" y="189" width="24" height="24" rx="4" fill="url(#goldGradient)" stroke="#fef08a" strokeWidth="2" />
            <rect x="114" y="195" width="12" height="12" rx="2" fill="#78350f" />
            {/* Pouch / Bolsa Pendurada no Cinto */}
            <rect x="90" y="210" width="12" height="14" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          </g>
        )}

        {/* ============================================================ */}
        {/* 8. BOTAS / GREVAS (PES)                                      */}
        {/* ============================================================ */}
        {getSlotItem('pes') ? (
          <g
            className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            onClick={() => onSlotClick?.('pes')}
          >
            {/* Bota Esquerda */}
            <path d="M 88 310 L 80 370 L 106 370 L 106 310 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 66 370 L 108 370 L 108 385 L 64 385 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
            <ellipse cx="97" cy="310" rx="10" ry="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />

            {/* Bota Direita */}
            <path d="M 152 310 L 160 370 L 134 370 L 134 310 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 132 370 L 174 370 L 176 385 L 132 385 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
            <ellipse cx="143" cy="310" rx="10" ry="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
          </g>
        ) : null}

        {/* ============================================================ */}
        {/* 9. PESCOÇO / COLAR (PESCOCO)                                  */}
        {/* ============================================================ */}
        {getSlotItem('pescoco') && (
          <g
            className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            onClick={() => onSlotClick?.('pescoco')}
          >
            {/* Corrente Encurvada */}
            <path d="M 104 76 Q 120 114 136 76" fill="none" stroke="#fef08a" strokeWidth="2" />
            {/* Gema / Amuleto Pendente */}
            <polygon points="120,118 113,108 127,108" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="120" cy="112" r="3" fill="#fef08a" />
          </g>
        )}

        {/* ============================================================ */}
        {/* 10. ELMO / CAPACETE / CABEÇA (CABECA)                        */}
        {/* ============================================================ */}
        {getSlotItem('cabeca') && (
          <g
            className="cursor-pointer group drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]"
            onClick={() => onSlotClick?.('cabeca')}
          >
            {/* Elmo Anatomicamente Ajustado à Cabeça */}
            <path
              d="M 120 20 C 94 20, 88 38, 88 60 C 88 80, 100 88, 120 88 C 140 88, 152 80, 152 60 C 152 38, 146 20, 120 20 Z"
              fill="url(#goldGradient)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            {/* Pluma Imperial no Topo */}
            <path d="M 120 20 Q 110 -5 130 -12 Q 135 10 120 20" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
            {/* Protetores de Bochecha / Nasal */}
            <path d="M 120 20 L 120 66 M 102 66 L 138 66" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* ============================================================ */}
        {/* 11. ROSTO / OLHOS (ROSTO_OLHOS)                              */}
        {/* ============================================================ */}
        {getSlotItem('rosto_olhos') && (
          <g
            className="cursor-pointer group drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]"
            onClick={() => onSlotClick?.('rosto_olhos')}
          >
            {/* Moldura da Viseira Arcana */}
            <path d="M 98 48 L 142 48 L 138 64 L 102 64 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            {/* Fenda Luminosa de Visão */}
            <rect x="102" y="52" width="36" height="8" rx="2" fill="#38bdf8" />
            <line x1="104" y1="56" x2="136" y2="56" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {/* ============================================================ */}
        {/* 12. ARMAS & ESCUDO NAS EMPUNHADURAS                          */}
        {/* ============================================================ */}
        {/* Empunhadura Principal (Esquerda do Visual) */}
        {mainHandItem && (
          <g
            className="cursor-pointer"
            onClick={() => onSlotClick?.('empunhadura_1')}
          >
            {renderWeaponGraphic(mainHandItem, 'main')}
          </g>
        )}

        {/* Empunhadura Secundária (Direita do Visual) */}
        {offHandItem && !isMain2H && !isOff2H && (
          <g
            className="cursor-pointer"
            onClick={() => onSlotClick?.('empunhadura_2')}
          >
            {renderWeaponGraphic(offHandItem, 'off')}
          </g>
        )}
      </svg>

      {/* Rótulos Opcionais das Zonas */}
      {showLabels && (
        <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-[10px] text-slate-300 font-semibold">
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400">
            {Object.values(equipmentSlots).filter(Boolean).length} / 13 Slots Equipados
          </span>
        </div>
      )}
    </div>
  );
};

export default CharacterMannequin;
