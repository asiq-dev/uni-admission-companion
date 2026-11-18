import { icon } from '../components/icons.js';
export function currentTheme() { return document.documentElement.dataset.bsTheme === 'dark' ? 'dark' : 'light'; }
export function refreshThemeControls() {
  const dark = currentTheme() === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.innerHTML = icon(dark ? 'sun' : 'moon');
    button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  });
  document.querySelectorAll('[data-set-theme]').forEach(button => {
    const selected = button.dataset.setTheme === currentTheme();
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('meta[name="theme-color"]').content = dark ? '#142522' : '#126658';
}
export function setTheme(theme) {
  document.documentElement.dataset.bsTheme = theme === 'dark' ? 'dark' : 'light';
  let saved = true;
  try { localStorage.setItem('ac:theme', currentTheme()); } catch { saved = false; }
  refreshThemeControls();
  return saved;
}
