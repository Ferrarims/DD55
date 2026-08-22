import { getAudioContext, playMoveSound, playAttackSound, playCollectSound } from './audio/soundEffects';
import { audioState, stopAmbientSound } from './audio/audioState';
import { playWeatherAudio } from './audio/weatherAudio';
import { playBiomeAudio } from './audio/biomeAudio';

export {
  getAudioContext,
  playMoveSound,
  playAttackSound,
  playCollectSound,
  stopAmbientSound,
};

export const playAmbientSound = (biome: string, weather: string = 'clear') => {
  stopAmbientSound();
  
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    audioState.ambientGainNode = ctx.createGain();
    audioState.ambientGainNode.gain.setValueAtTime(0, ctx.currentTime);
    audioState.ambientGainNode.connect(ctx.destination);
    audioState.ambientGainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // Fade in

    const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
    const isDesert = biome === 'Deserto';

    // Clima prioritário para biomas abertos
    let weatherHandled = false;
    if (!isIndoor && (!isDesert || weather === 'wind')) {
      weatherHandled = playWeatherAudio(ctx, weather);
    }

    // Clima padrão do bioma caso não haja efeito especial de clima
    if (!weatherHandled) {
      playBiomeAudio(ctx, biome);
    }
  } catch (e) {
    console.error('Error playing ambient sound:', e);
  }
};
