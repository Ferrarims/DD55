import React, { useState, useMemo } from 'react';
import { getAllShopCatalog } from '../../lib/mechanics/xpAndLootManager';
import { ShopCatalogItem } from '../../types/item';

const stripLeadingEmoji = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  return name.replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u, '').trim();
};

const getWeaponMastery = (name: string): string | null => {
  const lowerName = name.toLowerCase();

  // 1. Cleave (Fender)
  if (
    lowerName.includes('machado grande') ||
    lowerName.includes('glaive') ||
    lowerName.includes('alabarda')
  ) {
    return 'Cleave (Fender)';
  }

  // 2. Graze (Rozar)
  if (
    lowerName.includes('espada grande') ||
    lowerName.includes('espada longa')
  ) {
    return 'Graze (Rozar)';
  }

  // 3. Topple (Derrubar)
  if (
    lowerName.includes('machado de batalha') ||
    lowerName.includes('bordão') ||
    lowerName.includes('cajado') ||
    lowerName.includes('malho') ||
    lowerName.includes('tridente') ||
    lowerName.includes('lança de montaria') ||
    lowerName.includes('lanca de montaria')
  ) {
    return 'Topple (Derrubar)';
  }

  // 4. Push (Empurrar)
  if (
    lowerName.includes('besta pesada') ||
    lowerName.includes('martelo de guerra') ||
    lowerName.includes('clava grande') ||
    lowerName.includes('lança longa') ||
    lowerName.includes('lanca longa')
  ) {
    return 'Push (Empurrar)';
  }

  // 5. Nick (Corte Rápido)
  if (
    lowerName.includes('adaga') ||
    lowerName.includes('cimitarra') ||
    lowerName.includes('foice') ||
    lowerName.includes('martelo leve')
  ) {
    return 'Nick (Corte Rápido)';
  }

  // 6. Sap (Enfraquecer)
  if (
    lowerName.includes('maça estrela') ||
    lowerName.includes('maca estrela') ||
    lowerName.includes('maça') ||
    lowerName.includes('maca') ||
    lowerName.includes('mangual') ||
    lowerName.includes('lança') ||
    lowerName.includes('lanca') ||
    lowerName.includes('picareta de guerra')
  ) {
    return 'Sap (Enfraquecer)';
  }

  // 7. Slow (Lentidão)
  if (
    lowerName.includes('azagaia') ||
    lowerName.includes('arco longo') ||
    lowerName.includes('besta leve') ||
    lowerName.includes('chicote') ||
    lowerName.includes('clava') ||
    lowerName.includes('funda') ||
    lowerName.includes('mosquete')
  ) {
    return 'Slow (Lentidão)';
  }

  // 8. Vex (Vexar)
  if (
    lowerName.includes('machadinha') ||
    lowerName.includes('espada curta') ||
    lowerName.includes('rapieira') ||
    lowerName.includes('arco curto') ||
    lowerName.includes('dardo') ||
    lowerName.includes('besta de mão') ||
    lowerName.includes('besta de mao') ||
    lowerName.includes('pistola') ||
    lowerName.includes('zarabatana')
  ) {
    return 'Vex (Vexar)';
  }

  return null;
};

const getWeaponMasteryDescription = (name: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('cleave') || n.includes('fender')) {
    return "Cleave (Fender): Ao acertar um ataque corpo a corpo, você pode realizar um ataque adicional contra outra criatura adjacente no alcance de 1,5m que ainda não tenha sido atingida neste turno (causa dano do dado da arma sem modificador).";
  }
  if (n.includes('graze') || n.includes('rozar')) {
    return "Graze (Rozar): Se você errar um ataque corpo a corpo com esta arma, você ainda causa dano igual ao modificador do seu atributo de ataque (mínimo de 1) ao alvo.";
  }
  if (n.includes('vex') || n.includes('vexar')) {
    return "Vex (Vexar): Se você acertar um ataque com esta arma, você ganha Vantagem na sua próxima jogada de ataque contra o mesmo alvo antes do final do seu próximo turno.";
  }
  if (n.includes('nick') || n.includes('corte rápido')) {
    return "Nick (Corte Rápido): Quando você depara com um ataque com uma arma Leve como parte de sua Ação, você pode fazer o ataque adicional da arma leve como parte da mesma ação em vez de usar sua Ação Bônus.";
  }
  if (n.includes('sap') || n.includes('enfraquecer')) {
    return "Sap (Enfraquecer): Se você acertar uma criatura com esta arma, o alvo sofre Desvantagem na próxima jogada de ataque que ele fizer antes do início do seu próximo turno.";
  }
  if (n.includes('slow') || n.includes('lentidão')) {
    return "Slow (Lentidão): Se você acertar uma criatura com esta arma, o deslocamento dela é reduzido em 3 metros até o início do seu próximo turno.";
  }
  if (n.includes('topple') || n.includes('derrubar')) {
    return "Topple (Derrubar): Se você acertar uma criatura com esta arma, você pode forçar o alvo a fazer um Teste de Resistência de Constituição. Se falhar, o alvo cai Caído (Prone).";
  }
  if (n.includes('push') || n.includes('empurrar')) {
    return "Push (Empurrar): Se você acertar uma criatura com esta arma, você pode empurrá-la até 3 metros de distância em linha reta.";
  }
  return `Maestria de Arma (${name}): Propriedade especial da arma aplicada automaticamente ao acertar ataques.`;
};

