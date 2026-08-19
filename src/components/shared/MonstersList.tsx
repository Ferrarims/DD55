import { useState, useEffect } from 'react';
import { fetchMonstersFromDb } from '../../lib/api/monstersService';

export default function MonstersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbMonsters, setDbMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMonsters = async () => {
      setLoading(true);
      try {
        const data = await fetchMonstersFromDb(false);
        setDbMonsters(data || []);
      } catch (err) {
        console.error('Error loading monsters:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMonsters();
  }, []);

  const monsters = dbMonsters.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.cr - b.cr || a.name.localeCompare(b.name));

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="text-red-500">🐉</span>
          Monstros
        </h2>
        <input
          type="text"
          placeholder="Buscar monstro..."
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400">Carregando monstros do banco de dados...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {monsters.map((monster, idx) => (
              <div key={`${monster.id || monster.name}-${idx}`} className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow flex flex-col hover:border-slate-500 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-rose-400 text-base leading-tight truncate pr-2" title={monster.name}>{monster.icon || '👹'} {monster.name}</h3>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg whitespace-nowrap">
                    ND {monster.cr}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
                  <div className="bg-slate-800 p-1.5 rounded text-center">
                    <span className="text-[10px] text-slate-500 block">CA</span>
                    <span className="font-bold">{monster.armor_class}</span>
                  </div>
                  <div className="bg-slate-800 p-1.5 rounded text-center">
                    <span className="text-[10px] text-slate-500 block">HP</span>
                    <span className="font-bold text-emerald-400">{monster.hp}</span>
                  </div>
                </div>

                {monster.stats && (
                  <div className="grid grid-cols-6 gap-1 text-[10px] text-center mb-3">
                    <div className="bg-slate-800 rounded p-1"><span className="block text-slate-500 font-bold">FOR</span><span className="font-bold">{monster.stats.str || 10}</span></div>
                    <div className="bg-slate-800 rounded p-1"><span className="block text-slate-500 font-bold">DES</span><span className="font-bold">{monster.stats.dex || 10}</span></div>
                    <div className="bg-slate-800 rounded p-1"><span className="block text-slate-500 font-bold">CON</span><span className="font-bold">{monster.stats.con || 10}</span></div>
                    <div className="bg-slate-800 rounded p-1"><span className="block text-slate-500 font-bold">INT</span><span className="font-bold">{monster.stats.int || 10}</span></div>
                    <div className="bg-slate-800 rounded p-1"><span className="block text-slate-500 font-bold">SAB</span><span className="font-bold">{monster.stats.wis || 10}</span></div>
                    <div className="bg-slate-800 rounded p-1"><span className="block text-slate-500 font-bold">CAR</span><span className="font-bold">{monster.stats.cha || 10}</span></div>
                  </div>
                )}
                
                <div className="mt-auto space-y-1.5">
                  {monster.actions && monster.actions.slice(0, 2).map((act: any, i: number) => (
                    <div key={i} className="text-[10px] text-slate-300">
                      <strong className="text-amber-500">{act.name}.</strong> {act.text || (act.to_hit ? `+${act.to_hit} para acertar.` : '')}
                    </div>
                  ))}
                  {monster.actions && monster.actions.length > 2 && (
                    <div className="text-[10px] text-slate-500 italic text-center">...e mais {monster.actions.length - 2} ações</div>
                  )}
                </div>
              </div>
            ))}
            {monsters.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                Nenhum monstro encontrado com a busca "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
