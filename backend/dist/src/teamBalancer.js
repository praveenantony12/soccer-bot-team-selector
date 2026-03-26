"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceTeams = balanceTeams;
function shufflePlayers(players) {
    const list = [...players];
    for (let index = list.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
    }
    return list;
}
function getBalance(team1Rating, team2Rating, team1Size, team2Size) {
    const team1Avg = team1Rating / team1Size;
    const team2Avg = team2Rating / team2Size;
    return Math.abs(team1Avg - team2Avg);
}
function buildCandidate(players) {
    const sortedPlayers = shufflePlayers(players).sort((first, second) => {
        const firstScore = first.rating + Math.random() * 0.35;
        const secondScore = second.rating + Math.random() * 0.35;
        return secondScore - firstScore;
    });
    const team1 = [];
    const team2 = [];
    let team1Rating = 0;
    let team2Rating = 0;
    for (const player of sortedPlayers) {
        const team1HasSpace = team1.length <= team2.length;
        const shouldGoTeam1 = team1HasSpace && team1Rating <= team2Rating;
        if (shouldGoTeam1 || team2.length > team1.length) {
            team1.push(player);
            team1Rating += player.rating;
        }
        else {
            team2.push(player);
            team2Rating += player.rating;
        }
    }
    return {
        team1,
        team2,
        team1Rating,
        team2Rating,
        balance: getBalance(team1Rating, team2Rating, team1.length, team2.length)
    };
}
function balanceTeams(players) {
    if (players.length < 2) {
        throw new Error('Need at least 2 players to form teams');
    }
    const attemptCount = Math.max(25, players.length * 6);
    const candidates = [];
    for (let attempt = 0; attempt < attemptCount; attempt += 1) {
        candidates.push(buildCandidate(players));
    }
    candidates.sort((first, second) => first.balance - second.balance);
    const bestBalance = candidates[0].balance;
    const nearBest = candidates.filter(candidate => candidate.balance <= bestBalance + 0.12);
    const picked = nearBest[Math.floor(Math.random() * nearBest.length)] || candidates[0];
    const team1 = picked.team1;
    const team2 = picked.team2;
    const team1Rating = picked.team1Rating;
    const team2Rating = picked.team2Rating;
    // Calculate team statistics
    const team1Avg = team1Rating / team1.length;
    const team2Avg = team2Rating / team2.length;
    const balance = Math.abs(team1Avg - team2Avg);
    // Determine balance quality
    let quality;
    if (balance <= 0.3) {
        quality = 'excellent';
    }
    else if (balance <= 0.6) {
        quality = 'good';
    }
    else {
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
