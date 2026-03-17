# Memability/Memz.co Export Viewer

This small webapp lets you view your [Memability/Memz.co](https://www.memz.co) notes in all their hierarchical glory.

To use this, you first need a copy of your notes database in a Google Tasks JSON format.
* The easiest way to get this is from [Google Tasks](https://tasks.google.com/tasks) directly, but Memz.co got very buggy in its final days, and what you have in Google may be very incomplete. Nevertheless, this route *does* work — just make sure you place the downloaded file into the root directory of this project and name the file `Memability.json`.
* The best way to get a copy of your database in the correct format is to copy your app's database to somewhere you can read it. To do this, you must either use ADB or get root/Shizuku. Here is the relevant command once you have shell access: `cp -r /data/data/au.com.ds.ma /sdcard/memability_dump`. Once you have your dump, copy/paste `memability_dump/databases/notes-sqlite.db` into the root directory of this project, and execute `dump-db.sh`.

Once you have a `Memability.json`, simply run `server.sh` and navigate to `http://localhost:8000` in your web-browser. Your notes should display in all their glory!

## License

Copyright © 2026 Miles Bradley Huff. Publicly licensed per the terms of the GNU Affero General Public License v3.0 or later, whose full text may be found at `./License.txt`.
