import { BalanceResult } from './teamBalancer';

export function formatReminder(): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `⚽ *SOCCER REMINDER* ⚽

📅 ${date}

Hey everyone! It's game day! 🎯

🏃‍♂️ Don't forget to join the game before 7 PM
📱 Use the web app to select your name
👥 Need at least 12 players for balanced teams
⚽ 12–31 players form 2 balanced teams; 32+ players form 4 teams at the scheduled time

*Join now: https://soccer-bot-unified.onrender.com*

Let's have a great game! 🏆`;
}

export function formatTeams(result: BalanceResult): string {
  const qualityEmoji = result.quality === 'excellent' ? '🟢' : 
                      result.quality === 'good' ? '🟡' : '🔴';

  let message = `⚽ *TEAMS FORMED* ${qualityEmoji}

📊 Balance Quality: ${result.quality.toUpperCase()}
📈 Rating Difference: ${result.balance.toFixed(1)}
👥 Mode: ${result.mode === 'two-team' ? '2 Teams' : '4 Teams'}

`;

  if (result.mode === 'two-team') {
    // Team 1
    message += `🔵 *${result.team1.name}*\n`;
    message += `⭐ Avg Rating: ${result.team1.avgRating.toFixed(1)}\n`;
    message += `👥 Players:\n`;
    
    const team1ByPosition = groupPlayersByPosition(result.team1.players);
    for (const [position, players] of Object.entries(team1ByPosition)) {
      if (players.length > 0) {
        const positionEmoji = getPositionEmoji(position);
        message += `${positionEmoji} ${position.toUpperCase()}: `;
        message += players.map(p => `${p.name} (${p.rating})`).join(', ');
        message += '\n';
      }
    }

    message += '\n';

    // Team 2
    message += `🔴 *${result.team2.name}*\n`;
    message += `⭐ Avg Rating: ${result.team2.avgRating.toFixed(1)}\n`;
    message += `👥 Players:\n`;
    
    const team2ByPosition = groupPlayersByPosition(result.team2.players);
    for (const [position, players] of Object.entries(team2ByPosition)) {
      if (players.length > 0) {
        const positionEmoji = getPositionEmoji(position);
        message += `${positionEmoji} ${position.toUpperCase()}: `;
        message += players.map(p => `${p.name} (${p.rating})`).join(', ');
        message += '\n';
      }
    }

    message += `\n🏆 *Good luck to both teams!* 🏆`;
  } else {
    // 4 Teams
    const teamEmojis = ['🔴', '🟠', '🔵', '🟢'];
    const teams = [result.team1, result.team2, result.team3!, result.team4!];
    
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      message += `${teamEmojis[i]} *${team.name}*\n`;
      message += `⭐ Avg Rating: ${team.avgRating.toFixed(1)}\n`;
      message += `👥 Players:\n`;
      
      const teamByPosition = groupPlayersByPosition(team.players);
      for (const [position, players] of Object.entries(teamByPosition)) {
        if (players.length > 0) {
          const positionEmoji = getPositionEmoji(position);
          message += `${positionEmoji} ${position.toUpperCase()}: `;
          message += players.map(p => `${p.name} (${p.rating})`).join(', ');
          message += '\n';
        }
      }
      
      message += '\n';
    }

    message += `🏆 *Good luck to all four teams!* 🏆`;
  }

  message += `\n📱 *Game starts soon!*`;

  return message;
}

export function formatInsufficientPlayers(playerCount: number): string {
  const needed = Math.max(0, 12 - playerCount);
  
  return `⚠️ *NOT ENOUGH PLAYERS* ⚠️

📊 Current Players: ${playerCount}/12
🎯 Need ${needed} more players for balanced teams

🏃‍♂️ *Game postponed* until we have enough players
📱 *Join now:* https://soccer-bot-unified.onrender.com

⏰ *Deadline:* 7:00 PM
👥 *Minimum required:* 12 players
⚽ *Scheduled formation:* 12–31 players form 2 teams, and 32+ players form 4 teams when the cutoff arrives

Let's get more players to join! 🎯`;
}

function groupPlayersByPosition(players: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  for (const player of players) {
    const position = player.position || 'player';
    if (!grouped[position]) {
      grouped[position] = [];
    }
    grouped[position].push(player);
  }
  
  return grouped;
}

function getPositionEmoji(position: string): string {
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
