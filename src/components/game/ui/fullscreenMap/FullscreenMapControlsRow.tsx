import React from 'react';

interface FullscreenMapControlsRowProps {
  onMinimize: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  zoomLevel: number;
  is3dMode: boolean;
  setIs3dMode: (val: boolean) => void;
}

export const FullscreenMapControlsRow: React.FC<FullscreenMapControlsRowProps> = ({
  onMinimize,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  zoomLevel,
  is3dMode,
  setIs3dMode,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Botão Minimizar Mapa */}
      <button
        id="fullscreen-minimize-map-btn"
        onClick={onMinimize}
        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-2xl transition border border-rose-500 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0 active:scale-95"
        title="Minimizar tela cheia e voltar para visualização padrão (ESC)"
      >
        <span>📴</span>
        <span>Minimizar Mapa</span>
      </button>

      {/* Botões de Zoom + e - no Mapa em Tela Cheia */}
      <div className="flex items-center gap-1 bg-slate-900/95 border-2 border-amber-500/80 rounded-xl p-1 shadow-2xl backdrop-blur-md shrink-0">
        <button
          id="fullscreen-zoom-out-btn"
          onClick={handleZoomOut}
          disabled={zoomLevel <= -6}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-400 font-black text-xs rounded-lg border border-slate-700 transition flex items-center gap-1 shadow cursor-pointer active:scale-95"
          title="Reduzir Zoom do Mapa (-)"
        >
          <span className="text-sm leading-none font-extrabold">🔍 -</span>
        </button>
        <button
          id="fullscreen-zoom-reset-btn"
          onClick={handleZoomReset}
          className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 font-mono text-[11px] font-bold rounded-lg border border-slate-800 transition shadow cursor-pointer active:scale-95"
          title="Clique para Redefinir o Zoom para o Padrão (Zoom 0)"
        >
          {zoomLevel === 0 ? 'Zoom 0 (Padrão)' : zoomLevel > 0 ? `Zoom +${zoomLevel}` : `Zoom ${zoomLevel}`}
        </button>
        <button
          id="fullscreen-zoom-in-btn"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-400 font-black text-xs rounded-lg border border-slate-700 transition flex items-center gap-1 shadow cursor-pointer active:scale-95"
          title="Aumentar Zoom do Mapa (+)"
        >
          <span className="text-sm leading-none font-extrabold">🔍 +</span>
        </button>
      </div>

      {/* Botão 3D / 2D */}
      <button
        id="fullscreen-toggle-3d-btn"
        onClick={() => setIs3dMode(!is3dMode)}
        className={`px-3.5 py-2 font-black text-xs uppercase tracking-wider rounded-xl border transition flex items-center gap-1.5 shadow cursor-pointer active:scale-95 ${
          is3dMode
            ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-900/40'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
        }`}
        title="Alternar entre Visão 3D Pixel Art e Visão 2D Clássica"
      >
        <span>{is3dMode ? '🧊 3D' : '📐 2D'}</span>
      </button>
    </div>
  );
};