interface ShopTabProps {
  currentGoldNumber: number;
  handleBuyItem: (item: ShopCatalogItem) => void;
  formatGold: (num: number) => string;
}

export const ShopTab: React.FC<ShopTabProps> = ({
  currentGoldNumber,
  handleBuyItem,
  formatGold
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const shopCatalog = useMemo(() => getAllShopCatalog(), []);

  // Filtragem do Catálogo da Loja
  const filteredShopCatalog = useMemo(() => {
    return shopCatalog.filter(item => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'Armas Simples') return item.category.includes('Armas Simples');
      if (categoryFilter === 'Armas Marciais') return item.category.includes('Armas Marciais');
      if (categoryFilter === 'Armadura') return item.category.includes('Armadura') || item.category.includes('Escudo');
      if (categoryFilter === 'Equipamento de Aventura') return item.category.includes('Aventura') || item.category.includes('Geral');
      return true;
    });
  }, [shopCatalog, searchQuery, categoryFilter]);

  return (
    <div className="space-y-3">
      {/* Filtros de Categoria e Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar armas, armaduras, poções, kits..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1.5 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Seletor de Categoria */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
        >
          <option value="all" className="bg-slate-900 text-slate-200">Todas as Categorias</option>
          <option value="Armas Simples" className="bg-slate-900 text-slate-200">Armas Simples</option>
          <option value="Armas Marciais" className="bg-slate-900 text-slate-200">Armas Marciais</option>
          <option value="Armadura" className="bg-slate-900 text-slate-200">Armaduras &amp; Escudos</option>
          <option value="Equipamento de Aventura" className="bg-slate-900 text-slate-200">Aventura &amp; Poções</option>
        </select>
      </div>

      {/* Lista do Catálogo da Loja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredShopCatalog.map((item, idx) => {
          const canAfford = currentGoldNumber >= item.pricePO;
          const weaponMastery = getWeaponMastery(item.name);

          return (
            <div
              key={item.id || `${item.name}-${idx}`}
              className="bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 p-3 rounded-xl flex flex-col justify-between gap-2 transition shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-100">{stripLeadingEmoji(item.name)}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {item.cost}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Cat: {item.category}</span>
                    {item.weight && <span>Peso: {item.weight}</span>}
                  </div>
                  {item.damage && <div className="text-red-400 font-semibold">Dano: {item.damage}</div>}
                  {item.armor_class && <div className="text-amber-400 font-semibold">CA: {item.armor_class}</div>}
                  {item.properties && <div className="text-slate-400 italic">Prop: {item.properties}</div>}
                  {weaponMastery && (
                    <div
                      className="text-amber-500 font-semibold flex items-center gap-1 cursor-help mt-0.5"
                      title={getWeaponMasteryDescription(weaponMastery)}
                    >
                      <span>🎯 Maestria:</span>
                      <span className="underline decoration-dotted">{weaponMastery}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Compra */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Revenda: <span className="text-emerald-400 font-bold">{item.sellPricePO} PO</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleBuyItem(item)}
                  disabled={!canAfford}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                    canAfford
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                  title={
                    canAfford
                      ? `Comprar ${item.name} por ${item.cost}`
                      : `Moedas insuficientes (${formatGold(currentGoldNumber)} < ${item.cost})`
                  }
                >
                  <span>🛒 Comprar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
