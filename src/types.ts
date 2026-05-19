export interface Player {
  firstName: string;
  lastName: string;
}

export interface Team {
  name: string;
  players: Player[];
  freeSpaces: number | string;
  totalSpaces?: number;
}

export interface SpreadsheetData {
  teams: Team[];
  summary: {
    day: string;
    freeSpaces: string;
  }[];
}
