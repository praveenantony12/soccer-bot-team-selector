"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFormations = generateFormations;
// Standard soccer formations with position coordinates
// x: 0 = left sideline, 50 = center, 100 = right sideline
// y: 0 = opponent goal, 100 = own goal
// Each formation has exactly N slots where N equals the squad size it is designed for.
const FORMATIONS = {
    // ── 6-a-side ─────────────────────────────────────────────────────────────
    // 2-2-1  balanced 6v6
    '2-2-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 33, y: 73, label: 'Center Back', code: 'CB' },
        { x: 67, y: 73, label: 'Center Back', code: 'CB' },
        { x: 33, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 67, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 1-3-1  midfield-heavy 6v6
    '1-3-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 50, y: 73, label: 'Center Back', code: 'CB' },
        { x: 20, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 50, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 80, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 3-1-1  defensive 6v6
    '3-1-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // ── 7-a-side ─────────────────────────────────────────────────────────────
    // 3-2-1  balanced 7v7
    '3-2-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 2-3-1  midfield-heavy 7v7
    '2-3-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 33, y: 73, label: 'Center Back', code: 'CB' },
        { x: 67, y: 73, label: 'Center Back', code: 'CB' },
        { x: 20, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 80, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 2-2-2  attacking 7v7
    '2-2-2': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 33, y: 73, label: 'Center Back', code: 'CB' },
        { x: 67, y: 73, label: 'Center Back', code: 'CB' },
        { x: 33, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 67, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 33, y: 18, label: 'Striker', code: 'ST' },
        { x: 67, y: 18, label: 'Striker', code: 'ST' },
    ],
    // ── 8-a-side ─────────────────────────────────────────────────────────────
    // 3-3-1  balanced 8v8
    '3-3-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 25, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 75, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 4-2-1  defensive 8v8
    '4-2-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 15, y: 73, label: 'Left Back', code: 'LB' },
        { x: 38, y: 73, label: 'Center Back', code: 'CB' },
        { x: 62, y: 73, label: 'Center Back', code: 'CB' },
        { x: 85, y: 73, label: 'Right Back', code: 'RB' },
        { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 3-2-2  attacking 8v8
    '3-2-2': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 33, y: 18, label: 'Striker', code: 'ST' },
        { x: 67, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 2-4-1  midfield-heavy 8v8
    '2-4-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 33, y: 73, label: 'Center Back', code: 'CB' },
        { x: 67, y: 73, label: 'Center Back', code: 'CB' },
        { x: 15, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 38, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 62, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 85, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // ── 9-a-side ─────────────────────────────────────────────────────────────
    // 3-4-1  midfield-heavy 9v9
    '3-4-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 15, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 38, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 62, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 85, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 4-3-1  defensive 9v9
    '4-3-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 15, y: 73, label: 'Left Back', code: 'LB' },
        { x: 38, y: 73, label: 'Center Back', code: 'CB' },
        { x: 62, y: 73, label: 'Center Back', code: 'CB' },
        { x: 85, y: 73, label: 'Right Back', code: 'RB' },
        { x: 25, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 75, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 3-3-2  attacking 9v9
    '3-3-2': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 25, y: 48, label: 'Left Midfield', code: 'LM' },
        { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 75, y: 48, label: 'Right Midfield', code: 'RM' },
        { x: 35, y: 18, label: 'Striker', code: 'ST' },
        { x: 65, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 4-2-2  balanced 9v9
    '4-2-2': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 15, y: 73, label: 'Left Back', code: 'LB' },
        { x: 38, y: 73, label: 'Center Back', code: 'CB' },
        { x: 62, y: 73, label: 'Center Back', code: 'CB' },
        { x: 85, y: 73, label: 'Right Back', code: 'RB' },
        { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 35, y: 18, label: 'Striker', code: 'ST' },
        { x: 65, y: 18, label: 'Striker', code: 'ST' },
    ],
    // ── 10-a-side ────────────────────────────────────────────────────────────
    // 4-3-2  balanced 10v10
    '4-3-2': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 15, y: 73, label: 'Left Back', code: 'LB' },
        { x: 38, y: 73, label: 'Center Back', code: 'CB' },
        { x: 62, y: 73, label: 'Center Back', code: 'CB' },
        { x: 85, y: 73, label: 'Right Back', code: 'RB' },
        { x: 25, y: 51, label: 'Left Midfield', code: 'LM' },
        { x: 50, y: 54, label: 'Center Midfield', code: 'CM' },
        { x: 75, y: 51, label: 'Right Midfield', code: 'RM' },
        { x: 35, y: 18, label: 'Striker', code: 'ST' },
        { x: 65, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 3-4-2  midfield-heavy 10v10
    '3-4-2': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 15, y: 51, label: 'Left Midfield', code: 'LM' },
        { x: 38, y: 54, label: 'Center Midfield', code: 'CM' },
        { x: 62, y: 54, label: 'Center Midfield', code: 'CM' },
        { x: 85, y: 51, label: 'Right Midfield', code: 'RM' },
        { x: 35, y: 18, label: 'Striker', code: 'ST' },
        { x: 65, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 4-4-1  defensive 10v10
    '4-4-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 15, y: 73, label: 'Left Back', code: 'LB' },
        { x: 38, y: 73, label: 'Center Back', code: 'CB' },
        { x: 62, y: 73, label: 'Center Back', code: 'CB' },
        { x: 85, y: 73, label: 'Right Back', code: 'RB' },
        { x: 15, y: 51, label: 'Left Midfield', code: 'LM' },
        { x: 38, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 62, y: 51, label: 'Center Midfield', code: 'CM' },
        { x: 85, y: 51, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // 3-5-1  midfield-dominant 10v10
    '3-5-1': [
        { x: 50, y: 93, label: 'Goalkeeper', code: 'GK' },
        { x: 25, y: 73, label: 'Center Back', code: 'CB' },
        { x: 50, y: 76, label: 'Center Back', code: 'CB' },
        { x: 75, y: 73, label: 'Center Back', code: 'CB' },
        { x: 10, y: 55, label: 'Left Wing Back', code: 'LWB' },
        { x: 32, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 55, label: 'Defensive Midfield', code: 'CDM' },
        { x: 68, y: 48, label: 'Center Midfield', code: 'CM' },
        { x: 90, y: 55, label: 'Right Wing Back', code: 'RWB' },
        { x: 50, y: 18, label: 'Striker', code: 'ST' },
    ],
    // ── 11-a-side ────────────────────────────────────────────────────────────
    // Classic 4-4-2 - balanced
    '4-4-2': [
        { x: 50, y: 95, label: 'Goalkeeper', code: 'GK' },
        { x: 20, y: 75, label: 'Left Back', code: 'LB' },
        { x: 40, y: 75, label: 'Center Back', code: 'CB' },
        { x: 60, y: 75, label: 'Center Back', code: 'CB' },
        { x: 80, y: 75, label: 'Right Back', code: 'RB' },
        { x: 20, y: 50, label: 'Left Midfield', code: 'LM' },
        { x: 40, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 60, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 80, y: 50, label: 'Right Midfield', code: 'RM' },
        { x: 40, y: 25, label: 'Striker', code: 'ST' },
        { x: 60, y: 25, label: 'Striker', code: 'ST' },
    ],
    // 4-3-3 - attacking
    '4-3-3': [
        { x: 50, y: 95, label: 'Goalkeeper', code: 'GK' },
        { x: 20, y: 75, label: 'Left Back', code: 'LB' },
        { x: 40, y: 75, label: 'Center Back', code: 'CB' },
        { x: 60, y: 75, label: 'Center Back', code: 'CB' },
        { x: 80, y: 75, label: 'Right Back', code: 'RB' },
        { x: 35, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 55, label: 'Defensive Midfield', code: 'CDM' },
        { x: 65, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 20, y: 25, label: 'Left Winger', code: 'LW' },
        { x: 50, y: 20, label: 'Striker', code: 'ST' },
        { x: 80, y: 25, label: 'Right Winger', code: 'RW' },
    ],
    // 3-5-2 - midfield heavy
    '3-5-2': [
        { x: 50, y: 95, label: 'Goalkeeper', code: 'GK' },
        { x: 30, y: 75, label: 'Center Back', code: 'CB' },
        { x: 50, y: 80, label: 'Center Back', code: 'CB' },
        { x: 70, y: 75, label: 'Center Back', code: 'CB' },
        { x: 15, y: 50, label: 'Left Wing Back', code: 'LWB' },
        { x: 35, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 55, label: 'Defensive Midfield', code: 'CDM' },
        { x: 65, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 85, y: 50, label: 'Right Wing Back', code: 'RWB' },
        { x: 40, y: 25, label: 'Striker', code: 'ST' },
        { x: 60, y: 25, label: 'Striker', code: 'ST' },
    ],
    // 4-2-3-1 - modern flexible
    '4-2-3-1': [
        { x: 50, y: 95, label: 'Goalkeeper', code: 'GK' },
        { x: 20, y: 75, label: 'Left Back', code: 'LB' },
        { x: 40, y: 75, label: 'Center Back', code: 'CB' },
        { x: 60, y: 75, label: 'Center Back', code: 'CB' },
        { x: 80, y: 75, label: 'Right Back', code: 'RB' },
        { x: 40, y: 60, label: 'Defensive Midfield', code: 'CDM' },
        { x: 60, y: 60, label: 'Defensive Midfield', code: 'CDM' },
        { x: 25, y: 40, label: 'Attacking Midfield', code: 'CAM' },
        { x: 50, y: 40, label: 'Attacking Midfield', code: 'CAM' },
        { x: 75, y: 40, label: 'Attacking Midfield', code: 'CAM' },
        { x: 50, y: 20, label: 'Striker', code: 'ST' },
    ],
    // 5-3-2 - defensive
    '5-3-2': [
        { x: 50, y: 95, label: 'Goalkeeper', code: 'GK' },
        { x: 15, y: 75, label: 'Left Wing Back', code: 'LWB' },
        { x: 32, y: 78, label: 'Center Back', code: 'CB' },
        { x: 50, y: 80, label: 'Center Back', code: 'CB' },
        { x: 68, y: 78, label: 'Center Back', code: 'CB' },
        { x: 85, y: 75, label: 'Right Wing Back', code: 'RWB' },
        { x: 35, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 50, y: 55, label: 'Center Midfield', code: 'CM' },
        { x: 65, y: 50, label: 'Center Midfield', code: 'CM' },
        { x: 40, y: 25, label: 'Striker', code: 'ST' },
        { x: 60, y: 25, label: 'Striker', code: 'ST' },
    ],
    // 4-1-4-1 - solid defensive base
    '4-1-4-1': [
        { x: 50, y: 95, label: 'Goalkeeper', code: 'GK' },
        { x: 20, y: 75, label: 'Left Back', code: 'LB' },
        { x: 40, y: 75, label: 'Center Back', code: 'CB' },
        { x: 60, y: 75, label: 'Center Back', code: 'CB' },
        { x: 80, y: 75, label: 'Right Back', code: 'RB' },
        { x: 50, y: 60, label: 'Defensive Midfield', code: 'CDM' },
        { x: 20, y: 45, label: 'Left Midfield', code: 'LM' },
        { x: 40, y: 45, label: 'Center Midfield', code: 'CM' },
        { x: 60, y: 45, label: 'Center Midfield', code: 'CM' },
        { x: 80, y: 45, label: 'Right Midfield', code: 'RM' },
        { x: 50, y: 20, label: 'Striker', code: 'ST' },
    ],
};
// Maps exact player count to candidate formation names for that squad size.
// Selector picks the best match based on actual position distribution.
const FORMATIONS_BY_COUNT = {
    6: ['2-2-1', '1-3-1', '3-1-1'],
    7: ['3-2-1', '2-3-1', '2-2-2'],
    8: ['3-3-1', '4-2-1', '3-2-2', '2-4-1'],
    9: ['3-4-1', '4-3-1', '3-3-2', '4-2-2'],
    10: ['4-3-2', '3-4-2', '4-4-1', '3-5-1'],
    11: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '4-1-4-1'],
};
// Zone classification for each formation position code.
const POSITION_ZONE = {
    'GK': 'goalkeeper',
    'CB': 'defender', 'LB': 'defender', 'RB': 'defender', 'LWB': 'defender', 'RWB': 'defender',
    'CDM': 'midfielder', 'CM': 'midfielder', 'LM': 'midfielder', 'RM': 'midfielder', 'CAM': 'midfielder',
    'LW': 'forward', 'RW': 'forward', 'ST': 'forward',
};
// Linear zone order — proximity is the absolute index difference.
// GK(0) ↔ Defender(1) ↔ Midfielder(2) ↔ Forward(3)
const ZONE_ORDER = ['goalkeeper', 'defender', 'midfielder', 'forward'];
// Score per proximity distance: same zone, 1-step away, 2-steps, 3-steps
// Gaps are wide enough that even a max-rated player (rating 20 → +40) cannot
// override a closer-zone assignment.
const PROXIMITY_SCORES = [200, 100, 40, 10];
/**
 * Hard zone constraints — the zones a player type is ALLOWED to occupy.
 * A player is NEVER assigned to a zone outside this list regardless of
 * squad shortage. Better to leave a slot empty than break position logic.
 *
 *   goalkeeper  → goalkeeper, defender           (never midfielder/forward)
 *   defender    → defender, midfielder, goalkeeper (never forward/striker)
 *   midfielder  → anywhere (most flexible)
 *   forward     → forward, midfielder             (never defender/goalkeeper)
 *   player      → defender, midfielder, forward   (generic fallback, not GK)
 */
const ALLOWED_ZONES = {
    'goalkeeper': ['goalkeeper', 'defender'],
    'defender': ['defender', 'midfielder', 'goalkeeper'],
    'midfielder': ['midfielder', 'defender', 'forward', 'goalkeeper'],
    'forward': ['forward', 'midfielder'],
    'player': ['defender', 'midfielder', 'forward'],
};
// Position priorities for sorting (GK first, then defense, midfield, attack)
const POSITION_PRIORITY = {
    'GK': 0,
    'CB': 1, 'LB': 1, 'RB': 1, 'LWB': 1, 'RWB': 1,
    'CDM': 2,
    'CM': 3, 'LM': 3, 'RM': 3,
    'CAM': 4,
    'LW': 5, 'RW': 5,
    'ST': 6,
};
/**
 * Selects the best formation for a squad based on player count and position distribution.
 *
 * Step 1 — bucket by count: restricts candidates to formations designed for
 *           the exact squad size (6v6 through 11v11).
 * Step 2 — pick by fit: scores each candidate by how closely its DEF/MID/FWD
 *           ratio matches the actual position distribution of the squad.
 *           Goalkeepers overflow into the midfielder bucket for ratio purposes
 *           (they never fill outfield slots anyway); generic 'player' types
 *           are also treated as midfielders.
 */
function selectBestFormation(players) {
    const playerCount = players.length;
    // Count each outfield position type, using first preferred position as primary
    let defenders = 0, midfielders = 0, forwards = 0;
    for (const p of players) {
        const pos = (p.firstPreferredPosition || p.position || 'player').toLowerCase();
        if (pos === 'defender')
            defenders++;
        else if (pos === 'forward')
            forwards++;
        else
            midfielders++; // midfielder, goalkeeper, player all go here
    }
    const outfield = defenders + midfielders + forwards;
    // Clamp to supported squad sizes
    const bucket = Math.max(6, Math.min(11, playerCount));
    const candidates = FORMATIONS_BY_COUNT[bucket] ?? FORMATIONS_BY_COUNT[11];
    // Score each candidate by how closely its D/M/F ratio matches the squad
    let bestFormation = candidates[0];
    let bestScore = -Infinity;
    for (const name of candidates) {
        const parts = name.split('-').map(Number);
        // Notation: "D-M-F" (3 parts) or "D-M1-M2-F" (4 parts, e.g. 4-2-3-1)
        let formDefs, formMids, formFwds;
        if (parts.length === 4) {
            formDefs = parts[0];
            formMids = parts[1] + parts[2];
            formFwds = parts[3];
        }
        else if (parts.length === 3) {
            formDefs = parts[0];
            formMids = parts[1];
            formFwds = parts[2];
        }
        else {
            formDefs = parts[0];
            formMids = parts[1] ?? 0;
            formFwds = 0;
        }
        const formOutfield = formDefs + formMids + formFwds;
        const defRatio = outfield > 0 ? defenders / outfield : 1 / 3;
        const midRatio = outfield > 0 ? midfielders / outfield : 1 / 3;
        const fwdRatio = outfield > 0 ? forwards / outfield : 1 / 3;
        const score = -(Math.abs(formDefs / formOutfield - defRatio) +
            Math.abs(formMids / formOutfield - midRatio) +
            Math.abs(formFwds / formOutfield - fwdRatio));
        if (score > bestScore) {
            bestScore = score;
            bestFormation = name;
        }
    }
    return {
        name: bestFormation,
        positions: FORMATIONS[bestFormation] ?? FORMATIONS['4-4-2'],
    };
}
/**
 * Calculate fitness score for a player at a given formation position.
 *
 * Evaluates all three preferred positions in priority order.
 * Each preference gets a successively larger penalty so the algorithm
 * naturally places players in their highest-priority preferred zone
 * while still allowing fallback to 2nd / 3rd preference when needed.
 *
 * Preference penalties:  1st → 0 pts,  2nd → −30 pts,  3rd → −60 pts
 * Proximity scores:      same zone → 200,  1-step → 100,  2-step → 40,  3-step → 10
 * Rating bonus:          rating × 2 (max ~40 pts — never overrides zone tier)
 *
 * Returns −1 if NO preferred position allows the slot's zone (disqualified).
 * The greedy loop uses bestScore = −1 as its initial value, so disqualified
 * players are never chosen over qualified ones.
 */
function calculatePositionFitness(player, positionCode) {
    const posZone = POSITION_ZONE[positionCode] ?? 'midfielder';
    // Build ordered list of preferred zones: 1st → 2nd → 3rd → legacy position
    const prefs = [
        player.firstPreferredPosition,
        player.secondPreferredPosition,
        player.thirdPreferredPosition,
        player.position,
    ]
        .filter((p) => Boolean(p))
        .map(p => p.toLowerCase());
    if (prefs.length === 0)
        prefs.push('player');
    // Penalty increases for each successive preference
    const PREF_PENALTY = [0, 30, 60, 90];
    let bestScore = -1;
    for (let i = 0; i < prefs.length; i++) {
        const raw = prefs[i];
        const playerZone = raw === 'player' ? 'midfielder' : raw;
        const allowed = ALLOWED_ZONES[playerZone] ?? ALLOWED_ZONES['player'];
        // Hard constraint: this preference zone doesn't allow the slot — try next
        if (!allowed.includes(posZone))
            continue;
        const playerIndex = ZONE_ORDER.indexOf(playerZone);
        const posIndex = ZONE_ORDER.indexOf(posZone);
        const distance = (playerIndex === -1 || posIndex === -1)
            ? PROXIMITY_SCORES.length - 1
            : Math.abs(playerIndex - posIndex);
        const proximityScore = PROXIMITY_SCORES[Math.min(distance, PROXIMITY_SCORES.length - 1)];
        const ratingBonus = (player.rating || 5) * 2;
        const penalty = PREF_PENALTY[Math.min(i, PREF_PENALTY.length - 1)];
        const score = proximityScore + ratingBonus - penalty;
        if (score > bestScore)
            bestScore = score;
    }
    // Tiny tie-breaker — never large enough to change zone or preference tier
    if (bestScore > -1)
        bestScore += Math.random() * 2;
    return bestScore;
}
/**
 * Unconstrained proximity score used only in the force-assignment pass.
 * Unlike calculatePositionFitness, this never returns -1 — every player
 * is eligible for every slot. Evaluates all three preferred positions and
 * uses the best zone-proximity score (with preference penalties), ensuring
 * stranded players land in the closest zone to any of their preferences.
 */
function unconstrainedFitness(player, positionCode) {
    const posZone = POSITION_ZONE[positionCode] ?? 'midfielder';
    const prefs = [
        player.firstPreferredPosition,
        player.secondPreferredPosition,
        player.thirdPreferredPosition,
        player.position,
    ]
        .filter((p) => Boolean(p))
        .map(p => p.toLowerCase());
    if (prefs.length === 0)
        prefs.push('player');
    const PREF_PENALTY = [0, 30, 60, 90];
    let bestScore = -Infinity;
    for (let i = 0; i < prefs.length; i++) {
        const raw = prefs[i];
        const playerZone = raw === 'player' ? 'midfielder' : raw;
        const playerIndex = ZONE_ORDER.indexOf(playerZone);
        const posIndex = ZONE_ORDER.indexOf(posZone);
        const distance = (playerIndex === -1 || posIndex === -1)
            ? PROXIMITY_SCORES.length - 1
            : Math.abs(playerIndex - posIndex);
        const proximityScore = PROXIMITY_SCORES[Math.min(distance, PROXIMITY_SCORES.length - 1)];
        const ratingBonus = (player.rating || 5) * 2;
        const penalty = PREF_PENALTY[Math.min(i, PREF_PENALTY.length - 1)];
        const score = proximityScore + ratingBonus - penalty;
        if (score > bestScore)
            bestScore = score;
    }
    return bestScore;
}
/**
 * Assign players to formation positions.
 *
 * Pass 1 — zone-constrained greedy (GK → DEF → MID → FWD priority):
 *   Each slot picks the highest-scoring eligible player.
 *   Players that violate ALLOWED_ZONES for a slot score -1 and are skipped.
 *
 * Pass 2 — force assignment (no bench, ever):
 *   Any player not placed in pass 1 is assigned to the best remaining empty
 *   slot using unconstrained proximity.  This guarantees every player on the
 *   roster appears on the pitch — the formation has exactly N slots for N
 *   players, so no one can be left out.
 */
function assignPlayersToFormation(players, formationPositions) {
    const slots = formationPositions.map(pos => ({ position: pos }));
    const assignedPlayers = new Set();
    // Sort slots by priority (GK first, then defense, midfield, attack)
    const sortedSlotIndices = slots
        .map((slot, index) => ({
        index,
        priority: POSITION_PRIORITY[slot.position.code] ?? 99
    }))
        .sort((a, b) => a.priority - b.priority)
        .map(item => item.index);
    // ── Pass 1: zone-constrained assignment ───────────────────────────────────
    for (const slotIndex of sortedSlotIndices) {
        const slot = slots[slotIndex];
        let bestPlayer;
        let bestScore = -1;
        for (const player of players) {
            if (assignedPlayers.has(player.name))
                continue;
            const score = calculatePositionFitness(player, slot.position.code);
            if (score > bestScore) {
                bestScore = score;
                bestPlayer = player;
            }
        }
        if (bestPlayer) {
            slot.player = bestPlayer;
            assignedPlayers.add(bestPlayer.name);
        }
    }
    // ── Pass 2: force-assign stranded players (no bench) ─────────────────────
    // Collect players still unassigned and slots still empty after pass 1.
    const unassigned = players.filter(p => !assignedPlayers.has(p.name));
    if (unassigned.length > 0) {
        const emptySlotIndices = slots
            .map((slot, index) => ({ index, empty: !slot.player }))
            .filter(s => s.empty)
            .map(s => s.index);
        // For each unassigned player pick the best remaining empty slot
        // (closest zone, no constraint rejection).
        for (const player of unassigned) {
            let bestSlotIndex = -1;
            let bestScore = -Infinity;
            for (const slotIndex of emptySlotIndices) {
                const score = unconstrainedFitness(player, slots[slotIndex].position.code);
                if (score > bestScore) {
                    bestScore = score;
                    bestSlotIndex = slotIndex;
                }
            }
            if (bestSlotIndex !== -1) {
                slots[bestSlotIndex].player = player;
                assignedPlayers.add(player.name);
                emptySlotIndices.splice(emptySlotIndices.indexOf(bestSlotIndex), 1);
            }
        }
    }
    return slots;
}
/**
 * Generate formations for both teams
 */
function generateFormations(team1Players, team2Players) {
    // Select formation for each team (could be same or different based on player distribution)
    const team1Formation = selectBestFormation(team1Players);
    const team2Formation = selectBestFormation(team2Players);
    // Assign players to positions (force-assignment ensures no bench)
    const team1Slots = assignPlayersToFormation(team1Players, team1Formation.positions);
    const team2Slots = assignPlayersToFormation(team2Players, team2Formation.positions);
    return {
        team1: {
            name: team1Formation.name,
            description: getFormationDescription(team1Formation.name),
            slots: team1Slots,
            bench: [],
        },
        team2: {
            name: team2Formation.name,
            description: getFormationDescription(team2Formation.name),
            slots: team2Slots,
            bench: [],
        },
    };
}
function getFormationDescription(formation) {
    const descriptions = {
        // 6-a-side
        '2-2-1': 'Compact balanced shape',
        '1-3-1': 'Three in midfield, lone striker',
        '3-1-1': 'Solid defensive base, lone striker',
        // 7-a-side
        '3-2-1': 'Defensive triangle, two mids',
        '2-3-1': 'Midfield-dominant shape',
        '2-2-2': 'Attacking shape with twin strikers',
        // 8-a-side
        '3-3-1': 'Balanced three-line structure',
        '4-2-1': 'Solid back four, lone striker',
        '3-2-2': 'Attacking with twin strikers',
        '2-4-1': 'Midfield overload, lone striker',
        // 9-a-side
        '3-4-1': 'Midfield powerhouse, lone striker',
        '4-3-1': 'Solid back four, three mids',
        '3-3-2': 'Balanced with twin strikers',
        '4-2-2': 'Back four, twin strikers',
        // 10-a-side
        '4-3-2': 'Modern balanced shape',
        '3-4-2': 'Midfield-heavy, two up front',
        '4-4-1': 'Compact defensive block',
        '3-5-1': 'Midfield overload with wing-backs',
        // 11-a-side
        '4-4-2': 'Classic balanced with twin strikers',
        '4-3-3': 'Attacking with width from wingers',
        '3-5-2': 'Midfield dominant with wing-backs',
        '4-2-3-1': 'Attacking midfield trio behind striker',
        '5-3-2': 'Defensive solidity, three center-backs',
        '4-1-4-1': 'Solid base with protective midfielder',
    };
    return descriptions[formation] || 'Balanced formation';
}
