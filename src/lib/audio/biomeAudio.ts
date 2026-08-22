import { audioState, createNoiseBuffer } from './audioState';

export const playBiomeAudio = (ctx: AudioContext, biome: string) => {
  const { ambientGainNode } = audioState;
  if (!ambientGainNode) return;

  if (biome === 'Caverna' || biome === 'Masmorra') {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 55;
    
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.5;
    
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.connect(oscGain);
    oscGain.connect(ambientGainNode);
    osc.start();
    lfo.start();
    
    audioState.activeOscillators.push(osc, lfo);

    const dripInterval = setInterval(() => {
      if (Math.random() > 0.4) return;
      const dripOsc = ctx.createOscillator();
      const dripGain = ctx.createGain();
      dripOsc.type = 'sine';
      dripOsc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime);
      dripOsc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, ctx.currentTime + 0.1);
      
      dripGain.gain.setValueAtTime(0, ctx.currentTime);
      dripGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      dripGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      dripOsc.connect(dripGain);
      if (audioState.ambientGainNode) dripGain.connect(audioState.ambientGainNode);
      dripOsc.start();
      dripOsc.stop(ctx.currentTime + 0.4);
    }, 2000);
    audioState.ambientIntervals.push(dripInterval as any);

  } else if (biome === 'Floresta') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.1;
    
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);
    
    noiseSrc.start();
    lfo.start();
    audioState.activeSources.push(noiseSrc);
    audioState.activeOscillators.push(lfo);

    const birdInterval = setInterval(() => {
      if (Math.random() > 0.5) return;
      const birdOsc = ctx.createOscillator();
      const birdGain = ctx.createGain();
      birdOsc.type = 'sine';
      const startFreq = 3000 + Math.random() * 2000;
      birdOsc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      birdOsc.frequency.linearRampToValueAtTime(startFreq - 500, ctx.currentTime + 0.1);
      birdOsc.frequency.linearRampToValueAtTime(startFreq + 500, ctx.currentTime + 0.2);
      
      birdGain.gain.setValueAtTime(0, ctx.currentTime);
      birdGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      birdGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      
      birdOsc.connect(birdGain);
      if (audioState.ambientGainNode) birdGain.connect(audioState.ambientGainNode);
      birdOsc.start();
      birdOsc.stop(ctx.currentTime + 0.3);
    }, 3000);
    audioState.ambientIntervals.push(birdInterval as any);

  } else if (biome === 'Pântano') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, ctx.currentTime); 
    
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 20;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);
    
    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);
    
    noiseSrc.start();
    lfo.start();
    audioState.activeSources.push(noiseSrc);
    audioState.activeOscillators.push(lfo);

    const frogInterval = setInterval(() => {
      if (Math.random() > 0.6) return;
      const frogOsc = ctx.createOscillator();
      const frogGain = ctx.createGain();
      frogOsc.type = 'sawtooth';
      
      frogOsc.frequency.setValueAtTime(120 + Math.random() * 50, ctx.currentTime);
      frogOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      
      frogGain.gain.setValueAtTime(0, ctx.currentTime);
      frogGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      frogGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      frogOsc.connect(frogGain);
      if (audioState.ambientGainNode) frogGain.connect(audioState.ambientGainNode);
      frogOsc.start();
      frogOsc.stop(ctx.currentTime + 0.2);
    }, 4000);
    audioState.ambientIntervals.push(frogInterval as any);

  } else if (biome === 'Deserto') {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 2.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ambientGainNode);

    noiseSrc.start();
    lfo.start();
    audioState.activeSources.push(noiseSrc);
    audioState.activeOscillators.push(lfo);
  }
};
