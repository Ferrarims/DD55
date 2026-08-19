import { CLASSES, BACKGROUNDS } from './constants';

interface Props {
  charClass: string;
  currentClass: typeof CLASSES[keyof typeof CLASSES];
  currentBg: typeof BACKGROUNDS[0];
  classEqChoice: 'A' | 'B' | 'C';
  setClassEqChoice: (choice: 'A' | 'B' | 'C') => void;
  bgEqChoice: 'A' | 'B' | 'C';
  setBgEqChoice: (choice: 'A' | 'B' | 'C') => void;
  getStandardClassEquipment: (cls: string, option: 'A' | 'B' | 'C') => string;
  formatEquipmentChoiceDescription: (equipment: any, option: 'A' | 'B' | 'C') => string;
}

export function EquipmentSelection({
  charClass, currentClass, currentBg, classEqChoice, setClassEqChoice, bgEqChoice, setBgEqChoice, getStandardClassEquipment, formatEquipmentChoiceDescription
}: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-amber-500">Equipamento</h2>
        <p className="text-slate-400 mt-2">Escolha seu equipamento inicial.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Equipamento da Classe ({currentClass.name})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setClassEqChoice('A')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${classEqChoice === 'A' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
          >
            <div className="font-bold text-slate-200 mb-1">Opção A</div>
            <div className="text-xs text-slate-400">{getStandardClassEquipment(charClass, 'A')}</div>
          </button>
          <button
            onClick={() => setClassEqChoice('B')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${classEqChoice === 'B' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
          >
            <div className="font-bold text-slate-200 mb-1">Opção B</div>
            <div className="text-xs text-slate-400">{getStandardClassEquipment(charClass, 'B')}</div>
          </button>
          {charClass === 'Fighter' && (
            <button
              onClick={() => setClassEqChoice('C')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${classEqChoice === 'C' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
            >
              <div className="font-bold text-slate-200 mb-1">Opção C (Ouro)</div>
              <div className="text-xs text-slate-400">{getStandardClassEquipment(charClass, 'C')}</div>
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Equipamento do Antecedente ({currentBg.name})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setBgEqChoice('A')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${bgEqChoice === 'A' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
          >
            <div className="font-bold text-slate-200 mb-1">Opção A</div>
            <div className="text-xs text-slate-400">{formatEquipmentChoiceDescription(currentBg?.equipment, 'A') || `Equipamento Padrão de ${currentBg.name}`}</div>
          </button>
          <button
            onClick={() => setBgEqChoice('B')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${bgEqChoice === 'B' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
          >
            <div className="font-bold text-slate-200 mb-1">Opção B (Ouro)</div>
            <div className="text-xs text-slate-400">{formatEquipmentChoiceDescription(currentBg?.equipment, 'B') || '50 PO'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
