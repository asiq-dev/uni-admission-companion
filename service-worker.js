// Bump this name whenever app-shell files change. IndexedDB is not affected.
const CACHE = 'admission-companion-v16';
const FILES = [
  'js/past-papers.js', 'data/past-papers.json', 'PAST_PAPERS.md',
  './', 'index.html', 'QUESTION_BANK.md', 'ADMISSION_TARGETS.md', 'QUESTION_SOURCES.md', 'manifest.json', 'css/styles.css', 'css/study.css',
  'js/theme-init.js', 'js/app.js', 'js/practice.js', 'js/examinations.js', 'js/bank.js',
  'js/components/admission-controls.js', 'js/components/question-filters.js', 'js/components/icons.js', 'js/components/navigation.js', 'js/components/ui.js',
  'js/services/theme.js', 'js/services/db.js', 'js/services/questions.js', 'js/services/analytics.js', 'js/services/exams.js',
  'js/services/subjects.js', 'js/services/admissions.js', 'js/services/install.js', 'js/services/backup.js',
  'js/services/bank-notices.js', 'THIRD_PARTY_NOTICES.md',
  'js/services/subject-notices.js', 'js/services/question-export.js',
  'data/satt-humanities.json', 'data/satt-humanities-audit.json',
  'data/science-practice.json', 'data/science-practice-audit.json', 'data/mental-arithmetic.json', 'data/mental-arithmetic-audit.json',
  'data/sociology-practice.json', 'data/sociology-practice-audit.json', 'data/ict-practice.json', 'data/ict-practice-audit.json',
  'data/source-material/sciq-LICENSE.txt', 'data/source-material/gsm8k-LICENSE', 'SUBJECT_COVERAGE.md',
  'data/bluck-bangla.json', 'data/bluck-bangla-audit.json', 'data/bangladesh-affairs.json', 'data/bangladesh-affairs-audit.json',
  'data/international-history.json', 'data/international-history-audit.json', 'data/comparative-government.json', 'data/comparative-government-audit.json',
  'data/english-vocabulary.json', 'data/english-vocabulary-audit.json', 'data/general-knowledge.json', 'data/general-knowledge-audit.json',
  'data/source-material/wordnet-LICENSE.txt', 'data/source-material/countries-LICENSE',
  'assets/vendor/bootstrap.min.css', 'assets/fonts/Inter.ttf', 'assets/fonts/NotoSansBengali.ttf',
  'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'data/sample-questions.json', 'data/sourced-practice.json', 'data/sourced-practice-audit.json', 'data/licensed-reading.json', 'data/licensed-reading-audit.json', 'data/source-material/bangla-mcq-attribution.txt',
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      // Installation fails as a whole if any required file cannot be cached.
      await cache.addAll(FILES.map(file => new Request(new URL(file, self.registration.scope), {cache:'reload'})));
      // Updates wait until all app windows close. Never swap code during a test.
    } catch (error) { await caches.delete(CACHE); throw error; }
  })());
});
self.addEventListener('message', event => {
  // Report readiness only from the active, fully installed worker (no version duplication in the UI).
  if (event.data === 'OFFLINE_STATUS') event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const files = await Promise.all(FILES.map(file => cache.match(new URL(file, self.registration.scope))));
    event.ports[0]?.postMessage({ready:files.every(Boolean), version:CACHE});
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('admission-companion-') && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') return (await cache.match(new URL('index.html', self.registration.scope))) || fetch(event.request);
    return (await cache.match(event.request, {ignoreSearch:true})) || fetch(event.request);
  })());
});

