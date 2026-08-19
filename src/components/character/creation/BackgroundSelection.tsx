import { STAT_NAMES, StatKey, statMap } from './constants';
import { getItemNameById } from '../../../lib/api/itemsService';

interface Props {
  backgrounds: any[];
  background: string;
  setBackground: (bg: string) => void;
  bgBonusMode: '2/1' | '1/1/1';
  setBgBonusMode: (mode: '2/1' | '1/1/1') => void;
  bgBonuses: { stat: StatKey; value: number }[];
  setBgBonuses: (bonuses: { stat: StatKey; value: number }[]) => void;
  currentBg: any;
}

export function BackgroundSelection({
  backgrounds, background, setBackground, bgBonusMode, setBgBonusMode, bgBonuses, setBgBonuses, currentBg
}: Props) {
  const handleBgBonusChange = (stat: StatKey, value: number, index: number) => {
    const newBonuses = [...bgBonuses];
    newBonuses[index] = { stat, value };
    setBgBonuses(newBonuses);
  };

  const renderEquipment = (equipment: any) => {
    if (!equipment) return 'Nenhum';
    if (typeof equipment === 'string') return equipment;

    if (equipment.A || equipment.B) {
      const getItemsDesc = (items: any[]) => items ? items.map(i => `${i.quantity}x ${getItemNameById(i.id) || 'Item desconhecido'}`).join(', ') : '';
      return (
        <div className="space-y-0.5 mt-1">
          {equipment.A && <div><span className="font-bold">A:</span> {getItemsDesc(equipment.A)}</div>}
          {equipment.B && <div><span className="font-bold">B:</span> {getItemsDesc(equipment.B)}</div>}
        </div>
      );
    }
    return JSON.stringify(equipment);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Antecedente (Background)</label>
        <p className="text-xs text-slate-400 mb-4">Seu antecedente define seus bônus de habilidade e talento de origem.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {backgrounds.map((bg, bgIdx) => (
            <button
              key={`${bg.id || bg.name}-${bgIdx}`}
              onClick={() => setBackground(bg.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                background === bg.id 
                  ? 'bg-slate-800 border-amber-500 shadow-md shadow-amber-900/10' 
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <div className={`text-base font-bold mb-2 ${background === bg.id ? 'text-amber-500' : 'text-slate-100'}`}>{bg.icon} {bg.name}</div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400"><span className="text-slate-500 font-semibold">Talento:</span> {bg.feat || 'Nenhum'}</div>
                <div className="text-xs text-slate-400"><span className="text-slate-500 font-semibold">Atributos:</span> {(bg.stats || bg.ability_scores || []).map((s: string) => STAT_NAMES[s as StatKey] || s).join(', ')}</div>
                <div className="text-xs text-slate-400"><span className="text-slate-500 font-semibold">Perícias:</span> {(bg.skill_proficiencies || bg.skillProficiencies || []).join(', ')}</div>
                <div className="text-xs text-slate-400"><span className="text-slate-500 font-semibold">Ferramentas:</span> {bg.tool_proficiency || bg.toolProficiency || 'Nenhuma'}</div>
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-700 mt-2"><span className="text-slate-500 font-semibold block mb-1">Equipamento:</span> {renderEquipment(bg.equipment)}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Distribuir Bônus de {currentBg.name}</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={bgBonusMode === '2/1'} onChange={() => setBgBonusMode('2/1')} className="accent-amber-500" />
              +2 e +1
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={bgBonusMode === '1/1/1'} onChange={() => setBgBonusMode('1/1/1')} className="accent-amber-500" />
              +1, +1 e +1
            </label>
          </div>
          
          <div className="space-y-2">
            {bgBonuses.map((bonus, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-8 font-bold text-amber-500">+{bonus.value}</span>
                <select 
                  value={bonus.stat} 
                  onChange={(e) => handleBgBonusChange(e.target.value as StatKey, bonus.value, idx)}
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {(currentBg.stats || currentBg.ability_scores || []).map((s: string) => (
                    <option key={s} value={statMap[s] || s} className="bg-slate-900 text-slate-150">{STAT_NAMES[s as StatKey] || s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
