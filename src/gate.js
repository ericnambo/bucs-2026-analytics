// Coach access gate: is a typed password one of the accepted hashes? (soft gate, hides pages not data)
// Rules: surrounding whitespace is ignored (paste/autofill add it); letter case matters.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BaflGate = factory();
})(this, function () {
  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function isAccessGranted(typed, acceptedHashes) {
    const password = typeof typed === 'string' ? typed.trim() : '';
    if (!password || !Array.isArray(acceptedHashes) || acceptedHashes.length === 0) return false;
    const hash = await sha256Hex(password);
    return acceptedHashes.some((h) => typeof h === 'string' && h.trim().toLowerCase() === hash);
  }

  return { isAccessGranted, sha256Hex };
});
