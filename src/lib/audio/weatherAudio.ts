import { audioState, createNoiseBuffer } from './audioState';

export const playWeatherAudio = (ctx: AudioContext, weather: string): boolean => {
  const { ambientGainNode } = audioState;
  if (!ambientGainNode) return false;

  if (weather === 'rain') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.18;

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);

    noiseSrc.start();
    audioState.activeSources.push(noiseSrc);

    const dropInterval = setInterval(() => {
      if (Math.random() > 0.4) return;
      const dropOsc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(1400 + Math.random() * 800, ctx.currentTime);
      dropOsc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.08, ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      dropOsc.connect(dropGain);
      if (audioState.ambientGainNode) dropGain.connect(audioState.ambientGainNode);
      dropOsc.start();
      dropOsc.stop(ctx.currentTime + 0.1);
    }, 350);
    audioState.ambientIntervals.push(dropInterval as any);
    return true;
  }

  if (weather === 'storm') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.28;

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);

    noiseSrc.start();
    audioState.activeSources.push(noiseSrc);

    const windNoise = ctx.createBufferSource();
    windNoise.buffer = createNoiseBuffer(ctx);
    windNoise.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 450;
    windFilter.Q.value = 3.0;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.15;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.25;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ambientGainNode);

    windNoise.start();
    lfo.start();
    audioState.activeSources.push(windNoise);
    audioState.activeOscillators.push(lfo);

    const thunderInterval = setInterval(() => {
      if (Math.random() > 0.45) return;
      const thunderOsc = ctx.createOscillator();
      const thunderGain = ctx.createGain();
      thunderOsc.type = 'sawtooth';
      thunderOsc.frequency.setValueAtTime(80, ctx.currentTime);
      thunderOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.8);

      thunderGain.gain.setValueAtTime(0, ctx.currentTime);
      thunderGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.1);
      thunderGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      thunderOsc.connect(thunderGain);
      if (audioState.ambientGainNode) thunderGain.connect(audioState.ambientGainNode);
      thunderOsc.start();
      thunderOsc.stop(ctx.currentTime + 2.1);
    }, 5000);
    audioState.ambientIntervals.push(thunderInterval as any);
    return true;
  }

  if (weather === 'wind') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 4.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.22;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 400;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);

    noiseSrc.start();
    lfo.start();
    audioState.activeSources.push(noiseSrc);
    audioState.activeOscillators.push(lfo);
    return true;
  }

  if (weather === 'snow') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);

    noiseSrc.start();
    audioState.activeSources.push(noiseSrc);

    const chimeInterval = setInterval(() => {
      if (Math.random() > 0.5) return;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(2400 + Math.random() * 800, ctx.currentTime);

      chimeGain.gain.setValueAtTime(0.03, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      chimeOsc.connect(chimeGain);
      if (audioState.ambientGainNode) chimeGain.connect(audioState.ambientGainNode);
      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 0.7);
    }, 4000);
    audioState.ambientIntervals.push(chimeInterval as any);
    return true;
  }

  if (weather === 'fog') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 95;

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.2;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 250;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.06;

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);

    osc.connect(oscGain);
    oscGain.connect(ambientGainNode);

    osc.start();
    noiseSrc.start();
    audioState.activeOscillators.push(osc);
    audioState.activeSources.push(noiseSrc);
    return true;
  }

  return false;
};
