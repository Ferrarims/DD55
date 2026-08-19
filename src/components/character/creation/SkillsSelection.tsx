import { useState, useEffect, useMemo } from 'react';
import { CLASS_REFERENCE } from '../../../lib/api/references';

export const ALL_SKILLS = [
  "Acrobacia", "Arcanismo", "Atletismo", "Atuação", "Enganação", 
  "Furtividade", "História", "Intimidação", "Intuição", "Investigação", 
  "Lidar com Animais", "Medicina", "Natureza", "Percepção", "Persuasão", 
  "Prestidigitação", "Religião", "Sobrevivência"
];

interface SkillsSelectionProps {
  charClass: string;
  currentBg: any;
  currentRace: any;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  selectedTools: string[];
  setSelectedTools: (tools: string[]) => void;
  onValidationChange: (isValid: boolean) => void;
}

export function SkillsSelection({
  charClass, currentBg, currentRace, selectedSkills, setSelectedSkills, selectedTools, setSelectedTools, onValidationChange
}: SkillsSelectionProps) {
  const classData = (CLASS_REFERENCE as any)[charClass];
  const classNameFormatted = classData?.name || charClass;
  const classSkillsStr = classData?.skills || '';
  
  const classSkillOptions = useMemo(() => {
    if (!classSkillsStr) return { count: 0, options: [] };
    const match = classSkillsStr.match(/(?:Escolha|Choose)\s+(\d+)/i);
    const count = match ? parseInt(match[1], 10) : 0;
    const parts = classSkillsStr.split(/:/);
    const optionsPart = parts.length > 1 ? parts[1] : classSkillsStr;
    const options = optionsPart.split(/,|\bou\b|\bor\b|\be\b|\band\b/i)
      .map((s: string) => s.trim().replace(/\.$/, ''))
      .filter(Boolean);
    return { count, options };
  }, [classSkillsStr]);

  const isHuman = /humano|human/i.test(currentRace?.name || '');
  const humanSkillCount = isHuman ? 1 : 0;

  const bgSkills = useMemo(() => currentBg?.skillProficiencies || currentBg?.skill_proficiencies || [], [currentBg]);
  const bgTools = useMemo(() => {
    const tool = currentBg?.toolProficiency || currentBg?.tool_proficiency;
    return tool && tool !== 'Nenhuma' ? [tool] : [];
  }, [currentBg]);

  // Local state to track choices specifically (class vs human vs extra)
  const [classChoices, setClassChoices] = useState<string[]>([]);
  const [humanChoices, setHumanChoices] = useState<string[]>([]);

  // Reset choices if dependencies change
  useEffect(() => {
    setClassChoices([]);
  }, [charClass]);

  useEffect(() => {
    setHumanChoices([]);
  }, [currentRace?.name]);

  // Update parent selectedSkills whenever local choices change
  const combinedSkillsStr = Array.from(new Set([...bgSkills, ...classChoices, ...humanChoices])).sort().join(',');
  useEffect(() => {
    setSelectedSkills(combinedSkillsStr ? combinedSkillsStr.split(',') : []);
  }, [combinedSkillsStr, setSelectedSkills]);

  const combinedToolsStr = Array.from(new Set([...bgTools])).sort().join(',');
  useEffect(() => {
    setSelectedTools(combinedToolsStr ? combinedToolsStr.split(',') : []);
  }, [combinedToolsStr, setSelectedTools]);

  const toggleClassChoice = (skill: string) => {
    if (bgSkills.includes(skill)) return; // Already have it
    if (classChoices.includes(skill)) {
      setClassChoices(prev => prev.filter(s => s !== skill));
    } else if (classChoices.length < classSkillOptions.count) {
      setClassChoices(prev => [...prev, skill]);
    }
  };

  const toggleHumanChoice = (skill: string) => {
    if (bgSkills.includes(skill) || classChoices.includes(skill)) return;
    if (humanChoices.includes(skill)) {
      setHumanChoices([]);
    } else if (humanChoices.length < humanSkillCount) {
      setHumanChoices([skill]);
    }
  };

  useEffect(() => {
    const isClassValid = classChoices.length === classSkillOptions.count;
    const isHumanValid = humanChoices.length === humanSkillCount;
    onValidationChange(isClassValid && isHumanValid);
  }, [classChoices.length, classSkillOptions.count, humanChoices.length, humanSkillCount, onValidationChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-2">Proficiências</h2>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <h3 className="font-semibold text-amber-500 mb-3">Perícia do Antecedente ({currentBg?.name})</h3>
        <div className="flex flex-wrap gap-2">
          {bgSkills.map((s: string) => (
            <span key={s} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 flex items-center gap-1">
              <span className="text-green-400">✓</span> {s}
            </span>
          ))}
          {bgSkills.length === 0 && <span className="text-slate-500 text-sm">Nenhuma perícia</span>}
        </div>
        
        {bgTools.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-1.5">Ferramentas</h4>
            <div className="flex flex-wrap gap-2">
              {bgTools.map((t: string) => (
                <span key={t} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 flex items-center gap-1">
                  <span className="text-green-400">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
        <h3 className="font-semibold text-amber-500 mb-3">Proficiências de Armaduras e Armas ({classNameFormatted})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Armaduras</span>
            <div className="flex flex-wrap gap-1.5">
              {(classData?.armor || ['Armaduras leves', 'Armaduras médias', 'Armaduras pesadas', 'Escudos']).map((armor: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-slate-900/60 text-slate-300 rounded border border-slate-700 text-xs flex items-center gap-1">
                  <span className="text-green-400">✓</span> {armor}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Armas</span>
            <div className="flex flex-wrap gap-1.5">
              {(classData?.weapons || ['Armas simples', 'Armas marciais']).map((weapon: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-slate-900/60 text-slate-300 rounded border border-slate-700 text-xs flex items-center gap-1">
                  <span className="text-green-400">✓</span> {weapon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {classSkillOptions.count > 0 && (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-amber-500">
              Perícias da Classe ({classNameFormatted})
            </h3>
            <span className={`text-sm font-bold px-2 py-1 rounded-lg ${classChoices.length === classSkillOptions.count ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {classChoices.length} / {classSkillOptions.count}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Selecione as perícias que sua classe permite.</p>
          <div className="flex flex-wrap gap-2">
            {classSkillOptions.options.map((skill: string) => {
              const isBg = bgSkills.includes(skill);
              const isSelected = classChoices.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleClassChoice(skill)}
                  disabled={isBg || (classChoices.length >= classSkillOptions.count && !isSelected)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    isBg ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed' :
                    isSelected ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                    'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/50 hover:bg-slate-800'
                  }`}
                >
                  {skill} {isBg && '(Já possui)'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isHuman && (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
           <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-amber-500">
              Perícia Adicional (Humano)
            </h3>
            <span className={`text-sm font-bold px-2 py-1 rounded-lg ${humanChoices.length === 1 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {humanChoices.length} / 1
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Humanos recebem proficiência em 1 perícia extra à sua escolha.</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map((skill: string) => {
              const isBg = bgSkills.includes(skill);
              const isClass = classChoices.includes(skill);
              const isSelected = humanChoices.includes(skill);
              const isDisabled = isBg || isClass || (humanChoices.length >= 1 && !isSelected);
              return (
                <button
                  key={skill}
                  onClick={() => toggleHumanChoice(skill)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    isBg || isClass ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed' :
                    isSelected ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                    'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/50 hover:bg-slate-800'
                  }`}
                >
                  {skill} {(isBg || isClass) && '(Já possui)'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
