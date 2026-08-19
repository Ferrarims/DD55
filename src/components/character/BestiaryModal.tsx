import React, { useEffect, useState } from 'react';
import { useModalKeyboard } from '../shared/ModalKeyboardHandler';
import { BESTIARY_TEMPLATES } from '../../game/bestiaryData';
import { Monster5eJSON } from '../../lib/api/references';
import { fetchMonstersFromDb } from '../../lib/api/monstersService';

interface BestiaryModalProps {
  characterId: string;
  defeatedMonsters?: Record<string, number>;
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ characterId, defeatedMonsters: initialMonsters, onClose }) => {
  const [defeatedMonsters, setDefeatedMonsters] = useState<Record<string, number>>(initialMonsters || {});
  const [monstersList, setMonstersList] = useState(BESTIARY_TEMPLATES);

  useModalKeyboard({
    onCancel: onClose,
    onClose,
    onConfirm: onClose,
  });

  useEffect(() => {
    fetchMonstersFromDb()
      .then(templates => {
        setMonstersList(templates);
      })
      .catch(e => console.warn('Erro ao sincronizar bestiário do banco:', e));
  }, []);

  useEffect(() => {
    if (initialMonsters) {
      setDefeatedMonsters(prev => {
        const merged = { ...prev };
        Object.entries(initialMonsters).forEach(([k, v]) => {
          if (!merged[k] || v > merged[k]) {
            merged[k] = v;
          }
        });
        return merged;
      });
    }
  }, [initialMonsters]);

  useEffect(() => {
    if (characterId) {
      const stored = localStorage.getItem(`bestiary_${characterId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDefeatedMonsters(prev => {
          const merged = { ...prev };
          Object.keys(parsed).forEach(k => {
            if (!merged[k] || parsed[k] > merged[k]) {
              merged[k] = parsed[k];
            }
          });
          return merged;
        });
      }
    }
  }, [characterId]);

  // Normaliza os nomes dos monstros (removendo " #1", " 1", etc) e soma as contagens
  const normalizedMonsters: Record<string, number> = {};
  Object.entries(defeatedMonsters).forEach(([name, count]) => {
    const cleanName = name.replace(/ #?\d+$/, '').trim();
    normalizedMonsters[cleanName] = (normalizedMonsters[cleanName] || 0) + Number(count);
  });

  const bestiaryEntries = Object.entries(normalizedMonsters)
    .sort((a, b) => Number(b[1]) - Number(a[1])) // Sort by count descending
    .map(([name, count]) => {
      // Find the monster in the dynamic bestiary templates
      const monsterData = monstersList.find(m => m.name.toLowerCase() === name.toLowerCase());
      return { name, count, data: monsterData };
    });

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition bg-slate-800 hover:bg-rose-600 rounded-full w-8 h-8 flex items-center justify-center"
        >
          X
        </button>

        <h2 className="text-3xl font-black text-indigo-400 mb-6 flex items-center gap-3">
          <span>📖</span> Bestiário do Herói
        </h2>

        {bestiaryEntries.length === 0 ? (
          <div className="text-center p-12 text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-5xl block mb-4 opacity-50">🐉</span>
            <p className="text-lg">Você ainda não derrotou nenhum monstro.</p>
            <p className="text-sm mt-2 opacity-75">Entre na Plataforma de Jogo, explore e derrote inimigos para registrá-á-los aqui!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {bestiaryEntries.map((entry) => (
              <div key={entry.name} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col hover:border-indigo-500/50 transition">
                <div className="flex justify-between items-start mb-3 border-b border-slate-700 pb-2">
                  <h3 className="text-xl font-bold text-amber-400">{entry.name}</h3>
                  <div className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold border border-indigo-700/50">
                    Derrotados: {entry.count}
                  </div>
                </div>

                {entry.data ? (
                  <div className="text-sm text-slate-300 space-y-2 flex-grow">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">ND: {entry.data.cr}</span>
                      <span className="px-2 py-0.5 bg-rose-900/30 text-rose-300 rounded text-xs border border-rose-800">HP: {entry.data.hp}</span>
                      <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs border border-blue-800">CA: {entry.data.armor_class}</span>
                      {entry.data.speed && <span className="px-2 py-0.5 bg-slate-700 rounded text-xs" title="Deslocamento">🏃 {entry.data.speed}</span>}
                      {entry.data.attackBonus !== undefined && <span className="px-2 py-0.5 bg-amber-900/30 text-amber-300 rounded text-xs border border-amber-800" title="Bônus de Ataque">⚔️ +{entry.data.attackBonus}</span>}
                      {entry.data.damageDice && <span className="px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded text-xs border border-orange-800" title="Dano do Ataque Base">🩸 {entry.data.damageDice}</span>}
                      {entry.data.xp && <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-xs border border-purple-800" title="Recompensa de XP">⭐ {entry.data.xp} XP</span>}
                    </div>

                    {entry.data.stats && (
                      <div className="grid grid-cols-6 gap-1 text-center bg-slate-900 rounded p-1 mb-2 text-xs">
                        <div><div className="font-bold text-slate-500">FOR</div><div>{entry.data.stats.str}</div></div>
                        <div><div className="font-bold text-slate-500">DES</div><div>{entry.data.stats.dex}</div></div>
                        <div><div className="font-bold text-slate-500">CON</div><div>{entry.data.stats.con}</div></div>
                        <div><div className="font-bold text-slate-500">INT</div><div>{entry.data.stats.int}</div></div>
                        <div><div className="font-bold text-slate-500">SAB</div><div>{entry.data.stats.wis}</div></div>
                        <div><div className="font-bold text-slate-500">CAR</div><div>{entry.data.stats.cha}</div></div>
                      </div>
                    )}

                    {entry.data.senses && (
                      <p><strong className="text-slate-400">Sentidos:</strong> {entry.data.senses}</p>
                    )}
                    
                    {entry.data.resistances && (
                      <p><strong className="text-amber-400/80">Resistências:</strong> {entry.data.resistances}</p>
                    )}
                    {entry.data.immunities && (
                      <p><strong className="text-rose-400/80">Imunidades:</strong> {entry.data.immunities}</p>
                    )}

                    {entry.data.actions && entry.data.actions.length > 0 && (
                      <div className="mt-3">
                        <strong className="text-slate-400 border-b border-slate-700 block mb-1 pb-1">Ações Mapeadas</strong>
                        <ul className="space-y-1 text-xs opacity-90">
                          {entry.data.actions.map((act: any, i: number) => (
                            <li key={i}>
                              <span className="text-amber-200 font-semibold">{act.name}.</span> {act.text || act.desc || (act.to_hit !== undefined ? `+${act.to_hit} para acertar, dano: ${act.damage}` : '')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-slate-500 italic text-sm p-4">
                    Estatísticas detalhadas indisponíveis para este monstro.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
