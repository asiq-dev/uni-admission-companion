// Prompts are only opened by a deliberate tap in Settings, never on page load.
let deferredPrompt;
let installed = false;
const standalone = window.matchMedia('(display-mode: standalone)');
const isInstalled = () => installed || standalone.matches || navigator.standalone === true;
export function refreshInstall() {
  const button = document.querySelector('#install-app');
  const status = document.querySelector('#install-status');
  if (!button || !status) return;
  button.hidden = isInstalled();
  button.textContent = deferredPrompt ? 'Install App' : 'Installation instructions';
  status.textContent = isInstalled() ? 'App installed. Open it from your home screen for offline study.' :
    !window.isSecureContext ? 'Open the HTTPS address in Chrome to install and enable offline study.' :
    deferredPrompt ? 'Install Admission Companion on your home screen. Wait for offline readiness before going offline.' :
    'In Android Chrome, open the ⋮ menu → Add to Home screen → Install. If already installed, open its home-screen icon. In other browsers, look for Install or Add to Home screen, or open this address in Chrome.';
}
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  refreshInstall();
});
window.addEventListener('appinstalled', () => { installed = true; deferredPrompt = null; refreshInstall(); });
standalone.addEventListener('change', refreshInstall);
document.addEventListener('click', async event => {
  if (!event.target.closest('#install-app')) return;
  if (!deferredPrompt) { refreshInstall(); return; }
  const prompt = deferredPrompt;
  deferredPrompt = null; // Each browser event may only be used once, including dismissal.
  const button = event.target.closest('#install-app');
  button.disabled = true;
  try { await prompt.prompt(); await prompt.userChoice; }
  catch { /* Instructions remain available if the browser rejects the prompt. */ }
  finally { button.disabled = false; refreshInstall(); }
});
