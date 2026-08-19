import { useState, useEffect } from 'react';
import { CLASS_REFERENCE, FIGHTER_SUBCLASSES } from '../../lib/api/references';
import { supabase } from '../../lib/api/supabase';
import { formatEquipmentChoiceDescription } from '../../lib/mechanics/equipmentParser';

const CLASS_DETAILS: Record<string, { pt: string; icon: string; desc: string; color: string }> = {
  Barbarian: { 
    pt: "Bárbaro", 
    icon: "🪓", 
    desc: "Um guerreiro feroz de origem primitiva que pode entrar em uma fúria selvagem para devastar seus inimigos.",
    color: "from-red-600/30 to-red-950/20"
  },
  Bard: { 
    pt: "Bardo", 
    icon: "🎵", 
    desc: "Um mestre da música, erudição e mágica que inspira aliados, manipula mentes e conjura encantos.",
    color: "from-purple-600/30 to-purple-950/20"
  },
  Cleric: { 
    pt: "Clérigo", 
    icon: "🛡️", 
    desc: "Um campeão divino que conjura magias sagradas, cura feridos e canaliza o julgamento direto de sua divindade.",
    color: "from-blue-600/30 to-blue-950/20"
  },
  Druid: { 
    pt: "Druida", 
    icon: "🍃", 
    desc: "Um guardião da natureza selvagem capaz de assumir formas de feras e comandar as forças dos elementos.",
    color: "from-emerald-600/30 to-emerald-950/20"
  },
  Fighter: { 
    pt: "Guerreiro", 
    icon: "⚔️", 
    desc: "Um especialista tático em combate armado versado no uso de todas as armas, armaduras e estilos de luta.",
    color: "from-slate-600/30 to-slate-900/20"
  },
  Monk: { 
    pt: "Monge", 
    icon: "🥋", 
    desc: "Um mestre das artes marciais que focaliza sua energia corporal interna para desferir golpes relâmpago e esquivas sobre-humanas.",
    color: "from-amber-600/30 to-amber-950/20"
  },
  Paladin: { 
    pt: "Paladino", 
    icon: "✨", 
    desc: "Um combatente devoto juramentado por votos sagrados que canaliza punições divinas e auras protetoras contra a escuridão.",
    color: "from-yellow-600/30 to-yellow-950/20"
  },
  Ranger: { 
    pt: "Patrulheiro", 
    icon: "🏹", 
    desc: "Um caçador selvagem e rastreador incansável que utiliza magias naturais e táticas de guerrilha nas fronteiras.",
    color: "from-teal-600/30 to-teal-950/20"
  },
  Rogue: { 
    pt: "Ladino", 
    icon: "👤", 
    desc: "Um mestre da furtividade, perícia e precisão letal que localiza fraquezas para desferir Ataques Furtivos destruidores.",
    color: "from-zinc-700/40 to-zinc-950/20"
  },
  Sorcerer: { 
    pt: "Feiticeiro", 
    icon: "🔥", 
    desc: "Um conjurador nato cuja magia flui de seu próprio sangue ou herança cósmica, manipulando magias com a Metamagia.",
    color: "from-orange-600/30 to-orange-950/20"
  },
  Warlock: { 
    pt: "Bruxo", 
    icon: "🔮", 
    desc: "Um pactuante ávido por mistérios que recebeu segredos arcanos inestimáveis e magias de um patrono sobrenatural.",
    color: "from-fuchsia-600/30 to-fuchsia-950/20"
  },
  Wizard: { 
    pt: "Mago", 
    icon: "📖", 
    desc: "Um acadêmico genial que catalisa o tecido do multiverso através de estudos matemáticos das leis arcanas e seu Grimório.",
    color: "from-indigo-600/30 to-indigo-950/20"
  }
};

