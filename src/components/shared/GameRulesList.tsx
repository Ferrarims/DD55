import React, { useState, useEffect, useMemo } from 'react';
import { fetchGameRulesFromDb, GameRule } from '../../lib/api/gameRulesService';

const CATEGORY_ORDER = [
  'Raças & Espécies',
  'Descanso & Recuperação',
  'Combate & Ações',
  'Morte & Sobrevivência',
  'Maestria com Armas',
  'Posicionamento & Cobertura',
  'Iluminação & Sentidos',
  'Ambiente & Clima',
  'Magias & Conjuração',
  'Perícias & Atributos',
  'Condições de Status',
];

export const GameRulesList: React.FC = () => {
  const [rules, setRules] = useState<GameRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(true);

  useEffect(() => {
    async function loadRules() {
      setLoading(true);
      const data = await fetchGameRulesFromDb();
      setRules(data);
      setLoading(false);
    }
    loadRules();
  }, []);

  // Obter categorias únicas com suas contagens ordenadas
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    rules.forEach(rule => {
      const cat = rule.category || 'Geral';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Ordenar de acordo com CATEGORY_ORDER
    const sorted: Record<string, number> = {};
    CATEGORY_ORDER.forEach(cat => {
      if (counts[cat]) sorted[cat] = counts[cat];
    });
    Object.keys(counts).forEach(cat => {
      if (!sorted[cat]) sorted[cat] = counts[cat];
    });

    return sorted;
  }, [rules]);

  // Filtragem por busca e categoria
  const filteredRules = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return rules.filter(rule => {
      const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!term) return true;

      const titleMatch = rule.title.toLowerCase().includes(term);
      const subtitleMatch = rule.subtitle?.toLowerCase().includes(term);
      const descMatch = rule.description.toLowerCase().includes(term);
      const appUsageMatch = rule.appUsage?.toLowerCase().includes(term);
      const tagMatch = rule.tags?.some(t => t.toLowerCase().includes(term));
      const effectsMatch = rule.effects?.some(
        e => e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term)
      );

      return titleMatch || subtitleMatch || descMatch || appUsageMatch || tagMatch || effectsMatch;
    });
  }, [rules, searchTerm, selectedCategory]);

  // Agrupar regras filtradas por categoria ordenada para exibição
  const rulesByCategory = useMemo(() => {
    const grouped = filteredRules.reduce((acc, rule) => {
      const cat = rule.category || 'Geral';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(rule);
      return acc;
    }, {} as Record<string, GameRule[]>);

    const sortedGrouped: Record<string, GameRule[]> = {};
    CATEGORY_ORDER.forEach(cat => {
      if (grouped[cat]) sortedGrouped[cat] = grouped[cat];
    });
    Object.keys(grouped).forEach(cat => {
      if (!sortedGrouped[cat]) sortedGrouped[cat] = grouped[cat];
    });

    return sortedGrouped;
  }, [filteredRules]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newExpanded: Record<string, boolean> = {};
    rules.forEach(r => {
      newExpanded[r.id] = nextState;
    });
    setExpandedCards(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Raça') || category.includes('Espécie')) return '🧬';
    if (category.includes('Descanso')) return '⛺';
    if (category.includes('Combate')) return '⚔️';
    if (category.includes('Morte')) return '💀';
    if (category.includes('Maestria')) return '🔱';
    if (category.includes('Posicionamento') || category.includes('Cobertura')) return '🧱';
    if (category.includes('Iluminação') || category.includes('Sentidos')) return '🕯️';
    if (category.includes('Ambiente') || category.includes('Clima')) return '🌧️';
    if (category.includes('Magia')) return '✨';
    if (category.includes('Perícia') || category.includes('Atributo')) return '📊';
    if (category.includes('Condiç')) return '📜';
    return '📖';
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700/80 h-full flex items-center justify-center shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">📜</div>
          <h2 className="text-2xl font-bold text-amber-500 font-serif">Compêndio de Regras</h2>
          <p className="text-slate-400 text-sm mt-2">Carregando sistemas e mecânicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col h-full backdrop-blur-md">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/80 bg-slate-950/60 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/40 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
              📚
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 tracking-wide font-serif flex items-center gap-2">
                Regras do Jogo
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Consulte as regras oficiais e entenda o funcionamento prático de cada sistema dentro do aplicativo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={toggleExpandAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
              title={allExpanded ? 'Recolher todos os cards' : 'Expandir todos os cards'}
            >
              <span>{allExpanded ? '🔼' : '🔽'}</span>
              <span>{allExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por regra, condição, raça, comando, ação ou mecânica do app..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2 self-end md:self-center font-mono">
            <span>Mostrando <strong className="text-amber-400">{filteredRules.length}</strong> de <strong className="text-slate-300">{rules.length}</strong> regras</span>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span>✨</span>
            <span>Todas as Regras</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
              {rules.length}
            </span>
          </button>

          {Object.entries(categories).map(([catName, count]) => {
            const isSelected = selectedCategory === catName;
            const icon = getCategoryIcon(catName);
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span>{icon}</span>
                <span>{catName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Body */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-8">
        {filteredRules.length === 0 ? (
          <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800 p-6 flex flex-col items-center">
            <span className="text-5xl mb-3">🔍</span>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Nenhuma regra encontrada</h3>
            <p className="text-slate-400 text-sm max-w-md mb-4">
              Não encontramos nenhuma regra ou mecânica com o termo &quot;<strong>{searchTerm}</strong>&quot;.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg"
            >
              Limpar Filtros e Ver Todas
            </button>
          </div>
        ) : (
          Object.entries(rulesByCategory).map(([category, catRulesList]) => {
            const catRules = catRulesList as GameRule[];
            return (
            <section key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2 font-serif">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                  <span className="text-xs font-sans font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {catRules.length} {catRules.length === 1 ? 'regra' : 'regras'}
                  </span>
                </h3>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {catRules.map(rule => {
                  const isExpanded = expandedCards[rule.id] !== undefined ? expandedCards[rule.id] : allExpanded;

                  return (
                    <article
                      key={rule.id || rule.title}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3 cursor-pointer" onClick={() => toggleCard(rule.id)}>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl sm:text-3xl p-2 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                              {rule.icon || getCategoryIcon(rule.category)}
                            </span>
                            <div>
                              <h4 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-tight">
                                {rule.title}
                              </h4>
                              {rule.subtitle && (
                                <p className="text-xs text-amber-500/90 font-medium mt-0.5">
                                  {rule.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(rule.id);
                            }}
                            className="text-slate-400 hover:text-slate-200 p-1 text-sm rounded bg-slate-800/50 hover:bg-slate-800"
                            title={isExpanded ? 'Recolher' : 'Expandir'}
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </div>

                        {/* Tags */}
                        {rule.tags && rule.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {rule.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/70"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="space-y-3.5 mt-2 text-sm">
                            {/* Section 1: Descrição Oficial */}
                            <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800/80">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                <span className="text-amber-400">📖</span>
                                <span>Descrição da Regra</span>
                              </div>
                              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                {rule.description}
                              </div>

                              {/* Sub-effects list if present */}
                              {rule.effects && rule.effects.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5">
                                  {rule.effects.map((eff, eIdx) => (
                                    <div key={eIdx} className="text-xs flex items-start gap-1.5">
                                      <span className="text-amber-500 font-bold">•</span>
                                      <div>
                                        <strong className="text-slate-200">{eff.title}:</strong>{' '}
                                        <span className="text-slate-400">{eff.description}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Section 2: Como Funciona no App */}
                            {rule.appUsage && (
                              <div className="bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950/90 rounded-xl p-3.5 border border-amber-500/30 shadow-inner">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                                  <span>📱</span>
                                  <span>Como Funciona no Aplicativo</span>
                                </div>
                                <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                  {rule.appUsage}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Highlight */}
                      {rule.highlight && (
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                            <span>💡</span> {rule.highlight}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameRulesList;
