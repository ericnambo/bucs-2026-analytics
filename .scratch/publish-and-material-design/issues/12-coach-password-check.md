# 12: Coach password check and hash helper

**What to build:** A gate module, in the same browser-and-Node style as the other modules, whose public answer is: given a typed password and the list of accepted hashes, is access granted? It compares by SHA-256 and returns yes or no. Also add a command the owner runs locally that reads a typed password and prints its hash, without storing the password anywhere. This is the one new test seam in the spec.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Built test-first with the built-in Node test runner, one behavior at a time
- [x] A correct password is accepted; a wrong one and an empty one are rejected
- [x] Each of several fixture hashes is accepted independently; removing one hash rejects that password and still accepts the others; an empty or missing list rejects everything
- [x] Handling of surrounding whitespace and letter case is decided, tested and written in this ticket
- [x] The hash command prints a hash for a typed password and writes the password nowhere
- [x] Tests use made-up passwords only; no real password or password pattern appears in the repository
- [x] The full test suite passes

Source: spec "Implementation Decisions" (gate module, password list) and "Testing Decisions"; map ticket "Gate behavior and password handling".
