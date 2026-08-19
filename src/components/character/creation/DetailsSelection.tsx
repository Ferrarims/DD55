import { RefObject } from 'react';

interface Props {
  name: string;
  setName: (name: string) => void;
  alignment: string;
  setAlignment: (alignment: string) => void;
  charClass: string;
  nameInputRef: RefObject<HTMLInputElement | null>;
}

export function DetailsSelection({
  name, setName, alignment, setAlignment, charClass, nameInputRef
}: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Aventureiro</label>
        <input 
          ref={nameInputRef as any}
          autoFocus
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
          placeholder="Ex: Eldric, Thorin, Lyra..."
        />
        <p className="text-xs text-slate-500 mt-2 mb-4">Dê um nome ao seu herói para continuar a aventura.</p>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alinhamento</label>
        <select
          value={alignment}
          onChange={(e) => setAlignment(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="Leal e Bom" className="bg-slate-900 text-slate-150">Leal e Bom</option>
          <option value="Neutro e Bom" className="bg-slate-900 text-slate-150">Neutro e Bom</option>
          <option value="Caótico e Bom" className="bg-slate-900 text-slate-150">Caótico e Bom</option>
          <option value="Leal e Neutro" className="bg-slate-900 text-slate-150">Leal e Neutro</option>
          <option value="Neutro" className="bg-slate-900 text-slate-150">Neutro</option>
          <option value="Caótico e Neutro" className="bg-slate-900 text-slate-150">Caótico e Neutro</option>
          <option value="Leal e Mau" className="bg-slate-900 text-slate-150">Leal e Mau</option>
          <option value="Neutro e Mau" className="bg-slate-900 text-slate-150">Neutro e Mau</option>
          <option value="Caótico e Mau" className="bg-slate-900 text-slate-150">Caótico e Mau</option>
        </select>
      </div>

      {['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard', 'Paladin', 'Ranger'].includes(charClass) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-amber-500 mb-2">Habilidades Mágicas (Nível 1)</h3>
          <p className="text-sm text-slate-400 mb-4">Sua classe possui as seguintes características de conjuração inicial.</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-950 p-3 rounded-lg">
              <span className="block text-xl font-bold text-blue-400">
                {charClass === 'Sorcerer' ? 4 : charClass === 'Cleric' || charClass === 'Wizard' ? 3 : charClass === 'Paladin' || charClass === 'Ranger' ? 0 : 2}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Truques (Cantrips)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg">
              <span className="block text-xl font-bold text-purple-400">
                {charClass === 'Sorcerer' || charClass === 'Warlock' || charClass === 'Paladin' || charClass === 'Ranger' ? 2 : 4}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Magias Preparadas</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg">
              <span className="block text-xl font-bold text-pink-400">
                {charClass === 'Warlock' ? 1 : 2}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Espaços (Nível 1)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
