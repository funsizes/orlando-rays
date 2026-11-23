# Orlando Rays ⚾

Team site for the Orlando Rays in **Liga Amistosa**: schedule and results, standings, box scores, season stats and player pages.

Plain HTML/JS with no build step. Open `index.html` through any static server, or push to `main` and GitHub Pages deploys it.

## Weekly update (all in `data.js`)

1. **GAMES**: set `opponent`, `home`, `time`, and `score: { us, them }` for each game played. Add next week's games.
2. **ROSTER**: add any new players (`id` is a short name with no spaces).
3. **BOX**: add a block per game id with each player's batting line (and pitching if tracked).
4. **OTHER_RESULTS**: other teams' scores, if you want accurate standings.
5. **LEAGUE.teams**: add the other teams' names as you learn them.

Season totals, AVG/OBP/SLG/OPS, ERA/WHIP, leaders, standings and game logs are all calculated automatically.
