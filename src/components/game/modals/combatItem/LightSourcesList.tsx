import React from 'react';
import { updateCharacter } from '../../../../lib/api/characterService';

interface LightSourcesListProps {
  character: any;
  onCharacterUpdated?: () => void;
  forceUpdate?: () => void;
}

export const LightSourcesList: React.FC<LightSourcesListProps> = ({
  character,
  onCharacterUpdated,
  forceUpdate,
}) => {
  const lightMap = new Map<string, { id: string; name: string; quantity: number }>();

  if (Array.isArray(character?.character_inventory)) {
    character.character_inventory.forEach((inv: any) => {
      const rawName = String(inv.item?.name || inv.items?.name || inv.name || '').trim();
      if (!rawName) return;
      const lower = rawName.toLowerCase();
      if (/tocha|torch|lanterna|lantern|vela|candle|lampada|lamp|facho|foco|candeeiro|luminaria/i.test(lower)) {
        const baseName = rawName.replace(/\s*\(\d+\)$/, '').trim();
        const key = baseName.toLowerCase();
        const qty = (inv.quantity || 1);
        if (lightMap.has(key)) {
          const ex = lightMap.get(key)!;
          ex.quantity += qty;
        } else {
          lightMap.set(key, { id: inv.id || baseName, name: baseName, quantity: qty });
        }
      }
    });
  }

  let rawEquip: string[] = [];
  if (Array.isArray(character?.equipment)) {
    rawEquip = character.equipment;
  } else if (typeof character?.equipment === 'string') {
    try {
      const parsed = JSON.parse(character.equipment);
      if (Array.isArray(parsed)) rawEquip = parsed;
      else rawEquip = [character.equipment];
    } catch {
      rawEquip = [character.equipment];
    }
  }

  rawEquip.forEach(itemStr => {
    if (!itemStr || typeof itemStr !== 'string') return;
    const parts = itemStr.split(/,\s*|\s+e\s+|\n/);
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (/tocha|torch|lanterna|lantern|vela|candle|lampada|lamp|facho|foco|candeeiro|luminaria/i.test(lower)) {
        const match = trimmed.match(/^(\d+)\s*x?\s+(.+)$/i) || trimmed.match(/^(.+?)\s*\((\d+)\)$/i);
        let qty = 1;
        let base = trimmed;
        if (match) {
          qty = parseInt(match[1].match(/^\d+$/) ? match[1] : match[2], 10) || 1;
          base = (match[1].match(/^\d+$/) ? match[2] : match[1]).trim();
        }
        base = base.replace(/\s*\(\d+\)$/, '').trim();
        const key = base.toLowerCase();
        if (!lightMap.has(key)) {
          lightMap.set(key, { id: base, name: base, quantity: qty });
        }
      }
    });
  });

  const lightItems = Array.from(lightMap.values());
  if (lightItems.length === 0) return null;

  const slots = character?.equipment_slots || {};
  const isLightEquipped = (itemName: string) => {
    const norm = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const base = norm.replace(/\s*\(\d+\)$/, '').trim();
    return Object.entries(slots).some(([slotKey, val]) => {
      if (!val || typeof val !== 'string') return false;
      const vNorm = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const vBase = vNorm.replace(/\s*\(\d+\)$/, '').trim();
      return vNorm === norm || vBase === base || norm.includes(vBase) || vNorm.includes(base);
    });
  };

  const getLightInfo = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('facho') || lower.includes('bullseye') || lower.includes('foca')) {
      return {
        icon: '🔦',
        radiusLabel: 'Raio 18m (12 cel) • Facho Concentrado',
        description: 'Projeta um facho direcionado de luz plena e intensa em masmorras e à noite.'
      };
    }
    if (lower.includes('coberta') || lower.includes('hooded')) {
      return {
        icon: '🏮',
        radiusLabel: 'Raio 12m (8 cel) • Luz Plena',
        description: 'Emite luz brilhante protegida em todas as direções com capa ajustável.'
      };
    }
    if (lower.includes('tocha') || lower.includes('torch')) {
      return {
        icon: '🔥',
        radiusLabel: 'Raio 9m (6 cel) • Fogo Vivo',
        description: 'Queima por 1 hora emitindo 9m de luz plena para afastar a escuridão.'
      };
    }
    if (lower.includes('lanterna') || lower.includes('lantern') || lower.includes('lampada') || lower.includes('lamp')) {
      return {
        icon: '🪔',
        radiusLabel: 'Raio 6.75m (4.5 cel) • Luz Clara',
        description: 'Lâmpada contínua alimentada a óleo para exploração segura.'
      };
    }
    if (lower.includes('vela') || lower.includes('candle')) {
      return {
        icon: '🕯️',
        radiusLabel: 'Raio 3m (2 cel) • Luz Suave',
        description: 'Chama suave de vela para leitura e visibilidade próxima no escuro.'
      };
    }
    return {
      icon: '✨',
      radiusLabel: 'Fonte de Luz Mágica / Radiante',
      description: 'Gera iluminação brilhante ao redor do personagem.'
    };
  };

  return (
    <div className="pt-3 border-t border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-base">🔥</span> Fontes de Luz &amp; Iluminação
        </h4>
        <span className="text-[10px] text-amber-400/80 font-medium">
          Ilumina masmorras e noites
        </span>
      </div>

      {lightItems.map((item) => {
        const isEq = isLightEquipped(item.name);
        const info = getLightInfo(item.name);

        return (
          <div
            key={item.id || item.name}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow transition-all duration-200 ${
              isEq
                ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-2xl p-2 rounded-lg border shrink-0 ${
                isEq ? 'bg-amber-900/60 border-amber-500/60 shadow animate-pulse' : 'bg-slate-900 border-slate-700'
              }`}>
                {info.icon}
              </span>
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="truncate">{item.name}</span>
                  <span className="text-[10px] bg-slate-800 text-amber-400 border border-slate-700 font-mono px-1.5 py-0.5 rounded font-black shrink-0">
                    x{item.quantity}
                  </span>
                  {isEq ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm flex items-center gap-1">
                      <span>⚡</span> Empunhada / Ativa
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      Na Mochila
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                  {info.radiusLabel}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {info.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const updatedSlots = { ...(character?.equipment_slots || {}) };
                const norm = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                const base = norm.replace(/\s*\(\d+\)$/, '').trim();

                if (isEq) {
                  Object.keys(updatedSlots).forEach(key => {
                    const val = updatedSlots[key];
                    if (typeof val === 'string') {
                      const vNorm = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                      if (vNorm === norm || vNorm.includes(base) || norm.includes(vNorm)) {
                        updatedSlots[key] = null;
                      }
                    }
                  });
                } else {
                  updatedSlots.empunhadura_2 = item.name;
                  updatedSlots.fonte_luz = item.name;
                }

                if (character) {
                  character.equipment_slots = updatedSlots;
                }
                if (forceUpdate) forceUpdate();
                updateCharacter(character?.id, { equipment_slots: updatedSlots }).then(() => {
                  if (onCharacterUpdated) onCharacterUpdated();
                }).catch(e => console.warn(e));
              }}
              className={`px-3.5 py-2 font-black text-xs rounded-lg transition shrink-0 cursor-pointer shadow flex items-center gap-1.5 ${
                isEq
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 shadow-md active:scale-95'
                  : 'bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600/50 active:scale-95'
              }`}
            >
              <span>{isEq ? '✓ Guardar' : '🔥 Empunhar'}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
