// ─────────────────────────────────────────────────────────────────────────────
//  ORLANDO RAYS — APP  (no need to edit; data lives in data.js)
// ─────────────────────────────────────────────────────────────────────────────

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── DATES (local time, not UTC) ──────────────────────────────────────────────

function todayStr() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const asDate   = s => new Date(s + 'T12:00:00');
const fmtLong  = s => asDate(s).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtShort = s => asDate(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const monAbbr  = s => asDate(s).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
const dayNum   = s => asDate(s).getDate();

// ── GAME HELPERS ─────────────────────────────────────────────────────────────

const sortedGames = () => [...GAMES].sort((a, b) => a.date.localeCompare(b.date) || (a.num || 1) - (b.num || 1));
const played      = () => sortedGames().filter(g => g.score);
const upcoming    = () => sortedGames().filter(g => !g.score && g.date >= todayStr());
const getGame     = id => GAMES.find(g => g.id === id);
const getPlayer   = id => ROSTER.find(p => p.id === id);
const field       = g => FIELDS[g.field] || { name: g.field || 'TBD' };
const outcome     = s => s.us > s.them ? 'W' : s.us < s.them ? 'L' : 'T';
const isTBD       = s => !s || /^tbd$/i.test(String(s).trim());
const vsLabel     = g => (g.home === false ? '@ ' : 'vs ') + esc(g.opponent || 'TBD');
const homeTag     = g => g.home === true ? '<span class="tag tag-home">HOME</span>'
                       : g.home === false ? '<span class="tag tag-away">AWAY</span>' : '';
const gameLabel   = g => {
  const sameDay = GAMES.filter(x => x.date === g.date).length > 1;
  return sameDay ? `Game ${g.num || 1}` : '';
};

function teamRecord() {
  const r = { w: 0, l: 0, t: 0, rs: 0, ra: 0, gp: 0 };
  played().forEach(g => {
    const o = outcome(g.score);
    r.gp++; r.rs += g.score.us; r.ra += g.score.them;
    if (o === 'W') r.w++; else if (o === 'L') r.l++; else r.t++;
  });
  return r;
}
const recStr = r => `${r.w}-${r.l}${r.t ? '-' + r.t : ''}`;

// ── STATS MATH ───────────────────────────────────────────────────────────────

const BAT_KEYS = ['ab', 'r', 'h', '2b', '3b', 'hr', 'rbi', 'bb', 'so', 'hbp', 'sb', 'sf'];
const PIT_KEYS = ['h', 'r', 'er', 'bb', 'so', 'hbp', 'hr'];

// Accepts baseball shorthand ("4.1" = 4⅓, "4.2" = 4⅔) or decimals ("4.33", "4.67")
function ipToOuts(ip) {
  if (ip == null || ip === '') return 0;
  const [w, f = '0'] = String(ip).split('.');
  const whole = (parseInt(w, 10) || 0) * 3;
  if (f.length <= 1) return whole + (parseInt(f, 10) || 0);
  return whole + Math.round(parseFloat('0.' + f) * 3);
}
// Display innings as real fractions: 9, 1⅓, 1⅔
const outsToIp = o => {
  const w = Math.floor(o / 3), r = o % 3;
  return r === 0 ? String(w) : `${w || ''}${r === 1 ? '⅓' : '⅔'}`;
};

function blankBat() { const o = { g: 0 }; BAT_KEYS.forEach(k => o[k] = 0); return o; }
// Pitching: a stat left out of a line means "unknown" (not 0), so it shows as — and
// isn't counted in ERA/WHIP. Batting: left out = 0.
function blankPit() {
  const o = { g: 0, outs: 0, w: 0, l: 0, s: 0, erOuts: 0, whipOuts: 0, miss: {} };
  PIT_KEYS.forEach(k => { o[k] = 0; o.miss[k] = 0; });
  return o;
}

function addBat(t, s) { t.g++; BAT_KEYS.forEach(k => t[k] += +(s[k] || 0)); return t; }
function addPit(t, s) {
  const outs = ipToOuts(s.ip);
  t.g++; t.outs += outs;
  PIT_KEYS.forEach(k => { if (s[k] == null) t.miss[k]++; else t[k] += +s[k]; });
  if (s.er != null) t.erOuts += outs;
  if (s.h != null && s.bb != null) t.whipOuts += outs;
  if (s.dec === 'W') t.w++; if (s.dec === 'L') t.l++; if (s.dec === 'S') t.s++;
  return t;
}
// Season pitching value, or — if no game line has it
const pv = (r, k) => r.miss[k] === r.g ? '—' : r[k];
// Single game pitching value
const gv = (s, k) => s[k] == null ? '—' : s[k];

function batCalc(t) {
  const pa = t.ab + t.bb + t.hbp + t.sf;
  const tb = (t.h - t['2b'] - t['3b'] - t.hr) + 2 * t['2b'] + 3 * t['3b'] + 4 * t.hr;
  const avg = t.ab ? t.h / t.ab : null;
  const obp = pa ? (t.h + t.bb + t.hbp) / pa : null;
  const slg = t.ab ? tb / t.ab : null;
  return { ...t, pa, tb, avg, obp, slg, ops: obp != null && slg != null ? obp + slg : null };
}
function pitCalc(t) {
  return { ...t, ip: outsToIp(t.outs),
    era:  t.erOuts   ? t.er * LEAGUE.inningsPerGame / (t.erOuts / 3) : null,
    whip: t.whipOuts ? (t.bb + t.h) / (t.whipOuts / 3) : null };
}

const rate = x => x == null ? '—' : (x < 1 ? x.toFixed(3).slice(1) : x.toFixed(3));
const dec2 = x => x == null ? '—' : x.toFixed(2);

// Season totals per player
function seasonBatting() {
  const out = {};
  played().forEach(g => Object.entries(BOX[g.id]?.batting || {}).forEach(([pid, s]) =>
    addBat(out[pid] ||= blankBat(), s)));
  return Object.entries(out).map(([pid, t]) => ({ pid, ...batCalc(t) }));
}
function seasonPitching() {
  const out = {};
  played().forEach(g => Object.entries(BOX[g.id]?.pitching || {}).forEach(([pid, s]) =>
    addPit(out[pid] ||= blankPit(), s)));
  return Object.entries(out).map(([pid, t]) => ({ pid, ...pitCalc(t) }));
}

// Qualifiers: 2 AB per team game for AVG/OBP/SLG, 1 IP per team game for ERA
const qualBat = r => r.pa >= 2 * Math.max(1, teamRecord().gp);
const qualPit = r => r.outs >= 3 * Math.max(1, teamRecord().gp);

function playerName(pid) {
  const p = getPlayer(pid);
  return p ? p.name : pid;
}
function playerLink(pid) {
  return `<a href="#player/${encodeURIComponent(pid)}">${esc(playerName(pid))}</a>`;
}

// ── STANDINGS ────────────────────────────────────────────────────────────────

function standings() {
  const rows = {};
  const team = n => rows[n] ||= { team: n, w: 0, l: 0, t: 0, rs: 0, ra: 0, noScore: 0, results: [] };
  LEAGUE.teams.forEach(team);

  // a beat b (or tied). Scores optional: games without scores still count for W/L,
  // but that team's RS/RA/DIFF show — since they'd be incomplete.
  const addResult = (date, a, b, as, bs, tie = false) => {
    const ta = team(a), tb = team(b);
    if (as != null && bs != null) { ta.rs += as; ta.ra += bs; tb.rs += bs; tb.ra += as; }
    else { ta.noScore++; tb.noScore++; }
    if (tie) { ta.t++; tb.t++; ta.results.push([date, 'T']); tb.results.push([date, 'T']); }
    else { ta.w++; tb.l++; ta.results.push([date, 'W']); tb.results.push([date, 'L']); }
  };

  played().forEach(g => {
    if (isTBD(g.opponent)) return;
    const { us, them } = g.score;
    if (us >= them) addResult(g.date, TEAM.name, g.opponent, us, them, us === them);
    else addResult(g.date, g.opponent, TEAM.name, them, us);
  });
  OTHER_RESULTS.forEach(r => {
    if (r.winner) return addResult(r.date, r.winner, r.loser, r.winnerScore, r.loserScore, !!r.tie);
    // { home, away, homeScore, awayScore } form
    if (r.homeScore >= r.awayScore) addResult(r.date, r.home, r.away, r.homeScore, r.awayScore, r.homeScore === r.awayScore);
    else addResult(r.date, r.away, r.home, r.awayScore, r.homeScore);
  });

  const list = Object.values(rows).map(r => {
    const gp = r.w + r.l + r.t;
    const res = r.results.sort((a, b) => a[0].localeCompare(b[0])).map(x => x[1]);
    let streak = '';
    if (res.length) { const last = res[res.length - 1]; let n = 0; for (let i = res.length - 1; i >= 0 && res[i] === last; i--) n++; streak = last + n; }
    const scored = gp > 0 && r.noScore === 0;
    return { ...r, gp, pct: gp ? (r.w + r.t / 2) / gp : null, scored, diff: scored ? r.rs - r.ra : null, streak };
  });

  // Games behind the best record, then sort by GB, wins, run diff, name
  const best = list.reduce((m, r) => (r.w - r.l) > (m.w - m.l) ? r : m, list[0]);
  list.forEach(r => r.gb = best ? ((best.w - r.w) + (r.l - best.l)) / 2 : 0);
  return list.sort((a, b) => a.gb - b.gb || b.w - a.w || (b.diff ?? 0) - (a.diff ?? 0) || a.team.localeCompare(b.team));
}

// ── ROUTER ───────────────────────────────────────────────────────────────────

const ROUTES = {
  home:      { nav: 'home',      title: 'Home',      fn: renderHome },
  schedule:  { nav: 'schedule',  title: 'Schedule',  fn: renderSchedule },
  standings: { nav: 'standings', title: 'Standings', fn: renderStandings },
  stats:     { nav: 'stats',     title: 'Stats',     fn: renderStats },
  roster:    { nav: 'roster',    title: 'Roster',    fn: renderRoster },
  game:      { nav: 'schedule',  title: 'Box Score', fn: renderGame },
  player:    { nav: 'roster',    title: 'Player',    fn: renderPlayer }
};

function route() {
  const [name, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  const r = ROUTES[name] || ROUTES.home;
  const arg = decodeURIComponent(rest.join('/'));
  $('#app').innerHTML = r.fn(arg);
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === r.nav));
  document.title = `${r.title} · ${TEAM.name}`;
}

