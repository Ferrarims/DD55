import React from 'react';

interface LoginHeaderProps {
  isRegistering: boolean;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ isRegistering }) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative group shrink-0 mb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative w-14 h-14 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center justify-center p-2.5 shadow-xl">
          <svg className="w-full h-full text-amber-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="rgba(185, 28, 28, 0.2)" stroke="#f59e0b" strokeWidth="1.5"/>
            <path d="M12 2V12M12 22V12" stroke="#f59e0b" strokeWidth="1.2"/>
            <path d="M3 7L12 12L21 7" stroke="#f59e0b" strokeWidth="1.2"/>
            <path d="M3 17L12 12L21 17" stroke="#f59e0b" strokeWidth="1.2"/>
            <circle cx="12" cy="12" r="2" fill="#ef4444"/>
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-black text-amber-500 tracking-tight text-center" style={{ fontFamily: 'Georgia, serif' }}>
        DUNGEONS &amp; DRAGONS
      </h2>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
        {isRegistering ? 'Forje sua Conta de Jogador' : 'Faça Login na sua Campanha'}
      </p>
    </div>
  );
};
