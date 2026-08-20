import { useState, useEffect } from 'react';

export function useGameSettings() {
  const [isAmbientSoundEnabled, setIsAmbientSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('game_isAmbientSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSfxEnabled, setIsSfxEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('game_isSfxEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isShowMinimap, setIsShowMinimap] = useState<boolean>(() => {
    const saved = localStorage.getItem('game_isShowMinimap');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isShowZoomControls, setIsShowZoomControls] = useState<boolean>(() => {
    const saved = localStorage.getItem('game_isShowZoomControls');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [proceduralWorldEnabled, setProceduralWorldEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('game_proceduralWorldEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('game_isAmbientSoundEnabled', JSON.stringify(isAmbientSoundEnabled));
    localStorage.setItem('game_isSfxEnabled', JSON.stringify(isSfxEnabled));
    localStorage.setItem('game_isShowMinimap', JSON.stringify(isShowMinimap));
    localStorage.setItem('game_isShowZoomControls', JSON.stringify(isShowZoomControls));
    localStorage.setItem('game_proceduralWorldEnabled', JSON.stringify(proceduralWorldEnabled));
  }, [isAmbientSoundEnabled, isSfxEnabled, isShowMinimap, isShowZoomControls, proceduralWorldEnabled]);

  return {
    isAmbientSoundEnabled,
    setIsAmbientSoundEnabled,
    isSfxEnabled,
    setIsSfxEnabled,
    isShowMinimap,
    setIsShowMinimap,
    isShowZoomControls,
    setIsShowZoomControls,
    proceduralWorldEnabled,
    setProceduralWorldEnabled
  };
}
