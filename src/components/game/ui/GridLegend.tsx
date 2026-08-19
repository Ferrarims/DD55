import React from 'react';

export const GridLegend: React.FC = () => {
  return (
    <div id="grid-legend" className="flex flex-wrap items-center justify-center gap-2.5 text-[10px] text-slate-400 mt-2">
      <span className="flex items-center gap-1">🟦 <strong>Azul:</strong> Herói</span>
      <span className="flex items-center gap-1">🟥 <strong>Vermelho:</strong> Inimigos</span>
      <span className="flex items-center gap-1">🪨 <strong>Rocha:</strong> Obstáculo</span>
      <span className="flex items-center gap-1">🌿 <strong>Vegetação:</strong> Terreno Difícil (2x)</span>
      <span className="flex items-center gap-1">⚙️/🍄/🔥 <strong>Armadilhas:</strong> Hazards</span>
      <span className="flex items-center gap-1">💚/⚡/🔷/⚔️ <strong>Runas:</strong> Power-ups</span>
      <span className="flex items-center gap-1">🏕️ <strong>Acampamento:</strong> Descanso Longo</span>
    </div>
  );
};
