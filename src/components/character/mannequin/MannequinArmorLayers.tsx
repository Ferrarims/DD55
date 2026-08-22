import React from 'react';

export interface MannequinArmorLayersProps {
  equipmentSlots: Record<string, string | null>;
  onSlotClick?: (slotKey: string) => void;
}

export const MannequinArmorLayers: React.FC<MannequinArmorLayersProps> = ({
  equipmentSlots,
  onSlotClick,
}) => {
  const getSlotItem = (key: string) => equipmentSlots[key] || null;

  return (
    <>
      {/* 1. OMBROS E COSTAS (CAPA / MANTO) */}
      {getSlotItem('ombros_costas') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          onClick={() => onSlotClick?.('ombros_costas')}
        >
          <path
            d="M 75 102 C 55 135, 40 250, 32 360 L 208 360 C 200 250, 185 135, 165 102 Z"
            fill="rgba(120, 53, 15, 0.75)"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <path d="M 90 120 C 80 200, 70 290, 65 360" fill="none" stroke="#78350f" strokeWidth="2.5" />
          <path d="M 150 120 C 160 200, 170 290, 175 360" fill="none" stroke="#78350f" strokeWidth="2.5" />
          <path d="M 120 125 L 120 360" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="120" cy="106" r="6" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
        </g>
      )}

      {/* 2. ARMADURA DE CORPO / TORSO */}
      {getSlotItem('corpo_torso') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
          onClick={() => onSlotClick?.('corpo_torso')}
        >
          <path d="M 98 98 C 76 96, 62 108, 64 128 C 72 138, 92 136, 98 128 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 142 98 C 164 96, 178 108, 176 128 C 168 138, 148 136, 142 128 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />

          <path
            d="M 98 98 L 142 98 L 156 142 L 148 198 L 92 198 L 84 142 Z"
            fill="url(#armorGoldGradient)"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <path d="M 98 98 C 110 120, 130 120, 142 98" fill="none" stroke="#fef08a" strokeWidth="2" />
          <path d="M 104 135 L 136 135 M 106 155 L 134 155 M 108 175 L 132 175" stroke="#fef08a" strokeWidth="1.5" />
          <line x1="120" y1="98" x2="120" y2="198" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="4 2" />

          <path d="M 92 198 L 148 198 L 152 230 L 88 230 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <line x1="110" y1="198" x2="106" y2="230" stroke="#78350f" strokeWidth="1.5" />
          <line x1="130" y1="198" x2="134" y2="230" stroke="#78350f" strokeWidth="1.5" />

          <path d="M 94 230 L 86 308 L 108 308 L 118 230 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 146 230 L 154 308 L 132 308 L 122 230 Z" fill="url(#armorGoldGradient)" stroke="#f59e0b" strokeWidth="2" />
        </g>
      )}

      {/* 3. BRAÇADEIRAS / PULSOS */}
      {getSlotItem('bracos_pulsos') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
          onClick={() => onSlotClick?.('bracos_pulsos')}
        >
          <path d="M 54 180 L 32 225 L 42 228 L 66 182 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <line x1="48" y1="190" x2="38" y2="218" stroke="#78350f" strokeWidth="2" />

          <path d="M 186 180 L 208 225 L 198 228 L 174 182 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <line x1="192" y1="190" x2="202" y2="218" stroke="#78350f" strokeWidth="2" />
        </g>
      )}

      {/* 4. LUVAS / MANOPLAS */}
      {getSlotItem('maos_vestuario') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]"
          onClick={() => onSlotClick?.('maos_vestuario')}
        >
          <circle cx="30" cy="225" r="9" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="210" cy="225" r="9" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
        </g>
      )}

      {/* 5. ANÉIS MÁGICOS */}
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

      {/* 6. CINTO / FAIXA */}
      {getSlotItem('cintura') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
          onClick={() => onSlotClick?.('cintura')}
        >
          <rect x="86" y="192" width="68" height="18" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
          <rect x="108" y="189" width="24" height="24" rx="4" fill="url(#goldGradient)" stroke="#fef08a" strokeWidth="2" />
          <rect x="114" y="195" width="12" height="12" rx="2" fill="#78350f" />
          <rect x="90" y="210" width="12" height="14" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
        </g>
      )}

      {/* 7. BOTAS / GREVAS */}
      {getSlotItem('pes') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
          onClick={() => onSlotClick?.('pes')}
        >
          <path d="M 88 310 L 80 370 L 106 370 L 106 310 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 66 370 L 108 370 L 108 385 L 64 385 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
          <ellipse cx="97" cy="310" rx="10" ry="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />

          <path d="M 152 310 L 160 370 L 134 370 L 134 310 Z" fill="url(#goldGradient)" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 132 370 L 174 370 L 176 385 L 132 385 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
          <ellipse cx="143" cy="310" rx="10" ry="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
        </g>
      )}

      {/* 8. PESCOÇO / COLAR */}
      {getSlotItem('pescoco') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
          onClick={() => onSlotClick?.('pescoco')}
        >
          <path d="M 104 76 Q 120 114 136 76" fill="none" stroke="#fef08a" strokeWidth="2" />
          <polygon points="120,118 113,108 127,108" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="120" cy="112" r="3" fill="#fef08a" />
        </g>
      )}

      {/* 9. ELMO / CABEÇA */}
      {getSlotItem('cabeca') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]"
          onClick={() => onSlotClick?.('cabeca')}
        >
          <path
            d="M 120 20 C 94 20, 88 38, 88 60 C 88 80, 100 88, 120 88 C 140 88, 152 80, 152 60 C 152 38, 146 20, 120 20 Z"
            fill="url(#goldGradient)"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <path d="M 120 20 Q 110 -5 130 -12 Q 135 10 120 20" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
          <path d="M 120 20 L 120 66 M 102 66 L 138 66" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 10. ROSTO / OLHOS */}
      {getSlotItem('rosto_olhos') && (
        <g
          className="cursor-pointer group drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]"
          onClick={() => onSlotClick?.('rosto_olhos')}
        >
          <path d="M 98 48 L 142 48 L 138 64 L 102 64 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <rect x="102" y="52" width="36" height="8" rx="2" fill="#38bdf8" />
          <line x1="104" y1="56" x2="136" y2="56" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      )}
    </>
  );
};
