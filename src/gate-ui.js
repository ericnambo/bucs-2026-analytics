// Browser wiring for Coach access. Shows the form until a correct password is entered,
// then reveals the page content and runs onUnlock once. Soft gate: it hides the page, not the data.
(function () {
  const STORAGE_KEY = 'bafl-coach-access';

  // Device storage can be missing or blocked; the gate must still work for this page view.
  function remembered() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }
  function remember(on) {
    try { on ? localStorage.setItem(STORAGE_KEY, '1') : localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function guard(onUnlock) {
    const $ = (id) => document.getElementById(id);
    const gate = $('coach-gate');
    const content = $('gated-content');
    const form = $('gate-form');
    const input = $('gate-password');
    const error = $('gate-error');
    let started = false;

    function unlock(moveFocus) {
      gate.hidden = true;
      content.hidden = false;
      if (!started) { started = true; onUnlock(); }
      if (moveFocus) $('main').focus();
    }

    function lock() {
      remember(false);
      content.hidden = true;
      gate.hidden = false;
      input.value = '';
      error.textContent = '';
      input.removeAttribute('aria-invalid');
      input.focus();
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (await BaflGate.isAccessGranted(input.value, window.BaflCoachHashes)) {
        error.textContent = '';
        input.removeAttribute('aria-invalid');
        input.value = '';
        remember(true);
        unlock(true);
      } else {
        error.textContent = 'That password was not accepted. Check it and try again.'; // field keeps what was typed
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
    });
    $('lock-button').addEventListener('click', lock);

    if (remembered()) unlock(false);
  }

  window.BaflGateUI = { guard };
})();
