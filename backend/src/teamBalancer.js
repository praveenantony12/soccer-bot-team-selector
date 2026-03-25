"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceTeams = balanceTeams;
function balanceTeams(players) {
    if (players.length < 2) {
        throw new Error('Need at least 2 players to form teams');
    }
    // Sort players by rating (highest first)
    var sortedPlayers = __spreadArray([], players, true).sort(function (a, b) { return b.rating - a.rating; });
    // Initialize teams
    var team1 = [];
    var team2 = [];
    var team1Rating = 0;
    var team2Rating = 0;
    // Greedy assignment to team with lower total rating
    for (var _i = 0, sortedPlayers_1 = sortedPlayers; _i < sortedPlayers_1.length; _i++) {
        var player = sortedPlayers_1[_i];
        if (team1Rating <= team2Rating) {
            team1.push(player);
            team1Rating += player.rating;
        }
        else {
            team2.push(player);
            team2Rating += player.rating;
        }
    }
    // Calculate team statistics
    var team1Avg = team1Rating / team1.length;
    var team2Avg = team2Rating / team2.length;
    var balance = Math.abs(team1Avg - team2Avg);
    // Determine balance quality
    var quality;
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
        balance: balance,
        quality: quality
    };
}
