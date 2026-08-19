import { useState, useEffect, useMemo } from 'react';
import { RACES_REFERENCE } from '../../../lib/api/references';
import { fetchRacesFromDb } from '../../../lib/api/racesService';
import { BACKGROUNDS, DRACONIC_DAMAGE_TYPES, GIANT_ANCESTRIES_INFO } from './constants';
import { DRACONIC_ANCESTRIES, GIANT_ANCESTRIES, FEATS_REFERENCE } from '../../../lib/api/references';

interface Props {
  race: string;
  setRace: (race: string) => void;
  draconicAncestry: string | undefined;
  setDraconicAncestry: (ancestry: string | undefined) => void;
  giantAncestry: string | undefined;
  setGiantAncestry: (ancestry: string | undefined) => void;
  humanFeat: string;
  setHumanFeat: (feat: string) => void;
  currentBg: typeof BACKGROUNDS[0];
}

export function SpeciesSelection({
  race, setRace, draconicAncestry, setDraconicAncestry, giantAncestry, setGiantAncestry, humanFeat, setHumanFeat, currentBg
}: Props) {
  const [races, setRaces] = useState<any[]>([]);
  const selectedRace = races.find(r => r.id === race);

  const bgFeatsList = useMemo(() => {
    if (!currentBg?.feat) return [];
    return String(currentBg.feat)
      .split(',')
      .map(f => f.trim().toLowerCase())
      .filter(Boolean);
  }, [currentBg?.feat]);

  // Se o personagem é humano e o talento extra selecionado já é o talento do antecedente, auto-seleciona outro talento de origem válido
  useEffect(() => {
    if (race === 'Humano' || race === 'Human') {
      const isCurrentConflict = bgFeatsList.includes((humanFeat || '').trim().toLowerCase());
      if (!humanFeat || isCurrentConflict) {
        const availableFeat = Object.values(FEATS_REFERENCE).find(
          f => f.category === 'Origem' && !bgFeatsList.includes(f.name.trim().toLowerCase())
        );
        if (availableFeat) {
          setHumanFeat(availableFeat.name);
        }
      }
    }
  }, [race, bgFeatsList, humanFeat, setHumanFeat]);

  useEffect(() => {
    async function loadRaces() {
      await fetchRacesFromDb();
        const updatedRaces = Object.entries(RACES_REFERENCE).map(([id, race]) => ({
        id,
        name: race.name,
        icon: race.icon || "👤",
        size: race.size,
        speed: race.speed,
        traits: race.traits,
        variants: race.variants
      }));
      setRaces(updatedRaces);
    }
    loadRaces();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Escolha sua Espécie</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {races.map((r, rIdx) => {
            const isBlocked = r.id === 'Elfo' || r.id === 'Gnomo' || r.id === 'Tiferino';
            return (
              <button
                key={`${r.id || r.name}-${rIdx}`}
                disabled={isBlocked}
                onClick={() => {
                  if (isBlocked) return;
                  setRace(r.id);
                  if (r.id !== 'Draconato') setDraconicAncestry(undefined);
                  if (r.id !== 'Golias' && r.id !== 'Goliath') setGiantAncestry(undefined);
                }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  isBlocked 
                    ? 'opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-900 text-slate-600'
                    : race === r.id 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 cursor-pointer' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className={`text-4xl ${isBlocked ? 'grayscale opacity-50' : ''}`}>{r.icon}</span>
                  <span className="font-bold text-lg flex items-center gap-1.5 text-slate-100">
                    {r.name}
                    {isBlocked && <span className="text-[10px] bg-red-500/10 text-red-500 px-1 rounded border border-red-500/20">🔒 Bloqueado</span>}
                  </span>
                </div>
                
                {!isBlocked && (
                  <div className="text-left text-sm text-slate-300 w-full space-y-1.5 border-t border-slate-800 pt-4 mt-2">
                    <p><span className="text-slate-500">Tamanho:</span> {r.size}</p>
                    <p><span className="text-slate-500">Deslocamento:</span> {r.speed}</p>
                    <p><span className="text-slate-500">Habilidades:</span> {r.traits.map((t: any) => t.name).join(', ')}</p>
                  </div>
                )}
                {isBlocked && <span className="text-xs text-center opacity-60 mt-4 border-t border-slate-800 pt-4 w-full">Temporariamente indisponível</span>}
              </button>
            );
          })}
        </div>
      </div>

      {(race === 'Golias' || race === 'Goliath') && selectedRace?.variants && selectedRace.variants.length > 0 && (
        <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🪨</span>
            <div>
              <h3 className="text-lg font-bold text-amber-500">Ancestralidade Gigante</h3>
              <p className="text-xs text-slate-400">Escolha um dos benefícios de sua linhagem ancestral de gigantes.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedRace.variants.map((v: any) => (
              <button
                key={v.name}
                onClick={() => setGiantAncestry(v.name)}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  giantAncestry === v.name 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center justify-between gap-1.5 flex-wrap">
                    <span>{v.name}</span>
                    {giantAncestry === v.name && <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">SELECIONADO</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 space-y-1 leading-relaxed">
                    <div className="flex items-center gap-1.5">
                      <b className="text-amber-500">{GIANT_ANCESTRIES_INFO[v.name]?.benefit || v.description}</b>
                    </div>
                    <div className="text-[10px] leading-tight text-slate-500">
                      {GIANT_ANCESTRIES_INFO[v.name]?.description || v.metadata?.description || ''}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {race === 'Draconato' && selectedRace?.variants && selectedRace.variants.length > 0 && (
        <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🐉</span>
            <div>
              <h3 className="text-lg font-bold text-amber-500">Ancestralidade Dracônica</h3>
              <p className="text-xs text-slate-400">Escolha o tipo de dragão de sua linhagem. Isso afeta seu sopro e resistência.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedRace.variants.map((v: any) => (
              <button
                key={v.name}
                onClick={() => setDraconicAncestry(v.name)}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  draconicAncestry === v.name 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center justify-start gap-1.5 flex-wrap">
                    <span>{v.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 space-y-1 leading-relaxed">
                    <div className="flex items-center gap-1.5">
                      <b>Resistência:</b>
                      <span className="text-[9px] bg-slate-950 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">
                        {DRACONIC_DAMAGE_TYPES[v.name] || v.metadata?.damageType || '---'}
                      </span>
                    </div>
                    <div className="text-[10px] leading-tight space-y-0.5">
                      <div className="font-bold">Sopro de {DRACONIC_DAMAGE_TYPES[v.name] || '---'}</div>
                      <div>15' Cone / 30' Linha · DES Save (CD 8+Con+Prof)</div>
                      <div>1d10 Dano (aumenta níveis 5, 11, 17)</div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {(race === 'Humano' || race === 'Human') && (
        <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👤</span>
            <div>
              <h3 className="text-lg font-bold text-amber-500">Talento de Origem Extra (Versátil)</h3>
              <p className="text-xs text-slate-400">
                A característica racial <strong className="text-amber-400">Versátil</strong> do Humano permite escolher um Talento de Origem adicional no Nível 1.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(FEATS_REFERENCE)
              .filter(f => f.category === 'Origem')
              .map(feat => {
                const isBgFeat = bgFeatsList.includes(feat.name.trim().toLowerCase());
                const isSelected = !isBgFeat && humanFeat === feat.name;
                const featIcons: Record<string, string> = {
                  'Alerta': '👁️',
                  'Artifista': '🛠️',
                  'Atacante Selvagem': '⚔️',
                  'Curandeiro': '💊',
                  'Habilidoso': '🎓',
                  'Iniciado em Magia': '✨',
                  'Músico': '🎶',
                  'Sortudo': '🍀',
                  'Valentão de Taverna': '🥊',
                  'Vigoroso': '❤️'
                };
                return (
                  <button
                    key={feat.name}
                    type="button"
                    disabled={isBgFeat}
                    onClick={() => {
                      if (!isBgFeat) setHumanFeat(feat.name);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isBgFeat
                        ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                        : isSelected 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 cursor-pointer shadow-lg shadow-amber-500/5' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{featIcons[feat.name] || '📜'}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5">
                          {feat.name}
                        </span>
                        {isBgFeat ? (
                          <span className="text-[9px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded border border-red-800/40 font-semibold shrink-0">
                            🔒 Já no Antecedente
                          </span>
                        ) : isSelected ? (
                          <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">
                            SELECIONADO
                          </span>
                        ) : null}
                      </div>
                      <div className={`text-[10px] mt-1 leading-relaxed ${isBgFeat ? 'text-slate-600' : 'text-slate-500'}`}>
                        {feat.description}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
