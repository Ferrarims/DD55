import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { DragonbornAasimarAbilities } from './racial/DragonbornAasimarAbilities';
import { GoliathAbilities } from './racial/GoliathAbilities';
import { OrcHumanAbilities } from './racial/OrcHumanAbilities';

export const HeroRacialAbilities: React.FC = () => {
  const { activeEntity } = useGameContext();

  if (!activeEntity || activeEntity.type !== 'hero') return null;

  return (
    <>
      <DragonbornAasimarAbilities />
      <GoliathAbilities />
      <OrcHumanAbilities />
    </>
  );
};
