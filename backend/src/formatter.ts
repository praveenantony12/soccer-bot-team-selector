import { BalanceResult } from './teamBalancer';

export function formatTeams(result: BalanceResult): string {
  const { teamA, teamB, balance } = result;
  
  let message = `⚽ **SOCCER TEAMS** ⚽\n\n`;
  
  // Team A
  message += `🟦 **${teamA.name}** (Avg: ${teamA.averageRating.toFixed(1)})\n`;
  teamA.players.forEach((player, index) => {
    const emoji = getPlayerEmoji(player.position);
    message += `${index + 1}. ${emoji} ${player.name} (${player.rating})\n`;
  });
  
  message += `\n`;
  
  // Team B
  message += `🟥 **${teamB.name}** (Avg: ${teamB.averageRating.toFixed(1)})\n`;
  teamB.players.forEach((player, index) => {
    const emoji = getPlayerEmoji(player.position);
    message += `${index + 1}. ${emoji} ${player.name} (${player.rating})\n`;
  });
  
  message += `\n`;
  
  // Balance indicator
  const balanceEmoji = balance < 0.3 ? '🟢' : balance < 0.5 ? '🟡' : '🔴';
  message += `${balanceEmoji} Balance: ${balance.toFixed(2)} points\n`;
  message += `📊 Total players: ${teamA.players.length + teamB.players.length}\n`;
  
  return message;
}

export function formatReminder(): string {
  return `⚽ **SOCCER REMINDER** ⚽\n\n` +
    `🗓️ Game day today! \n` +
    `⏰ Be ready for team formation at 7 PM\n\n` +
    `👉 Join here: ${process.env.BASE_URL}\n\n` +
    `Let's play! 🏃‍♂️`;
}

export function formatInsufficientPlayers(currentCount: number): string {
  return `⚽ **TEAM FORMATION** ⚽\n\n` +
    `❌ Not enough players today!\n` +
    `👥 Only ${currentCount} players joined\n` +
    `🎯 Need at least 12 players for balanced teams\n\n` +
    `See you next time! 👋`;
}

function getPlayerEmoji(position?: string): string {
  switch (position?.toLowerCase()) {
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
