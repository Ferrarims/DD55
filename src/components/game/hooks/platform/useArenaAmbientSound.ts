import { useEffect } from 'react';
import { BiomeType, WeatherType } from '../../../../game/types';
import { playAmbientSound, stopAmbientSound } from '../../../../lib/audio';

export interface UseArenaAmbientSoundProps {
  biome: BiomeType;
  weather: WeatherType;
  isBattleOver: boolean;
  isAmbientSoundEnabled: boolean;
}

export function useArenaAmbientSound({
  biome,
  weather,
  isBattleOver,
  isAmbientSoundEnabled
}: UseArenaAmbientSoundProps) {
  useEffect(() => {
    if (isBattleOver || !isAmbientSoundEnabled) {
      stopAmbientSound();
      return;
    }

    const enableAudio = () => {
      if (isAmbientSoundEnabled) playAmbientSound(biome, weather);
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };

    window.addEventListener('click', enableAudio);
    window.addEventListener('keydown', enableAudio);

    if (isAmbientSoundEnabled) playAmbientSound(biome, weather);

    return () => {
      stopAmbientSound();
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, [biome, weather, isBattleOver, isAmbientSoundEnabled]);
}
