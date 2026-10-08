# 15: Load the real coach hashes

**What to build:** Replace the demo hashes with the 9 real coach hashes. This needs the owner: they run the hash command locally for each real password and keep the passwords only on paper and in their phone notes. The agent helps with the swap and with checking, and never asks for, sees, writes or commits a real password or the password pattern.

**Blocked by:** 12 (Coach password check and hash helper), 13 (Coach access on Matchup).

**Status:** ready-for-agent

- [ ] The list holds 9 unlabeled hashes; no coach names or hints are anywhere in the repository
- [ ] The demo hashes and any demo password are gone from the repository
- [ ] The owner has confirmed on a locked page that a real password unlocks and a wrong one does not
- [ ] A search of the working tree and git history for the real passwords and the pattern finds nothing
- [ ] Revoking one password is documented in a short note: remove its hash and republish

Source: spec user stories 15-18; map ticket "Gate behavior and password handling".
