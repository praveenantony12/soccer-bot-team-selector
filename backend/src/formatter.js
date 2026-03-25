"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReminder = formatReminder;
exports.formatTeams = formatTeams;
exports.formatInsufficientPlayers = formatInsufficientPlayers;
function formatReminder() {
    var date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return "\u26BD *SOCCER REMINDER* \u26BD\n\n\uD83D\uDCC5 ".concat(date, "\n\nHey everyone! It's game day! \uD83C\uDFAF\n\n\uD83C\uDFC3\u200D\u2642\uFE0F Don't forget to join the game before 7 PM\n\uD83D\uDCF1 Use the web app to select your name\n\uD83D\uDC65 Need at least 12 players for balanced teams\n\n*Join now: https://soccer-bot-unified.onrender.com*\n\nLet's have a great game! \uD83C\uDFC6");
}
function formatTeams(result) {
    var qualityEmoji = result.quality === 'excellent' ? '🟢' :
        result.quality === 'good' ? '🟡' : '🔴';
    var message = "\u26BD *TEAMS FORMED* ".concat(qualityEmoji, "\n\n\uD83D\uDCCA Balance Quality: ").concat(result.quality.toUpperCase(), "\n\uD83D\uDCC8 Rating Difference: ").concat(result.balance.toFixed(1), "\n\n");
    // Team 1
    message += "\uD83D\uDD35 *".concat(result.team1.name, "*\n");
    message += "\u2B50 Avg Rating: ".concat(result.team1.avgRating.toFixed(1), "\n");
    message += "\uD83D\uDC65 Players:\n";
    // Group by position for better readability
    var team1ByPosition = groupPlayersByPosition(result.team1.players);
    for (var _i = 0, _a = Object.entries(team1ByPosition); _i < _a.length; _i++) {
        var _b = _a[_i], position = _b[0], players = _b[1];
        if (players.length > 0) {
            var positionEmoji = getPositionEmoji(position);
            message += "".concat(positionEmoji, " ").concat(position.toUpperCase(), ": ");
            message += players.map(function (p) { return "".concat(p.name, " (").concat(p.rating, ")"); }).join(', ');
            message += '\n';
        }
    }
    message += '\n';
    // Team 2
    message += "\uD83D\uDD34 *".concat(result.team2.name, "*\n");
    message += "\u2B50 Avg Rating: ".concat(result.team2.avgRating.toFixed(1), "\n");
    message += "\uD83D\uDC65 Players:\n";
    var team2ByPosition = groupPlayersByPosition(result.team2.players);
    for (var _c = 0, _d = Object.entries(team2ByPosition); _c < _d.length; _c++) {
        var _e = _d[_c], position = _e[0], players = _e[1];
        if (players.length > 0) {
            var positionEmoji = getPositionEmoji(position);
            message += "".concat(positionEmoji, " ").concat(position.toUpperCase(), ": ");
            message += players.map(function (p) { return "".concat(p.name, " (").concat(p.rating, ")"); }).join(', ');
            message += '\n';
        }
    }
    message += "\n\uD83C\uDFC6 *Good luck to both teams!* \uD83C\uDFC6\n\uD83D\uDCF1 *Game starts soon!*";
    return message;
}
function formatInsufficientPlayers(playerCount) {
    var needed = Math.max(0, 12 - playerCount);
    return "\u26A0\uFE0F *NOT ENOUGH PLAYERS* \u26A0\uFE0F\n\n\uD83D\uDCCA Current Players: ".concat(playerCount, "/12\n\uD83C\uDFAF Need ").concat(needed, " more players for balanced teams\n\n\uD83C\uDFC3\u200D\u2642\uFE0F *Game postponed* until we have enough players\n\uD83D\uDCF1 *Join now:* https://soccer-bot-unified.onrender.com\n\n\u23F0 *Deadline:* 7:00 PM\n\uD83D\uDC65 *Minimum required:* 12 players\n\nLet's get more players to join! \uD83C\uDFAF");
}
function groupPlayersByPosition(players) {
    var grouped = {};
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var player = players_1[_i];
        var position = player.position || 'player';
        if (!grouped[position]) {
            grouped[position] = [];
        }
        grouped[position].push(player);
    }
    return grouped;
}
function getPositionEmoji(position) {
    switch (position === null || position === void 0 ? void 0 : position.toLowerCase()) {
        case 'goalkeeper':
        case 'gk':
            return '🥅';
        case 'defender':
        case 'def':
            return '🛡️';
        case 'midfielder':
        case 'mid':
            return '⚙️';
        case 'forward':
        case 'fwd':
            return '⚡';
        default:
            return '👤';
    }
}
