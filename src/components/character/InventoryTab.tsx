import React, { useState } from 'react';
import { getItemWeight, parseWeightToKg, getItemPriceInfo } from '../../lib/mechanics/xpAndLootManager';
import { getCachedEquipmentReference } from '../../lib/api/itemsService';
import { 
  isProficientWithWeapon, 
  isProficientWithArmor, 
  checkHeavyArmorStrengthReq, 
  getNonProficientArmorPenalties 
} from '../../lib/mechanics/proficiencyUtils';

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

const getRefInfo = (cleanName: string) => {
  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();
  const stackMatch = cleanName.match(/^(.*?) \((\d+)\)$/);
  let baseName = cleanName;
  let hasStack = false;
  if (stackMatch) {
    baseName = stackMatch[1].trim();
    hasStack = true;
  }
  let matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
    key => key.toLowerCase() === cleanName.toLowerCase()
  );
  if (!matchedKey && hasStack) {
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(key => {
      const keyStackMatch = key.match(/^(.*?) \((\d+)\)$/);
      if (keyStackMatch) {
        return keyStackMatch[1].trim().toLowerCase() === baseName.toLowerCase();
      }
      return key.toLowerCase() === baseName.toLowerCase();
    });
  }
  if (!matchedKey) {
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
      key => key !== 'Equipamento de Aventura' && (cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase()))
    );
  }
  return matchedKey ? EQUIPMENT_REFERENCE[matchedKey] : null;
};

