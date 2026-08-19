import React from 'react';
import { CLASSES } from './constants';
import { SPELLS_REFERENCE } from '../../../lib/api/references';

interface Props {
  charClass: string;
  selectedCantrips: string[];
  setSelectedCantrips: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSpells: string[];
  setSelectedSpells: React.Dispatch<React.SetStateAction<string[]>>;
  spellSlots: { cantrips: number; spells: number } | null;
}

export function SpellsSelection({
  charClass, selectedCantrips, setSelectedCantrips, selectedSpells, setSelectedSpells, spellSlots
}: Props) {
  if (!spellSlots) return null;
  
  const classSpells = Object.values(SPELLS_REFERENCE).filter(s => s.classes.includes(CLASSES[charClass as keyof typeof CLASSES].name));
  const availableCantrips = classSpells.filter(s => s.level === 0);
  const availableSpells = classSpells.filter(s => s.level === 1);

  const handleToggleCantrip = (spellName: string) => {
    setSelectedCantrips(prev => 
      prev.includes(spellName) ? prev.filter(s => s !== spellName) : 
      (prev.length < spellSlots.cantrips ? [...prev, spellName] : prev)
    );
  };

  const handleToggleSpell = (spellName: string) => {
    setSelectedSpells(prev => 
      prev.includes(spellName) ? prev.filter(s => s !== spellName) : 
      (prev.length < spellSlots.spells ? [...prev, spellName] : prev)
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-amber-500">Magias</h2>
        <p className="text-slate-400 mt-2">Escolha seus truques e magias de 1º círculo.</p>
      </div>
      
      {spellSlots.cantrips > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Truques (Nível 0)</h3>
            <span className="text-sm font-bold text-amber-500">{selectedCantrips.length} / {Math.min(spellSlots.cantrips, availableCantrips.length)} Escolhidos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableCantrips.map(spell => (
              <button
                key={spell.name}
                onClick={() => handleToggleCantrip(spell.name)}
                className={`p-3 rounded border text-left transition-colors flex justify-between items-center ${selectedCantrips.includes(spell.name) ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
              >
                <span className="text-slate-200 text-sm font-bold">{spell.name}</span>
                {selectedCantrips.includes(spell.name) && <span className="text-amber-500 text-xl leading-none">✓</span>}
              </button>
            ))}
          </div>
          {availableCantrips.length === 0 && <p className="text-sm text-slate-500 mt-2">Nenhum truque disponível para esta classe.</p>}
        </div>
      )}

      {spellSlots.spells > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Magias de 1º Círculo</h3>
            <span className="text-sm font-bold text-amber-500">{selectedSpells.length} / {Math.min(spellSlots.spells, availableSpells.length)} Escolhidas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableSpells.map(spell => (
              <button
                key={spell.name}
                onClick={() => handleToggleSpell(spell.name)}
                className={`p-3 rounded border text-left transition-colors flex justify-between items-center ${selectedSpells.includes(spell.name) ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
              >
                <span className="text-slate-200 text-sm font-bold">{spell.name}</span>
                {selectedSpells.includes(spell.name) && <span className="text-amber-500 text-xl leading-none">✓</span>}
              </button>
            ))}
          </div>
          {availableSpells.length === 0 && <p className="text-sm text-slate-500 mt-2">Nenhuma magia de 1º círculo disponível para esta classe.</p>}
        </div>
      )}
    </div>
  );
}
