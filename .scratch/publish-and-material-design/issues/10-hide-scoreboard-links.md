# 10: Hide the scoreboard links on Results

**What to build:** The Results page shows every game's scores with no "Week N scoreboard" links, so nothing a visitor taps leads to a missing image. Decide, and record in this ticket, whether the export keeps each game's scoreboard filename while the links are hidden. Whether the column stays at all is a later question and is not part of this ticket.

**Blocked by:** None (can start immediately).

**Status:** done

**Decision:** The export keeps each game's scoreboard filename (the "Source" column in CSV/print). Only the on-screen links and the Source column on Results are removed. The filename is still useful for auditing, and keeping it leaves the export untouched.

- [ ] Results shows scores, notes and filters as before, with no scoreboard links and no empty or misaligned column
- [ ] The decision about the export's scoreboard filename is written in this ticket
- [ ] The existing test suite and the data check still pass
- [ ] Screen reader and keyboard order on Results are unchanged apart from the removed links

Source: spec "Implementation Decisions" (scoreboard links hidden); map ticket "Scoreboard links on the public site".