let lastHash = location.hash;
window.addEventListener('hashchange', () => {
  route();
  // Only jump to top when moving to a different page, not on a re-sort
  if (location.hash.split('?')[0] !== lastHash.split('?')[0]) window.scrollTo(0, 0);
  lastHash = location.hash;
});

document.addEventListener('DOMContentLoaded', () => {
  $('#brand-name').textContent = TEAM.name;
  $('#brand-sub').textContent = `${LEAGUE.name} · ${TEAM.season}`;
  $('#footer').textContent = `${TEAM.name} · ${LEAGUE.name} · ${TEAM.city}`;
  route();
});

// Clicks on sortable table headers / tabs / calendar buttons
document.addEventListener('click', e => {
  const sortTh = e.target.closest('[data-sort]');
  if (sortTh) {
    const tbl = sortTh.dataset.table, key = sortTh.dataset.sort;
    const st = SORT[tbl];
    st.dir = st.key === key ? -st.dir : (sortTh.dataset.asc ? 1 : -1);
    st.key = key;
    route();
    return;
  }
  const tab = e.target.closest('[data-stats-tab]');
  if (tab) { statsTab = tab.dataset.statsTab; route(); return; }
  const qual = e.target.closest('[data-qual]');
  if (qual) { qualOnly = qual.checked; route(); return; }
  const ics = e.target.closest('[data-ics]');
  if (ics) { downloadIcs(ics.dataset.ics); }
});

