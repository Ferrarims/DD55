export type { Json } from './database/json';
import { CharacterTables } from './database/characterTables';
import { ClassTables } from './database/classTables';
import { SubclassAndFeatTables } from './database/subclassAndFeatTables';
import { WorldAndCombatTables } from './database/worldAndCombatTables';
import { SystemTables } from './database/systemTables';

export type DatabaseTables = CharacterTables &
  ClassTables &
  SubclassAndFeatTables &
  WorldAndCombatTables &
  SystemTables;

export interface Database {
  public: {
    Tables: DatabaseTables;
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
