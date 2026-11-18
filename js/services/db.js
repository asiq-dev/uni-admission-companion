const DB_NAME = 'admission-companion';
const STORES = ['questions', 'history', 'bookmarks', 'exams', 'progress', 'settings'];
let connection;

export function openDB() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); connection = null; };
      resolve(request.result);
    };
    request.onerror = () => { connection = null; reject(request.error); };
    request.onblocked = () => { connection = null; reject(new Error('Close other Admission Companion tabs and reload to update the database.')); };
  });
  return connection;
}

// Resolve only after commit, so the UI never reports unsaved changes as saved.
export async function transact(stores, mode, work) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let value;
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error || new Error('Could not save local data.'));
    tx.onabort = () => reject(tx.error || new Error('The local transaction was cancelled.'));
    try { value = work(tx); } catch (error) { tx.abort(); reject(error); }
  });
}
export async function all(store) {
  let result;
  await transact([store], 'readonly', tx => { const request = tx.objectStore(store).getAll(); request.onsuccess = () => { result = request.result; }; });
  return result;
}
export async function get(store, id) {
  let result;
  await transact([store], 'readonly', tx => { const request = tx.objectStore(store).get(id); request.onsuccess = () => { result = request.result; }; });
  return result;
}
export const put = (store, value) => transact([store], 'readwrite', tx => tx.objectStore(store).put(value));
export const remove = (store, id) => transact([store], 'readwrite', tx => tx.objectStore(store).delete(id));
export async function setting(id, fallback) { return (await get('settings', id))?.value ?? fallback; }
export const saveSetting = (id, value) => put('settings', { id, value });

function recordInTransaction(tx, attempt) {
  tx.objectStore('history').add(attempt);
  const store = tx.objectStore('progress');
  const request = store.get(attempt.questionId);
  request.onsuccess = () => {
    const previous = request.result || { id: attempt.questionId, attempts: 0, correct: 0, mistakes: 0 };
    store.put({ ...previous, subject: attempt.subject, attempts: previous.attempts + 1,
      correct: previous.correct + Number(attempt.correct), mistakes: previous.mistakes + Number(!attempt.correct),
      needsReview: !attempt.correct, lastAttempt: attempt.createdAt });
  };
}
export const saveAttempt = attempt => transact(['history', 'progress'], 'readwrite', tx => recordInTransaction(tx, attempt));

export async function finishExam(result, attempts) {
  // The unique result ID makes submit/timeout/reload retries idempotent.
  await transact(['exams', 'history', 'progress', 'settings'], 'readwrite', tx => {
    const request = tx.objectStore('exams').get(result.id);
    request.onsuccess = () => {
      if (request.result) return;
      tx.objectStore('exams').add(result);
      // One question per exam, so progress updates address distinct records.
      for (const attempt of attempts) recordInTransaction(tx, attempt);
      const active = tx.objectStore('settings').get('activeExam');
      active.onsuccess = () => { if (active.result?.value?.id === result.id) tx.objectStore('settings').delete('activeExam'); };
    };
  });
}
