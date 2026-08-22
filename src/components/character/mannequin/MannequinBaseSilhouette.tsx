import React from 'react';

export const MannequinBaseSilhouette: React.FC = () => {
  return (
    <>
      {/* Círculos da Aura Mística e Grade de Fundo */}
      <circle cx="120" cy="60" r="38" fill="none" stroke="currentColor" className="text-amber-500/20" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="120" cy="210" r="150" fill="none" stroke="currentColor" className="text-slate-800/50" strokeWidth="1" />
      <line x1="120" y1="20" x2="120" y2="380" stroke="currentColor" className="text-slate-800/30" strokeWidth="0.8" strokeDasharray="2 4" />

      {/* Silhueta Anatômica Humana Base (Sem Equipamentos) */}
      <g className="transition-opacity duration-300">
        {/* Pescoço & Músculos Trapézio */}
        <path d="M 104 70 L 98 100 L 142 100 L 136 70 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
        <path d="M 112 72 Q 120 80 128 72" fill="none" stroke="#64748b" strokeWidth="1" />

        {/* Cabeça Humana */}
        <path
          d="M 120 28 C 102 28, 96 42, 96 60 C 96 76, 108 84, 120 84 C 132 84, 144 76, 144 60 C 144 42, 138 28, 120 28 Z"
          fill="url(#skinGradient)"
          stroke="#64748b"
          strokeWidth="1.5"
        />
        {/* Orelhas */}
        <ellipse cx="94" cy="58" rx="3" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <ellipse cx="146" cy="58" rx="3" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Traços do Rosto */}
        <path d="M 110 52 L 116 50 M 130 52 L 124 50" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 120 52 L 120 62 L 123 63" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="114" y1="71" x2="126" y2="71" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Ombros / Deltoides */}
        <path d="M 98 100 C 80 102, 68 112, 68 126 C 68 138, 76 142, 82 142 L 98 138 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
        <path d="M 142 100 C 160 102, 172 112, 172 126 C 172 138, 164 142, 158 142 L 142 138 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

        {/* Torso & Abdômen */}
        <path
          d="M 98 100 L 142 100 L 158 140 L 150 200 L 90 200 L 82 140 Z"
          fill="url(#skinGradient)"
          stroke="#64748b"
          strokeWidth="1.5"
        />
        {/* Definição dos Músculos Peitorais & Abdominais */}
        <path d="M 98 100 C 98 128, 118 130, 120 130 C 122 130, 142 128, 142 100" fill="none" stroke="#64748b" strokeWidth="1.2" />
        <line x1="120" y1="100" x2="120" y2="195" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="105" y1="148" x2="135" y2="148" stroke="#64748b" strokeWidth="1" />
        <line x1="107" y1="168" x2="133" y2="168" stroke="#64748b" strokeWidth="1" />

        {/* Quadril / Pelve */}
        <path d="M 90 200 L 150 200 L 146 226 L 94 226 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

        {/* Braço Esquerdo */}
        <path d="M 72 138 L 54 180 L 66 182 L 80 144 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
        <circle cx="60" cy="181" r="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <path d="M 54 180 L 32 225 L 42 228 L 66 182 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
        <circle cx="30" cy="225" r="7" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

        {/* Braço Direito */}
        <path d="M 168 138 L 186 180 L 174 182 L 160 144 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
        <circle cx="180" cy="181" r="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <path d="M 186 180 L 208 225 L 198 228 L 174 182 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />
        <circle cx="210" cy="225" r="7" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1" />

        {/* Pernas Anatômicas */}
        {/* Coxa Esquerda */}
        <path d="M 94 226 L 86 310 L 108 310 L 118 226 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
        <ellipse cx="97" cy="310" rx="9" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Panturrilha & Canela Esquerda */}
        <path d="M 88 314 L 80 370 L 104 370 L 106 314 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
        <path d="M 72 370 L 106 370 L 106 382 L 68 382 Z" fill="#334155" stroke="#64748b" strokeWidth="1" />

        {/* Coxa Direita */}
        <path d="M 146 226 L 154 310 L 132 310 L 122 226 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
        <ellipse cx="143" cy="310" rx="9" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Panturrilha & Canela Direita */}
        <path d="M 152 314 L 160 370 L 136 370 L 134 314 Z" fill="url(#skinGradient)" stroke="#64748b" strokeWidth="1.2" />
        <path d="M 134 370 L 168 370 L 172 382 L 134 382 Z" fill="#334155" stroke="#64748b" strokeWidth="1" />
      </g>
    </>
  );
};
