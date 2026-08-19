import { useState } from 'react';
import { BACKGROUNDS_REFERENCE } from '../../lib/api/references';
import { FEATS_REFERENCE } from '../../lib/api/references';
import { formatEquipmentChoiceDescription } from '../../lib/mechanics/equipmentParser';

const BACKGROUND_ICONS: Record<string, string> = {
  'Acólito': '🙏',
  'Criminoso': '💰',
  'Soldado': '🛡️',
  'Sábio': '📚',
  'Nobre': '👑',
  'Andarilho': '🚶',
  'Mercador': '⚖️',
  'Escriba': '✍️',
  'Artesão': '🔨',
  'Guarda': '💂',
  'Guia': '🗺️',
  'Artista': '🎨',
  'Charlatão': '🎭',
  'Eremita': '🧘',
  'Fazendeiro': '🌾',
  'Marinheiro': '⚓'
};

export default function BackgroundsList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const backgrounds = Object.values(BACKGROUNDS_REFERENCE).filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.feat && b.feat.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((b.skillProficiencies || (b as any).skill_proficiencies) || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="text-amber-500">📜</span>
          Antecedentes
        </h2>
        <input
          type="text"
          placeholder="Buscar antecedente, talento ou perícia..."
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backgrounds.map((b) => {
            // Tenta encontrar o talento pelo nome base (usando o campo feat)
            const featBaseName = b.feat ? b.feat.trim() : "";
            
            // Procura a chave correspondente ignorando case
            const featKey = Object.keys(FEATS_REFERENCE).find(k => k.trim().toLowerCase() === featBaseName.toLowerCase());
            const featInfo = featKey ? FEATS_REFERENCE[featKey] : null;

            return (
              <div key={b.name} className="bg-slate-700/40 border border-slate-600/70 rounded-xl p-5 shadow-sm hover:border-slate-500 transition-all flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl bg-slate-900/60 p-2 rounded-lg flex items-center justify-center">
                    {BACKGROUND_ICONS[b.name] || "👤"}
                  </span>
                  <div>
                    <h3 className="font-bold text-xl text-amber-500 leading-tight">{b.name}</h3>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Atributos: {b.abilityScores.join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 border-t border-slate-700/60 pt-3 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Talento</h4>
                    <span className="text-sm text-amber-200/90 font-medium">{featInfo ? featInfo.name : b.feat}{b.featSubChoice ? ` (${b.featSubChoice})` : ""}</span>
                    {featInfo ? (
                      <p className="text-xs text-slate-400 mt-1">{featInfo.description}</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1 italic">Descrição não disponível.</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Perícias</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {((b.skillProficiencies || (b as any).skill_proficiencies) || []).map((skill: string, idx: number) => (
                        <span key={idx} className="text-xs bg-slate-900/40 px-2 py-0.5 rounded border border-slate-700/40 text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ferramentas</h4>
                    <span className="text-xs text-slate-300">{b.toolProficiency}</span>
                  </div>
                  
                  <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Equipamento</h4>
                      <p className="text-xs text-slate-300"><span className='font-bold'>Opção A:</span> {formatEquipmentChoiceDescription(b.equipment, 'A')}</p>
                      <p className="text-xs text-slate-300"><span className='font-bold'>Opção B:</span> {formatEquipmentChoiceDescription(b.equipment, 'B')}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {backgrounds.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Nenhum antecedente encontrado para a busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