// ── HOME ─────────────────────────────────────────────────────────────────────

function renderHome() {
  const rec = teamRecord();
  const up = upcoming();
  const next = up[0];

  // Next game day (shows both games of a doubleheader)
  let hero;
  if (next) {
    const day = up.filter(g => g.date === next.date);
    const f = field(next);
    const isToday = next.date === todayStr();
    hero = `
      <section class="hero">
        <div class="hero-kicker">${isToday ? 'GAME DAY — TODAY' : 'NEXT UP'}${day.length > 1 ? ' · DOUBLEHEADER' : ''}</div>
        <div class="hero-date">${fmtLong(next.date)}</div>
        <div class="hero-games">
          ${day.map(g => `
            <div class="hero-game">
              <div class="hero-game-label">${gameLabel(g) || 'Game'} ${homeTag(g)}</div>
              <div class="hero-vs">${vsLabel(g)}</div>
              <div class="hero-time"><i class="fas fa-clock"></i> ${esc(g.time)}</div>
            </div>`).join('')}
        </div>
        <div class="hero-meta"><i class="fas fa-location-dot"></i> ${esc(f.name)}${f.address ? ' · ' + esc(f.address) : ''}</div>
        ${next.notes ? `<div class="hero-notes">${esc(next.notes)}</div>` : ''}
        <div class="btn-row">
          <button class="btn btn-primary" data-ics="${next.id}"><i class="fas fa-calendar-plus"></i> Save to Calendar</button>
          ${f.mapsUrl ? `<a class="btn" href="${esc(f.mapsUrl)}" target="_blank" rel="noopener"><i class="fas fa-map"></i> Directions</a>` : ''}
          <a class="btn" href="#schedule"><i class="fas fa-list"></i> Full Schedule</a>
        </div>
      </section>`;
  } else {
    hero = `<section class="hero"><div class="hero-kicker">SCHEDULE</div><div class="hero-date">No upcoming games on the schedule yet.</div></section>`;
  }

  const recordCards = `
    <div class="kpis">
      <div class="kpi"><div class="kpi-val">${recStr(rec)}</div><div class="kpi-label">Record</div></div>
      <div class="kpi"><div class="kpi-val">${rec.gp}<span class="kpi-of">/${LEAGUE.regularSeasonGames}</span></div><div class="kpi-label">Games Played</div></div>
      <div class="kpi"><div class="kpi-val">${rec.rs}</div><div class="kpi-label">Runs Scored</div></div>
      <div class="kpi"><div class="kpi-val">${rec.ra}</div><div class="kpi-label">Runs Allowed</div></div>
    </div>`;

  const recent = played().reverse().slice(0, 4);
  const recentHtml = recent.length ? `
    <h2 class="sec-title">Recent Results</h2>
    <div class="list">${recent.map(gameRowHtml).join('')}</div>` : '';

  return hero + recordCards + recentHtml + leadersHtml();
}

