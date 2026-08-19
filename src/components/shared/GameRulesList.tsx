import React, { useState, useEffect } from 'react';
import { fetchGameRulesFromDb, GameRule } from '../../lib/api/gameRulesService';

const LOCAL_FALLBACK_RULES: GameRule[] = [
  {
    id: 'local-1',
    title: 'Descanso Curto',
    description: 'No jogo, o descanso curto é realizado no meio da aventura usando um item de acampamento (como Saco de Dormir ou Tenda) pelo Inventário, e apenas se não houver monstros vivos na área. Realizar o descanso consome 1 Ração. Durante o descanso, abrirá um menu onde você pode escolher quantos dos seus Dados de Vida disponíveis deseja gastar para recuperar Pontos de Vida. Além disso, todas as habilidades da sua classe que se recarregam em Descanso Curto serão restauradas automaticamente.',
    category: 'Descanso'
  },
  {
    id: 'local-2',
    title: 'Descanso Longo',
    description: 'No jogo, o descanso longo só pode ser realizado ao interagir com um "Ponto de Descanso" (Acampamento) localizado no próprio chão do mapa (simbolizado por uma tenda no mapa). Só é permitido realizar esse descanso se NÃO houver nenhum monstro vivo na área atual e você não pode estar Inconsciente (precisa ter no mínimo 1 PV). O descanso longo restaura todos os seus Pontos de Vida (PV) ao máximo, recupera 100% dos seus Dados de Vida e recarrega todos os espaços de magia e habilidades diárias da sua classe ou raça. Além disso, sempre que você sair da arena e voltar para a ficha do personagem, um Descanso Longo é realizado automaticamente.',
    category: 'Descanso'
  }
];

export const GameRulesList: React.FC = () => {
  const [rules, setRules] = useState<GameRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRules() {
      setLoading(true);
      const data = await fetchGameRulesFromDb();
      if (data && data.length > 0) {
        setRules(data);
      } else {
        setRules(LOCAL_FALLBACK_RULES);
      }
      setLoading(false);
    }
    loadRules();
  }, []);

  // Agrupar por categoria
  const rulesByCategory = rules.reduce((acc, rule) => {
    const cat = rule.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rule);
    return acc;
  }, {} as Record<string, GameRule[]>);

  if (loading) {
    return (
      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">📜</div>
          <h2 className="text-xl font-bold text-amber-500">Carregando Regras...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
        <span className="text-4xl">📚</span>
        <div>
          <h2 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
            Regras do Jogo
          </h2>
          <p className="text-slate-400 text-sm">
            Consulte as principais mecânicas e regras para a sua aventura.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(rulesByCategory as Record<string, any[]>).map(([category, catRules]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 flex items-center gap-2">
              <span className="text-slate-400">#</span> {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catRules.map((rule, rIdx) => (
                <div key={`${rule.id || rule.title}-${rIdx}`} className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-amber-500/30 transition-colors">
                  <h4 className="text-lg font-bold text-slate-200 mb-2">
                    {rule.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Nenhuma regra encontrada no banco de dados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRulesList;
