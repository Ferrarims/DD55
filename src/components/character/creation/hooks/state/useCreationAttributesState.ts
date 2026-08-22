import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { STANDARD_ARRAY, StatKey, statMap } from '../../constants';
import {
  getPointsSpent,
  getFinalStat as getFinalStatHelper,
  generateRolledStats,
} from '../../helpers/creationHelpers';

interface UseCreationAttributesStateProps {
  currentBg: any;
}

export function useCreationAttributesState({ currentBg }: UseCreationAttributesStateProps) {
  const [bgBonusMode, setBgBonusMode] = useState<'2/1' | '1/1/1'>('2/1');
  const [bgBonuses, setBgBonuses] = useState<{stat: StatKey, value: number}[]>(() => {
    const saved = localStorage.getItem('bgBonuses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bgBonuses', JSON.stringify(bgBonuses));
  }, [bgBonuses]);

  const [statMethod, setStatMethod] = useState<'standard' | 'pointbuy' | 'roll'>('standard');
  const [baseStats, setBaseStats] = useState<Record<StatKey, number>>({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
  const [unassignedStandard, setUnassignedStandard] = useState<number[]>(STANDARD_ARRAY);

  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [unassignedRolls, setUnassignedRolls] = useState<number[]>([]);

  const { stat1, stat2, stat3 } = useMemo(() => {
    const stats = currentBg.stats || currentBg.ability_scores || ['str', 'dex', 'con'];
    return {
      stat1: stats[0] || 'str',
      stat2: stats[1] || 'dex',
      stat3: stats[2] || 'con'
    };
  }, [currentBg]);

  const newBonuses = useMemo(() => {
    const s1 = (statMap[stat1] || stat1) as StatKey;
    const s2 = (statMap[stat2] || stat2) as StatKey;
    const s3 = (statMap[stat3] || stat3) as StatKey;
    return bgBonusMode === '2/1' 
      ? [{stat: s1, value: 2}, {stat: s2, value: 1}]
      : [{stat: s1, value: 1}, {stat: s2, value: 1}, {stat: s3, value: 1}];
  }, [bgBonusMode, stat1, stat2, stat3]);

  const prevBackgroundRef = useRef(currentBg.id);
  const prevBonusModeRef = useRef(bgBonusMode);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
       setIsInitialized(true);
       prevBackgroundRef.current = currentBg.id;
       prevBonusModeRef.current = bgBonusMode;
       return;
    }
    if (currentBg.id !== prevBackgroundRef.current || bgBonusMode !== prevBonusModeRef.current) {
        setBgBonuses(newBonuses);
        prevBackgroundRef.current = currentBg.id;
        prevBonusModeRef.current = bgBonusMode;
    }
  }, [currentBg.id, bgBonusMode, newBonuses, isInitialized]);

  const getPointsSpentValue = useCallback(() => getPointsSpent(baseStats), [baseStats]);

  const getFinalStat = useCallback((stat: StatKey) => {
    return getFinalStatHelper(stat, baseStats, bgBonuses);
  }, [baseStats, bgBonuses]);

  const rollStats = () => {
    const rolls = generateRolledStats();
    setRolledScores(rolls);
    setUnassignedRolls([...rolls]);
    setBaseStats({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
  };

  const assignStat = (stat: StatKey, val: number) => {
    if (statMethod === 'standard') {
      const oldVal = baseStats[stat];
      const newStats = { ...baseStats, [stat]: val };
      setBaseStats(newStats);
      
      let newUnassigned = [...unassignedStandard];
      if (oldVal > 0) newUnassigned.push(oldVal);
      const valIndex = newUnassigned.indexOf(val);
      if (valIndex > -1) newUnassigned.splice(valIndex, 1);
      setUnassignedStandard(newUnassigned.sort((a,b)=>b-a));
    } else if (statMethod === 'roll') {
      const oldVal = baseStats[stat];
      const newStats = { ...baseStats, [stat]: val };
      setBaseStats(newStats);
      
      let newUnassigned = [...unassignedRolls];
      if (oldVal > 0) newUnassigned.push(oldVal);
      const valIndex = newUnassigned.indexOf(val);
      if (valIndex > -1) newUnassigned.splice(valIndex, 1);
      setUnassignedRolls(newUnassigned.sort((a,b)=>b-a));
    }
  };

  return {
    bgBonusMode,
    setBgBonusMode,
    bgBonuses,
    setBgBonuses,
    statMethod,
    setStatMethod,
    baseStats,
    setBaseStats,
    unassignedStandard,
    setUnassignedStandard,
    rolledScores,
    setRolledScores,
    unassignedRolls,
    setUnassignedRolls,
    getPointsSpentValue,
    getFinalStat,
    rollStats,
    assignStat,
  };
}
