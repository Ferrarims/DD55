import React from 'react';
import { MartialAbilitiesGroup } from './classAbilities/MartialAbilitiesGroup';
import { DivineAndMysticAbilitiesGroup } from './classAbilities/DivineAndMysticAbilitiesGroup';

export const HeroClassAbilities: React.FC = () => {
  return (
    <>
      <MartialAbilitiesGroup />
      <DivineAndMysticAbilitiesGroup />
    </>
  );
};
