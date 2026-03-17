#!/bin/sh
sqlite3 notes-sqlite.db -json "
SELECT
  json(N.ID) as id,
  json(N.PARENT_ID) as parent,
  strftime('%Y-%m-%dT%H:%M:%S', N.CREATED / 1000, 'unixepoch') || '.000000Z' as created,
  strftime('%Y-%m-%dT%H:%M:%S', N.UPDATED / 1000, 'unixepoch') || '.000000Z' as updated,
  CASE WHEN N.REMOVED = 0 THEN NULL ELSE strftime('%Y-%m-%dT%H:%M:%S', N.REMOVED / 1000, 'unixepoch') || '.000000Z' END as removed,
  N.TITLE as title,
  T.TEXT_FULL as notes
FROM NOTE N
LEFT JOIN NOTE_TEXT T ON N.ID = T.NOTE_ID
ORDER BY N.PARENT_ID, N.REMOVED, N.UPDATED DESC, N.CREATED DESC, N.ID;
" | jq '{items: [{title: "Memability", items: .}]}' > Memability.json
