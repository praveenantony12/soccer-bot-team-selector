const test = require('node:test');
const assert = require('node:assert/strict');
const { balanceTeams, validateTeamAssignment, FOUR_TEAM_MIN_PLAYERS } = require('../dist/src/teamBalancer.js');

function buildPlayers(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: `Player ${index + 1}`,
    rating: 5 + (index % 6),
    position: index % 4 === 0 ? 'goalkeeper' : index % 4 === 1 ? 'defender' : index % 4 === 2 ? 'midfielder' : 'forward',
    firstPreferredPosition: index % 4 === 0 ? 'goalkeeper' : index % 4 === 1 ? 'defender' : index % 4 === 2 ? 'midfielder' : 'forward'
  }));
}

test('four-team threshold is 32 players', () => {
  assert.equal(FOUR_TEAM_MIN_PLAYERS, 32);
});

test('forms four balanced teams for 32+ players', () => {
  const players = buildPlayers(32);
  const result = balanceTeams(players);

  assert.equal(result.mode, 'four-team');
  assert.equal(result.teams.length, 4);
  const sizes = result.teams.map(team => team.players.length);
  assert.deepEqual(sizes, [8, 8, 8, 8]);
  const avgRatings = result.teams.map(team => team.avgRating);
  assert.ok(avgRatings.every(v => Number.isFinite(v)));
});

test('keeps two-team behavior for 31 players or fewer', () => {
  for (const count of [12, 28, 31]) {
    const result = balanceTeams(buildPlayers(count));
    assert.equal(result.mode, 'two-team', `${count} players`);
    assert.equal(result.teams.length, 2);
    assert.ok(result.team1.players.length > 0);
    assert.ok(result.team2.players.length > 0);
  }
});

test('every player appears exactly once in four-team mode (no duplicates / missing)', () => {
  for (const count of [32, 33, 34, 35, 36, 41]) {
    const players = buildPlayers(count);
    for (let run = 0; run < 25; run++) {
      const result = balanceTeams(players);
      const names = result.teams.flatMap(team => team.players.map(p => p.name));

      assert.equal(names.length, count, `${count} players, run ${run}: total size`);
      assert.equal(new Set(names).size, count, `${count} players, run ${run}: duplicates`);
      assert.deepEqual(validateTeamAssignment(players, result.teams), []);

      const sizes = result.teams.map(team => team.players.length);
      assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `${count} players: uneven sizes ${sizes}`);
    }
  }
});

test('validateTeamAssignment reports duplicates, missing and unexpected players', () => {
  const players = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
  const teams = [{ players: [{ name: 'A' }, { name: 'A' }] }, { players: [{ name: 'D' }] }];

  const problems = validateTeamAssignment(players, teams);
  assert.ok(problems.some(p => p.startsWith('duplicated: A')));
  assert.ok(problems.includes('missing: B'));
  assert.ok(problems.includes('missing: C'));
  assert.ok(problems.includes('unexpected: D'));
});
