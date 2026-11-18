import { admissionConfig } from './services/admissions.js';
import { renderNavigation } from './components/navigation.js';
import { icon } from './components/icons.js';
import { heading, emptyState, escapeHTML as e } from './components/ui.js';
import { currentTheme, setTheme, refreshThemeControls } from './services/theme.js';
import { openDB, all, setting, saveSetting } from './services/db.js';
import { summarize } from './services/analytics.js';
import { mountBank } from './bank.js';
import { mountPastPapers } from './past-papers.js';
import { mountPractice } from './practice.js';
import { mountExams, reviewHTML } from './examinations.js';
import { refreshInstall } from './services/install.js';
import { createBackup, validateBackup, restoreBackup, downloadBackup } from './services/backup.js';

const routes = {dashboard:'Dashboard', practice:'Practice', examinations:'Examinations', progress:'Progress', profile:'Profile', settings:'Settings', bank:'Question bank', mistakes:'Mistake book', bookmarks:'Bookmarks'};
routes['past-papers'] = 'Humanities past papers';
const main = document.querySelector('#main');
let cleanup = () => {};
let renderVersion = 0;
let toastTimeout;
function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => element.classList.remove('visible'), 4000);
}
function report(error) { toast(error.message || 'Could not save local data. Please try again.'); }
function stat(label, value, glyph) { return `<article class="panel stat-card"><div class="stat-top"><span>${label}</span>${icon(glyph)}</div><strong>${value}</strong></article>`; }
function subjectCards(stats) {
  return stats.subjects.map(subject => `<article class="panel subject-card"><div class="subject-top"><h3>${e(subject.subject)}</h3><span class="subject-percent">${subject.accuracy === null ? '—' : subject.accuracy + '%'}</span></div><p>${subject.total} attempts · ${subject.correct} correct</p><div class="progress" role="progressbar" aria-label="${e(subject.subject)} question coverage" aria-valuenow="${subject.coverage}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar green" style="width:${subject.coverage}%"></div></div><div class="subject-bottom"><span>${subject.attempted} / ${subject.available} bank questions tried</span><a href="#/practice?subject=${encodeURIComponent(subject.subject)}" aria-label="Practice ${e(subject.subject)}">${icon('arrow')}</a></div></article>`).join('');
}
function recentActivity(history) {
  return history.length ? [...history].sort((a,b) => b.createdAt - a.createdAt).slice(0,6).map(answer => `<div class="activity-row"><span class="stat-icon ${answer.correct ? 'green' : 'orange'}">${icon(answer.correct ? 'check' : 'book')}</span><div class="activity-copy"><h3>${e(answer.subject)} · ${answer.source === 'exam' ? 'Model test' : 'Practice'}${answer.isSample ? ' · Testing sample' : ''}</h3><p>${e(answer.questionText.slice(0,90))}</p></div><div class="activity-result"><strong>${answer.correct ? 'Correct' : 'Revisit'}</strong><span>${e(new Date(answer.createdAt).toLocaleDateString('en-GB'))}</span></div></div>`).join('') : emptyState('Your story starts here', 'Import your questions, then answer your first MCQ. Every saved answer will count.', 'book', '<a class="btn btn-outline-primary" href="#/bank">Import questions</a>');
}
function renderDashboard(data, stats, profile, target) {
  const remaining = Math.max(0,target - stats.today);
  main.innerHTML = heading('ONE QUESTION AT A TIME', `Welcome${profile.name ? ', ' + e(profile.name) : ' to your study space'}.`, 'A little practice today. A little more confidence tomorrow.') +
    `<section class="study-welcome panel"><div><p class="eyebrow">YOUR NEXT STEP</p><h2>${data.questions.length ? 'Make room for a little learning.' : 'Bring your questions. Begin your journey.'}</h2><p class="muted">${data.questions.length ? `${data.questions.length} questions ready on this device. Choose a subject and start.` : 'Your progress starts at zero. Import your bank or try the clearly labeled testing questions.'}</p><div class="button-row"><a class="btn btn-primary" href="#/${data.questions.length ? 'practice' : 'bank'}">${data.questions.length ? 'Quick practice →' : 'Import questions →'}</a><a class="text-link" href="#/mistakes">Mistake book (${data.progress.filter(item => item.needsReview).length})</a></div></div><div class="daily-goal"><strong>${stats.today}<small> / ${target}</small></strong><span>today’s question target</span><p>${remaining ? `${remaining} to go. You can do this.` : 'Daily target reached. Well done!'}</p><a class="text-link" href="#/settings">Edit target</a></div></section><section class="stats-grid" aria-label="Your real study progress">${stat('Questions practiced',stats.total,'book')}${stat('Overall accuracy',stats.accuracy === null ? '—' : stats.accuracy + '%','target')}${stat('Completed model tests',stats.exams,'exam')}${stat('Questions in bank',data.questions.length,'cap')}</section><section class="subject-section"><div class="section-heading"><div><h2>Your subjects</h2><p>Accuracy from your saved answers; bars show question coverage.</p></div><a href="#/progress" class="text-link">See progress →</a></div><div class="subject-grid">${subjectCards(stats)}</div></section><section class="panel"><div class="panel-heading"><h2>Recent activity</h2><a class="text-link" href="#/bank">Manage questions</a></div>${recentActivity(data.history)}</section>`;
}
function renderProgress(data, stats) {
  const weak = stats.subjects.filter(subject => subject.total > 0 && subject.accuracy < 60).sort((a,b) => a.accuracy - b.accuracy);
  main.innerHTML = heading('SMALL STEPS ADD UP', 'Your progress, honestly.', 'Every number comes from answers saved on this device.') +
    `<section class="stats-grid">${stat('Total attempted',stats.total,'book')}${stat('Correct answers',stats.correct,'check')}${stat('Accuracy',stats.accuracy === null ? '—' : stats.accuracy + '%','target')}${stat('Completed tests',stats.exams,'exam')}</section><section class="panel p-4 mb-4"><h2>Where to focus next</h2><p class="muted mt-2">Subjects below 60% accuracy on your current attempts. Small samples are only an early signal.</p>${weak.length ? `<div class="button-row">${weak.map(subject => `<a href="#/practice?subject=${encodeURIComponent(subject.subject)}" class="btn btn-outline-primary">${e(subject.subject)} · ${subject.accuracy}% (${subject.total} attempts)</a>`).join('')}</div>` : '<p class="muted mb-0">No weak subjects identified yet. Keep practicing to build a clearer picture.</p>'}</section><section class="subject-section"><div class="section-heading"><h2>Subject-wise performance</h2></div><div class="subject-grid">${subjectCards(stats)}</div></section><section class="panel p-4"><h2>Model test history</h2><div id="exam-history" class="mt-3">${data.exams.length ? [...data.exams].sort((a,b) => b.finishedAt - a.finishedAt).map(exam => `<button class="history-test" data-result="${e(exam.id)}"><span>${e(new Date(exam.finishedAt).toLocaleString('en-GB'))}<small>${exam.correct} correct · ${exam.incorrect} incorrect · ${exam.unanswered} unanswered</small></span><strong>${exam.score} / ${exam.maxMarks ?? exam.total} →</strong></button>`).join('') : emptyState('Your first model test is ahead', 'Complete a test to see its score and detailed review here.', 'exam', '<a class="btn btn-outline-primary" href="#/examinations">Set up a model test</a>')}</div></section><div id="saved-review" class="mt-4"></div>`;
  main.querySelectorAll('[data-result]').forEach(button => button.addEventListener('click', () => {
    const view = main.querySelector('#saved-review');
    view.innerHTML = reviewHTML(data.exams.find(exam => exam.id === button.dataset.result));
    view.scrollIntoView({behavior:'instant',block:'start'});
  }));
}
function renderProfile(profile) {
  main.innerHTML = heading('YOUR JOURNEY, YOUR SPACE', 'Make it personal.', 'Just for you. No account or sign-in needed.') + `<section class="panel p-4"><form id="profile-form"><label for="student-name" class="form-label">Your name</label><input id="student-name" class="form-control mb-4" maxlength="60" autocomplete="given-name" placeholder="What should we call you?" value="${e(profile.name || '')}"><label for="university" class="form-label">Dream university (optional)</label><input id="university" class="form-control mb-4" maxlength="120" value="${e(profile.university || '')}" placeholder="Your next chapter"><p class="muted">SSC & HSC background: Humanities · মানবিক</p><button type="submit" class="btn btn-primary">Save profile</button><p class="form-text" id="profile-status" role="status"></p></form></section><div class="button-row mt-4"><a class="btn btn-outline-primary" href="#/bank">Question bank</a><a class="btn btn-outline-primary" href="#/mistakes">Mistake book</a><a class="btn btn-outline-primary" href="#/bookmarks">Bookmarks</a><a class="btn btn-outline-primary" href="#/settings">Settings</a></div>`;
  main.querySelector('#profile-form').addEventListener('submit', async event => {
    event.preventDefault();
    const value = {name:main.querySelector('#student-name').value.trim(), university:main.querySelector('#university').value.trim()};
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    try { await saveSetting('profile', value); document.querySelector('.topbar .avatar').textContent = Array.from(value.name || 'S')[0]; main.querySelector('#profile-status').textContent = 'Profile saved on this device.'; }
    catch (error) { report(error); }
    finally { button.disabled = false; }
  });
}
function renderSettings(target) {
  main.innerHTML = heading('STUDY YOUR WAY', 'Make yourself at home.', 'A few simple preferences for your study space.') + `<section class="panel settings-panel"><div class="setting-row"><div><h3>Appearance</h3><p>A comfortable theme for your next study session.</p></div><div class="theme-choice" role="group" aria-label="Color theme"><button class="btn" data-set-theme="light">Light</button><button class="btn" data-set-theme="dark">Dark</button></div></div><form class="setting-row" id="target-form"><div><label class="form-label" for="daily-target">Daily question target</label><p>Counts all answers from practice and submitted tests, using Bangladesh time.</p></div><div class="target-controls"><input class="form-control" id="daily-target" type="number" min="1" max="500" required value="${target}"><button class="btn btn-primary">Save target</button></div></form><div class="setting-row"><div><h3>Local storage</h3><p>Questions, answers, bookmarks, tests, progress, and preferences live in IndexedDB. Clearing browser data removes them. Download full backups regularly.</p></div><a class="text-link" href="#/bank">Manage question bank →</a></div><div class="setting-row"><div><h3>Keep data on this device</h3><p>Request persistent storage to reduce automatic eviction. Your browser decides whether to allow it; this does not protect against clearing data.</p></div><button class="btn btn-outline-primary" id="persist-data">Request persistence</button></div><p class="p-4 muted mb-0" id="storage-state" role="status"></p></section>`;
  main.innerHTML += `<section class="panel p-4 mt-4"><h2>Install on your phone</h2><p class="muted mt-2" id="install-status" role="status"></p><button class="btn btn-outline-primary" id="install-app">Install App</button></section><section class="panel p-4 mt-4"><h2>Backup and restore</h2><p class="muted mt-2">Download a full backup of questions, progress, bookmarks, tests, and settings. Keep a copy outside this browser, such as in your phone's Files. Question-bank exports contain questions only.</p><button class="btn btn-outline-primary" id="backup-all">Download full backup</button><hr><label class="form-label" for="backup-file">Restore a full backup (.json, up to 50 MB)</label><input class="form-control" type="file" id="backup-file" accept=".json,application/json"><p class="muted mt-2">Restore replaces all current study data with the backup. Download your current backup first. Close other app tabs/windows before restoring. A restored active test keeps its original deadline.</p><button class="btn btn-outline-primary" id="restore-all">Validate backup</button><div id="restore-confirm" class="mt-3"></div><p class="form-text" id="backup-status" role="status"></p></section>`;
  refreshInstall();
  const backupStatus = main.querySelector('#backup-status');
  const confirmation = main.querySelector('#restore-confirm');
  main.querySelector('#backup-all').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try { downloadBackup(await createBackup()); backupStatus.textContent = 'Backup download requested. Check your Downloads/Files and keep it somewhere safe.'; }
    catch (error) { backupStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
  main.querySelector('#backup-file').addEventListener('change', () => { confirmation.replaceChildren(); backupStatus.textContent = ''; });
  main.querySelector('#restore-all').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    confirmation.replaceChildren();
    try {
      const file = main.querySelector('#backup-file').files[0];
      if (!file || file.size > 50 * 1024 * 1024) throw new Error('Choose a full backup JSON file up to 50 MB.');
      const backup = await validateBackup(JSON.parse(await file.text()));
      backupStatus.textContent = `Valid backup: ${backup.stores.questions.length} questions, ${backup.stores.history.length} answers, ${backup.stores.exams.length} completed tests. Nothing has changed yet.`;
      confirmation.innerHTML = '<p>Replace all current study data with this backup? This cannot be undone without your current backup.</p><button class="btn btn-primary" id="confirm-restore">Replace data and restore</button> <button class="btn btn-outline-primary" id="cancel-restore">Cancel</button>';
      confirmation.querySelector('#cancel-restore').onclick = () => { confirmation.replaceChildren(); backupStatus.textContent = 'Restore cancelled. Current data is unchanged.'; };
      confirmation.querySelector('#confirm-restore').onclick = async event => {
        event.currentTarget.disabled = true;
        try { await restoreBackup(backup); setTheme(await setting('theme','light')); await navigate(); toast('Full backup restored on this device.'); }
        catch (error) { backupStatus.textContent = error.message; confirmation.replaceChildren(); }
      };
    } catch (error) { backupStatus.textContent = `Restore rejected: ${error.message} Current data is unchanged.`; }
    finally { button.disabled = false; }
  });
  main.querySelector('#target-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    try { await saveSetting('target', Number(main.querySelector('#daily-target').value)); toast('Daily target saved.'); } catch (error) { report(error); }
  });
  main.querySelector('#persist-data').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const allowed = await navigator.storage?.persist?.();
      main.querySelector('#storage-state').textContent = allowed ? 'Persistent storage is enabled.' : 'The browser did not grant persistence. Data is still saved; download a full backup regularly.';
    } catch (error) { report(error); } finally { button.disabled = false; }
  });
}
async function navigate() {
  const version = ++renderVersion;
  cleanup();
  cleanup = () => {};
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const route = path || 'dashboard';
  if (!Object.hasOwn(routes, route)) { location.replace('#/dashboard'); return; }
  renderNavigation(['bank','mistakes','bookmarks'].includes(route) ? 'practice' : route);
  document.querySelector('#current-page').textContent = routes[route];
  document.title = `${routes[route]} · Admission Companion`;
  main.setAttribute('aria-busy','true');
  try {
    const [questions, history, bookmarks, exams, progress, profile, target, admissions] = await Promise.all([
      all('questions'), all('history'), all('bookmarks'), all('exams'), all('progress'), setting('profile',{}), setting('target',50), admissionConfig(),
    ]);
    if (version !== renderVersion) return;
    const data = {questions,history,bookmarks,exams,progress};
    const stats = summarize(history,questions,exams);
    document.querySelector('.topbar .avatar').textContent = Array.from(profile.name || 'S')[0];
    if (route === 'dashboard') renderDashboard(data,stats,profile,target);
    if (route === 'progress') renderProgress(data,stats);
    if (route === 'profile') renderProfile(profile);
    if (route === 'settings') renderSettings(target);
    if (route === 'past-papers') {
      main.innerHTML = heading('JU · GST · NU HUMANITIES', 'Past papers by university and year.', 'Saved questions, source claims, and honest coverage.') + '<div id="papers-view"></div>';
      const stop = await mountPastPapers(main.querySelector('#papers-view'),data,admissions,() => version === renderVersion);
      if (version === renderVersion) cleanup = stop; else stop();
    }
    if (route === 'bank') { main.innerHTML = heading('YOUR STUDY MATERIAL', 'A question bank of your own.', 'Your questions stay on this device, ready for offline study.') + '<div class="button-row mb-4"><a class="btn btn-outline-primary" href="#/past-papers">JU / GST / NU Humanities — past papers by year</a></div><div id="bank-view"></div>'; mountBank(main.querySelector('#bank-view'),questions,admissions); }
    if (['practice','mistakes','bookmarks'].includes(route)) {
      const mode = route === 'mistakes' ? 'mistakes' : route === 'bookmarks' ? 'bookmarks' : 'all';
      const titles = {practice:'Find your focus.', mistakes:'Turn mistakes into understanding.', bookmarks:'Keep the good questions close.'};
      main.innerHTML = heading('A LITTLE PRACTICE, EVERY DAY',titles[route],mode === 'mistakes' ? 'Your most recently wrong answers. A correct retry clears a question from this book.' : 'One question at a time. Feedback, explanation, and a little more confidence.') + `<div class="study-tabs"><a href="#/practice" ${route === 'practice' ? 'aria-current="page"' : ''}>All practice</a><a href="#/mistakes" ${route === 'mistakes' ? 'aria-current="page"' : ''}>Mistake book (${progress.filter(item => item.needsReview).length})</a><a href="#/bookmarks" ${route === 'bookmarks' ? 'aria-current="page"' : ''}>Bookmarks (${bookmarks.length})</a><a href="#/bank">Question bank</a><a href="#/past-papers">Past papers by year</a></div><div id="practice-view"></div>`;
      mountPractice(main.querySelector('#practice-view'),data,mode,new URLSearchParams(query).get('subject') || '',admissions);
    }
    if (route === 'examinations') {
      main.innerHTML = heading('PUT YOUR PREPARATION TO THE TEST', 'A little closer to exam day.', 'Timed model tests with saved answers, marking, and a full review.') + '<div class="button-row mb-4"><a class="btn btn-outline-primary" href="#/past-papers">JU / GST / NU Humanities — past papers by year</a></div><div id="exam-view"></div>';
      const stop = await mountExams(main.querySelector('#exam-view'),questions,() => version === renderVersion,admissions);
      if (version === renderVersion) cleanup = stop; else stop();
    }
    refreshThemeControls();
  } catch (error) {
    if (version !== renderVersion) return;
    main.innerHTML = emptyState('Your study space could not open', `Local database access is required. ${e(error.message)} Check browser storage permissions, then retry.`, 'info', '<button class="btn btn-primary" id="retry">Try again</button>');
    main.querySelector('#retry').addEventListener('click',navigate);
  } finally {
    if (version === renderVersion) { main.removeAttribute('aria-busy'); window.scrollTo(0,0); main.focus({preventScroll:true}); }
  }
}
document.addEventListener('click', async event => {
  const selection = event.target.closest('[data-set-theme]');
  if (selection || event.target.closest('[data-theme-toggle]')) {
    const theme = selection ? selection.dataset.setTheme : currentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { await saveSetting('theme',theme); toast(`${theme === 'dark' ? 'Dark' : 'Light'} theme saved.`); } catch (error) { report(error); }
  }
  const link = event.target.closest('a[href^="#/"]');
  if (link && link.getAttribute('href') === location.hash && !event.defaultPrevented) { event.preventDefault(); navigate(); }
});
window.addEventListener('hashchange',navigate);
async function initialize() {
  try { await openDB(); setTheme(await setting('theme',currentTheme())); await navigate(); }
  catch (error) { main.innerHTML = emptyState('Local storage is unavailable', 'Enable IndexedDB for this site and reload. ' + e(error.message), 'info'); }
  setupOffline();
}
async function setupOffline() {
  const status = document.querySelector('#offline-status');
  let updateReady = false;
  const setStatus = message => {
    const visible = updateReady ? 'Update ready · close all app windows and reopen' : message;
    status.textContent = visible; document.querySelector('#mobile-offline-status').textContent = visible;
  };
  if (!('serviceWorker' in navigator) || !window.isSecureContext) { setStatus('Use HTTPS or localhost for offline setup'); return; }
  const update = async registration => {
    const worker = registration.active;
    if (!worker) { setStatus('Preparing offline files…'); return; }
    const channel = new MessageChannel();
    const timeout = setTimeout(() => { channel.port1.close(); setStatus('Reopen online to check offline readiness'); }, 5000);
    channel.port1.onmessage = event => {
      clearTimeout(timeout);
      channel.port1.close();
      status.title = event.data.version || '';
      setStatus(event.data.ready ? (navigator.onLine ? 'Ready for offline study' : 'Offline · ready to study') : 'Offline files missing · reopen online to repair');
    };
    worker.postMessage('OFFLINE_STATUS', [channel.port2]);
  };
  try {
    const registration = await navigator.serviceWorker.register('service-worker.js', {updateViaCache:'none'});
    const showUpdate = () => { updateReady = true; setStatus(''); toast('Update downloaded. Close all app windows and reopen to apply it.'); };
    const watchInstall = worker => { if (worker) worker.addEventListener('statechange', () => { if (worker.state === 'redundant' && !registration.active) setStatus('Offline setup failed · reopen online to retry'); if (worker.state === 'installed' && registration.active) showUpdate(); }); };
    if (registration.waiting) showUpdate();
    watchInstall(registration.installing);
    registration.addEventListener('updatefound', () => watchInstall(registration.installing));
    await navigator.serviceWorker.ready;
    await update(registration);
    navigator.serviceWorker.addEventListener('controllerchange',() => { updateReady = Boolean(registration.waiting); update(registration); });
    window.addEventListener('online',() => update(registration));
    window.addEventListener('offline',() => update(registration));
  } catch { setStatus('Offline setup failed · reopen online to retry'); }
}
initialize();