export default function ClassesList() {
  const [selectedClassKey, setSelectedClassKey] = useState<keyof typeof CLASS_REFERENCE>('Fighter');
  const [subclasses, setSubclasses] = useState<any[]>([]);
  const [selectedSubKey, setSelectedSubKey] = useState<string>('');
  const [loadingSubs, setLoadingSubs] = useState(false);
  
  const currentClassData = CLASS_REFERENCE[selectedClassKey];
  
  if (!currentClassData || !currentClassData.progression) {
    return <div className="p-8 text-center text-slate-400">Carregando dados do banco...</div>;
  }
  const currentDetails = CLASS_DETAILS[selectedClassKey as string] || { pt: selectedClassKey, icon: "⚔️", desc: "", color: "from-slate-700/30 to-slate-900/20" };

  useEffect(() => {
    async function loadSubclasses() {
      setLoadingSubs(true);
      try {
        const ptName = CLASS_DETAILS[selectedClassKey]?.pt;
        if (!ptName) return;

        // 1. Obter ID da classe do Supabase
        const { data: cls } = await supabase
          .from('classes')
          .select('id')
          .ilike('name', ptName)
          .maybeSingle();

        const clsObj = cls as any;
        if (clsObj) {
          // 2. Obter as subclasses e suas características
          const { data: subs } = await supabase
            .from('subclasses')
            .select('*, subclass_features(*)')
            .eq('class_id', clsObj.id);

          const subsData = subs as any[];
          if (subsData && subsData.length > 0) {
            // Ordenar características por nível
            const formattedSubs = subsData.map(s => ({
              ...s,
              features: (s.subclass_features || []).sort((a: any, b: any) => a.level - b.level)
            }));
            setSubclasses(formattedSubs);
            if (formattedSubs.length > 0) {
              setSelectedSubKey(formattedSubs[0].id || formattedSubs[0].name);
            }
            setLoadingSubs(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar subclasses do Supabase:", err);
      }

      // Fallback para dados estáticos locais se for Guerreiro
      if (selectedClassKey === 'Fighter') {
        const formatted = Object.entries(FIGHTER_SUBCLASSES).map(([key, sub]) => ({
          id: key,
          name: sub.name,
          description: sub.description,
          features: sub.features,
          maneuvers: (sub as any).maneuvers // Se for BattleMaster
        }));
        setSubclasses(formatted);
        if (formatted.length > 0) {
          setSelectedSubKey(formatted[0].id);
        }
      } else {
        setSubclasses([]);
        setSelectedSubKey('');
      }
      setLoadingSubs(false);
    }

    loadSubclasses();
  }, [selectedClassKey]);

  // Encontrar todas as chaves adicionais da progressão para criar colunas extras inteligentes
  const progressionKeys = (currentClassData.progression as any[]).reduce((acc: string[], row: any) => {
    Object.keys(row).forEach(key => {
      if (!['level', 'prof', 'features', 'spellSlots', 'metadata'].includes(key) && !acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, []);

  // Formatar nomes das colunas de progresso específicas
  const getColLabel = (key: string) => {
    const labels: Record<string, string> = {
      rages: "Fúrias",
      rageDamage: "Dano de Fúria",
      weaponMastery: "Maestrias",
      bardicDie: "Dado de Inspiração",
      cantrips: "Truques",
      preparedSpells: "Magias Prep.",
      channelDivinity: "Canalizar Divindade",
      wildShapes: "Formas Selvagens",
      secondWind: "Retomar Fôlego",
      martialArtsDie: "Artes Marciais",
      focusPoints: "Pontos de Foco",
      unarmoredMovement: "Movimento Extra",
      sneakAttackDie: "Ataque Furtivo",
      sorceryPoints: "Pontos de Feitiçaria",
      invocationsKnown: "Invocações",
      invocations: "Invocações",
      slotLevel: "Círculo de Espaço",
      warlockSlotLevel: "Círculo de Espaço"
    };
    return labels[key] || key;
  };

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full lg:h-[calc(100vh-220px)] min-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex items-center gap-2">
        <span className="text-amber-500 text-lg">⚔️</span>
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">Classes</h2>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left column: Class Selector */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-700 bg-slate-900/40 overflow-y-auto p-3 flex lg:flex-col gap-2 scrollbar-thin">
          {(Object.keys(CLASS_DETAILS) as Array<keyof typeof CLASS_REFERENCE>).map((key) => {
            const details = CLASS_DETAILS[key] || { pt: key, icon: "⚔️" };
            const isSelected = selectedClassKey === key;
            const isImplemented = key === 'Fighter';
            return (
              <button
                key={key}
                onClick={() => isImplemented && setSelectedClassKey(key)}
                disabled={!isImplemented}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                  isSelected 
                    ? 'bg-amber-600/90 text-white shadow-md font-bold' 
                    : isImplemented
                      ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-750/30'
                      : 'bg-slate-800/20 text-slate-600 border border-transparent cursor-not-allowed opacity-60'
                }`}
              >
                <span className={`text-xl ${!isImplemented ? 'grayscale opacity-50' : ''}`}>{details.icon}</span>
                <div>
                  <div className={`font-bold leading-tight ${!isImplemented ? 'line-through text-slate-500' : ''}`}>
                    {details.pt}
                  </div>
                  <div className={`text-[10px] hidden lg:block ${isSelected ? 'text-amber-100' : isImplemented ? 'text-slate-500' : 'text-slate-600'}`}>
                    {key} {!isImplemented && '(Em Breve)'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right column: Class Data Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-slate-950/20">
          
          {/* Banner */}
          <div className={`bg-gradient-to-r ${currentDetails.color} border border-slate-700/50 p-6 rounded-2xl`}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl bg-slate-900/80 p-3 rounded-2xl shadow-inner border border-slate-750">{currentClassData?.icon || currentDetails.icon}</span>
              <div>
                <h3 className="text-3xl font-black text-amber-500" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentDetails.pt}
                </h3>
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-0.5">DADO DE VIDA: {currentClassData.hitPointDie} • ATRIBUTO PRINCIPAL: {currentClassData.primaryAbility}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {currentDetails.desc}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proficiências básicas */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🛡️</span> Proficiências Iniciais
              </h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Salvaguardas</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {currentClassData.savingThrows.map((st, i) => (
                      <span key={i} className="bg-slate-900/60 px-2.5 py-1 rounded border border-slate-700/50 text-slate-200">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Armaduras</span>
                  <p>{currentClassData.armor.join(', ') || 'Nenhuma'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Armas</span>
                  <p>{currentClassData.weapons.join(', ') || 'Nenhuma'}</p>
                </div>
                {currentClassData.tools && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Ferramentas</span>
                    <p>{(currentClassData.tools as string[]).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Perícias e Opções de Equipamento */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🎒</span> Escolhas e Equipamentos
              </h4>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Perícias de Classe</span>
                  <p className="leading-relaxed text-slate-300">{currentClassData.skills}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Equipamento Inicial (Opção A)</span>
                  <p className="bg-slate-900/40 p-2 rounded border border-slate-750 text-slate-300 leading-relaxed italic">
                    {formatEquipmentChoiceDescription(currentClassData.equipmentOptions, 'A')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Equipamento Inicial (Opção B - Ouro)</span>
                  <p className="bg-slate-900/40 p-2 rounded border border-slate-750 text-slate-300 leading-relaxed italic">
                    {formatEquipmentChoiceDescription(currentClassData.equipmentOptions, 'B')}
                  </p>
                </div>
                {currentClassData.equipmentOptions && (currentClassData.equipmentOptions as any).C && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Equipamento Inicial (Opção C)</span>
                    <p className="bg-slate-900/40 p-2 rounded border border-slate-750 text-slate-300 leading-relaxed italic">
                      {formatEquipmentChoiceDescription(currentClassData.equipmentOptions, 'C')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progression Table */}
          <div className="bg-slate-850 border border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <span>📈</span> Tabela de Progressão de Nível
              </h4>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 text-amber-400 font-bold uppercase rounded border border-slate-800">1 ao 20</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-black">Nível</th>
                    <th className="py-3 px-4 font-black">Bônus Prof.</th>
                    <th className="py-3 px-4 font-black">Características de Nível</th>
                    {progressionKeys.map(k => (
                      <th key={k} className="py-3 px-4 font-black text-center">{getColLabel(k)}</th>
                    ))}
                    {currentClassData.progression[0].spellSlots && (
                      <th className="py-3 px-4 font-black text-center">Espaços de Magia (1º ao 9º Círculo)</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-750 bg-slate-900/20">
                  {currentClassData.progression.map((row: any) => (
                    <tr key={row.level} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-amber-400 bg-slate-950/20">{row.level}º</td>
                      <td className="py-2.5 px-4 text-slate-300">{row.prof}</td>
                      <td className="py-2.5 px-4 text-slate-200 font-medium leading-normal">{row.features}</td>
                      {progressionKeys.map(k => (
                        <td key={k} className="py-2.5 px-4 text-slate-300 text-center font-mono bg-slate-950/10">
                          {row[k] !== undefined && row[k] !== null ? String(row[k]) : '—'}
                        </td>
                      ))}
                      {row.spellSlots !== undefined && (
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex gap-1 justify-center">
                            {Array.isArray(row.spellSlots) ? (
                              <>
                                {row.spellSlots.map((slots: number, idx: number) => {
                                  if (slots === 0) return null;
                                  return (
                                    <span key={idx} className="bg-fuchsia-950/50 text-fuchsia-300 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-900/40 font-mono" title={`Círculo ${idx + 1}: ${slots} espaços`}>
                                      {idx + 1}º:{slots}
                                    </span>
                                  );
                                })}
                                {row.spellSlots.every((s: number) => s === 0) && <span className="text-slate-600">—</span>}
                              </>
                            ) : (
                              <span className="bg-fuchsia-950/50 text-fuchsia-300 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-900/40 font-mono" title={`Círculo ${row.slotLevel || row.warlockSlotLevel}: ${row.spellSlots} espaços`}>
                                {row.slotLevel || row.warlockSlotLevel}º:{row.spellSlots}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subclasses (Especializações) */}
          {loadingSubs ? (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 text-center text-slate-400 text-sm">
              Carregando subclasses...
            </div>
          ) : subclasses.length > 0 ? (
            <div className="bg-slate-850 border border-slate-700 rounded-xl p-5 space-y-6 shadow-md">
              <div className="border-b border-slate-700/80 pb-3">
                <h4 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <span>✨</span> Subclasses & Especializações
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Escolha uma das especializações de {currentDetails.pt} disponíveis no {selectedClassKey === 'Fighter' ? 'Livro do Jogador 2024' : 'sistema'}.
                </p>
              </div>

              {/* Subclass Tabs */}
              <div className="flex flex-wrap gap-2">
                {subclasses.map((sub) => {
                  const subId = sub.id || sub.name;
                  const isSelected = selectedSubKey === subId;
                  return (
                    <button
                      key={subId}
                      onClick={() => setSelectedSubKey(subId)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-600/20 border-amber-500/80 text-amber-300 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected Subclass Details */}
              {subclasses.map((sub) => {
                const subId = sub.id || sub.name;
                if (selectedSubKey !== subId) return null;

                return (
                  <div key={subId} className="space-y-6 animate-fade-in">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-750/50">
                      <h5 className="font-bold text-slate-200 text-sm mb-1.5">Sobre o {sub.name}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{sub.description}</p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Habilidades de Subclasse</h5>
                      <div className="relative border-l-2 border-slate-700 ml-3 pl-5 space-y-5">
                        {sub.features?.map((feat: any, fIdx: number) => (
                          <div key={fIdx} className="relative">
                            {/* Bullet dot */}
                            <span className="absolute -left-[27px] top-1 w-3 h-3 bg-amber-500 border-2 border-slate-800 rounded-full shadow-sm" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-amber-400 font-bold text-xs">{feat.level}º Nível</span>
                                <span className="font-bold text-slate-200 text-sm">{feat.name}</span>
                                {feat.actionType && (
                                  <span className="text-[10px] px-2 py-0.5 bg-slate-850 border border-slate-700 text-slate-400 rounded-md font-medium">
                                    {feat.actionType}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">{feat.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Maneuvers Special Case (BattleMaster) */}
                    {sub.maneuvers && (
                      <div className="space-y-3 pt-4 border-t border-slate-700/60">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <span>🎯</span> Manobras do Mestre da Batalha ({sub.maneuvers.length})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sub.maneuvers.map((man: any, mIdx: number) => (
                            <div key={mIdx} className="bg-slate-900/25 border border-slate-800 p-3 rounded-lg hover:border-slate-700 transition-all">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-slate-200 text-xs">{man.name}</span>
                                <span className="text-[9px] bg-slate-950/60 border border-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">
                                  {man.actionType}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-normal">{man.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 text-center text-slate-500 text-xs">
              Nenhuma subclasse cadastrada no momento para {currentDetails.pt}.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
