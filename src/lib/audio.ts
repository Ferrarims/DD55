const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

export const playMoveSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // A more audible step sound (higher pitch for phone/laptop speakers)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error(e);
  }
};

export const playAttackSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error(e);
  }
};

export const playCollectSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error(e);
  }
};

let ambientGainNode: GainNode | null = null;
let ambientIntervals: number[] = [];
let activeOscillators: OscillatorNode[] = [];
let activeSources: AudioBufferSourceNode[] = [];
let noiseBuffer: AudioBuffer | null = null;

const createNoiseBuffer = (ctx: AudioContext) => {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
};

export const stopAmbientSound = () => {
  if (ambientGainNode) {
    ambientGainNode.gain.linearRampToValueAtTime(0, getAudioContext().currentTime + 1);
    const oldNode = ambientGainNode;
    setTimeout(() => {
      try { oldNode.disconnect(); } catch (e) {}
    }, 1100);
    ambientGainNode = null;
  }
  
  ambientIntervals.forEach(clearInterval);
  ambientIntervals = [];
  
  activeOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  activeOscillators = [];
  
  activeSources.forEach(src => {
    try { src.stop(); } catch(e) {}
  });
  activeSources = [];
};

export const playAmbientSound = (biome: string, weather: string = 'clear') => {
  stopAmbientSound();
  
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(0, ctx.currentTime);
    ambientGainNode.connect(ctx.destination);
    ambientGainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // Fade in

    const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
    const isDesert = biome === 'Deserto';

    // Clima prioritário para biomas abertos (em cavernas/masmorras não há clima externo; no deserto não há chuva, tempestade, neve ou neblina)
    if (!isIndoor && (!isDesert || weather === 'wind')) {
      if (weather === 'rain') {
        // Chuva suave / constante
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
        activeSources.push(noiseSrc);

        // Gotas caindo
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
          if (ambientGainNode) dropGain.connect(ambientGainNode);
          dropOsc.start();
          dropOsc.stop(ctx.currentTime + 0.1);
        }, 350);
        ambientIntervals.push(dropInterval as any);
        return;
      }

      if (weather === 'storm') {
        // Tempestade: chuva pesada, vento uivante e trovões
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
        activeSources.push(noiseSrc);

        // Vento de tempestade com LFO
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
        activeSources.push(windNoise);
        activeOscillators.push(lfo);

        // Trovão estrondoso periódico
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
          if (ambientGainNode) thunderGain.connect(ambientGainNode);
          thunderOsc.start();
          thunderOsc.stop(ctx.currentTime + 2.1);
        }, 5000);
        ambientIntervals.push(thunderInterval as any);
        return;
      }

      if (weather === 'wind') {
        // Vento forte uivante com rajadas
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
        activeSources.push(noiseSrc);
        activeOscillators.push(lfo);
        return;
      }

      if (weather === 'snow') {
        // Neve: vento frio suave e silêncio gélido
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
        activeSources.push(noiseSrc);

        // Cristais de gelo sutis
        const chimeInterval = setInterval(() => {
          if (Math.random() > 0.5) return;
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(2400 + Math.random() * 800, ctx.currentTime);

          chimeGain.gain.setValueAtTime(0.03, ctx.currentTime);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

          chimeOsc.connect(chimeGain);
          if (ambientGainNode) chimeGain.connect(ambientGainNode);
          chimeOsc.start();
          chimeOsc.stop(ctx.currentTime + 0.7);
        }, 4000);
        ambientIntervals.push(chimeInterval as any);
        return;
      }

      if (weather === 'fog') {
        // Neblina: ambiente misterioso e abafado
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
        activeOscillators.push(osc);
        activeSources.push(noiseSrc);
        return;
      }
    }

    // Clima Limpo: Áudio Padrão do Bioma
    if (biome === 'Caverna' || biome === 'Masmorra') {
      // Cave: low rumble + drips
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 55;
      
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.5;
      
      // Slow LFO for rumble
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
      
      activeOscillators.push(osc, lfo);

      // Drips
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
        if (ambientGainNode) dripGain.connect(ambientGainNode);
        dripOsc.start();
        dripOsc.stop(ctx.currentTime + 0.4);
      }, 2000);
      ambientIntervals.push(dripInterval as any);

    } else if (biome === 'Floresta') {
      // Forest: Wind and birds
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(ctx);
      noiseSrc.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.5;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.1; // soft wind
      
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
      activeSources.push(noiseSrc);
      activeOscillators.push(lfo);

      // Birds
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
        if (ambientGainNode) birdGain.connect(ambientGainNode);
        birdOsc.start();
        birdOsc.stop(ctx.currentTime + 0.3);
      }, 3000);
      ambientIntervals.push(birdInterval as any);

    } else if (biome === 'Pântano') {
      // Swamp: crickets and frogs
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(ctx);
      noiseSrc.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;
      
      const noiseGain = ctx.createGain();
      // crickets base gain
      noiseGain.gain.setValueAtTime(0.01, ctx.currentTime); 
      
      // crickets modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 20; // fast chirps
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(noiseGain.gain);
      
      noiseSrc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ambientGainNode);
      
      noiseSrc.start();
      lfo.start();
      activeSources.push(noiseSrc);
      activeOscillators.push(lfo);

      // Frogs
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
        if (ambientGainNode) frogGain.connect(ambientGainNode);
        frogOsc.start();
        frogOsc.stop(ctx.currentTime + 0.2);
      }, 4000);
      ambientIntervals.push(frogInterval as any);
    } else if (biome === 'Deserto') {
      // Desert: howling hot desert wind
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
      lfo.frequency.value = 0.15; // slow desert wind gusts
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 250;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSrc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ambientGainNode);

      noiseSrc.start();
      lfo.start();
      activeSources.push(noiseSrc);
      activeOscillators.push(lfo);
    }
  } catch (e) {
    console.error('Error playing ambient sound:', e);
  }
};