function leadersHtml() {
  const bat = seasonBatting(), pit = seasonPitching();
  if (!bat.length && !pit.length) return '';
  const top = (arr, key, fmt, filter = () => true, asc = false) => {
    const rows = arr.filter(filter).filter(r => r[key] != null).sort((a, b) => asc ? a[key] - b[key] : b[key] - a[key]);
    const c = rows[0];
    if (!c) return null;
    const tied = rows.filter(r => r[key] === c[key]).length - 1;
    return { who: c.pid, val: fmt(c[key]), tied };
  };
  const cards = [
    ['AVG', top(bat, 'avg', rate, qualBat)],
    ['Hits', top(bat, 'h', String)],
    ['HR', top(bat, 'hr', String)],
    ['RBI', top(bat, 'rbi', String)],
    ['Runs', top(bat, 'r', String)],
    ['OPS', top(bat, 'ops', rate, qualBat)],
    ['Strikeouts (P)', top(pit, 'so', String)],
    ['ERA', top(pit, 'era', dec2, qualPit, true)]
  ].filter(([, v]) => v && v.val !== '0');
  if (!cards.length) return '';
  return `
    <h2 class="sec-title">Team Leaders</h2>
    <div class="leaders">${cards.map(([label, v]) => `
      <a class="leader" href="${v.tied ? '#stats' : '#player/' + encodeURIComponent(v.who)}">
        <div class="leader-label">${label}</div>
        <div class="leader-val">${v.val}</div>
        <div class="leader-name">${v.tied ? `${v.tied + 1}-way tie` : esc(playerName(v.who))}</div>
      </a>`).join('')}
    </div>`;
}

// ── SCHEDULE ─────────────────────────────────────────────────────────────────

function gameRowHtml(g) {
  const f = field(g);
  const label = gameLabel(g);
  let right;
  if (g.score) {
    const o = outcome(g.score);
    right = `<div class="result result-${o.toLowerCase()}"><span class="result-o">${o}</span> ${g.score.us}–${g.score.them}</div>`;
  } else {
    right = `<button class="btn btn-sm btn-icon" data-ics="${g.id}" title="Save to calendar" aria-label="Save to calendar"><i class="fas fa-calendar-plus"></i></button>`;
  }
  const hasBox = !!BOX[g.id];
  return `
    <div class="row">
      <div class="datebox"><div class="datebox-m">${monAbbr(g.date)}</div><div class="datebox-d">${dayNum(g.date)}</div></div>
      <div class="row-main">
        <div class="row-title">${vsLabel(g)} ${homeTag(g)}</div>
        <div class="row-meta">${label ? `<b>${label}</b> · ` : ''}${esc(g.time)} · ${esc(f.name)}</div>
        ${g.score && hasBox ? `<a class="row-link" href="#game/${g.id}">Box score →</a>` : ''}
      </div>
      <div class="row-side">${right}</div>
    </div>`;
}

function renderSchedule() {
  const games = sortedGames();
  const rec = teamRecord();
  const remaining = Math.max(0, LEAGUE.regularSeasonGames - games.length);

  // Group by date
  const byDate = {};
  games.forEach(g => (byDate[g.date] ||= []).push(g));
  const days = Object.keys(byDate).sort();

  const list = days.map(d => {
    const gs = byDate[d];
    const dh = gs.length > 1;
    return `
      <div class="day">
        <div class="day-head">${fmtShort(d)}${dh ? ' <span class="tag">DOUBLEHEADER</span>' : ''}</div>
        <div class="list">${gs.map(gameRowHtml).join('')}</div>
      </div>`;
  }).join('');

  return `
    <h1 class="page-title">Schedule & Results</h1>
    <p class="lede">${LEAGUE.name} regular season: ${LEAGUE.regularSeasonGames} games. Record: <b>${recStr(rec)}</b>.</p>
    ${list || '<div class="empty">No games on the schedule yet.</div>'}
    ${remaining ? `<p class="muted small">${remaining} more regular-season game${remaining === 1 ? '' : 's'} still to be scheduled.</p>` : ''}
    <h2 class="sec-title">Playoffs</h2>
    <div class="card">
      <p>${LEAGUE.playoffTeams} of ${Math.max(LEAGUE.teams.length, 9)} teams make the playoffs. The bracket shows up here once the regular season ends.</p>
    </div>`;
}

