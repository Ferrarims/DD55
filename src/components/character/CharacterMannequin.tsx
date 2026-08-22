import React from 'react';
import { isTwoHandedWeapon } from '../../lib/mechanics/acCalculator';
import { MannequinGradients } from './mannequin/MannequinGradients';
import { MannequinBaseSilhouette } from './mannequin/MannequinBaseSilhouette';
import { MannequinArmorLayers } from './mannequin/MannequinArmorLayers';
import { renderWeaponGraphic } from './mannequin/MannequinWeaponGraphics';

export interface CharacterMannequinProps {
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
  const getSlotItem = (key: string) => equipmentSlots[key] || null;

  const mainHandItem = getSlotItem('empunhadura_1');
  const offHandItem = getSlotItem('empunhadura_2');

  const isMain2H = mainHandItem ? isTwoHandedWeapon(mainHandItem) : false;
  const isOff2H = offHandItem ? isTwoHandedWeapon(offHandItem) : false;

  const equippedCount = Object.values(equipmentSlots).filter(Boolean).length;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 400"
        className="w-full h-full max-h-[420px] drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]"
      >
        <MannequinGradients />
        <MannequinBaseSilhouette />
        <MannequinArmorLayers equipmentSlots={equipmentSlots} onSlotClick={onSlotClick} />

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
            {equippedCount} / 13 Slots Equipados
          </span>
        </div>
      )}
    </div>
  );
};

export default CharacterMannequin;
