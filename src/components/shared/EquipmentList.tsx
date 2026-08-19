import { useState, useEffect } from 'react';
import { fetchItemsFromDb, DbItem } from '../../lib/api/itemsService';

export default function EquipmentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentMap, setEquipmentMap] = useState<Record<string, DbItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemsFromDb().then(map => {
      setEquipmentMap(map);
      setLoading(false);
    });
  }, []);
  
  const equipment = (Object.values(equipmentMap) as DbItem[]).filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="text-amber-500">⚔️</span>
          Equipamento
        </h2>
        <input
          type="text"
          placeholder="Buscar equipamento..."
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equipment.map((item) => (
            <div key={item.name} className="bg-slate-700/50 border border-slate-600 rounded p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-amber-500 leading-tight">{item.name}</h3>
                <span className="text-[10px] px-2 py-0.5 bg-slate-900 rounded-full text-slate-300 whitespace-nowrap uppercase tracking-widest ml-2 flex-shrink-0">{item.category}</span>
              </div>
              
              <div className="mt-3 flex-1 flex flex-col gap-1.5 text-xs text-slate-300">
                {item.usable_location && (
                  <div className="flex justify-between border-b border-slate-600/50 pb-1">
                    <span className="text-slate-400">Local de Uso:</span>
                    <span className="text-amber-400 font-medium">{item.usable_location}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-600/50 pb-1">
                  <span className="text-slate-400">Custo:</span>
                  <span className="font-mono text-slate-200">{item.cost}</span>
                </div>
                
                {item.weight && (
                  <div className="flex justify-between border-b border-slate-600/50 pb-1">
                    <span className="text-slate-400">Peso:</span>
                    <span className="font-mono text-slate-200">{item.weight}</span>
                  </div>
                )}
                
                {item.damage && (
                  <div className="flex justify-between border-b border-slate-600/50 pb-1">
                    <span className="text-slate-400">Dano:</span>
                    <span className="text-red-400 font-semibold">{item.damage}</span>
                  </div>
                )}
                
                {item.armor_class && (
                  <div className="flex justify-between border-b border-slate-600/50 pb-1">
                    <span className="text-slate-400">CA:</span>
                    <span className="text-blue-400 font-bold">{item.armor_class}</span>
                  </div>
                )}
                
                {item.properties && (
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-0.5">Propriedades:</span>
                    <span className="italic">{item.properties}</span>
                  </div>
                )}

                {item.stealth && item.stealth !== '—' && (
                  <div className="pt-1 flex gap-1">
                    <span className="text-slate-400">Furtividade:</span>
                    <span className="text-red-400">{item.stealth}</span>
                  </div>
                )}

                {item.items && (
                  <div className="pt-1 text-[10px] leading-relaxed">
                    <span className="text-slate-400 block mb-1">Itens:</span>
                    {item.items}
                  </div>
                )}
              </div>
            </div>
          ))}
          {equipment.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Nenhum equipamento encontrado para a busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
