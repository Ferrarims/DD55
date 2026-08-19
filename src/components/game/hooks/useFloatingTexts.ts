import { useState, useEffect } from 'react';

export interface FloatingTextItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  progress: number;
}

export function useFloatingTexts() {
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);

  useEffect(() => {
    if (floatingTexts.length === 0) return;

    let animFrameId: number;
    const speed = 0.02; // Slower than attack effects (50 frames / ~800ms)

    const update = () => {
      setFloatingTexts(prev => {
        const next = prev.map(ft => ({
          ...ft,
          progress: ft.progress + speed
        })).filter(ft => ft.progress < 1.0);
        return next;
      });
      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, [floatingTexts.length]);

  return {
    floatingTexts,
    setFloatingTexts
  };
}
