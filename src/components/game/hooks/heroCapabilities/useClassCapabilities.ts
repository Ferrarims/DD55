import { useMemo } from 'react';
import { CLASS_REFERENCE } from '../../../../lib/api/references';

export interface UseClassCapabilitiesProps {
  character: any;
}

export function useClassCapabilities({ character }: UseClassCapabilitiesProps) {
  const secondWindMaxUses = useMemo(() => {
    if (!character) return 2;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (className.includes('guerreiro') || className.includes('fighter')) {
      const level = Number(character.level) || 1;
      const classData = (CLASS_REFERENCE as any)['Fighter'];
      const progression = classData?.progression?.find((p: any) => p.level === level);
      return progression?.secondWind || 2;
    }
    if (Array.isArray(character.class_resources)) {
      const sw = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('fôlego') || name.includes('folego') || name.includes('second wind');
      });
      if (sw && typeof sw === 'object') {
        const val = Number(sw.max_uses || sw.uses || sw.max);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (character.second_wind_max) return Number(character.second_wind_max);
    if (character.second_wind_uses) return Number(character.second_wind_uses);

    const level = Number(character.level) || 1;
    return level >= 6 ? 2 : 1;
  }, [character]);

  const actionSurgeMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (Array.isArray(character.class_resources)) {
      const res = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('surto') || name.includes('action surge');
      });
      if (res && typeof res === 'object') {
        const val = Number(res.max || res.uses || res.max_uses);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (className.includes('guerreiro') || className.includes('fighter')) {
      return level >= 17 ? 2 : level >= 2 ? 1 : 0;
    }
    return 0;
  }, [character]);

  const rageMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (Array.isArray(character.class_resources)) {
      const res = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('fúria') || name.includes('furia') || name.includes('rage');
      });
      if (res && typeof res === 'object') {
        const val = Number(res.max || res.uses || res.max_uses);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (className.includes('bárbaro') || className.includes('barbarian')) {
      return level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2;
    }
    return 0;
  }, [character]);

  const channelDivinityMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (Array.isArray(character.class_resources)) {
      const res = character.class_resources.find((r: any) => {
        const name = (typeof r === 'string' ? r : r?.name || '').toLowerCase();
        return name.includes('canalizar') || name.includes('channel divinity');
      });
      if (res && typeof res === 'object') {
        const val = Number(res.max || res.uses || res.max_uses);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    if (className.includes('clérigo') || className.includes('cleric')) {
      return level >= 18 ? 4 : level >= 6 ? 3 : level >= 2 ? 2 : 0;
    }
    if (className.includes('paladino') || className.includes('paladin')) {
      return level >= 11 ? 3 : level >= 3 ? 2 : 0;
    }
    return 0;
  }, [character]);

  const spellSlotsMax = useMemo(() => {
    if (!character) return 2;
    if (character.spell_slots) {
      const val = Number(character.spell_slots);
      if (!isNaN(val) && val > 0) return val;
    }
    const level = Number(character.level) || 1;
    return Math.max(2, Math.min(6, level + 1));
  }, [character]);

  const indomitableMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    if (className.includes('guerreiro') || className.includes('fighter')) {
      return level >= 17 ? 3 : level >= 13 ? 2 : level >= 9 ? 1 : 0;
    }
    return 0;
  }, [character]);

  const superiorityDiceMaxUses = useMemo(() => {
    if (!character) return 0;
    const level = Number(character.level) || 1;
    const subclass = (character.subclass || character.subclass_name || '').toLowerCase();
    if (subclass.includes('battle') || subclass.includes('mestre da batalha') || subclass.includes('battlemaster')) {
      return level >= 15 ? 6 : level >= 7 ? 5 : 4;
    }
    return 0;
  }, [character]);

  const bardicInspirationMaxUses = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('bardo') || className.includes('bard')) {
      return Math.max(1, Math.floor(((character.charisma || 10) - 10) / 2));
    }
    return 0;
  }, [character]);

  const layOnHandsMaxPool = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('paladino') || className.includes('paladin')) {
      return (Number(character.level) || 1) * 5;
    }
    return 0;
  }, [character]);

  const focusPointsMaxUses = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('monge') || className.includes('monk')) {
      const level = Number(character.level) || 1;
      return level >= 2 ? level : 0;
    }
    return 0;
  }, [character]);

  const wildShapeMaxUses = useMemo(() => {
    if (!character) return 0;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    if (className.includes('druida') || className.includes('druid')) {
      const level = Number(character.level) || 1;
      return level >= 17 ? 4 : level >= 6 ? 3 : level >= 2 ? 2 : 0;
    }
    return 0;
  }, [character]);

  const hasMagicCapability = useMemo(() => {
    if (!character) return false;
    let spellsList: any[] = [];
    if (Array.isArray(character.spells)) {
      spellsList = character.spells;
    } else if (typeof character.spells === 'string') {
      try { spellsList = JSON.parse(character.spells); } catch {}
    }
    if (spellsList && spellsList.length > 0) return true;

    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    const casterClasses = [
      'mago', 'wizard', 'bruxo', 'warlock', 'feiticeiro', 'sorcerer',
      'clérigo', 'cleric', 'druida', 'druid', 'bardo', 'bard',
      'paladino', 'paladin', 'patrulheiro', 'ranger'
    ];
    return casterClasses.some(c => className.includes(c));
  }, [character]);

  const hasSecondWindCapability = useMemo(() => {
    if (!character) return true;
    const className = (character.class_name || character.charClass || '').toLowerCase().trim();
    const martialClasses = [
      'guerreiro', 'fighter', 'paladino', 'paladin', 'bárbaro', 'barbarian',
      'monge', 'monk', 'patrulheiro', 'ranger', 'ladino', 'rogue'
    ];
    return martialClasses.some(c => className.includes(c)) || (character.class_resources && character.class_resources.length > 0);
  }, [character]);

  return {
    secondWindMaxUses, actionSurgeMaxUses, rageMaxUses, channelDivinityMaxUses, spellSlotsMax,
    indomitableMaxUses, superiorityDiceMaxUses, bardicInspirationMaxUses, layOnHandsMaxPool,
    focusPointsMaxUses, wildShapeMaxUses, hasMagicCapability, hasSecondWindCapability
  };
}
