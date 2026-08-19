import { useState } from 'react';
import { SPELLS_REFERENCE } from '../../lib/api/references';

export default function SpellsList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const spells = Object.values(SPELLS_REFERENCE).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.classes.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="text-amber-500">✨</span>
          Magias
        </h2>
        <input
          type="text"
          placeholder="Buscar magia, escola ou classe..."
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spells.map((spell) => (
            <div key={spell.name} className="bg-slate-700/50 border border-slate-600 rounded p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-amber-500 leading-tight">{spell.name}</h3>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    {spell.level === 0 ? 'Truque' : `Magia de ${spell.level}º Círculo`} • {spell.school}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex-1 flex flex-col gap-1.5 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-600/50 pb-1">
                  <span className="text-slate-400">Tempo:</span>
                  <span className="text-slate-200">{spell.castingTime}</span>
                </div>
                
                <div className="flex justify-between border-b border-slate-600/50 pb-1">
                  <span className="text-slate-400">Alcance:</span>
                  <span className="text-slate-200">{spell.range}</span>
                </div>
                
                <div className="flex justify-between border-b border-slate-600/50 pb-1">
                  <span className="text-slate-400">Componentes:</span>
                  <span className="text-slate-200">{spell.components}</span>
                </div>
                
                <div className="flex justify-between border-b border-slate-600/50 pb-1">
                  <span className="text-slate-400">Duração:</span>
                  <span className="text-blue-400">{spell.duration}</span>
                </div>
                
                <div className="pt-1">
                  <span className="text-slate-400 block mb-0.5">Descrição:</span>
                  <span className="leading-relaxed">{spell.description}</span>
                </div>

                <div className="pt-2 mt-auto">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Classes:</span>
                  <div className="flex flex-wrap gap-1">
                    {spell.classes.map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-400">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {spells.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Nenhuma magia encontrada para a busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
