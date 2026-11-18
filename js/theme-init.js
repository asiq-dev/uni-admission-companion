// Run before paint to avoid flashing the wrong theme. Storage may be unavailable.
try {
  document.documentElement.dataset.bsTheme = localStorage.getItem('ac:theme') === 'dark' ? 'dark' : 'light';
} catch { document.documentElement.dataset.bsTheme = 'light'; }
