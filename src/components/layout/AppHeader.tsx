import React from 'react';
import { AppUser } from '../../types/auth';
import { logoutUser } from '../../lib/api/authService';

interface AppHeaderProps {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser | null) => void;
  setSession: (session: any) => void;
  setActiveTab: (tab: any) => void;
  setCharacterView: (view: any) => void;
  setSelectedCharacter: (char: any) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  setCurrentUser,
  setSession,
  setActiveTab,
  setCharacterView,
  setSelectedCharacter,
}) => {
  return (
    <header className="mb-8 text-center relative flex flex-col items-center">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
        <div className="relative group shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center justify-center p-2 shadow-xl">
            <svg className="w-full h-full text-amber-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="rgba(185, 28, 28, 0.2)" stroke="#f59e0b" strokeWidth="1.5"/>
              <path d="M12 2V12M12 22V12" stroke="#f59e0b" strokeWidth="1.2"/>
              <path d="M3 7L12 12L21 7" stroke="#f59e0b" strokeWidth="1.2"/>
              <path d="M3 17L12 12L21 17" stroke="#f59e0b" strokeWidth="1.2"/>
              <circle cx="12" cy="12" r="2.5" fill="#ef4444" className="animate-pulse"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-500 tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
          DUNGEONS <span className="text-xl sm:text-2xl text-red-500 font-serif">&amp;</span> DRAGONS
        </h1>
      </div>
      
      <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Forje seu Herói e Viva a sua Lenda</p>
      
      <div className="mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-0 flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-lg">
        <div className="text-left">
          <span className="block text-slate-200 font-bold">{currentUser.name}</span>
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
            currentUser.role === 'administrador' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-400'
          }`}>
            {currentUser.role}
          </span>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logoutUser();
            setCurrentUser(null);
            setSession(null);
            setActiveTab('character');
            setCharacterView('menu');
            setSelectedCharacter(null);
          }}
          className="bg-slate-800 hover:bg-red-600 hover:text-white px-2 py-1 rounded font-bold text-[10px] transition-all uppercase cursor-pointer border border-slate-700 hover:border-red-500"
        >
          Sair
        </button>
      </div>
    </header>
  );
};
