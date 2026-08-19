import { useState, useEffect, useCallback } from 'react';
import { playAttackSound } from '../../../../lib/audio';

export interface ActiveEffectItem {
  id: string;
  type: 'melee' | 'ranged' | 'breath_cone' | 'breath_line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  hit: boolean;
  damageType?: string;
}

export interface UseArenaVisualFXProps {
  isSfxEnabled: boolean;
  setFloatingTexts: (val: any) => void;
  weather?: string;
  setWeatherTime?: (val: number | ((prev: number) => number)) => void;
}

export function useArenaVisualFX({
  isSfxEnabled,
  setFloatingTexts,
  weather,
  setWeatherTime
}: UseArenaVisualFXProps) {
  // Efeitos visuais ativos no Grid (Melee Slash / Ranged Projectile / Baforada Dracônica)
  const [activeEffects, setActiveEffects] = useState<ActiveEffectItem[]>([]);

  // Loop de animação contínua para os efeitos visuais no canvas
  useEffect(() => {
    if (activeEffects.length === 0) return;

    let animFrameId: number;

    const update = () => {
      setActiveEffects(prev => {
        const next = prev.map(eff => {
          const effSpeed = (eff.type === 'breath_cone' || eff.type === 'breath_line') ? 0.04 : 0.08;
          return {
            ...eff,
            progress: eff.progress + effSpeed
          };
        }).filter(eff => eff.progress < 1.0);
        return next;
      });
      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, [activeEffects.length]);

  // Loop de Animação em Tempo Real para Partículas e Atmosfera Climática
  useEffect(() => {
    if (!weather || weather === 'clear' || !setWeatherTime) return;

    let animFrameId: number;
    let lastTime = 0;
    const updateWeather = (time: number) => {
      if (time - lastTime >= 16) {
        setWeatherTime(time);
        lastTime = time;
      }
      animFrameId = requestAnimationFrame(updateWeather);
    };

    animFrameId = requestAnimationFrame(updateWeather);
    return () => cancelAnimationFrame(animFrameId);
  }, [weather, setWeatherTime]);

  const triggerAttackVisualEffect = useCallback((
    attacker: { x: number; y: number },
    defender: { x: number; y: number },
    isRanged: boolean,
    hit: boolean,
    damage: number = 0,
    isCritical: boolean = false
  ) => {
    if (isSfxEnabled) playAttackSound();
    const newEffect: ActiveEffectItem = {
      id: Math.random().toString(),
      type: (isRanged ? 'ranged' : 'melee'),
      startX: attacker.x,
      startY: attacker.y,
      endX: defender.x,
      endY: defender.y,
      progress: 0,
      hit
    };
    setActiveEffects(prev => [...prev, newEffect]);

    const text = hit ? damage.toString() : 'Errou';
    let color = hit ? '#ef4444' : '#9ca3af';
    if (isCritical) color = '#fbbf24';

    const newFloatingText = {
      id: Math.random().toString(),
      x: defender.x,
      y: defender.y,
      text,
      color,
      progress: 0
    };
    setFloatingTexts((prev: any[]) => [...prev, newFloatingText]);
  }, [isSfxEnabled, setFloatingTexts]);

  return {
    activeEffects,
    setActiveEffects,
    triggerAttackVisualEffect
  };
}
