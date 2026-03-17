#!/bin/sh
sqlite3 notes-sqlite.db -json "
SELECT
  n.ID as id,
  n.PARENT_ID as parent,
  strftime('%Y-%m-%dT%H:%M:%S', n.UPDATED / 1000, 'unixepoch') || '.000000Z' as updated,
  strftime('%Y-%m-%dT%H:%M:%S', n.CREATED / 1000, 'unixepoch') || '.000000Z' as created,
  n.TITLE as title,
  t.TEXT_FULL as notes
FROM NOTE n
LEFT JOIN NOTE_TEXT t ON n.ID = t.NOTE_ID
ORDER BY n.PARENT_ID, n.UPDATED DESC, n.CREATED DESC;
" | jq '{items: [{title: "Memability", items: .}]}' > Memability.json