// ── STANDINGS ────────────────────────────────────────────────────────────────

function renderStandings() {
  const rows = standings();
  const known = LEAGUE.teams.length;
  const missingTeams = Math.max(0, 9 - known);
  const partial = OTHER_RESULTS.length === 0 && played().length > 0;

  return `
    <h1 class="page-title">${esc(LEAGUE.name)} Standings</h1>
    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th class="l">#</th><th class="l">Team</th><th>GP</th><th>W</th><th>L</th><th>T</th><th>PCT</th><th>GB</th><th>RS</th><th>RA</th><th>DIFF</th><th>STRK</th></tr></thead>
        <tbody>${rows.map((r, i) => `
          <tr class="${r.team === TEAM.name ? 'us' : ''} ${i === LEAGUE.playoffTeams - 1 ? 'cutline' : ''}">
            <td class="l">${i + 1}</td>
            <td class="l name">${esc(r.team)}</td>
            <td>${r.gp}</td><td>${r.w}</td><td>${r.l}</td><td>${r.t}</td>
            <td>${r.gp ? rate(r.pct) : '—'}</td>
            <td>${r.gb === 0 ? '—' : r.gb.toFixed(1)}</td>
            <td>${r.scored ? r.rs : '—'}</td><td>${r.scored ? r.ra : '—'}</td>
            <td class="${r.diff > 0 ? 'up' : r.diff < 0 ? 'down' : ''}">${r.diff == null ? '—' : (r.diff > 0 ? '+' : '') + r.diff}</td>
            <td>${r.streak || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="muted small">Top ${LEAGUE.playoffTeams} make the playoffs (line under #${LEAGUE.playoffTeams}). Ties count as half a win.</p>
    ${missingTeams ? `<p class="muted small">${missingTeams} of the league's 9 teams haven't been added yet.</p>` : ''}
    ${partial ? `<p class="muted small">Only Rays games are counted so far. Other teams' results get added as they come in.</p>` : ''}
    ${rows.some(r => r.gp && !r.scored) ? `<p class="muted small">RS / RA / DIFF show — for teams whose game scores we don't have yet.</p>` : ''}`;
}

// ── STATS ────────────────────────────────────────────────────────────────────

let statsTab = 'batting';
let qualOnly = false;
const SORT = {
  bat: { key: 'avg', dir: -1 },
  pit: { key: 'era', dir: 1 }
};

function sortRows(rows, st) {
  return [...rows].sort((a, b) => {
    const av = a[st.key], bv = b[st.key];
    if (st.key === 'name') return st.dir * playerName(a.pid).localeCompare(playerName(b.pid));
    if (av == null && bv == null) return 0;
    if (av == null) return 1;          // blanks always last
    if (bv == null) return -1;
    return st.dir * (av - bv);
  });
}

function th(table, key, label, title, asc) {
  const st = SORT[table];
  const on = st.key === key;
  return `<th class="sortable ${on ? 'sorted' : ''} ${key === 'name' ? 'l' : ''}" data-table="${table}" data-sort="${key}" ${asc ? 'data-asc="1"' : ''} title="${title}">${label}${on ? (st.dir < 0 ? ' ▾' : ' ▴') : ''}</th>`;
}

function renderStats() {
  const bat = seasonBatting().filter(r => !qualOnly || qualBat(r));
  const pit = seasonPitching().filter(r => !qualOnly || qualPit(r));

  const batTbl = !bat.length ? '<div class="empty">No batting stats yet.</div>' : `
    <div class="table-wrap"><table class="tbl">
      <thead><tr>
        ${th('bat', 'name', 'Player', 'Player', true)}
        ${th('bat', 'g', 'G', 'Games')}${th('bat', 'pa', 'PA', 'Plate appearances')}${th('bat', 'ab', 'AB', 'At bats')}
        ${th('bat', 'r', 'R', 'Runs')}${th('bat', 'h', 'H', 'Hits')}${th('bat', '2b', '2B', 'Doubles')}${th('bat', '3b', '3B', 'Triples')}
        ${th('bat', 'hr', 'HR', 'Home runs')}${th('bat', 'rbi', 'RBI', 'Runs batted in')}${th('bat', 'bb', 'BB', 'Walks')}
        ${th('bat', 'so', 'SO', 'Strikeouts', true)}${th('bat', 'sb', 'SB', 'Stolen bases')}
        ${th('bat', 'avg', 'AVG', 'Batting average')}${th('bat', 'obp', 'OBP', 'On-base %')}${th('bat', 'slg', 'SLG', 'Slugging %')}${th('bat', 'ops', 'OPS', 'OBP + SLG')}
      </tr></thead>
      <tbody>${sortRows(bat, SORT.bat).map(r => `
        <tr><td class="l name">${playerLink(r.pid)}</td>
          <td>${r.g}</td><td>${r.pa}</td><td>${r.ab}</td><td>${r.r}</td><td>${r.h}</td><td>${r['2b']}</td><td>${r['3b']}</td>
          <td>${r.hr}</td><td>${r.rbi}</td><td>${r.bb}</td><td>${r.so}</td><td>${r.sb}</td>
          <td class="hi">${rate(r.avg)}</td><td>${rate(r.obp)}</td><td>${rate(r.slg)}</td><td>${rate(r.ops)}</td></tr>`).join('')}
      </tbody>
    </table></div>`;

  const pitTbl = !pit.length ? '<div class="empty">No pitching stats yet.</div>' : `
    <div class="table-wrap"><table class="tbl">
      <thead><tr>
        ${th('pit', 'name', 'Pitcher', 'Pitcher', true)}
        ${th('pit', 'g', 'G', 'Games')}${th('pit', 'w', 'W', 'Wins')}${th('pit', 'l', 'L', 'Losses', true)}${th('pit', 's', 'SV', 'Saves')}
        ${th('pit', 'outs', 'IP', 'Innings pitched')}${th('pit', 'h', 'H', 'Hits allowed', true)}${th('pit', 'r', 'R', 'Runs allowed', true)}
        ${th('pit', 'er', 'ER', 'Earned runs', true)}${th('pit', 'bb', 'BB', 'Walks', true)}${th('pit', 'so', 'SO', 'Strikeouts')}
        ${th('pit', 'era', 'ERA', `Earned runs per ${LEAGUE.inningsPerGame} innings`, true)}${th('pit', 'whip', 'WHIP', 'Walks + hits per inning', true)}
      </tr></thead>
      <tbody>${sortRows(pit, SORT.pit).map(r => `
        <tr><td class="l name">${playerLink(r.pid)}</td>
          <td>${r.g}</td><td>${r.w}</td><td>${r.l}</td><td>${r.s}</td><td>${r.ip}</td><td>${pv(r,"h")}</td><td>${pv(r,"r")}</td>
          <td>${pv(r,"er")}</td><td>${pv(r,"bb")}</td><td>${pv(r,"so")}</td><td class="hi">${dec2(r.era)}</td><td>${dec2(r.whip)}</td></tr>`).join('')}
      </tbody>
    </table></div>`;

  return `
    <h1 class="page-title">Season Stats</h1>
    <div class="toolbar">
      <div class="tabs" role="tablist">
        <button class="tab ${statsTab === 'batting' ? 'active' : ''}" data-stats-tab="batting" role="tab">Batting</button>
        <button class="tab ${statsTab === 'pitching' ? 'active' : ''}" data-stats-tab="pitching" role="tab">Pitching</button>
      </div>
      <label class="check"><input type="checkbox" data-qual ${qualOnly ? 'checked' : ''}> Qualified only</label>
    </div>
    ${statsTab === 'batting' ? batTbl : pitTbl}
    <p class="muted small">Tap a column to sort. Qualified = ${statsTab === 'batting' ? '2 plate appearances' : '1 inning pitched'} per team game.
      ${statsTab === 'pitching' ? `ERA = earned runs per ${LEAGUE.inningsPerGame} innings. Errors aren't tracked yet, so every run counts as earned. — = not tracked yet.` : ''}</p>`;
}

// ── GAME (BOX SCORE) ─────────────────────────────────────────────────────────

function renderGame(id) {
  const g = getGame(id);
  if (!g) return `<div class="empty">Game not found. <a href="#schedule">Back to schedule</a></div>`;
  const box = BOX[g.id] || {};
  const f = field(g);
  const label = gameLabel(g);

  const head = `
    <a class="back" href="#schedule">← Schedule</a>
    <div class="game-head">
      <div class="muted small">${fmtLong(g.date)}${label ? ' · ' + label : ''} · ${esc(g.time)} · ${esc(f.name)}</div>
      <h1 class="page-title">${esc(TEAM.short)} ${vsLabel(g)} ${homeTag(g)}</h1>
      ${g.score ? `<div class="final result-${outcome(g.score).toLowerCase()}">
          <span class="result-o">${outcome(g.score)}</span> ${g.score.us}–${g.score.them} <span class="muted">Final</span></div>` : ''}
    </div>`;

  // Line score
  let line = '';
  if (g.line && (g.line.us || g.line.them)) {
    const n = Math.max(g.line.us?.length || 0, g.line.them?.length || 0, LEAGUE.inningsPerGame);
    const rowFor = (name, arr, total) => `<tr><td class="l name">${esc(name)}</td>${Array.from({ length: n }, (_, i) => `<td>${arr?.[i] ?? ''}</td>`).join('')}<td class="hi">${total}</td></tr>`;
    const awayFirst = g.home !== false; // home team bats second
    const usRow = rowFor(TEAM.short, g.line.us, g.score?.us ?? ''), themRow = rowFor(g.opponent, g.line.them, g.score?.them ?? '');
    line = `
      <div class="table-wrap"><table class="tbl line">
        <thead><tr><th class="l"></th>${Array.from({ length: n }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>R</th></tr></thead>
        <tbody>${awayFirst ? themRow + usRow : usRow + themRow}</tbody>
      </table></div>`;
  }

  // Batting box
  const batEntries = Object.entries(box.batting || {});
  let batHtml = '<div class="empty">No batting box score for this game.</div>';
  if (batEntries.length) {
    const tot = blankBat();
    batEntries.forEach(([, s]) => addBat(tot, s));
    const T = batCalc(tot);
    batHtml = `
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th class="l">Batter</th><th class="l">Pos</th><th>AB</th><th>R</th><th>H</th><th>2B</th><th>3B</th><th>HR</th><th>RBI</th><th>BB</th><th>SO</th><th>SB</th></tr></thead>
        <tbody>${batEntries.map(([pid, s]) => {
          const v = k => +(s[k] || 0);
          return `<tr><td class="l name">${playerLink(pid)}</td><td class="l muted">${esc(s.pos || '')}</td><td>${v('ab')}</td><td>${v('r')}</td><td>${v('h')}</td><td>${v('2b')}</td><td>${v('3b')}</td><td>${v('hr')}</td><td>${v('rbi')}</td><td>${v('bb')}</td><td>${v('so')}</td><td>${v('sb')}</td></tr>`;
        }).join('')}</tbody>
        <tfoot><tr><td class="l">Team</td><td></td><td>${T.ab}</td><td>${T.r}</td><td>${T.h}</td><td>${T['2b']}</td><td>${T['3b']}</td><td>${T.hr}</td><td>${T.rbi}</td><td>${T.bb}</td><td>${T.so}</td><td>${T.sb}</td></tr></tfoot>
      </table></div>`;
  }

  // Pitching box
  const pitEntries = Object.entries(box.pitching || {});
  const pitHtml = !pitEntries.length ? '' : `
    <h2 class="sec-title">Pitching</h2>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th class="l">Pitcher</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th></tr></thead>
      <tbody>${pitEntries.map(([pid, s]) => {
        const v = k => gv(s, k);
        return `<tr><td class="l name">${playerLink(pid)}${s.dec ? ` <span class="tag">${esc(s.dec)}</span>` : ''}</td><td>${outsToIp(ipToOuts(s.ip))}</td><td>${v('h')}</td><td>${v('r')}</td><td>${v('er')}</td><td>${v('bb')}</td><td>${v('so')}</td></tr>`;
      }).join('')}</tbody>
    </table></div>`;

  return `${head}${line}<h2 class="sec-title">Batting</h2>${batHtml}${pitHtml}
    ${g.notes ? `<p class="muted small">${esc(g.notes)}</p>` : ''}`;
}

// ── ROSTER ───────────────────────────────────────────────────────────────────

function renderRoster() {
  if (!ROSTER.length) return `
    <h1 class="page-title">Roster</h1>
    <div class="empty">Roster coming soon.</div>`;

  const bat = Object.fromEntries(seasonBatting().map(r => [r.pid, r]));
  const players = [...ROSTER].sort((a, b) => (a.number ?? 999) - (b.number ?? 999) || a.name.localeCompare(b.name));
  return `
    <h1 class="page-title">Roster</h1>
    <div class="roster">${players.map(p => {
      const s = bat[p.id];
      const initials = p.name.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
      return `
        <a class="player" href="#player/${encodeURIComponent(p.id)}">
          <div class="player-num">${p.number != null ? '#' + esc(p.number) : ''}</div>
          <div class="avatar">${esc(initials)}</div>
          <div class="player-name">${esc(p.name)}</div>${p.nickname ? `<div class="player-nick">"${esc(p.nickname)}"</div>` : ''}
          <div class="player-pos">${(p.positions || []).map(x => `<span class="pos">${esc(x)}</span>`).join('')}</div>
          ${s && s.ab ? `<div class="player-line">${rate(s.avg)} · ${s.hr} HR · ${s.rbi} RBI</div>` : ''}
        </a>`;
    }).join('')}</div>`;
}

// ── PLAYER ───────────────────────────────────────────────────────────────────

function renderPlayer(pid) {
  const p = getPlayer(pid);
  const name = p ? p.name : pid;
  const logs = played().filter(g => BOX[g.id]?.batting?.[pid] || BOX[g.id]?.pitching?.[pid]);
  const b = seasonBatting().find(r => r.pid === pid);
  const pt = seasonPitching().find(r => r.pid === pid);

  const batLog = logs.filter(g => BOX[g.id]?.batting?.[pid]);
  const pitLog = logs.filter(g => BOX[g.id]?.pitching?.[pid]);

  const kpi = (v, l) => `<div class="kpi"><div class="kpi-val">${v}</div><div class="kpi-label">${l}</div></div>`;

  return `
    <a class="back" href="#roster">← Roster</a>
    <h1 class="page-title">${esc(name)} ${p?.nickname ? `<span class="muted">"${esc(p.nickname)}"</span> ` : ''}${p?.number != null ? `<span class="muted">#${esc(p.number)}</span>` : ''}</h1>
    ${p?.positions?.length ? `<div class="player-pos left">${p.positions.map(x => `<span class="pos">${esc(x)}</span>`).join('')}</div>` : ''}

    ${b ? `<div class="kpis">${kpi(rate(b.avg), 'AVG')}${kpi(rate(b.obp), 'OBP')}${kpi(rate(b.slg), 'SLG')}${kpi(b.h, 'H')}${kpi(b.hr, 'HR')}${kpi(b.rbi, 'RBI')}${kpi(b.r, 'R')}</div>` : ''}
    ${pt ? `<div class="kpis">${kpi(pt.ip, 'IP')}${kpi(dec2(pt.era), 'ERA')}${kpi(pt.so, 'SO')}${kpi(`${pt.w}-${pt.l}`, 'W-L')}</div>` : ''}

    ${batLog.length ? `
      <h2 class="sec-title">Batting Game Log</h2>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th class="l">Game</th><th>AB</th><th>R</th><th>H</th><th>2B</th><th>3B</th><th>HR</th><th>RBI</th><th>BB</th><th>SO</th></tr></thead>
        <tbody>${batLog.map(g => {
          const s = BOX[g.id].batting[pid], v = k => +(s[k] || 0);
          return `<tr><td class="l"><a href="#game/${g.id}">${fmtShort(g.date)}${gameLabel(g) ? ' G' + (g.num || 1) : ''} ${vsLabel(g)}</a></td><td>${v('ab')}</td><td>${v('r')}</td><td>${v('h')}</td><td>${v('2b')}</td><td>${v('3b')}</td><td>${v('hr')}</td><td>${v('rbi')}</td><td>${v('bb')}</td><td>${v('so')}</td></tr>`;
        }).join('')}</tbody>
      </table></div>` : ''}

    ${pitLog.length ? `
      <h2 class="sec-title">Pitching Game Log</h2>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th class="l">Game</th><th>DEC</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>SO</th></tr></thead>
        <tbody>${pitLog.map(g => {
          const s = BOX[g.id].pitching[pid], v = k => gv(s, k);
          return `<tr><td class="l"><a href="#game/${g.id}">${fmtShort(g.date)}${gameLabel(g) ? ' G' + (g.num || 1) : ''} ${vsLabel(g)}</a></td><td>${esc(s.dec || '')}</td><td>${outsToIp(ipToOuts(s.ip))}</td><td>${v('h')}</td><td>${v('r')}</td><td>${v('er')}</td><td>${v('bb')}</td><td>${v('so')}</td></tr>`;
        }).join('')}</tbody>
      </table></div>` : ''}

    ${!logs.length ? '<div class="empty">No stats yet.</div>' : ''}`;
}

// ── CALENDAR EXPORT (.ics) ───────────────────────────────────────────────────

function parseTime(t) {
  const m = String(t || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = +m[1]; const min = +m[2], ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return [h, min];
}

function downloadIcs(id) {
  const g = getGame(id);
  if (!g) return;
  const p = n => String(n).padStart(2, '0');
  const icsEsc = s => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const d = g.date.replace(/-/g, '');
  const t = parseTime(g.time);
  let when;
  if (t) {
    const start = new Date(+g.date.slice(0, 4), +g.date.slice(5, 7) - 1, +g.date.slice(8, 10), t[0], t[1]);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const f = x => `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
    when = [`DTSTART;TZID=America/New_York:${f(start)}`, `DTEND;TZID=America/New_York:${f(end)}`];
  } else {
    const next = asDate(g.date); next.setDate(next.getDate() + 1);
    when = [`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.getFullYear()}${p(next.getMonth() + 1)}${p(next.getDate())}`];
  }
  const fl = field(g);
  const label = gameLabel(g);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Orlando Rays//Liga Amistosa//EN',
    'BEGIN:VEVENT',
    `UID:${g.id}@orlando-rays`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    ...when,
    `SUMMARY:${icsEsc(`${TEAM.short} ${g.home === false ? '@' : 'vs'} ${g.opponent || 'TBD'}${label ? ' (' + label + ')' : ''}`)}`,
    `LOCATION:${icsEsc([fl.name, fl.address].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${icsEsc(`${LEAGUE.name}${g.notes ? ' — ' + g.notes : ''}`)}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `rays-${g.id}.ics` });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
