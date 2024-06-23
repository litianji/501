import Character from './Character';
export default class Faction {
  static allCharacters: Character[] = [];

  static add(character: Character) {
    Faction.allCharacters.push(character);
  }
}
