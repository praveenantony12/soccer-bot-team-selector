import { Player } from './players';

export interface Team {
  name: string;
  players: Player[];
  totalRating: number;
  averageRating: number;
}

export interface BalanceResult {
  teamA: Team;
  teamB: Team;
  balance: number; // Difference in average ratings
}

export function balanceTeams(players: Player[]): BalanceResult {
  if (players.length < 2) {
    throw new Error('Need at least 2 players to form teams');
  }

  // Sort players by rating (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
  
  // Initialize teams
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let teamARating = 0;
  let teamBRating = 0;

  // Greedy algorithm: assign each player to the team with lower total rating
  for (const player of sortedPlayers) {
    if (teamARating <= teamBRating) {
      teamA.push(player);
      teamARating += player.rating;
    } else {
      teamB.push(player);
      teamBRating += player.rating;
    }
  }

  // Calculate team statistics
  const teamAStats: Team = {
    name: 'Team A',
    players: teamA,
    totalRating: teamARating,
    averageRating: teamARating / teamA.length
  };

  const teamBStats: Team = {
    name: 'Team B', 
    players: teamB,
    totalRating: teamBRating,
    averageRating: teamBRating / teamB.length
  };

  return {
    teamA: teamAStats,
    teamB: teamBStats,
    balance: Math.abs(teamAStats.averageRating - teamBStats.averageRating)
  };
}

export function validateTeamBalance(result: BalanceResult): boolean {
  // Good balance if difference is less than 0.5 rating points
  return result.balance < 0.5;
}

export function getTeamComposition(team: Team): string {
  const positions = team.players.reduce((acc, player) => {
    const pos = player.position || 'player';
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(positions)
    .map(([pos, count]) => `${count} ${pos}${count > 1 ? 's' : ''}`)
    .join(', ');
}
