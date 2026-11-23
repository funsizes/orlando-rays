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
// Add number: and positions: [...] to anyone as you get them.
const ROSTER = [
  { id: 'luis-bueno',         name: 'Luis Bueno' },
  { id: 'luis-martinez',      name: 'Luis Martínez' },
  { id: 'george-castillo',    name: 'George Castillo' },
  { id: 'albert-corniell',    name: 'Albert Corniell' },
  { id: 'randy-rodriguez',    name: 'Randy Rodríguez' },
  { id: 'omar-lugo',          name: 'Omar Lugo' },
  { id: 'manuel-contreras',   name: 'Manuel Contreras' },
  { id: 'enderson-jean',      name: 'Enderson Jean' },
  { id: 'alvaro-ascanio',     name: 'Alvaro Ascanio' },
  { id: 'jose-roa',           name: 'José Roa' },
  { id: 'angel-vazquez',      name: 'Angel Vazquez' },
  { id: 'mychal-lett',        name: 'Mychal Lett' },
  { id: 'chait-samuel',       name: 'Chait Samuel' },
  { id: 'rey-alvarado',       name: 'Rey Alvarado' },
  { id: 'deano-thompson',     name: 'Deano Thompson' },
  { id: 'jean-cruz',          name: 'Jean Cruz' },
  { id: 'anthony-torres',     name: 'Anthony Torres' },
  { id: 'juan-gomez',         name: 'Juan Gómez' },
  { id: 'derlyn-reyes',       name: 'Derlyn Reyes' },
  { id: 'ray-peralta',        name: 'Ray Peralta' },
  { id: 'manny-velazquez',    name: 'Manny Velázquez' },
  { id: 'marvin-ramos',       name: 'Marvin Ramos' },
  { id: 'jorge-suarez',       name: 'Jorge Suárez' },
  { id: 'akeem-fleming',      name: 'Akeem Fleming' },
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
