import { useState, useCallback } from 'react';

export interface UseHeroWeaponFeatsConfigProps {
  getActiveFeats: () => string[];
}

export function useHeroWeaponFeatsConfig({ getActiveFeats }: UseHeroWeaponFeatsConfigProps) {
  // Estados para Ativar/Desativar penalidade e bônus de GWM ou Sharpshooter (toggles)
  const [gwmActive, setGwmActive] = useState<boolean>(false);
  const [sharpshooterActive, setSharpshooterActive] = useState<boolean>(false);
  const [versatileTwoHandedWeapons, setVersatileTwoHandedWeapons] = useState<Record<string, boolean>>({});

  const isVersatileWeapon = useCallback((atkName: string, properties?: string): boolean => {
    const name = (atkName || '').toLowerCase();
    const props = (properties || '').toLowerCase();
    if (props.includes('versátil') || props.includes('versatile')) return true;
    if (name.includes('ataque desarmado') && getActiveFeats().some(f => f.toLowerCase().includes('combate desarmado') || f.toLowerCase().includes('unarmed fighting'))) return true;
    const versatileNames = ['espada longa', 'longsword', 'lança', 'spear', 'bordão', 'cajado', 'quarterstaff', 'staff', 'martelo de guerra', 'warhammer', 'tridente', 'trident'];
    return versatileNames.some(v => name.includes(v));
  }, [getActiveFeats]);

  const getVersatileDamage = useCallback((atkName: string, properties?: string): string => {
    const name = (atkName || '').toLowerCase();
    if (name.includes('ataque desarmado')) return '1d8';
    if (!properties) return '1d10';
    const match = properties.match(/versátil\s*\(([^)]+)\)/i) || properties.match(/versatile\s*\(([^)]+)\)/i);
    if (match && match[1]) return match[1].trim();
    return '1d10';
  }, []);

  return {
    gwmActive,
    setGwmActive,
    sharpshooterActive,
    setSharpshooterActive,
    versatileTwoHandedWeapons,
    setVersatileTwoHandedWeapons,
    isVersatileWeapon,
    getVersatileDamage
  };
}
