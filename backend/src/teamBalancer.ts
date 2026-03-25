import { Player } from './players';

export interface Team {
  name: string;
  players: Player[];
  totalRating: number;
  avgRating: number;
}

export interface BalanceResult {
  team1: Team;
  team2: Team;
  balance: number;
  quality: 'excellent' | 'good' | 'poor';
}

export function balanceTeams(players: Player[]): BalanceResult {
  if (players.length < 2) {
    throw new Error('Need at least 2 players to form teams');
  }

  // Sort players by rating (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
  
  // Initialize teams
  const team1: Player[] = [];
  const team2: Player[] = [];
  let team1Rating = 0;
  let team2Rating = 0;

  // Greedy assignment to team with lower total rating
  for (const player of sortedPlayers) {
    if (team1Rating <= team2Rating) {
      team1.push(player);
      team1Rating += player.rating;
    } else {
      team2.push(player);
      team2Rating += player.rating;
    }
  }

  // Calculate team statistics
  const team1Avg = team1Rating / team1.length;
  const team2Avg = team2Rating / team2.length;
  const balance = Math.abs(team1Avg - team2Avg);

  // Determine balance quality
  let quality: 'excellent' | 'good' | 'poor';
  if (balance <= 0.3) {
    quality = 'excellent';
  } else if (balance <= 0.6) {
    quality = 'good';
  } else {
    quality = 'poor';
  }

  return {
    team1: {
      name: 'Team 1',
      players: team1,
      totalRating: team1Rating,
      avgRating: team1Avg
    },
    team2: {
      name: 'Team 2',
      players: team2,
      totalRating: team2Rating,
      avgRating: team2Avg
    },
    balance,
    quality
  };
}
