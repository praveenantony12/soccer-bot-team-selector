const test = require('node:test');
const assert = require('node:assert/strict');
const { balanceTeams } = require('../dist/src/teamBalancer.js');

function buildPlayers(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: `Player ${index + 1}`,
    rating: 5 + (index % 6),
    position: index % 4 === 0 ? 'goalkeeper' : index % 4 === 1 ? 'defender' : index % 4 === 2 ? 'midfielder' : 'forward',
    firstPreferredPosition: index % 4 === 0 ? 'goalkeeper' : index % 4 === 1 ? 'defender' : index % 4 === 2 ? 'midfielder' : 'forward'
  }));
}

test('forms four balanced teams for 28+ players', () => {
  const players = buildPlayers(28);
  const result = balanceTeams(players);

  assert.equal(result.mode, 'four-team');
  assert.equal(result.teams.length, 4);
  const sizes = result.teams.map(team => team.players.length);
  assert.deepEqual(sizes, [7, 7, 7, 7]);
  const avgRatings = result.teams.map(team => team.avgRating);
  assert.ok(avgRatings.every(v => Number.isFinite(v)));
});

test('keeps legacy two-team behavior for 27 players or fewer', () => {
  const players = buildPlayers(27);
  const result = balanceTeams(players);

  assert.equal(result.mode, 'two-team');
  assert.equal(result.teams.length, 2);
  assert.ok(result.team1.players.length > 0);
  assert.ok(result.team2.players.length > 0);
});
