import { useState, useEffect } from 'react';
import { CLASSES, STAT_NAMES, StatKey } from './constants';
import { CLASS_REFERENCE } from '../../../lib/api/references';
import { fetchClassesFromDb } from '../../../lib/api/classesService';
import { FIGHTING_STYLES } from '../sheet/constants';

interface Props {
  charClass: string;
  setCharClass: (cls: string) => void;
  fightingStyle: string;
  setFightingStyle: (style: string) => void;
}

export function ClassSelection({ charClass, setCharClass, fightingStyle, setFightingStyle }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      await fetchClassesFromDb();
      setReady(true);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Escolha sua Classe</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(CLASSES) as Array<keyof typeof CLASSES>).map((cls) => {
          const classData = (CLASS_REFERENCE as any)[cls];
          const classConstant = CLASSES[cls];
          const isBlocked = cls !== 'Fighter';
          
          return (
            <button
              key={cls}
              onClick={() => !isBlocked && setCharClass(cls)}
              disabled={isBlocked}
              className={`p-6 rounded-xl border flex flex-col gap-4 transition-all ${
                isBlocked
                  ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-950' 
                  : (charClass === cls 
                      ? 'bg-slate-900 border-amber-500 cursor-pointer' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600 cursor-pointer')
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{classData?.icon || classConstant.icon}</span>
                <span className={`font-bold text-xl ${charClass === cls ? 'text-amber-500' : 'text-slate-100'}`}>
                  {classConstant.name}
                </span>
              </div>
              
              <div className="text-left text-sm text-slate-300 space-y-1.5 border-t border-slate-800 pt-4">
                {classData ? (
                  <>
                    <p><span className="text-slate-500">Atributos:</span> {classData.primaryAbility || classConstant.mainStats.map(s => STAT_NAMES[s as StatKey]).join(', ')}</p>
                    <p><span className="text-slate-500">Dado de Vida:</span> {classData.hitPointDie || '-'}</p>
                    <p><span className="text-slate-500">Saving Throws:</span> {Array.isArray(classData.savingThrows) ? classData.savingThrows.join(', ') : classData.savingThrows}</p>
                    <p><span className="text-slate-500">Armas:</span> {Array.isArray(classData.weapons) ? classData.weapons.join(', ') : classData.weapons}</p>
                    <p><span className="text-slate-500">Armaduras:</span> {Array.isArray(classData.armor) ? classData.armor.join(', ') : classData.armor}</p>
                  </>
                ) : (
                  <p><span className="text-slate-500">Atributos:</span> {classConstant.mainStats.map(s => STAT_NAMES[s as StatKey]).join(', ')}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {charClass === 'Fighter' && (
        <div className="bg-slate-950/90 p-4 rounded-xl border border-amber-500/30 space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚔️</span> Estilo de Luta do Guerreiro (Nível 1)
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium">
              Especialidade Tática
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Você adota um estilo particular de combate como sua especialidade, concedendo bônus especiais.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {FIGHTING_STYLES.map(fs => {
              const isSelected = fightingStyle === fs.name;
              return (
                <button
                  key={fs.id}
                  type="button"
                  disabled={fs.disabled}
                  onClick={() => !fs.disabled && setFightingStyle(fs.name)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    fs.disabled
                      ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400 font-medium'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className={`font-bold text-xs ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                      {fs.name}
                    </div>
                    {fs.disabled ? (
                      <span className="text-[9px] px-1 rounded bg-slate-900 text-amber-400 border border-amber-500/30">
                        🔒
                      </span>
                    ) : isSelected ? (
                      <span className="text-[9px] px-1.5 rounded bg-amber-400 text-slate-950 font-bold">
                        ✓ Selecionado
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    {fs.disabled ? fs.disabledReason || fs.desc : fs.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
