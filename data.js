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
  name: 'Liga Amistosa de Orlando',
  regularSeasonGames: 16,   // per team
  playoffTeams: 8,
  inningsPerGame: 6,        // used for ERA (earned runs per 6 innings)
  // All 9 teams (from the league's Nov 22 graphic)
  teams: [
    'Orlando Rays', 'Cleveland', 'Los Brechones', 'Team Buffalo', 'Los Vengadores',
    'Team Añejo', 'Team Panas', 'Dodgers', 'Altamira'
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
    opponent: 'Cleveland', home: true,  score: { us: 3, them: 1 }, notes: 'Opening day doubleheader' },
  { id: '2026-11-22-g2', date: '2026-11-22', num: 2, time: '10:30 AM', field: 'beisbol',
    opponent: 'Cleveland', home: null,  score: { us: 12, them: 13 }, notes: 'Battled back. Rays outscored Cleveland 15–14 over the doubleheader.' }
];

// ─── OTHER LEAGUE RESULTS (games the Rays weren't in) ────────────────────────
// Only needed for the standings table. One line per game. Scores are optional:
//   { date: '2026-11-22', winner: 'Team A', loser: 'Team B' }
//   { date: '2026-11-22', winner: 'Team A', loser: 'Team B', winnerScore: 6, loserScore: 4 }
const OTHER_RESULTS = [
  // Nov 22: all doubleheaders (Altamira had the bye)
  { date: '2026-11-22', winner: 'Los Brechones',  loser: 'Team Buffalo' },
  { date: '2026-11-22', winner: 'Los Brechones',  loser: 'Team Buffalo' },
  { date: '2026-11-22', winner: 'Los Vengadores', loser: 'Team Añejo' },
  { date: '2026-11-22', winner: 'Los Vengadores', loser: 'Team Añejo' },
  { date: '2026-11-22', winner: 'Team Panas',     loser: 'Dodgers' },
  { date: '2026-11-22', winner: 'Team Panas',     loser: 'Dodgers' },
];

// ─── ROSTER ──────────────────────────────────────────────────────────────────
// id: short, unique, no spaces (used in BOX below). number/positions optional.
// Add number: and positions: [...] to anyone as you get them.
const ROSTER = [
  { id: 'luis-bueno',         name: 'Luis Bueno', positions: ['2B'] },
  { id: 'luis-martinez',      name: 'Luis Martínez', positions: ['C'] },
  { id: 'george-castillo',    name: 'George Castillo' },
  { id: 'albert-corniell',    name: 'Albert Corniell', positions: ['1B'] },
  { id: 'randy-rodriguez',    name: 'Randy Rodríguez', positions: ['3B'] },
  { id: 'omar-lugo',          name: 'Omar Lugo', positions: ['SS'] },
  { id: 'manuel-contreras',   name: 'Manuel Contreras' },
  { id: 'enderson-jean',      name: 'Enderson Jean' },
  { id: 'alvaro-ascanio',     name: 'Alvaro Ascanio', positions: ['RF'] },
  { id: 'jose-roa',           name: 'José Roa' },
  { id: 'angel-vazquez',      name: 'Angel Vazquez' },
  { id: 'mychal-lett',        name: 'Mychal Lett', positions: ['LF'] },
  { id: 'chait-samuel',       name: 'Chait Samuel', positions: ['P'] },
  { id: 'rey-alvarado',       name: 'Rey Alvarado', positions: ['EH'] },
  { id: 'deano-thompson',     name: 'Deano Thompson' },
  { id: 'jean-cruz',          name: 'Jean Cruz' },
  { id: 'anthony-torres',     name: 'Anthony Torres' },
  { id: 'juan-gomez',         name: 'Juan Gómez', positions: ['RCF'], nickname: 'Sonny' },
  { id: 'derlyn-reyes',       name: 'Derlyn Reyes' },
  { id: 'ray-peralta',        name: 'Ray Peralta', positions: ['LCF'] },
  { id: 'manny-velazquez',    name: 'Manny Velázquez' },
  { id: 'marvin-ramos',       name: 'Marvin Ramos' },
  { id: 'jorge-suarez',       name: 'Jorge Suárez' },
  { id: 'akeem-fleming',      name: 'Akeem Fleming' },
];

