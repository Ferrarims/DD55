import React, { useState } from 'react';
import { InventoryWeightBar } from './inventory/InventoryWeightBar';
import { InventoryCategoryFilter, InventoryCategoryType } from './inventory/InventoryCategoryFilter';
import { InventoryCategorySection } from './inventory/InventoryCategorySection';

interface InventoryTabProps {
  character: any;
  categorizedInventory: {
    armaduras: any[];
    armas: any[];
    municoes: any[];
    consumiveis: any[];
    outros: any[];
    teste: any[];
    all: any[];
    totalConsumiveis: number;
  };
  totalInventoryWeight: number;
  maxWeightCapacity: number;
  isOverburdened: boolean;
  isItemEquippedAnywhere: (itemName: string) => boolean;
  canItemBeEquipped: (itemName: string) => boolean;
  isConsumableItem: (itemName: string) => boolean;
  getEquipmentType: (itemName: string) => 'armor' | 'shield' | 'ring' | null;
  handleToggleEquipInInventory: (itemName: string) => void;
  handleConsumeItem: (inventoryId: string) => void;
  handleSellItem: (index: number) => void;
  setShowSlotsModal?: (show: boolean) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  character,
  categorizedInventory,
  totalInventoryWeight,
  maxWeightCapacity,
  isOverburdened,
  isItemEquippedAnywhere,
  canItemBeEquipped,
  isConsumableItem,
  getEquipmentType,
  handleToggleEquipInInventory,
  handleConsumeItem,
  handleSellItem
}) => {
  const [invCategoryFilter, setInvCategoryFilter] = useState<InventoryCategoryType>('all');

  const hasItems = categorizedInventory?.all?.length > 0 || (character.character_inventory && character.character_inventory.length > 0);

  return (
    <div className="space-y-4">
      {/* Sistema de Peso do Inventário / Capacidade de Carga */}
      <InventoryWeightBar
        character={character}
        totalInventoryWeight={totalInventoryWeight}
        maxWeightCapacity={maxWeightCapacity}
        isOverburdened={isOverburdened}
      />

      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
        <p className="text-slate-400 text-[11px]">
          💡 <strong>Regra de Venda:</strong> Cada item é vendido por <strong>metade (50%) do preço de compra</strong> do livro oficial D&amp;D.
        </p>
      </div>

      {/* Botões de Filtro de Categorias no Inventário */}
      <InventoryCategoryFilter
        currentFilter={invCategoryFilter}
        onSelectFilter={setInvCategoryFilter}
        counts={{
          all: categorizedInventory.all.length,
          armaduras: categorizedInventory.armaduras.length,
          armas: categorizedInventory.armas.length,
          municoes: categorizedInventory.municoes.length,
          consumiveis: categorizedInventory.totalConsumiveis,
          outros: categorizedInventory.outros.length,
          teste: categorizedInventory.teste.length
        }}
      />

      {hasItems ? (
        <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
          {/* Armaduras */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'armaduras') && (
            <InventoryCategorySection
              title="Armaduras & Proteções"
              icon="🛡️"
              titleColor="text-blue-400"
              items={categorizedInventory.armaduras}
              category="armaduras"
              showHeading={invCategoryFilter === 'all'}
              emptyMessage={invCategoryFilter === 'armaduras' ? 'Nenhuma armadura no inventário.' : undefined}
              character={character}
              isItemEquippedAnywhere={isItemEquippedAnywhere}
              canItemBeEquipped={canItemBeEquipped}
              isConsumableItem={isConsumableItem}
              getEquipmentType={getEquipmentType}
              handleToggleEquipInInventory={handleToggleEquipInInventory}
              handleConsumeItem={handleConsumeItem}
              handleSellItem={handleSellItem}
            />
          )}

          {/* Armas */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'armas') && (
            <InventoryCategorySection
              title="Armas"
              icon="⚔️"
              titleColor="text-red-400"
              items={categorizedInventory.armas}
              category="armas"
              showHeading={invCategoryFilter === 'all'}
              emptyMessage={invCategoryFilter === 'armas' ? 'Nenhuma arma no inventário.' : undefined}
              character={character}
              isItemEquippedAnywhere={isItemEquippedAnywhere}
              canItemBeEquipped={canItemBeEquipped}
              isConsumableItem={isConsumableItem}
              getEquipmentType={getEquipmentType}
              handleToggleEquipInInventory={handleToggleEquipInInventory}
              handleConsumeItem={handleConsumeItem}
              handleSellItem={handleSellItem}
            />
          )}

          {/* Munições */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'municoes') && (
            <InventoryCategorySection
              title="Munições"
              icon="🏹"
              titleColor="text-emerald-400"
              items={categorizedInventory.municoes}
              category="municoes"
              showHeading={invCategoryFilter === 'all'}
              emptyMessage={invCategoryFilter === 'municoes' ? 'Nenhuma munição no inventário.' : undefined}
              character={character}
              isItemEquippedAnywhere={isItemEquippedAnywhere}
              canItemBeEquipped={canItemBeEquipped}
              isConsumableItem={isConsumableItem}
              getEquipmentType={getEquipmentType}
              handleToggleEquipInInventory={handleToggleEquipInInventory}
              handleConsumeItem={handleConsumeItem}
              handleSellItem={handleSellItem}
            />
          )}

          {/* Consumíveis */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'consumiveis') && (
            <InventoryCategorySection
              title="Consumíveis"
              icon="🧪"
              titleColor="text-rose-400"
              items={categorizedInventory.consumiveis}
              category="consumiveis"
              showHeading={invCategoryFilter === 'all'}
              emptyMessage={invCategoryFilter === 'consumiveis' ? 'Nenhum item consumível no inventário.' : undefined}
              character={character}
              isItemEquippedAnywhere={isItemEquippedAnywhere}
              canItemBeEquipped={canItemBeEquipped}
              isConsumableItem={isConsumableItem}
              getEquipmentType={getEquipmentType}
              handleToggleEquipInInventory={handleToggleEquipInInventory}
              handleConsumeItem={handleConsumeItem}
              handleSellItem={handleSellItem}
            />
          )}

          {/* Outros Itens */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'outros') && (
            <InventoryCategorySection
              title="Outros Itens"
              icon="🎒"
              titleColor="text-purple-400"
              items={categorizedInventory.outros}
              category="outros"
              showHeading={invCategoryFilter === 'all'}
              emptyMessage={invCategoryFilter === 'outros' ? 'Nenhum outro item no inventário.' : undefined}
              character={character}
              isItemEquippedAnywhere={isItemEquippedAnywhere}
              canItemBeEquipped={canItemBeEquipped}
              isConsumableItem={isConsumableItem}
              getEquipmentType={getEquipmentType}
              handleToggleEquipInInventory={handleToggleEquipInInventory}
              handleConsumeItem={handleConsumeItem}
              handleSellItem={handleSellItem}
            />
          )}

          {/* Teste */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'teste') && (
            <InventoryCategorySection
              title="Itens de Teste"
              icon="🧪"
              titleColor="text-amber-400"
              items={categorizedInventory.teste}
              category="teste"
              showHeading={invCategoryFilter === 'all'}
              emptyMessage={invCategoryFilter === 'teste' ? 'Nenhum item de teste no inventário. Clique em "Adicionar Itens de Teste" acima para carregar todos.' : undefined}
              character={character}
              isItemEquippedAnywhere={isItemEquippedAnywhere}
              canItemBeEquipped={canItemBeEquipped}
              isConsumableItem={isConsumableItem}
              getEquipmentType={getEquipmentType}
              handleToggleEquipInInventory={handleToggleEquipInInventory}
              handleConsumeItem={handleConsumeItem}
              handleSellItem={handleSellItem}
            />
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-xl">
          <p className="text-sm text-slate-300 font-semibold">Seu inventário está vazio!</p>
          <p className="text-xs text-slate-500 mt-1">
            Acesse a aba <strong>🛒 Loja (Comprar)</strong> para adquirir novos equipamentos.
          </p>
        </div>
      )}
    </div>
  );
};
