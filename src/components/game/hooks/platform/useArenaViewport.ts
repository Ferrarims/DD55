import { useState, useCallback } from 'react';

export function useArenaViewport() {
  // Configuração do Grid & Zoom (7 níveis: -3 a +3, padrão 0 no meio, ou até -6 em mapa cheio)
  const [zoomLevel, setZoomLevel] = useState<number>(0);

  // Modo de Exibição do Mapa (3D Pixel Art Isométrico vs 2D Top-Down)
  const [is3dMode, setIs3dMode] = useState<boolean>(true);

  // Displays de Map e UI
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);
  const [isMinimapMinimized, setIsMinimapMinimized] = useState<boolean>(false);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(3, prev + 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const limit = isFullscreenMap ? -6 : -3;
      return Math.max(limit, prev - 1);
    });
  }, [isFullscreenMap]);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(0);
  }, []);

  const safeZoom = Math.max(isFullscreenMap ? -6 : -3, Math.min(3, zoomLevel));
  const cols = (isFullscreenMap ? 24 : 14) - (safeZoom * 2);
  const rows = (isFullscreenMap ? 18 : 14) - (safeZoom * 2);

  return {
    zoomLevel,
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    is3dMode,
    setIs3dMode,
    isFullscreenMap,
    setIsFullscreenMap,
    isMinimapMinimized,
    setIsMinimapMinimized,
    safeZoom,
    cols,
    rows
  };
}
