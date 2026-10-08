# Scoreboard links on the public site

Type: grilling
Status: resolved
Blocked by: none

## Question

Results links to scoreboard images that are git-ignored and would 404 on GitHub Pages. Options: hide the link column on the public site, publish the images (are they OK to share publicly? do they show anything beyond scores?), or link elsewhere. Decide with Eric.

## Answer

**Hide the "Week N scoreboard" links on the public site.** Eric also questions whether the column is worth its space in the table at all, even in the finished app; that is a separate later exploration.

Facts: the images are team names and scores across all divisions (no player names or photos), and the league posts them publicly on its Facebook page, so publishing copies would likely be fine, and a link to the league's Facebook post is a possible later alternative. Neither is needed for the first launch.

For the spec: the export (`src/export.js`) also writes each game's `source` filename; decide in the spec whether the export drops it while the links are hidden.
