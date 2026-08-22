import React from 'react';
import { CombatActionsModalsGroup } from './groups/CombatActionsModalsGroup';
import { ReactionAndTraitModalsGroup } from './groups/ReactionAndTraitModalsGroup';
import { EnvironmentAndRestModalsGroup } from './groups/EnvironmentAndRestModalsGroup';

export const GameModalsContainer: React.FC = () => {
  return (
    <>
      <CombatActionsModalsGroup />
      <ReactionAndTraitModalsGroup />
      <EnvironmentAndRestModalsGroup />
    </>
  );
};
