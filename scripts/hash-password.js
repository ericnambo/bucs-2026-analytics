// Usage: npm run hash   (type a password at the prompt; it prints the hash, stores nothing)
// Same trimming rule as the gate. Typing is hidden; the password is never written anywhere.
const { sha256Hex } = require('../src/gate');

function readHidden(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(prompt);
    if (!stdin.isTTY) { // piped input
      let data = '';
      stdin.setEncoding('utf8');
      stdin.on('data', (c) => (data += c));
      stdin.on('end', () => resolve(data.split(/\r?\n/)[0]));
      return;
    }
    let value = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (ch) => {
      for (const c of ch) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', onData);
          process.stdout.write('\n');
          return resolve(value);
        }
        if (c === '\u0003') { process.stdout.write('\n'); process.exit(130); }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on('data', onData);
  });
}

(async () => {
  const typed = (await readHidden('Password: ')).trim();
  if (!typed) { console.error('Empty password; nothing to hash.'); process.exitCode = 1; return; }
  console.log(await sha256Hex(typed));
})();
