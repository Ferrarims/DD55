import React from 'react';

type TabType = 'character' | 'feats' | 'equipment' | 'spells' | 'classes' | 'races' | 'monsters' | 'backgrounds' | 'gameRules' | 'implementations' | 'users';

interface AppNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
}) => {
  const tabs: { key: TabType; label: string; adminOnly?: boolean }[] = [
    { key: 'character', label: 'Personagens' },
    { key: 'classes', label: 'Classes' },
    { key: 'races', label: 'Raças' },
    { key: 'backgrounds', label: 'Antecedentes' },
    { key: 'feats', label: 'Talentos' },
    { key: 'equipment', label: 'Equipamentos' },
    { key: 'spells', label: 'Magias' },
    { key: 'monsters', label: 'Monstros' },
    { key: 'gameRules', label: 'Regras do Jogo' },
    { key: 'implementations', label: 'Implementações' },
    { key: 'users', label: 'Usuários', adminOnly: true },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {tabs.map((tab) => {
        if (tab.adminOnly && !isAdmin) return null;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
              activeTab === tab.key
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