// ─── BOX SCORES ──────────────────────────────────────────────────────────────
// Keyed by game id. Batting order = order listed. Leave out any stat that's 0.
//   batting:  ab r h 2b 3b hr rbi bb so hbp sb sf
//   pitching: ip (e.g. "4.2" = 4⅔) h r er bb so hbp hr, dec: 'W' | 'L' | 'S'
//             Pitching is different: leave out what you DON'T KNOW (shows as —).
//             If it really was zero, write 0.
const BOX = {
  '2026-11-22-g1': {
    // Scorebook notes: L4 = lineout to 2B, 4-3 = grounder 2B→1B, F6/F8/F9 = flyout SS/CF/RF,
    // L4-3 DP = lineout doubled off 1st, FC1 = fielder's choice to the pitcher.
    batting: {
      'omar-lugo':       { pos: 'SS', ab: 3 },                          // L4, 4-3, F6
      'mychal-lett':     { pos: 'LF', ab: 3, r: 1, h: 1, '3b': 1 },     // 3B, F8, F9
      'randy-rodriguez': { pos: '3B', ab: 2, bb: 1, so: 1 },            // BB, Kᴸ, 6-3
      'albert-corniell': { pos: '1B', ab: 2, h: 1, rbi: 1, so: 1 },     // 1B (RBI), K
      'juan-gomez':      { pos: 'RCF', ab: 1, bb: 1 },                   // BB, 4-3
      'rey-alvarado':    { pos: 'EH', ab: 2, r: 1, h: 1 },              // L4-3 DP, 1B
      'luis-bueno':      { pos: '2B', ab: 2, h: 1 },                    // 4-3, 1B
      'luis-martinez':   { pos: 'C', ab: 2, h: 2, rbi: 1 },            // 1B, 1B (RBI)
      'ray-peralta':     { pos: 'LCF', ab: 1, bb: 1 },                   // FC1, BB
      'alvaro-ascanio':  { pos: 'RF', ab: 2, h: 1, so: 1 },             // 1B, K
      'chait-samuel':    { pos: 'P', ab: 2, h: 1, rbi: 1 },            // 1B (RBI), 4-3
    },
    pitching: {
      // Complete game. H / BB / SO not tracked yet. ER = R (errors not tracked yet).
      'chait-samuel':    { ip: '6.0', r: 1, er: 1, dec: 'W' },
    }
  },
  '2026-11-22-g2': {
    // Lineup order as given. Subs listed right after the player they replaced.
    batting: {
      'omar-lugo':       { ab: 1, r: 1, bb: 2, rbi: 1 },             // BB, 1-3, BB (RBI); also out on the bases as a pinch runner
      'mychal-lett':     { ab: 4, r: 2, h: 3, '2b': 1, rbi: 2 },     // 1B, 2B, 4-3, 1B
      'randy-rodriguez': { ab: 1, r: 2, h: 1, bb: 2, rbi: 2 },       // BB, BB, 1B
      'albert-corniell': { ab: 2, bb: 2 },                           // FC4, BB, 4-3, BB  (sent as "Alvaro"; 4th spot = Albert?)
      'juan-gomez':      { ab: 4, h: 2, rbi: 2, so: 1 },             // 5-3, 1B (RBI), K, 1B (RBI)
      'marvin-ramos':    { ab: 2, h: 1, bb: 2, rbi: 1 },             // BB, BB, 1B (RBI), F9
      'rey-alvarado':    { ab: 3, r: 1, h: 2, sf: 1, rbi: 1 },       // 1B, SF8 (RBI), 1B, F9
      'luis-bueno':      { ab: 2, h: 1, bb: 1, so: 1 },              // BB, K, 1B
      'luis-martinez':   { ab: 2, rbi: 1 },                          // 5-4-3 DP (RBI), 4-3
      'chait-samuel':    { r: 1, bb: 1 },                            //   PH for Luis M: BB
      'ray-peralta':     { ab: 2, bb: 1, so: 1 },                    // BB, 1-3, Kᴸ
      'alvaro-ascanio':  { ab: 1, h: 1, bb: 1 },                     // BB, 1B
      'deano-thompson':  { r: 1, bb: 1, rbi: 1 },                    //   sub for Alvaro: BB (RBI)
    },
    pitching: {
      // ER = R (errors not tracked yet). H / BB / SO not tracked yet. L not assigned.
      'mychal-lett':     { ip: '1.1', r: 7, er: 7 },
      'luis-martinez':   { ip: '1.2', r: 2, er: 2 },
      'chait-samuel':    { ip: '3.0', r: 4, er: 4 },
    }
  },
  // '2026-11-22-g1': {
  //   batting: {
  //     luis: { ab: 4, r: 2, h: 3, '2b': 1, rbi: 2, bb: 1 },
  //   },
  //   pitching: {
  //     luis: { ip: '7.0', h: 6, r: 5, er: 3, bb: 2, so: 4, dec: 'W' },
  //   }
  // },
};
