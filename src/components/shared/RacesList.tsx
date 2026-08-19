import { useState } from 'react';
import { RACES_REFERENCE } from '../../lib/api/references';


export default function RacesList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const races = Object.values(RACES_REFERENCE).filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.creatureType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.traits.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="text-amber-500">✨</span>
          Raças
        </h2>
        <input
          type="text"
          placeholder="Buscar raça, traço ou tipo..."
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {races.map((race) => {
            const isNotImplemented = ['elfo', 'tiferino', 'gnomo'].includes(race.name.toLowerCase());
            
            return (
            <div key={race.name} className={`bg-slate-700/40 border rounded-xl p-5 shadow-sm transition-all ${isNotImplemented ? 'border-slate-700/30 opacity-60 grayscale' : 'border-slate-600/70 hover:border-slate-500'}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-3xl bg-slate-900/60 p-2 rounded-lg flex items-center justify-center ${isNotImplemented ? 'opacity-50' : ''}`}>
                  {race.icon || "👤"}
                </span>
                <div>
                  <h3 className={`font-bold text-xl leading-tight ${isNotImplemented ? 'text-slate-500 line-through' : 'text-amber-500'}`}>
                    {race.name} {isNotImplemented && <span className="text-xs font-normal text-slate-500 no-underline ml-1">(Em Breve)</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-900/60 text-slate-400 rounded-full">
                      Tipo: {race.creatureType}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-900/60 text-slate-400 rounded-full">
                      Tamanho: {race.size}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-900/60 text-slate-400 rounded-full">
                      Vel: {race.speed}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`border-t pt-3 ${isNotImplemented ? 'border-slate-700/30' : 'border-slate-700/60'}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Traços Raciais</h4>
                <div className="space-y-3">
                  {race.traits.map((trait, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-2.5 rounded border border-slate-700/40">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-bold ${isNotImplemented ? 'text-slate-500' : 'text-amber-200/90'}`}>{trait.name}</span>
                        {trait.type && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded-full border border-slate-800">
                            {trait.type}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] leading-relaxed ${isNotImplemented ? 'text-slate-500' : 'text-slate-300'}`}>
                        {trait.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
          {races.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Nenhuma raça encontrada para a busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
