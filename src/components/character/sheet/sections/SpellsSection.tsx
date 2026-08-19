import React from 'react';

export const SpellsSection: React.FC<{
  spellsList: string[];
}> = ({
  spellsList,
}) => {
  if (spellsList.length === 0) return null;

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
          <span>✨</span> Magias &amp; Truques Conhecidos
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {spellsList.map((spell, idx) => (
          <span key={`${spell}-${idx}`} className="bg-purple-950/60 text-purple-200 border border-purple-800/60 px-3 py-1 rounded-lg text-xs font-semibold">
            {spell}
          </span>
        ))}
      </div>
    </div>
  );
};
