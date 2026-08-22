import { getAudioContext } from './soundEffects';

export interface AmbientAudioState {
  ambientGainNode: GainNode | null;
  ambientIntervals: number[];
  activeOscillators: OscillatorNode[];
  activeSources: AudioBufferSourceNode[];
  noiseBuffer: AudioBuffer | null;
}

export const audioState: AmbientAudioState = {
  ambientGainNode: null,
  ambientIntervals: [],
  activeOscillators: [],
  activeSources: [],
  noiseBuffer: null,
};

export const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  if (audioState.noiseBuffer) return audioState.noiseBuffer;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  audioState.noiseBuffer = buffer;
  return audioState.noiseBuffer;
};

export const stopAmbientSound = () => {
  if (audioState.ambientGainNode) {
    audioState.ambientGainNode.gain.linearRampToValueAtTime(0, getAudioContext().currentTime + 1);
    const oldNode = audioState.ambientGainNode;
    setTimeout(() => {
      try { oldNode.disconnect(); } catch (e) {}
    }, 1100);
    audioState.ambientGainNode = null;
  }
  
  audioState.ambientIntervals.forEach(clearInterval);
  audioState.ambientIntervals = [];
  
  audioState.activeOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  audioState.activeOscillators = [];
  
  audioState.activeSources.forEach(src => {
    try { src.stop(); } catch(e) {}
  });
  audioState.activeSources = [];
};
