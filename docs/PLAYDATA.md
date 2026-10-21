# Player data

Anonymous run summaries, so the escapes can be tuned from how people really play.

**What a summary holds:** which escape (and challenge), its revision, how the run ended (won, caught,
failed, quit), how long it took, treasure and alarms, stars, where Sally was caught and by what (tail
drops included, up to twelve), which tools she used, where she was when she quit, and whether it was
played by touch or keyboard. No names, accounts, player ids or addresses. Builder playtests,
community levels and workshop drafts are not recorded.

**How it travels:** `public/escape-playdata.js` keeps summaries in the browser and sends them five at a
time to `POST /api/playdata` (a beacon carries the rest when the page closes). `server/playdata.cjs`
checks every field, keeps only known escapes, stamps the server's date and appends one line per run
to `DATA_DIR/playdata/YYYY-MM-DD.jsonl`. A run is about 150 bytes; storage stops at 200 MB, and one
visitor can send at most 20 batches a minute.

**Reading it:** Admin → Player data shows a row per escape: plays, win rate, median winning time,
caught, quit, failed, what catches Sally most and the tiles where it happens most. **Export all runs**
downloads everything as one `.ndjson` file; `node scripts/playdata-report.cjs export.ndjson --maps`
prints the same per escape with catch heatmaps drawn on each map.

Nothing is shared until someone says yes: on the first start the title screen asks once ("Help make Sally’s Escape better?"), and until it is answered no summary is kept or sent. **Options → Play → Share play data** changes the answer for everyone on that device; turning it off throws away any summaries not yet sent. Closing the question without answering asks again next time.
