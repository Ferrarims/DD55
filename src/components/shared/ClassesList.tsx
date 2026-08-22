import { useState, useEffect } from 'react';
import { CLASS_REFERENCE, FIGHTER_SUBCLASSES } from '../../lib/api/references';
import { supabase } from '../../lib/api/supabase';
import { ClassQuickStats } from './classes/ClassQuickStats';
import { ClassProgressionTable } from './classes/ClassProgressionTable';
import { ClassSubclasses } from './classes/ClassSubclasses';

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

        const { data: cls } = await supabase
          .from('classes')
          .select('id')
          .ilike('name', ptName)
          .maybeSingle();

        const clsObj = cls as any;
        if (clsObj) {
          const { data: subs } = await supabase
            .from('subclasses')
            .select('*, subclass_features(*)')
            .eq('class_id', clsObj.id);

          const subsData = subs as any[];
          if (subsData && subsData.length > 0) {
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

      if (selectedClassKey === 'Fighter') {
        const formatted = Object.entries(FIGHTER_SUBCLASSES).map(([key, sub]) => ({
          id: key,
          name: sub.name,
          description: sub.description,
          features: sub.features,
          maneuvers: (sub as any).maneuvers
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

  const progressionKeys = (currentClassData.progression as any[]).reduce((acc: string[], row: any) => {
    Object.keys(row).forEach(key => {
      if (!['level', 'prof', 'features', 'spellSlots', 'metadata'].includes(key) && !acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, []);

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

          <ClassQuickStats currentClassData={currentClassData} />

          <ClassProgressionTable
            currentClassData={currentClassData}
            progressionKeys={progressionKeys}
            getColLabel={getColLabel}
          />

          <ClassSubclasses
            ptName={currentDetails.pt}
            classKey={selectedClassKey as string}
            subclasses={subclasses}
            selectedSubKey={selectedSubKey}
            setSelectedSubKey={setSelectedSubKey}
            loadingSubs={loadingSubs}
          />
        </div>
      </div>
    </div>
  );
}
