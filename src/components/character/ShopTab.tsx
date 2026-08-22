import React, { useState, useMemo } from 'react';
import { getAllShopCatalog } from '../../lib/mechanics/xpAndLootManager';
import { ShopCatalogItem } from '../../types/item';
import { ShopCatalogItemCard } from './shop/ShopCatalogItemCard';

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
        {filteredShopCatalog.map((item, idx) => (
          <ShopCatalogItemCard
            key={item.id || `${item.name}-${idx}`}
            item={item}
            idx={idx}
            currentGoldNumber={currentGoldNumber}
            handleBuyItem={handleBuyItem}
            formatGold={formatGold}
          />
        ))}
      </div>
    </div>
  );
};
