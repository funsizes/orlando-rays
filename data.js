// ─────────────────────────────────────────────────────────────────────────────
//  ORLANDO RAYS — DATA
//  This is the only file you edit each week. Everything else is calculated.
// ─────────────────────────────────────────────────────────────────────────────

const TEAM = {
  name: 'Orlando Rays',
  short: 'Rays',
  city: 'Orlando, FL',
  season: '2026–27'
};

const LEAGUE = {
  name: 'Liga Amistosa',
  regularSeasonGames: 16,   // per team
  playoffTeams: 8,
  inningsPerGame: 7,        // used for ERA (runs allowed per 7 innings)
  // All 9 teams. Add the other 8 names here as you learn them.
  teams: [
    'Orlando Rays'
  ]
};

// Fields. Fill in the address so "Directions" works.
const FIELDS = {
  beisbol: { name: 'Beisbol Field', address: '', mapsUrl: '' }
};

// ─── SCHEDULE (Rays games) ───────────────────────────────────────────────────
// One entry per GAME (a doubleheader day = 2 entries with num: 1 and num: 2).
//   home:  true = we're home, false = away, null = not known yet
//   time:  "9:00 AM" or "TBD"
//   score: null until played, then { us: 8, them: 5 }
//   line:  optional inning-by-inning runs, e.g. { us: [2,0,1,3,0,2], them: [0,1,0,0,4,0,0] }
const GAMES = [
  { id: '2026-11-22-g1', date: '2026-11-22', num: 1, time: '9:00 AM', field: 'beisbol',
    opponent: 'TBD', home: true,  score: null, notes: 'Opening day doubleheader' },
  { id: '2026-11-22-g2', date: '2026-11-22', num: 2, time: 'TBD',     field: 'beisbol',
    opponent: 'TBD', home: null,  score: null, notes: '' }
];

// ─── OTHER LEAGUE RESULTS (games the Rays weren't in) ────────────────────────
// Only needed for the standings table. Example:
//   { date: '2026-11-22', home: 'Team A', away: 'Team B', homeScore: 6, awayScore: 4 }
const OTHER_RESULTS = [];

// ─── ROSTER ──────────────────────────────────────────────────────────────────
// id: short, unique, no spaces (used in BOX below). number/positions optional.
const ROSTER = [
  // { id: 'luis', name: 'Luis Martinez', number: 6, positions: ['SS', 'P'] },
];

// ─── BOX SCORES ──────────────────────────────────────────────────────────────
// Keyed by game id. Batting order = order listed. Leave out any stat that's 0.
//   batting:  ab r h 2b 3b hr rbi bb so hbp sb sf
//   pitching: ip (e.g. "4.2" = 4⅔) h r er bb so hbp hr, dec: 'W' | 'L' | 'S'
const BOX = {
  // '2026-11-22-g1': {
  //   batting: {
  //     luis: { ab: 4, r: 2, h: 3, '2b': 1, rbi: 2, bb: 1 },
  //   },
  //   pitching: {
  //     luis: { ip: '7.0', h: 6, r: 5, er: 3, bb: 2, so: 4, dec: 'W' },
  //   }
  // },
};
