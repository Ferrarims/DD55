import { useState, useEffect, useMemo } from 'react';
import { RACES_REFERENCE, FEATS_REFERENCE } from '../../../lib/api/references';
import { fetchRacesFromDb } from '../../../lib/api/racesService';
import { BACKGROUNDS } from './constants';
import { SpeciesGrid } from './species/SpeciesGrid';
import { GiantAncestrySelector } from './species/GiantAncestrySelector';
import { DraconicAncestrySelector } from './species/DraconicAncestrySelector';
import { HumanVersatileFeatSelector } from './species/HumanVersatileFeatSelector';

interface Props {
  race: string;
  setRace: (race: string) => void;
  draconicAncestry: string | undefined;
  setDraconicAncestry: (ancestry: string | undefined) => void;
  giantAncestry: string | undefined;
  setGiantAncestry: (ancestry: string | undefined) => void;
  humanFeat: string;
  setHumanFeat: (feat: string) => void;
  currentBg: typeof BACKGROUNDS[0];
}

export function SpeciesSelection({
  race, setRace, draconicAncestry, setDraconicAncestry, giantAncestry, setGiantAncestry, humanFeat, setHumanFeat, currentBg
}: Props) {
  const [races, setRaces] = useState<any[]>([]);
  const selectedRace = races.find(r => r.id === race);

  const bgFeatsList = useMemo(() => {
    if (!currentBg?.feat) return [];
    return String(currentBg.feat)
      .split(',')
      .map(f => f.trim().toLowerCase())
      .filter(Boolean);
  }, [currentBg?.feat]);

  // Se o personagem é humano e o talento extra selecionado já é o talento do antecedente, auto-seleciona outro talento de origem válido
  useEffect(() => {
    if (race === 'Humano' || race === 'Human') {
      const isCurrentConflict = bgFeatsList.includes((humanFeat || '').trim().toLowerCase());
      if (!humanFeat || isCurrentConflict) {
        const availableFeat = Object.values(FEATS_REFERENCE).find(
          f => f.category === 'Origem' && !bgFeatsList.includes(f.name.trim().toLowerCase())
        );
        if (availableFeat) {
          setHumanFeat(availableFeat.name);
        }
      }
    }
  }, [race, bgFeatsList, humanFeat, setHumanFeat]);

  useEffect(() => {
    async function loadRaces() {
      await fetchRacesFromDb();
      const updatedRaces = Object.entries(RACES_REFERENCE).map(([id, r]) => ({
        id,
        name: r.name,
        icon: r.icon || "👤",
        size: r.size,
        speed: r.speed,
        traits: r.traits,
        variants: r.variants
      }));
      setRaces(updatedRaces);
    }
    loadRaces();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <SpeciesGrid
        races={races}
        race={race}
        setRace={setRace}
        setDraconicAncestry={setDraconicAncestry}
        setGiantAncestry={setGiantAncestry}
      />

      <GiantAncestrySelector
        race={race}
        selectedRace={selectedRace}
        giantAncestry={giantAncestry}
        setGiantAncestry={setGiantAncestry}
      />

      <DraconicAncestrySelector
        race={race}
        selectedRace={selectedRace}
        draconicAncestry={draconicAncestry}
        setDraconicAncestry={setDraconicAncestry}
      />

      <HumanVersatileFeatSelector
        race={race}
        bgFeatsList={bgFeatsList}
        humanFeat={humanFeat}
        setHumanFeat={setHumanFeat}
      />
    </div>
  );
}