const shortenCategory = (category: string): string => {
  if (!category) return '';
  let cat = category;
  cat = cat.replace('Armas Marciais Corpo a Corpo', 'Marcial Corpo a Corpo');
  cat = cat.replace('Armas Simples Corpo a Corpo', 'Simples Corpo a Corpo');
  cat = cat.replace('Armas Marciais de Longo Alcance', 'Marcial Dist.');
  cat = cat.replace('Armas Simples de Longo Alcance', 'Simples Dist.');
  cat = cat.replace('Armadura Pesada', 'Pesada');
  cat = cat.replace('Armadura Média', 'Média');
  cat = cat.replace('Armadura Leve', 'Leve');
  cat = cat.replace('Equipamento de Aventura', 'Aventura');
  return cat;
};

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
  const [invCategoryFilter, setInvCategoryFilter] = useState<'all' | 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste'>('all');

  const renderCantilCharges = (itemName: string, quantity: number = 1) => {
    if (!itemName.toLowerCase().includes('cantil')) return null;
    const waterResource = (character.class_resources || []).find((r: any) => r.name === "Cantil de Água");
    
    const maxCapacity = quantity * 10;
    const used = waterResource ? (waterResource.used || 0) : 0;
    const remaining = Math.max(0, maxCapacity - used);

    return (
      <span className="bg-blue-950 text-blue-300 border border-blue-500/50 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ml-1">
        💧 {remaining}/{maxCapacity}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sistema de Peso do Inventário / Capacidade de Carga */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🏋️‍♂️</span>
            <div>
              <span className="font-bold text-slate-300">Capacidade de Carga</span>
              <p className="text-[10px] text-slate-500">
                Baseado em sua Força ({character.strength || 10} × {maxWeightCapacity >= (character.strength || 10) * 30 ? '30' : '15'} kg{maxWeightCapacity >= (character.strength || 10) * 30 ? ' • Porte Poderoso 🪨' : ''})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-slate-100 font-mono font-bold text-sm">
              {totalInventoryWeight.toFixed(1)} <span className="text-slate-400 font-normal text-xs">/ {maxWeightCapacity} kg</span>
            </span>
            {isOverburdened ? (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded animate-pulse">
                ⚠️ Sobrecarregado
              </span>
            ) : totalInventoryWeight > maxWeightCapacity * 0.8 ? (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded">
                Carga Pesada
              </span>
            ) : totalInventoryWeight > maxWeightCapacity * 0.5 ? (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                Carga Média
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                Carga Leve
              </span>
            )}
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
          <div
            style={{ width: `${Math.min(100, (totalInventoryWeight / maxWeightCapacity) * 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isOverburdened
                ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                : totalInventoryWeight > maxWeightCapacity * 0.8
                ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                : totalInventoryWeight > maxWeightCapacity * 0.5
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
          />
        </div>
        
        {/* Mensagem de alerta */}
        {isOverburdened && (
          <p className="text-[10px] text-rose-400/90 font-medium flex items-center gap-1">
            <span>⚠️</span> <strong>Limite Excedido!</strong> O peso total dos itens excede a capacidade de carga recomendada. O personagem pode sofrer penalidades de movimentação.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
        <p className="text-slate-400 text-[11px]">
          💡 <strong>Regra de Venda:</strong> Cada item é vendido por <strong>metade (50%) do preço de compra</strong> do livro oficial D&amp;D.
        </p>
      </div>

      {/* Botões de Filtro de Categorias no Inventário */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        
                          <button
          type="button"
          onClick={() => setInvCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'all'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>📦 Todos ({categorizedInventory.all.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setInvCategoryFilter('armaduras')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'armaduras'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>🛡️ Armaduras ({categorizedInventory.armaduras.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setInvCategoryFilter('armas')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'armas'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>⚔️ Armas ({categorizedInventory.armas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setInvCategoryFilter('municoes')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'municoes'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>🏹 Munições ({categorizedInventory.municoes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setInvCategoryFilter('consumiveis')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'consumiveis'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>🧪 Consumíveis ({categorizedInventory.totalConsumiveis})</span>
        </button>

        <button
          type="button"
          onClick={() => setInvCategoryFilter('outros')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'outros'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>🎒 Outros Itens ({categorizedInventory.outros.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setInvCategoryFilter('teste')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            invCategoryFilter === 'teste'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>🧪 Teste ({categorizedInventory.teste.length})</span>
        </button>
      </div>

      {(categorizedInventory?.all?.length > 0 || (character.character_inventory && character.character_inventory.length > 0)) ? (
        <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
          {/* Categoria: Armaduras */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'armaduras') && (
            <div className="space-y-2">
              {invCategoryFilter === 'all' && categorizedInventory.armaduras.length > 0 && (
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <span>🛡️</span> Armaduras &amp; Proteções ({categorizedInventory.armaduras.length})
                </h4>
              )}
              {categorizedInventory.armaduras.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorizedInventory.armaduras.map((itemObj) => {
                    const itemName = itemObj.name;
                    const index = itemObj.originalIndex;
                    const priceInfo = getItemPriceInfo(itemName);
                    const eqType = getEquipmentType(itemName);
                    const isEquipped = isItemEquippedAnywhere(itemName);
                    const isEquippable = canItemBeEquipped(itemName);
                    const refInfo = getRefInfo(itemName);

                    const isArmorProf = isProficientWithArmor(character, itemName);
                    const heavyReq = checkHeavyArmorStrengthReq(character, itemName);

                    return (
                      <div
                        key={`${itemName}-${index}`}
                        className={`p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm border ${
                          isEquipped
                            ? !isArmorProf
                              ? 'border-rose-600 bg-gradient-to-br from-rose-950/40 via-slate-900/95 to-slate-950 ring-1 ring-rose-500/30'
                              : 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className={`font-extrabold truncate text-sm ${isEquipped ? 'text-amber-300' : 'text-slate-100'}`} title={itemName}>
                                  {stripLeadingEmoji(itemName)}
                                </span>
                                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
                                  x{itemObj.quantity || 1}
                                </span>
                                {renderCantilCharges(itemName, itemObj.quantity || 1)}
                              </div>
                              <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-800 shrink-0">
                                {shortenCategory(priceInfo.category)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1 shrink-0">
                                  🛡️ Equipado
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                                  🎒 Na Mochila
                                </span>
                              )}
                              {isArmorProf ? (
                                <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                                  ⚡ Proficiente
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                                  ⚠️ Sem Proficiência
                                </span>
                              )}
                              {heavyReq.requiresMinStr && !heavyReq.met && (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                                  ⚠️ FOR Insuficiente ({character.strength || 10}/{heavyReq.minStr})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span>Preço: <strong className="text-slate-300">{priceInfo.costStr}</strong></span>
                              <span>Peso: <strong className="text-slate-300 font-mono">{(parseWeightToKg(getItemWeight(itemName)) * (itemObj.quantity || 1)).toFixed(2).replace('.', ',').replace(',00', '')} kg</strong></span>
                            </div>
                            {refInfo?.armor_class && (
                              <div className="text-amber-400 font-semibold mt-0.5">
                                CA: {refInfo.armor_class}
                              </div>
                            )}
                            {refInfo?.properties && (
                              <div className="text-slate-400 italic mt-0.5">
                                Prop: {refInfo.properties}
                              </div>
                            )}
                            {!isArmorProf && isEquipped && (
                              <div className="text-[10px] text-rose-200 bg-rose-950/80 border border-rose-600/80 p-1.5 rounded mt-1 space-y-0.5">
                                <div className="font-bold text-rose-300 flex items-center gap-1">
                                  <span>⚠️</span> Penalidades Ativas (Equipado sem Proficiência):
                                </div>
                                <p>• Desvantagem em testes, salvaguardas e ataques de FOR e DES.</p>
                                <p>• Bloqueio total da conjuração de magias.</p>
                              </div>
                            )}
                            {heavyReq.requiresMinStr && !heavyReq.met && isEquipped && (
                              <div className="text-[10px] text-amber-200 bg-amber-950/70 border border-amber-600/70 p-1.5 rounded mt-1">
                                ⚠️ <strong>Força Insuficiente:</strong> Deslocamento reduzido em -10 pés (-3m / -2 células).
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          {isEquippable ? (
                            <button
                              type="button"
                              onClick={() => handleToggleEquipInInventory(itemName)}
                              className={`px-2 py-1 text-[11px] font-black rounded-lg transition shadow flex items-center gap-1 ${
                                isEquipped
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 shadow-md'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }`}
                              title={isEquipped ? 'Desequipar item' : 'Equipar item'}
                            >
                              <span>{isEquipped ? 'Desequipar' : 'Equipar'}</span>
                            </button>
                          ) : (
                            <div className="text-[11px]">
                              <span className="text-slate-400">Recebe: </span>
                              <span className="font-extrabold text-emerald-400">+{priceInfo.sellPricePO} PO</span>
                            </div>
                          )}

                          {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(itemObj.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                              title="Usar / Consumir item"
                            >
                              <span>🧪 Usar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSellItem(itemObj.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                            title={`Vender ${itemName} por metade do preço (+${priceInfo.sellPricePO} PO)`}
                          >
                            <span>💰 Vender (+{priceInfo.sellPricePO} PO)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                invCategoryFilter === 'armaduras' && (
                  <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Nenhuma armadura no inventário.
                  </div>
                )
              )}
            </div>
          )}

          {/* Categoria: Armas */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'armas') && (
            <div className="space-y-2">
              {invCategoryFilter === 'all' && categorizedInventory.armas.length > 0 && (
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <span>⚔️</span> Armas ({categorizedInventory.armas.length})
                </h4>
              )}
              {categorizedInventory.armas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorizedInventory.armas.map((itemObj) => {
                    const itemName = itemObj.name;
                    const index = itemObj.originalIndex;
                    const priceInfo = getItemPriceInfo(itemName);
                    const eqType = getEquipmentType(itemName);
                    const isEquipped = isItemEquippedAnywhere(itemName);
                    const isEquippable = canItemBeEquipped(itemName);
                    const refInfo = getRefInfo(itemName);
                    const weaponMastery = getWeaponMastery(itemName);
                    const isWeaponProf = isProficientWithWeapon(character, itemName);

                    return (
                      <div
                        key={`${itemName}-${index}`}
                        className={`p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm border ${
                          isEquipped
                            ? !isWeaponProf
                              ? 'border-rose-600/80 bg-gradient-to-br from-rose-950/30 via-slate-900/95 to-slate-950 ring-1 ring-rose-500/30'
                              : 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className={`font-extrabold truncate text-sm ${isEquipped ? 'text-amber-300' : 'text-slate-100'}`} title={itemName}>
                                  {stripLeadingEmoji(itemName)}
                                </span>
                                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
                                  x{itemObj.quantity || 1}
                                </span>
                                {renderCantilCharges(itemName, itemObj.quantity || 1)}
                              </div>
                              <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-800 shrink-0">
                                {shortenCategory(priceInfo.category)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1 shrink-0">
                                  ⚔️ Equipado
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                                  🎒 Na Mochila
                                </span>
                              )}
                              {isWeaponProf ? (
                                <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                                  ⚡ Proficiente
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                                  ⚠️ Sem Proficiência
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span>Preço: <strong className="text-slate-300">{priceInfo.costStr}</strong></span>
                              <span>Peso: <strong className="text-slate-300 font-mono">{(parseWeightToKg(getItemWeight(itemName)) * (itemObj.quantity || 1)).toFixed(2).replace('.', ',').replace(',00', '')} kg</strong></span>
                            </div>
                            {refInfo?.damage && (
                              <div className="text-red-400 font-semibold mt-0.5">
                                Dano: {refInfo.damage}
                              </div>
                            )}
                            {refInfo?.properties && (
                              <div className="text-slate-400 italic mt-0.5">
                                Prop: {refInfo.properties}
                              </div>
                            )}
                            {weaponMastery && (
                              isWeaponProf ? (
                                <div
                                  className="text-amber-500 font-semibold flex items-center gap-1 cursor-help mt-1"
                                  title={getWeaponMasteryDescription(weaponMastery)}
                                >
                                  <span>🎯 Maestria:</span>
                                  <span className="underline decoration-dotted">{weaponMastery}</span>
                                </div>
                              ) : (
                                <div
                                  className="text-rose-400/80 font-semibold flex items-center gap-1 cursor-help mt-1"
                                  title="Recurso de Maestria bloqueado porque o personagem não tem proficiência com esta arma."
                                >
                                  <span>🎯 Maestria:</span>
                                  <span className="line-through">{weaponMastery}</span>
                                  <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1 rounded ml-1 font-mono">🚫 Bloqueado</span>
                                </div>
                              )
                            )}
                            {!isWeaponProf && (
                              <div className="text-[10px] text-rose-200 bg-rose-950/70 border border-rose-800/80 p-1.5 rounded mt-1.5 space-y-0.5">
                                ⚠️ <strong>Sem Proficiência:</strong> Bônus de Proficiência (+PB +{character.proficiencyBonus || character.proficiency_bonus || 2}) não é adicionado ao acerto; Recursos de Maestria são bloqueados.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          {isEquippable ? (
                            
                          <button
                              type="button"
                              onClick={() => handleToggleEquipInInventory(itemName)}
                              className={`px-2 py-1 text-[11px] font-black rounded-lg transition shadow flex items-center gap-1 ${
                                isEquipped
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 shadow-md'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }`}
                              title={isEquipped ? 'Desequipar item' : 'Equipar item'}
                            >
                              <span>{isEquipped ? 'Desequipar' : 'Equipar'}</span>
                            </button>
                          ) : (
                            <div className="text-[11px]">
                              <span className="text-slate-400">Recebe: </span>
                              <span className="font-extrabold text-emerald-400">+{priceInfo.sellPricePO} PO</span>
                            </div>
                          )}

                          {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(itemObj.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                              title="Usar / Consumir item"
                            >
                              <span>🧪 Usar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSellItem(itemObj.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                            title={`Vender ${itemName} por metade do preço (+${priceInfo.sellPricePO} PO)`}
                          >
                            <span>💰 Vender (+{priceInfo.sellPricePO} PO)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                invCategoryFilter === 'armas' && (
                  <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Nenhuma arma no inventário.
                  </div>
                )
              )}
            </div>
          )}

          {/* Categoria: Munições */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'municoes') && (
            <div className="space-y-2">
              {invCategoryFilter === 'all' && categorizedInventory.municoes.length > 0 && (
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <span>🏹</span> Munições ({categorizedInventory.municoes.length})
                </h4>
              )}
              {categorizedInventory.municoes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorizedInventory.municoes.map((itemObj) => {
                    const itemName = itemObj.name;
                    const index = itemObj.originalIndex;
                    const priceInfo = getItemPriceInfo(itemName);
                    const eqType = getEquipmentType(itemName);
                    const isEquipped = isItemEquippedAnywhere(itemName);
                    const isEquippable = canItemBeEquipped(itemName);
                    return (
                      <div
                        key={`municao-${itemName}-${index}`}
                        className={`p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm border ${
                          isEquipped
                            ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className={`font-extrabold truncate text-sm ${isEquipped ? 'text-amber-300' : 'text-slate-100'}`} title={itemName}>
                                  {stripLeadingEmoji(itemName)}
                                </span>
                                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
                                  x{itemObj.quantity || 1}
                                </span>
                                {renderCantilCharges(itemName, itemObj.quantity || 1)}
                              </div>
                              <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-800 shrink-0">
                                {shortenCategory(priceInfo.category)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1 shrink-0">
                                  🏹 Equipado
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                                  🎒 Na Mochila
                                </span>
                              )}
                              <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                🏹 Munição
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                            <span>Preço: <strong className="text-slate-300">{priceInfo.costStr}</strong></span>
                            <span>Peso: <strong className="text-slate-300 font-mono">{(parseWeightToKg(getItemWeight(itemName)) * (itemObj.quantity || 1)).toFixed(2).replace('.', ',').replace(',00', '')} kg</strong></span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="text-[11px]">
                            <span className="text-slate-400">Recebe: </span>
                            <span className="font-extrabold text-emerald-400">+{priceInfo.sellPricePO} PO</span>
                          </div>

                          
                          {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(itemObj.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                              title="Usar / Consumir item"
                            >
                              <span>🧪 Usar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSellItem(itemObj.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                            title={`Vender ${itemName} por metade do preço (+${priceInfo.sellPricePO} PO)`}
                          >
                            <span>💰 Vender (+{priceInfo.sellPricePO} PO)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                invCategoryFilter === 'municoes' && (
                  <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Nenhuma munição no inventário.
                  </div>
                )
              )}
            </div>
          )}

          {/* Categoria: Consumíveis */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'consumiveis') && (
            <div className="space-y-2">
              {invCategoryFilter === 'all' && categorizedInventory.consumiveis.length > 0 && (
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <span>🧪</span> Consumíveis ({categorizedInventory.totalConsumiveis})
                </h4>
              )}
              {categorizedInventory.consumiveis.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorizedInventory.consumiveis.map((itemObj) => {
                    const itemName = itemObj.name;
                    const index = itemObj.originalIndex;
                    const priceInfo = getItemPriceInfo(itemName);
                    const lowerName = itemName.toLowerCase();
                    const isRation = lowerName.includes('ração') || lowerName.includes('racao') || lowerName.includes('ration') || lowerName.includes('marmita') || lowerName.includes('comida');

                    return (
                      <div
                        key={`${itemName}-${index}`}
                        className="border border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85 p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="font-extrabold truncate text-sm text-slate-100" title={itemName}>
                                  {stripLeadingEmoji(itemName)}
                                </span>
                                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
                                  x{itemObj.quantity || 1}
                                </span>
                                {renderCantilCharges(itemName, itemObj.quantity || 1)}
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border shrink-0 ${
                                isRation
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/30 font-bold'
                                  : 'bg-slate-950 text-slate-400 border-slate-800'
                              }`}>
                                {isRation ? '⛺ Acampamento' : 'Consumível'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                                🎒 Na Mochila
                              </span>
                              <span className="text-[9px] uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                🧪 Consumível
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span>Preço: <strong className="text-slate-300">{priceInfo.costStr}</strong></span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Peso: <strong className="text-slate-300 font-mono">{(parseWeightToKg(getItemWeight(itemName)) * (itemObj.quantity || 1)).toFixed(2).replace('.', ',').replace(',00', '')} kg</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="text-[11px]">
                            <span className="text-slate-400">Recebe: </span>
                            <span className="font-extrabold text-emerald-400">+{priceInfo.sellPricePO} PO</span>
                          </div>

                          
                          {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(itemObj.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                              title="Usar / Consumir item"
                            >
                              <span>🧪 Usar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSellItem(itemObj.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                            title={`Vender 1 unidade de ${itemName} por metade do preço (+${priceInfo.sellPricePO} PO)`}
                          >
                            <span>💰 Vender (+{priceInfo.sellPricePO} PO)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                invCategoryFilter === 'consumiveis' && (
                  <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Nenhum item consumível no inventário.
                  </div>
                )
              )}
            </div>
          )}

          {/* Categoria: Outros Itens */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'outros') && (
            <div className="space-y-2">
              {invCategoryFilter === 'all' && categorizedInventory.outros.length > 0 && (
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <span>🎒</span> Outros Itens ({categorizedInventory.outros.length})
                </h4>
              )}
              {categorizedInventory.outros.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorizedInventory.outros.map((itemObj) => {
                    const itemName = itemObj.name;
                    const index = itemObj.originalIndex;
                    const priceInfo = getItemPriceInfo(itemName);
                    const eqType = getEquipmentType(itemName);
                    const isEquipped = isItemEquippedAnywhere(itemName);
                    const isEquippable = canItemBeEquipped(itemName);
                    return (
                      <div
                        key={`${itemName}-${index}`}
                        className={`p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm border ${
                          isEquipped
                            ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className={`font-extrabold truncate text-sm ${isEquipped ? 'text-amber-300' : 'text-slate-100'}`} title={itemName}>
                                  {stripLeadingEmoji(itemName)}
                                </span>
                                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
                                  x{itemObj.quantity || 1}
                                </span>
                                {renderCantilCharges(itemName, itemObj.quantity || 1)}
                              </div>
                              <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-800 shrink-0">
                                {shortenCategory(priceInfo.category)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1 shrink-0">
                                  💡 Equipado
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                                  🎒 Na Mochila
                                </span>
                              )}
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                  ⚡ Ativo
                                </span>
                              ) : isEquippable ? (
                                <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                  💡 Equipável
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-slate-800/60 text-slate-400 border border-slate-700/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                  📦 Utilitário
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                            <span>Preço: <strong className="text-slate-300">{priceInfo.costStr}</strong></span>
                            <span>Peso: <strong className="text-slate-300 font-mono">{(parseWeightToKg(getItemWeight(itemName)) * (itemObj.quantity || 1)).toFixed(2).replace('.', ',').replace(',00', '')} kg</strong></span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          {isEquippable ? (
                            
                          <button
                              type="button"
                              onClick={() => handleToggleEquipInInventory(itemName)}
                              className={`px-2 py-1 text-[11px] font-black rounded-lg transition shadow flex items-center gap-1 ${
                                isEquipped
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 shadow-md'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }`}
                              title={isEquipped ? 'Desequipar item' : 'Equipar item'}
                            >
                              <span>{isEquipped ? 'Desequipar' : 'Equipar'}</span>
                            </button>
                          ) : (
                            <div className="text-[11px]">
                              <span className="text-slate-400">Recebe: </span>
                              <span className="font-extrabold text-emerald-400">+{priceInfo.sellPricePO} PO</span>
                            </div>
                          )}

                          {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(itemObj.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                              title="Usar / Consumir item"
                            >
                              <span>🧪 Usar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSellItem(itemObj.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                            title={`Vender ${itemName} por metade do preço (+${priceInfo.sellPricePO} PO)`}
                          >
                            <span>💰 Vender (+{priceInfo.sellPricePO} PO)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                invCategoryFilter === 'outros' && (
                  <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Nenhum outro item no inventário.
                  </div>
                )
              )}
            </div>
          )}

          {/* Categoria: Teste / Decorativo */}
          {(invCategoryFilter === 'all' || invCategoryFilter === 'teste') && (
            <div className="space-y-2">
              {invCategoryFilter === 'all' && categorizedInventory.teste.length > 0 && (
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <span>🧪</span> Itens de Teste ({categorizedInventory.teste.length})
                </h4>
              )}
              {categorizedInventory.teste.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorizedInventory.teste.map((itemObj) => {
                    const itemName = itemObj.name;
                    const index = itemObj.originalIndex;
                    const priceInfo = getItemPriceInfo(itemName);
                    const isEquipped = isItemEquippedAnywhere(itemName);
                    const isEquippable = canItemBeEquipped(itemName);
                    return (
                      <div
                        key={`${itemName}-${index}`}
                        className={`p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm border ${
                          isEquipped
                            ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className={`font-extrabold truncate text-sm ${isEquipped ? 'text-amber-300' : 'text-slate-100'}`} title={itemName}>
                                  {stripLeadingEmoji(itemName)}
                                </span>
                                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
                                  x{itemObj.quantity || 1}
                                </span>
                                {renderCantilCharges(itemName, itemObj.quantity || 1)}
                              </div>
                              <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded font-mono border border-slate-800 shrink-0">
                                Decorativo
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1 shrink-0">
                                  🧪 Equipado
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                                  🎒 Na Mochila
                                </span>
                              )}
                              {isEquipped ? (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                  ⚡ Ativo
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                  🧪 Teste
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                            <span>Função: <strong className="text-slate-300">Apenas Decorativo</strong></span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          {isEquippable ? (
                            
                          <button
                              type="button"
                              onClick={() => handleToggleEquipInInventory(itemName)}
                              className={`px-2 py-1 text-[11px] font-black rounded-lg transition shadow flex items-center gap-1 ${
                                isEquipped
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 shadow-md'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }`}
                              title={isEquipped ? 'Desequipar item' : 'Equipar item'}
                            >
                              <span>{isEquipped ? 'Desequipar' : 'Equipar'}</span>
                            </button>
                          ) : (
                            <div className="text-[11px]">
                              <span className="text-slate-400">Peso: </span>
                              <span className="font-extrabold text-slate-200">{getItemWeight(itemName)}</span>
                            </div>
                          )}

                          {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(itemObj.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                              title="Usar / Consumir item"
                            >
                              <span>🧪 Usar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSellItem(itemObj.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                            title={`Remover ${itemName}`}
                          >
                            <span>🗑️ Remover</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                invCategoryFilter === 'teste' && (
                  <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Nenhum item de teste no inventário. Clique em "Adicionar Itens de Teste" acima para carregar todos.
                  </div>
                )
              )}
            </div>
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
