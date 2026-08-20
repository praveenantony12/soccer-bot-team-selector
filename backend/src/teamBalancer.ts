import { Player } from './players';

export interface Team {
  name: string;
  players: Player[];
  totalRating: number;
  avgRating: number;
  captainName?: string;
}

export interface BalanceResult {
  mode: 'two-team' | 'four-team';
  teams: Team[];
  team1: Team;
  team2: Team;
  team3?: Team;
  team4?: Team;
  balance: number;
  quality: 'excellent' | 'good' | 'poor';
}

type Candidate = {
  teams: Team[];
  ratingBalance: number;
  positionBalance: number;
};

function shuffleArray<T>(arr: T[]): T[] {
  const list = [...arr];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function getPreferredZone(p: Player): string {
  return p.firstPreferredPosition || p.position || 'player';
}

function computePositionBalance(teams: Team[]): number {
  const positions = new Set(teams.flatMap(team => team.players.map(getPreferredZone)));
  let total = 0;
  for (const pos of positions) {
    const counts = teams.map(team => team.players.filter(player => getPreferredZone(player) === pos).length);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    total += max - min;
  }
  return total;
}

// ── Rating-balance helpers ───────────────────────────────────────────────────

function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of generatePermutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

function calculateRatingSpread(
  teams: Array<{ players: Player[]; totalRating: number; avgRating: number }>
): number {
  const avgs = teams.map(t => t.avgRating);
  return Math.max(...avgs) - Math.min(...avgs);
}

function optimizeFourTeams(
  teams: Array<{ players: Player[]; totalRating: number; avgRating: number }>
): void {
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    const currentSpread = calculateRatingSpread(teams);
    let bestSwap: { i: number; j: number; pi: number; pj: number } | null = null;
    let bestSpread = currentSpread;

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        for (let pi = 0; pi < teams[i].players.length; pi++) {
          for (let pj = 0; pj < teams[j].players.length; pj++) {
            const newTotalI = teams[i].totalRating - teams[i].players[pi].rating + teams[j].players[pj].rating;
            const newTotalJ = teams[j].totalRating - teams[j].players[pj].rating + teams[i].players[pi].rating;
            const newAvgI = newTotalI / teams[i].players.length;
            const newAvgJ = newTotalJ / teams[j].players.length;

            const newAvgs = teams.map((t, idx) => {
              if (idx === i) return newAvgI;
              if (idx === j) return newAvgJ;
              return t.avgRating;
            });

            const newSpread = Math.max(...newAvgs) - Math.min(...newAvgs);

            if (newSpread < bestSpread) {
              bestSpread = newSpread;
              bestSwap = { i, j, pi, pj };
            }
          }
        }
      }
    }

    if (bestSwap) {
      const { i, j, pi, pj } = bestSwap;
      const temp = teams[i].players[pi];
      teams[i].players[pi] = teams[j].players[pj];
      teams[j].players[pj] = temp;

      teams[i].totalRating = teams[i].players.reduce((sum, p) => sum + p.rating, 0);
      teams[i].avgRating = teams[i].totalRating / teams[i].players.length;
      teams[j].totalRating = teams[j].players.reduce((sum, p) => sum + p.rating, 0);
      teams[j].avgRating = teams[j].totalRating / teams[j].players.length;

      improved = true;
    }
  }
}

// ── End rating-balance helpers ───────────────────────────────────────────────

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.name.localeCompare(b.name));
}

function buildTeamSummary(name: string, players: Player[]): Team {
  const sortedPlayers = sortPlayers(players);
  const totalRating = sortedPlayers.reduce((sum, player) => sum + player.rating, 0);
  return {
    name,
    players: sortedPlayers,
    totalRating,
    avgRating: sortedPlayers.length ? totalRating / sortedPlayers.length : 0
  };
}

function buildPositionAwareCandidate(players: Player[]): Candidate {
  const byPosition = new Map<string, Player[]>();
  for (const player of players) {
    const pos = getPreferredZone(player);
    if (!byPosition.has(pos)) byPosition.set(pos, []);
    byPosition.get(pos)!.push(player);
  }

  const team1: Player[] = [];
  const team2: Player[] = [];
  const groups = shuffleArray([...byPosition.values()]);

  for (const group of groups) {
    const sorted = [...group].sort(
      (a, b) => (b.rating + Math.random() * 1.5) - (a.rating + Math.random() * 1.5)
    );
    for (const player of sorted) {
      if (team1.length <= team2.length) {
        team1.push(player);
      } else {
        team2.push(player);
      }
    }
  }

  let t1Rating = team1.reduce((sum, player) => sum + player.rating, 0);
  let t2Rating = team2.reduce((sum, player) => sum + player.rating, 0);

  for (let pass = 0; pass < 8; pass++) {
    let swapped = false;
    for (let i = 0; i < team1.length; i++) {
      for (let j = 0; j < team2.length; j++) {
        if (getPreferredZone(team1[i]) !== getPreferredZone(team2[j])) continue;
        const newT1 = t1Rating - team1[i].rating + team2[j].rating;
        const newT2 = t2Rating - team2[j].rating + team1[i].rating;
        if (Math.abs(newT1 - newT2) < Math.abs(t1Rating - t2Rating)) {
          [team1[i], team2[j]] = [team2[j], team1[i]];
          t1Rating = newT1;
          t2Rating = newT2;
          swapped = true;
        }
      }
    }
    if (!swapped) break;
  }

  const teams = [
    buildTeamSummary('Blue Team', team1),
    buildTeamSummary('Red Team', team2)
  ];

  return {
    teams,
    ratingBalance: Math.abs((t1Rating / team1.length) - (t2Rating / team2.length)),
    positionBalance: computePositionBalance(teams)
  };
}

