import { useMemo } from 'react';

export function useUsableInventoryItems(equipment: any) {
  const usableInventoryItems = useMemo(() => {
    if (!equipment) return [];
    let rawStrings: string[] = [];
    if (Array.isArray(equipment)) {
      rawStrings = equipment;
    } else if (typeof equipment === 'string') {
      try {
        const parsed = JSON.parse(equipment);
        if (Array.isArray(parsed)) rawStrings = parsed;
        else rawStrings = [equipment];
      } catch {
        rawStrings = [equipment];
      }
    }

    const items: Array<{ name: string; qty: number }> = [];
    rawStrings.forEach(raw => {
      if (!raw || typeof raw !== 'string') return;
      const parts = raw.split(/,\s*|\s+e\s+|\n/);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const match = trimmed.match(/^(\d+)\s*x?\s+(.+)$/i) || trimmed.match(/^(.+?)\s*\((\d+)\)$/i);
        if (match) {
          const qty = parseInt(match[1].match(/^\d+$/) ? match[1] : match[2], 10);
          const name = match[1].match(/^\d+$/) ? match[2] : match[1];
          items.push({ name: name.trim(), qty: isNaN(qty) ? 1 : qty });
        } else {
          items.push({ name: trimmed, qty: 1 });
        }
      });
    });

    const mapped = items.map(item => {
      const itemName = item.name;
      const qty = item.qty;
      const lower = itemName.toLowerCase();
      const baseName = itemName.replace(/\s*\(\d+\)$/, '').trim();

      if (lower.includes('poção de cura maior') || lower.includes('pocao de cura maior') || lower.includes('poção maior') || lower.includes('pocao maior')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🏺',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Restaura 4d4+4 Pontos de Vida no combate.',
          effectType: 'heal_major' as const,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          btnColor: 'bg-rose-600 hover:bg-rose-500'
        };
      }

      if (lower.includes('poção') || lower.includes('pocao') || lower.includes('potion') || lower.includes('cura') || lower.includes('vida')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🧪',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Restaura 2d4+2 Pontos de Vida no combate.',
          effectType: 'heal_minor' as const,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          btnColor: 'bg-rose-600 hover:bg-rose-500'
        };
      }

      if (lower.includes('antídoto') || lower.includes('antidoto')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🌿',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Neutraliza envenenamento e concede resistência a veneno por 1 hora.',
          effectType: 'antidote' as const,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          btnColor: 'bg-emerald-600 hover:bg-emerald-500'
        };
      }

      if (lower.includes('elixir') || lower.includes('agilidade') || lower.includes('velocidade') || lower.includes('speed')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '⚡',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Ganha +4.5m (+3 cel) de deslocamento livre.',
          effectType: 'speed' as const,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          btnColor: 'bg-blue-600 hover:bg-blue-500'
        };
      }

      if (lower.includes('força') || lower.includes('forca') || lower.includes('strength')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '💪',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Concede +2 de bônus em jogadas de ataque e dano corpo a corpo.',
          effectType: 'strength' as const,
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          btnColor: 'bg-red-600 hover:bg-red-500'
        };
      }

      if (lower.includes('pergaminho') || lower.includes('scroll') || lower.includes('proteção') || lower.includes('protecao')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '📜',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Concede +3 na CA até seu próximo turno.',
          effectType: 'ac' as const,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          btnColor: 'bg-purple-600 hover:bg-purple-500'
        };
      }

      if (lower.includes('fogo') || lower.includes('bomba') || lower.includes('ácido') || lower.includes('acido') || lower.includes('alquímico') || lower.includes('alquimico')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '💣',
          actionCost: 'action' as const,
          actionCostLabel: 'Ação Principal',
          description: 'Arremessa contra o inimigo mais próximo causando 2d6 Dano de Fogo.',
          effectType: 'bomb' as const,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          btnColor: 'bg-orange-600 hover:bg-orange-500'
        };
      }

      if (lower.includes('curandeiro') || lower.includes('primeiros socorros') || lower.includes('bandagem') || lower.includes('curativo')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🩹',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Trata ferimentos restaurando 5 PV fixos.',
          effectType: 'kit' as const,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          btnColor: 'bg-emerald-600 hover:bg-emerald-500'
        };
      }

      if (lower.includes('saco de dormir') || lower.includes('sleeping bag')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🛌',
          actionCost: 'action' as const,
          actionCostLabel: 'Ação Principal',
          description: 'Descanso Curto rápido no saco de dormir (recupera PV e recursos). 50% de chance de atrair monstros!',
          effectType: 'sleeping_bag' as const,
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          btnColor: 'bg-orange-600 hover:bg-orange-500'
        };
      }

      if (lower.includes('tenda') || lower.includes('barraca') || lower.includes('tent') || lower.includes('acampamento')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '⛺',
          actionCost: 'action' as const,
          actionCostLabel: 'Ação Principal',
          description: 'Arma a tenda para realizar um Descanso Curto (recupera PV e recursos). Requer 1 Ração no inventário (20% de chance de atração).',
          effectType: 'tent' as const,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          btnColor: 'bg-amber-600 hover:bg-amber-500'
        };
      }

      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    const uniqueMap = new Map<string, typeof mapped[0]>();
    mapped.forEach(item => {
      const canonicalId = item.id.toLowerCase();
      if (uniqueMap.has(canonicalId)) {
        uniqueMap.get(canonicalId)!.baseQty += item.baseQty;
      } else {
        uniqueMap.set(canonicalId, { ...item, id: canonicalId });
      }
    });

    return Array.from(uniqueMap.values());
  }, [equipment]);

  const totalRationsCount = useMemo(() => {
    if (!equipment) return 0;
    let rawStrings: string[] = [];
    if (Array.isArray(equipment)) {
      rawStrings = equipment;
    } else if (typeof equipment === 'string') {
      try {
        const parsed = JSON.parse(equipment);
        if (Array.isArray(parsed)) rawStrings = parsed;
        else rawStrings = [equipment];
      } catch {
        rawStrings = [equipment];
      }
    }

    let total = 0;
    rawStrings.forEach(raw => {
      if (!raw || typeof raw !== 'string') return;
      const parts = raw.split(/,\s*|\s+e\s+|\n/);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const lower = trimmed.toLowerCase();
        if (lower.includes('ração') || lower.includes('racao') || lower.includes('ration') || lower.includes('marmita') || lower.includes('comida')) {
          const match = trimmed.match(/\b(\d+)\s*x?\b/i);
          total += match ? parseInt(match[1], 10) : 1;
        }
      });
    });
    return total;
  }, [equipment]);

  return { usableInventoryItems, totalRationsCount };
}
