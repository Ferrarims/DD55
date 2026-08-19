import React from 'react';

interface MinimapOverlayProps {
  isShowMinimap: boolean;
  isMinimapMinimized: boolean;
  setIsMinimapMinimized: (val: boolean) => void;
  isFullscreenMap: boolean;
  renderMinimapElement: (className?: string) => React.ReactNode;
}

export const MinimapOverlay: React.FC<MinimapOverlayProps> = ({
  isShowMinimap,
  isMinimapMinimized,
  setIsMinimapMinimized,
  isFullscreenMap,
  renderMinimapElement,
}) => {
  if (!isShowMinimap) return null;

  return (
    <div
      id="minimap-overlay"
      className="absolute top-2 right-2 border-2 border-slate-700/80 rounded shadow-xl z-10 bg-slate-950 opacity-80 hover:opacity-100 transition-opacity flex flex-col pointer-events-none"
    >
      <div className="flex justify-between items-center bg-slate-900 px-1 py-0.5 pointer-events-auto">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Mini Mapa</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimapMinimized(!isMinimapMinimized);
          }}
          className="text-slate-400 hover:text-white text-[10px] ml-2 leading-none p-0.5 rounded hover:bg-slate-800 cursor-pointer"
          title={isMinimapMinimized ? 'Maximizar' : 'Minimizar'}
        >
          {isMinimapMinimized ? '➕' : '➖'}
        </button>
      </div>
      <div style={{ display: isMinimapMinimized ? 'none' : 'block' }}>
        {!isFullscreenMap && renderMinimapElement()}
      </div>
    </div>
  );
};