function getTeamSizes(playerCount: number): number[] {
  if (playerCount <= 27) {
    const split = Math.floor(playerCount / 2);
    return [split, playerCount - split];
  }

  const base = Math.floor(playerCount / 4);
  const remainder = playerCount % 4;
  return Array.from({ length: 4 }, (_, index) => base + (index < remainder ? 1 : 0));
}

function buildFourTeamCandidate(players: Player[]): Candidate {
  const sizes = getTeamSizes(players.length);
  const teams = sizes.map(() => ({ players: [] as Player[], totalRating: 0, avgRating: 0 }));

  // Calculate target total rating for each team
  const totalRating = players.reduce((sum, p) => sum + p.rating, 0);
  const targetRating = totalRating / 4;

  // Sort players by rating (highest to lowest)
  const orderedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  // Greedy assignment with target rating constraint
  for (const player of orderedPlayers) {
    let bestTeamIndex = 0;
    let bestScore = Infinity;

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.players.length >= sizes[i]) continue;

      const newTotal = team.totalRating + player.rating;
      const deviationFromTarget = Math.abs(newTotal - targetRating);
      const sizePenalty = (team.players.length / sizes[i]) * 2; // Prefer filling teams evenly
      const score = deviationFromTarget + sizePenalty;

      if (score < bestScore) {
        bestScore = score;
        bestTeamIndex = i;
      }
    }

    if (bestTeamIndex >= 0) {
      const team = teams[bestTeamIndex];
      team.players.push(player);
      team.totalRating += player.rating;
      team.avgRating = team.players.length ? team.totalRating / team.players.length : 0;
    }
  }

  // Swap optimization pass to fine-tune balance
  optimizeFourTeams(teams);

  const namedTeams = [
    buildTeamSummary('Red Team A', teams[0].players),
    buildTeamSummary('Red Team B', teams[1].players),
    buildTeamSummary('Blue Team A', teams[2].players),
    buildTeamSummary('Blue Team B', teams[3].players)
  ];

  return {
    teams: namedTeams,
    ratingBalance: Math.max(...namedTeams.map(team => team.avgRating)) - Math.min(...namedTeams.map(team => team.avgRating)),
    positionBalance: computePositionBalance(namedTeams)
  };
}

function chooseBestCandidate(candidates: Candidate[]): Candidate {
  // Prioritize rating balance first, then position balance as tiebreaker
  candidates.sort((a, b) =>
    a.ratingBalance !== b.ratingBalance
      ? a.ratingBalance - b.ratingBalance
      : a.positionBalance - b.positionBalance
  );

  const bestRatingBalance = candidates[0].ratingBalance;
  const ratingFair = candidates.filter(candidate => candidate.ratingBalance === bestRatingBalance);
  const topN = Math.min(5, ratingFair.length);
  return ratingFair[Math.floor(Math.random() * topN)] || candidates[0];
}

function applyCaptains(teams: Team[]): Team[] {
  return teams.map(team => {
    const captain = team.players[Math.floor(Math.random() * team.players.length)];
    return {
      ...team,
      captainName: captain?.name
    };
  });
}

export function balanceTeams(players: Player[]): BalanceResult {
  if (players.length < 2) {
    throw new Error('Need at least 2 players to form teams');
  }

  if (players.length <= 27) {
    const attemptCount = Math.max(50, players.length * 5);
    const candidates: Candidate[] = [];

    for (let attempt = 0; attempt < attemptCount; attempt++) {
      candidates.push(buildPositionAwareCandidate(players));
    }

    const picked = chooseBestCandidate(candidates);
    const [team1, team2] = applyCaptains(picked.teams);
    const team1Avg = team1.avgRating;
    const team2Avg = team2.avgRating;
    const balance = Math.abs(team1Avg - team2Avg);

    let quality: 'excellent' | 'good' | 'poor';
    if (balance <= 0.5) {
      quality = 'excellent';
    } else if (balance <= 1.0) {
      quality = 'good';
    } else {
      quality = 'poor';
    }

    return {
      mode: 'two-team',
      teams: [team1, team2],
      team1,
      team2,
      balance,
      quality
    };
  }

  // Four-team mode: run multiple attempts and pick the best candidate
  const attemptCount = Math.max(30, players.length * 2);
  const candidates: Candidate[] = [];

  for (let attempt = 0; attempt < attemptCount; attempt++) {
    candidates.push(buildFourTeamCandidate(players));
  }

  const picked = chooseBestCandidate(candidates);
  const teams = applyCaptains(picked.teams);
  const overallAvg = players.reduce((sum, player) => sum + player.rating, 0) / players.length;
  const balance = Math.max(...teams.map(team => Math.abs(team.avgRating - overallAvg)));

  let quality: 'excellent' | 'good' | 'poor';
  if (balance <= 0.7) {
    quality = 'excellent';
  } else if (balance <= 1.3) {
    quality = 'good';
  } else {
    quality = 'poor';
  }

  return {
    mode: 'four-team',
    teams,
    team1: teams[0],
    team2: teams[1],
    team3: teams[2],
    team4: teams[3],
    balance,
    quality
  };
}