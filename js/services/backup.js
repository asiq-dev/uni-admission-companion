import { validateAdmissionConfig, validateMarking } from './admissions.js';
import { transact } from './db.js';
import { validateQuestions, SUBJECTS } from './questions.js';
import { scoreExam } from './exams.js';
import { BANK_NOTICES } from './bank-notices.js';
import { SUBJECT_NOTICES } from './subject-notices.js';
const STORES = ['questions', 'history', 'bookmarks', 'exams', 'progress', 'settings'];
const digest = async data => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)))), byte => byte.toString(16).padStart(2, '0')).join('');
const check = condition => { if (!condition) throw new Error('Invalid or damaged backup. Nothing was restored.'); };
const text = value => typeof value === 'string';
const number = value => typeof value === 'number' && Number.isFinite(value);
const count = value => Number.isInteger(value) && value >= 0;
const choice = value => Number.isInteger(value) && value >= 0 && value <= 3;

export async function createBackup() {
  const stores = {};
  // All stores are read in one transaction for a consistent snapshot.
  await transact(STORES, 'readonly', tx => {
    for (const name of STORES) {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => { stores[name] = request.result; };
    }
  });
  return { app:'admission-companion', version:1, createdAt:new Date().toISOString(), stores, checksum:await digest(stores), notices:{...BANK_NOTICES,...SUBJECT_NOTICES} };
}
export async function validateBackup(backup) {
  check(backup?.app === 'admission-companion' && backup.version === 1 && backup.stores);
  const stores = backup.stores;
  check(Object.keys(stores).length === STORES.length);
  for (const name of STORES) {
    check(Array.isArray(stores[name]));
    check(stores[name].every(row => row && text(row.id) && row.id.length > 0));
    check(new Set(stores[name].map(row => row.id)).size === stores[name].length);
  }
  check(await digest(stores) === backup.checksum);
  const questionsValid = async questions => {
    check(Array.isArray(questions));
    for (let index = 0; index < questions.length; index += 5000) {
      const chunk = questions.slice(index, index + 5000);
      const validated = await validateQuestions(chunk);
      check(validated.every((question, i) => question.id === chunk[i].id));
    }
  };
  await questionsValid(stores.questions);
  const ids = new Set(stores.questions.map(row => row.id));
  for (const row of stores.history) check(ids.has(row.questionId) && SUBJECTS.includes(row.subject) && text(row.questionText) && choice(row.selected) && typeof row.correct === 'boolean' && ['exam','practice'].includes(row.source) && number(row.createdAt));
  for (const row of stores.bookmarks) check(ids.has(row.id));
  for (const row of stores.progress) check(ids.has(row.id) && SUBJECTS.includes(row.subject) && count(row.attempts) && count(row.correct) && count(row.mistakes) && row.correct + row.mistakes === row.attempts && typeof row.needsReview === 'boolean' && number(row.lastAttempt));
  const examValid = async (exam, active) => {
    check(exam && text(exam.id) && Array.isArray(exam.questions) && exam.questions.length > 0);
    await questionsValid(exam.questions);
    check(Array.isArray(exam.answers) && exam.answers.length === exam.questions.length && exam.answers.every(answer => answer === null || choice(answer)));
    validateMarking(exam);
    check(number(exam.negative) && number(exam.startedAt) && number(exam.durationMinutes) && exam.durationMinutes >= 1 && exam.durationMinutes <= 180);
    if (active) check(count(exam.index) && exam.index < exam.questions.length && number(exam.deadline));
    else {
      const scored = scoreExam(exam);
      check(number(exam.finishedAt) && ['correct','incorrect','unanswered','score','total',...(exam.maxMarks == null ? [] : ['maxMarks'])].every(key => scored[key] === exam[key]));
    }
  };
  for (const exam of stores.exams) await examValid(exam, false);
  for (const { id, value } of stores.settings) {
    check(['profile','theme','target','activeExam','admissionConfig'].includes(id));
    if (id === 'profile') check(value && text(value.name) && value.name.length <= 60 && (value.university === undefined || text(value.university) && value.university.length <= 120));
    if (id === 'theme') check(['light','dark'].includes(value));
    if (id === 'target') check(Number.isInteger(value) && value >= 1 && value <= 500);
    if (id === 'admissionConfig') validateAdmissionConfig(value);
    if (id === 'activeExam') await examValid(value, true);
  }
  return backup;
}
export async function restoreBackup(backup) {
  await validateBackup(backup);
  // Only an explicitly confirmed restore replaces records. An abort rolls back ALL stores.
  await transact(STORES, 'readwrite', tx => {
    for (const name of STORES) {
      const store = tx.objectStore(name);
      store.clear();
      for (const row of backup.stores[name]) store.add(row);
    }
  });
}
export function downloadBackup(backup) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], {type:'application/json'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `admission-companion-backup-${new Date().toISOString().slice(0,10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
