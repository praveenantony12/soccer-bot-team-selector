"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceTeams = balanceTeams;
function shuffleArray(arr) {
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}
function computePositionBalance(team1, team2) {
    const positions = new Set([...team1, ...team2].map(p => p.position));
    let total = 0;
    for (const pos of positions) {
        const t1 = team1.filter(p => p.position === pos).length;
        const t2 = team2.filter(p => p.position === pos).length;
        total += Math.abs(t1 - t2);
    }
    return total;
}
function buildPositionAwareCandidate(players) {
    const byPosition = new Map();
    for (const player of players) {
        const pos = player.position || 'player';
        if (!byPosition.has(pos))
            byPosition.set(pos, []);
        byPosition.get(pos).push(player);
    }
    const team1 = [];
    const team2 = [];
    const groups = shuffleArray([...byPosition.values()]);
    for (const group of groups) {
        const sorted = [...group].sort((a, b) => (b.rating + Math.random() * 1.5) - (a.rating + Math.random() * 1.5));
        for (const player of sorted) {
            if (team1.length <= team2.length) {
                team1.push(player);
            }
            else {
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
                if (team1[i].position !== team2[j].position)
                    continue;
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
        if (!swapped)
            break;
    }
    return {
        team1,
        team2,
        team1Rating: t1Rating,
        team2Rating: t2Rating,
        ratingBalance: Math.abs(t1Rating / team1.length - t2Rating / team2.length),
        positionBalance: computePositionBalance(team1, team2)
    };
}
function balanceTeams(players) {
    if (players.length < 2) {
        throw new Error('Need at least 2 players to form teams');
    }
    const attemptCount = Math.max(50, players.length * 5);
    const candidates = [];
    for (let attempt = 0; attempt < attemptCount; attempt++) {
        candidates.push(buildPositionAwareCandidate(players));
    }
    candidates.sort((a, b) => a.positionBalance !== b.positionBalance
        ? a.positionBalance - b.positionBalance
        : a.ratingBalance - b.ratingBalance);
    const bestPositionBalance = candidates[0].positionBalance;
    const positionFair = candidates.filter(c => c.positionBalance === bestPositionBalance);
    const topN = Math.min(5, positionFair.length);
    const picked = positionFair[Math.floor(Math.random() * topN)] || candidates[0];
    const team1 = picked.team1;
    const team2 = picked.team2;
    const team1Rating = picked.team1Rating;
    const team2Rating = picked.team2Rating;
    const team1Avg = team1Rating / team1.length;
    const team2Avg = team2Rating / team2.length;
    const balance = Math.abs(team1Avg - team2Avg);
    let quality;
    if (balance <= 0.5) {
        quality = 'excellent';
    }
    else if (balance <= 1.0) {
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
