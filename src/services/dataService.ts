import { SpreadsheetData, Team, Player } from '../types';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1QIfsqyip9erBKqNFdpif7c3y1Mh0TRqnCuADppsONi8/export?format=csv';

export async function fetchSpreadsheetData(): Promise<SpreadsheetData> {
  const response = await fetch(SHEET_URL);
  const csv = await response.text();
  // Clean up and split CSV
  const rows = csv.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));

  const teams: Team[] = [];
  const summary: { day: string; freeSpaces: string }[] = [];
  const freeSpacesMap: Record<string, string> = {};

  // 1. Parse Summary Section (DIES and PLACES LLIURES)
  const diesLabelRow = rows.findIndex(r => r[0]?.toLowerCase() === 'dies');
  if (diesLabelRow !== -1) {
    for (let i = diesLabelRow + 1; i < diesLabelRow + 15 && i < rows.length; i++) {
      const dayOrTeam = rows[i][0];
      const count = rows[i][1];
      if (dayOrTeam && dayOrTeam !== "" && dayOrTeam.toLowerCase() !== 'nom') {
        summary.push({ day: dayOrTeam, freeSpaces: count || "0" });
        freeSpacesMap[dayOrTeam.toLowerCase()] = count || "0";
      }
    }
  }

  // 2. Helper to parse a block of teams
  const parseTeamBlockAt = (headerRowIndex: number, columnIndices: number[]) => {
    const playersStartRow = headerRowIndex + 2;
    
    columnIndices.forEach(col => {
      const teamName = rows[headerRowIndex] ? rows[headerRowIndex][col] : null;
      if (!teamName || teamName === "" || teamName.toLowerCase() === "nom") return;

      const players: Player[] = [];
      // Lookahead up to 40 rows to capture full teams
      for (let i = 0; i < 40; i++) {
        const rowIndex = playersStartRow + i;
        if (!rows[rowIndex]) break;
        
        const firstName = rows[rowIndex][col];
        const lastName = rows[rowIndex][col + 1];
        
        // Stop if we hit summary rows or empty space
        if (firstName?.toLowerCase() === 'lliures' || firstName?.toLowerCase() === 'total') break;
        if (i > 10 && !firstName && !lastName) {
           // Double check next row for gaps
           const nextRow = rows[rowIndex + 1];
           if (!nextRow || (!nextRow[col] && !nextRow[col+1])) break;
        }

        if (firstName || lastName) {
          if (firstName?.toLowerCase() !== "nom" && firstName?.toLowerCase() !== "cognoms") {
            players.push({ firstName: firstName || "", lastName: lastName || "" });
          }
        }
      }

      // Lookup free spaces from our summary map (normalized keys)
      const freeSpaces = freeSpacesMap[teamName.toLowerCase()] || "0";

      teams.push({
        name: teamName,
        players,
        freeSpaces,
      });
    });
  };

  // 3. Locate the major team blocks
  const header1Index = rows.findIndex(r => r.join(',').includes('LUNNIS'));
  const header2Index = rows.findIndex((r, idx) => idx > (header1Index + 10) && (r.join(',').includes('JUAPAS') || r.join(',').includes('GRECAS')));

  if (header1Index !== -1) {
    parseTeamBlockAt(header1Index, [3, 5, 7, 9, 11]);
  }
  
  if (header2Index !== -1) {
    parseTeamBlockAt(header2Index, [3, 5, 7, 9]);
  }

  return {
    teams,
    summary,
  };
}
