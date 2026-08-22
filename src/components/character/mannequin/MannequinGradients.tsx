import React from 'react';

export const MannequinGradients: React.FC = () => {
  return (
    <defs>
      {/* Gradientes Anatômicos e de Equipamentos */}
      <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="armorGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>

      <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="45%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="shieldMetallicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>

      <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="80%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>

      <linearGradient id="magicOrbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>

      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      {/* Gradientes do Facho de Luz da Lanterna e Tocha */}
      <linearGradient id="lanternBeamLeft" x1="100%" y1="50%" x2="0%" y2="50%">
        <stop offset="0%" stopColor="rgba(254, 240, 138, 0.75)" />
        <stop offset="40%" stopColor="rgba(253, 224, 71, 0.4)" />
        <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
      </linearGradient>

      <linearGradient id="lanternBeamRight" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="rgba(254, 240, 138, 0.75)" />
        <stop offset="40%" stopColor="rgba(253, 224, 71, 0.4)" />
        <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
      </linearGradient>

      <linearGradient id="torchBeamLeft" x1="100%" y1="50%" x2="0%" y2="50%">
        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.7)" />
        <stop offset="50%" stopColor="rgba(234, 179, 8, 0.35)" />
        <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
      </linearGradient>

      <linearGradient id="torchBeamRight" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.7)" />
        <stop offset="50%" stopColor="rgba(234, 179, 8, 0.35)" />
        <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
      </linearGradient>
    </defs>
  );
};
