import { Player } from './players';

export interface FieldPosition {
  x: number; // 0-100, horizontal position on field
  y: number; // 0-100, vertical position on field (0 = opponent goal, 100 = own goal)
  label: string;
  code: string; // Position code like 'GK', 'CB', 'ST', etc.
}

export interface FormationSlot {
  position: FieldPosition;
  player?: Player;
}

export interface TeamFormation {
  name: string; // e.g., "4-4-2", "4-3-3"
  description: string;
  slots: FormationSlot[];
  bench: Player[];
}

export interface FormationResult {
  team1: TeamFormation;
  team2: TeamFormation;
}

// Standard soccer formations with position coordinates
// x: 0 = left sideline, 50 = center, 100 = right sideline
// y: 0 = opponent goal, 100 = own goal
// Each formation has exactly N slots where N equals the squad size it is designed for.
const FORMATIONS: Record<string, FieldPosition[]> = {

  // ── 6-a-side ─────────────────────────────────────────────────────────────
  // 2-2-1  balanced 6v6
  '2-2-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 33, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 67, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 33, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 67, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 1-3-1  midfield-heavy 6v6
  '1-3-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 50, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 20, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 50, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 80, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 3-1-1  defensive 6v6
  '3-1-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],

  // ── 7-a-side ─────────────────────────────────────────────────────────────
  // 3-2-1  balanced 7v7
  '3-2-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 2-3-1  midfield-heavy 7v7
  '2-3-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 33, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 67, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 20, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 80, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 2-2-2  attacking 7v7
  '2-2-2': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 33, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 67, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 33, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 67, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 33, y: 18, label: 'Striker',       code: 'ST' },
    { x: 67, y: 18, label: 'Striker',       code: 'ST' },
  ],

  // ── 8-a-side ─────────────────────────────────────────────────────────────
  // 3-3-1  balanced 8v8
  '3-3-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 25, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 75, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 4-2-1  defensive 8v8
  '4-2-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 15, y: 73, label: 'Left Back',     code: 'LB' },
    { x: 38, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 62, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 85, y: 73, label: 'Right Back',    code: 'RB' },
    { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 3-2-2  attacking 8v8
  '3-2-2': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 33, y: 18, label: 'Striker',       code: 'ST' },
    { x: 67, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 2-4-1  midfield-heavy 8v8
  '2-4-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 33, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 67, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 15, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 38, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 62, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 85, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],

  // ── 9-a-side ─────────────────────────────────────────────────────────────
  // 3-4-1  midfield-heavy 9v9
  '3-4-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 15, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 38, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 62, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 85, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 4-3-1  defensive 9v9
  '4-3-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 15, y: 73, label: 'Left Back',     code: 'LB' },
    { x: 38, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 62, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 85, y: 73, label: 'Right Back',    code: 'RB' },
    { x: 25, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 75, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 3-3-2  attacking 9v9
  '3-3-2': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 25, y: 48, label: 'Left Midfield', code: 'LM' },
    { x: 50, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 75, y: 48, label: 'Right Midfield', code: 'RM' },
    { x: 35, y: 18, label: 'Striker',       code: 'ST' },
    { x: 65, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 4-2-2  balanced 9v9
  '4-2-2': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 15, y: 73, label: 'Left Back',     code: 'LB' },
    { x: 38, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 62, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 85, y: 73, label: 'Right Back',    code: 'RB' },
    { x: 35, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 65, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 35, y: 18, label: 'Striker',       code: 'ST' },
    { x: 65, y: 18, label: 'Striker',       code: 'ST' },
  ],

  // ── 10-a-side ────────────────────────────────────────────────────────────
  // 4-3-2  balanced 10v10
  '4-3-2': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 15, y: 73, label: 'Left Back',     code: 'LB' },
    { x: 38, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 62, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 85, y: 73, label: 'Right Back',    code: 'RB' },
    { x: 25, y: 51, label: 'Left Midfield', code: 'LM' },
    { x: 50, y: 54, label: 'Center Midfield', code: 'CM' },
    { x: 75, y: 51, label: 'Right Midfield', code: 'RM' },
    { x: 35, y: 18, label: 'Striker',       code: 'ST' },
    { x: 65, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 3-4-2  midfield-heavy 10v10
  '3-4-2': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',   code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 15, y: 51, label: 'Left Midfield', code: 'LM' },
    { x: 38, y: 54, label: 'Center Midfield', code: 'CM' },
    { x: 62, y: 54, label: 'Center Midfield', code: 'CM' },
    { x: 85, y: 51, label: 'Right Midfield', code: 'RM' },
    { x: 35, y: 18, label: 'Striker',       code: 'ST' },
    { x: 65, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 4-4-1  defensive 10v10
  '4-4-1': [
    { x: 50, y: 93, label: 'Goalkeeper',    code: 'GK' },
    { x: 15, y: 73, label: 'Left Back',     code: 'LB' },
    { x: 38, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 62, y: 73, label: 'Center Back',   code: 'CB' },
    { x: 85, y: 73, label: 'Right Back',    code: 'RB' },
    { x: 15, y: 51, label: 'Left Midfield', code: 'LM' },
    { x: 38, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 62, y: 51, label: 'Center Midfield', code: 'CM' },
    { x: 85, y: 51, label: 'Right Midfield', code: 'RM' },
    { x: 50, y: 18, label: 'Striker',       code: 'ST' },
  ],
  // 3-5-1  midfield-dominant 10v10
  '3-5-1': [
    { x: 50, y: 93, label: 'Goalkeeper',      code: 'GK' },
    { x: 25, y: 73, label: 'Center Back',     code: 'CB' },
    { x: 50, y: 76, label: 'Center Back',     code: 'CB' },
    { x: 75, y: 73, label: 'Center Back',     code: 'CB' },
    { x: 10, y: 55, label: 'Left Wing Back',  code: 'LWB' },
    { x: 32, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 50, y: 55, label: 'Defensive Midfield', code: 'CDM' },
    { x: 68, y: 48, label: 'Center Midfield', code: 'CM' },
    { x: 90, y: 55, label: 'Right Wing Back', code: 'RWB' },
    { x: 50, y: 18, label: 'Striker',         code: 'ST' },
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
const FORMATIONS_BY_COUNT: Record<number, string[]> = {
  6:  ['2-2-1', '1-3-1', '3-1-1'],
  7:  ['3-2-1', '2-3-1', '2-2-2'],
  8:  ['3-3-1', '4-2-1', '3-2-2', '2-4-1'],
  9:  ['3-4-1', '4-3-1', '3-3-2', '4-2-2'],
  10: ['4-3-2', '3-4-2', '4-4-1', '3-5-1'],
  11: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '4-1-4-1'],
};

// Zone classification for each formation position code.
const POSITION_ZONE: Record<string, string> = {
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
const ALLOWED_ZONES: Record<string, string[]> = {
  'goalkeeper': ['goalkeeper', 'defender'],
  'defender':   ['defender', 'midfielder', 'goalkeeper'],
  'midfielder':  ['midfielder', 'defender', 'forward', 'goalkeeper'],
  'forward':    ['forward', 'midfielder'],
  'player':     ['defender', 'midfielder', 'forward'],
};

// Position priorities for sorting (GK first, then defense, midfield, attack)
const POSITION_PRIORITY: Record<string, number> = {
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
function selectBestFormation(players: Player[]): { name: string; positions: FieldPosition[] } {
  const playerCount = players.length;

  // Count each outfield position type
  let defenders = 0, midfielders = 0, forwards = 0;
  for (const p of players) {
    const pos = (p.position || 'player').toLowerCase();
    if (pos === 'defender') defenders++;
    else if (pos === 'forward') forwards++;
    else midfielders++; // midfielder, goalkeeper, player all go here
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
    let formDefs: number, formMids: number, formFwds: number;
    if (parts.length === 4) {
      formDefs = parts[0]; formMids = parts[1] + parts[2]; formFwds = parts[3];
    } else if (parts.length === 3) {
      formDefs = parts[0]; formMids = parts[1]; formFwds = parts[2];
    } else {
      formDefs = parts[0]; formMids = parts[1] ?? 0; formFwds = 0;
    }
    const formOutfield = formDefs + formMids + formFwds;

    const defRatio = outfield > 0 ? defenders  / outfield : 1 / 3;
    const midRatio = outfield > 0 ? midfielders / outfield : 1 / 3;
    const fwdRatio = outfield > 0 ? forwards   / outfield : 1 / 3;

    const score = -(
      Math.abs(formDefs / formOutfield - defRatio) +
      Math.abs(formMids / formOutfield - midRatio) +
      Math.abs(formFwds / formOutfield - fwdRatio)
    );

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
 * Hard constraint (checked first):
 *   Each player type has a strict list of allowed zones (ALLOWED_ZONES).
 *   If the slot's zone is outside that list, return -1 (disqualified).
 *   The greedy loop uses bestScore = -1 as initial value, so -1 scored
 *   players are never chosen — a slot stays empty rather than breaking rules.
 *
 * Fallback priority within allowed zones (proximity along GK→DEF→MID→FWD):
 *   Same zone (preferred):   200 pts
 *   1 step away (adjacent):  100 pts  (e.g. midfielder ↔ defender)
 *   2 steps away:             40 pts  (e.g. defender ↔ forward via MID)
 *   3 steps away:             10 pts  (theoretical max for midfielder)
 *
 * Rating bonus (max ~40 pts) only differentiates players within the same zone tier.
 */
function calculatePositionFitness(player: Player, positionCode: string): number {
  const raw = (player.position || 'player').toLowerCase();
  const playerZone = raw === 'player' ? 'midfielder' : raw;
  const posZone = POSITION_ZONE[positionCode] ?? 'midfielder';

  // Hard constraint: disqualify if zone is not in the player's allowed list
  const allowed = ALLOWED_ZONES[playerZone] || ALLOWED_ZONES['player'];
  if (!allowed.includes(posZone)) {
    return -1;
  }

  // Proximity score within allowed zones
  const playerIndex = ZONE_ORDER.indexOf(playerZone);
  const posIndex = ZONE_ORDER.indexOf(posZone);
  const distance = (playerIndex === -1 || posIndex === -1)
    ? PROXIMITY_SCORES.length - 1
    : Math.abs(playerIndex - posIndex);

  const proximityScore = PROXIMITY_SCORES[Math.min(distance, PROXIMITY_SCORES.length - 1)];
  const ratingBonus = (player.rating || 5) * 2;
  // Tiny tie-breaker — never large enough to change zone preference
  const tieBreaker = Math.random() * 2;
  return proximityScore + ratingBonus + tieBreaker;
}

/**
 * Unconstrained proximity score used only in the force-assignment pass.
 * Unlike calculatePositionFitness, this never returns -1 — every player
 * is eligible for every slot.  The zone-distance penalty still applies so
 * each stranded player is placed in the closest available zone.
 */
function unconstrainedFitness(player: Player, positionCode: string): number {
  const raw = (player.position || 'player').toLowerCase();
  const playerZone = raw === 'player' ? 'midfielder' : raw;
  const posZone = POSITION_ZONE[positionCode] ?? 'midfielder';
  const playerIndex = ZONE_ORDER.indexOf(playerZone);
  const posIndex   = ZONE_ORDER.indexOf(posZone);
  const distance   = (playerIndex === -1 || posIndex === -1)
    ? PROXIMITY_SCORES.length - 1
    : Math.abs(playerIndex - posIndex);
  return PROXIMITY_SCORES[Math.min(distance, PROXIMITY_SCORES.length - 1)]
    + (player.rating || 5) * 2;
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
function assignPlayersToFormation(
  players: Player[], 
  formationPositions: FieldPosition[]
): FormationSlot[] {
  const slots: FormationSlot[] = formationPositions.map(pos => ({ position: pos }));
  const assignedPlayers = new Set<string>();
  
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
    let bestPlayer: Player | undefined;
    let bestScore = -1;
    
    for (const player of players) {
      if (assignedPlayers.has(player.name)) continue;
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
export function generateFormations(
  team1Players: Player[], 
  team2Players: Player[]
): FormationResult {
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

function getFormationDescription(formation: string): string {
  const descriptions: Record<string, string> = {
    // 6-a-side
    '2-2-1': 'Compact 6v6 with balanced shape',
    '1-3-1': 'Midfield-heavy 6v6 with three in the middle',
    '3-1-1': 'Defensive 6v6 with three at the back',
    // 7-a-side
    '3-2-1': 'Solid 7v7 with defensive triangle',
    '2-3-1': 'Midfield-dominant 7v7 formation',
    '2-2-2': 'Attacking 7v7 with twin strikers',
    // 8-a-side
    '3-3-1': 'Balanced 8v8 with solid structure',
    '4-2-1': 'Defensive 8v8 with four at the back',
    '3-2-2': 'Attacking 8v8 with twin strikers',
    '2-4-1': 'Midfield-loaded 8v8 formation',
    // 9-a-side
    '3-4-1': 'Midfield powerhouse 9v9 with lone striker',
    '4-3-1': 'Defensively solid 9v9 formation',
    '3-3-2': 'Attacking 9v9 with twin strikers',
    '4-2-2': 'Balanced 9v9 with two up front',
    // 10-a-side
    '4-3-2': 'Modern balanced 10v10 formation',
    '3-4-2': 'Midfield-heavy 10v10 with two up front',
    '4-4-1': 'Defensive-minded 10v10 formation',
    '3-5-1': 'Midfield dominant 10v10 with wing-backs',
    // 11-a-side
    '4-4-2': 'Classic balanced formation with solid defense and twin strikers',
    '4-3-3': 'Attacking formation with width from wingers',
    '3-5-2': 'Midfield dominant with wing-backs providing width',
    '4-2-3-1': 'Modern flexible formation with attacking midfield trio',
    '5-3-2': 'Defensive solidity with three center-backs',
    '4-1-4-1': 'Solid defensive base with protective midfielder',
  };
  return descriptions[formation] || 'Balanced formation';
}
