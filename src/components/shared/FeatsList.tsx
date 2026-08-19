import { useState } from 'react';
import { FEATS_REFERENCE } from '../../lib/api/references';

export default function FeatsList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const feats = Object.values(FEATS_REFERENCE).filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="text-amber-500">❖</span>
          Talentos
        </h2>
        <input
          type="text"
          placeholder="Buscar talento ou categoria..."
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {feats.map((feat) => {
            const isNotImplemented = feat.name.includes('(Não Implementado)') || feat.description.includes('[Temporariamente Desabilitado]');
            const displayName = feat.name.replace(' (Não Implementado)', '');
            
            return (
              <div key={feat.name} className="bg-slate-700/50 border border-slate-600 rounded p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold leading-tight ${isNotImplemented ? 'text-slate-500 line-through' : 'text-amber-500'}`}>{displayName}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-900 rounded-full text-slate-300 whitespace-nowrap uppercase tracking-widest">{feat.category}</span>
                </div>
                <p className={`text-xs leading-relaxed mt-3 ${isNotImplemented ? 'text-slate-500' : 'text-slate-300'}`}>{feat.description}</p>
              </div>
            );
          })}
          {feats.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Nenhum talento encontrado para a busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
