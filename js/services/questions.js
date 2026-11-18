import { validateQuestionLinks, cleanLinks, mergedLinks } from './admissions.js';
import { all, transact } from './db.js';
import { SUBJECTS } from './subjects.js';
export { SUBJECTS } from './subjects.js';
export const MAX_QUESTIONS = 10000;
export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
const yieldToUI = () => new Promise(resolve => setTimeout(resolve, 0));
export const normalize = value => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
const text = (value, max = 3000) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
export function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export async function validateQuestions(input, onProgress = () => {}) {
  const rows = Array.isArray(input) ? input : input?.questions;
  if (!Array.isArray(rows) || !rows.length || rows.length > MAX_QUESTIONS) throw new Error(`Provide an array (or {"questions": [...]}) containing 1–${MAX_QUESTIONS} questions. Split larger banks into files.`);
  const errors = [];
  const valid = [];
  for (const [index, row] of rows.entries()) {
    if (index % 100 === 0) { onProgress({phase:'validation', completed:index, total:rows.length}); await yieldToUI(); }
    const before = errors.length;
    const fail = message => errors.push(`Question ${index + 1}: ${message}`);
    if (!row || typeof row !== 'object' || Array.isArray(row)) { fail('must be an object.'); continue; }
    const subject = SUBJECTS.find(name => normalize(name) === normalize(String(row.subject ?? '')));
    if (!subject) fail('subject must match one of the eight supported subjects.');
    if (!text(row.question)) fail('question must be a non-empty string (max 3000 characters).');
    if (!Array.isArray(row.options) || row.options.length !== 4 || !row.options.every(option => text(option, 1000)) || new Set(row.options.map(option => typeof option === 'string' ? normalize(option) : '')).size !== 4) fail('provide exactly four different non-empty options.');
    if (!Number.isInteger(row.correctAnswer) || row.correctAnswer < 0 || row.correctAnswer > 3) fail('correctAnswer must be an integer from 0 to 3.');
    if (!text(row.explanation, 5000)) fail('explanation must be a non-empty string (max 5000 characters).');
    for (const field of ['chapter', 'topic', 'university', 'admissionUnit', 'collection']) if (row[field] != null && (typeof row[field] !== 'string' || row[field].length > 200)) fail(`${field} must be a string (max 200 characters).`);
    if (row.source != null && (typeof row.source !== 'string' || row.source.length > 1000)) fail('source must be a string (max 1000 characters).');
    if (row.language != null && !['bn','en','mixed'].includes(row.language)) fail('language must be bn, en, mixed, or null.');
    if (row.examYear != null && (!Number.isInteger(row.examYear) || row.examYear < 1900 || row.examYear > 2100)) fail('examYear must be null or an integer from 1900 to 2100.');
    if (row.difficulty != null && !['easy','medium','hard'].includes(row.difficulty)) fail('difficulty must be easy, medium, or hard.');
    if (row.isSample != null && typeof row.isSample !== 'boolean') fail('isSample must be a boolean.');
    try { validateQuestionLinks(row); } catch (error) { fail(error.message); }
    if (errors.length !== before) continue;
    const fingerprint = normalize(subject) + '\n' + normalize(row.question);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
    const id = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    valid.push({ id, subject, collection:(row.collection || '').trim(), chapter: (row.chapter || '').trim(), topic: (row.topic || '').trim(), question: row.question.trim(),
      options: row.options.map(option => option.trim()), correctAnswer: row.correctAnswer, explanation: row.explanation.trim(),
      university: (row.university || '').trim(), admissionUnit: (row.admissionUnit || '').trim(), examYear: row.examYear ?? null,
      difficulty: row.difficulty || 'medium', source: (row.source || '').trim(), language: row.language ?? null, common:row.common === true, admissionTargets:cleanLinks(row.admissionTargets || []), previousYears:cleanLinks(row.previousYears || [],true), isSample: row.isSample === true });
  }
  onProgress({phase:'validation', completed:rows.length, total:rows.length});
  if (errors.length) {
    const error = new Error(`${errors.slice(0, 12).join('\n')}${errors.length > 12 ? `\n…and ${errors.length - 12} more errors. Download the import report for all rows.` : ''}\nNothing was imported.`);
    error.issues = errors;
    throw error;
  }
  return valid;
}
const answerContent = row => JSON.stringify([row.options, row.correctAnswer, row.explanation]);
export async function importQuestions(input, onProgress = () => {}) {
  const rows = await validateQuestions(input, onProgress);
  let imported = 0;
  let duplicates = 0;
  let inFile = 0;
  let existing = 0;
  let conflicts = 0;
  const details = [];
  const seen = new Map();
  const reused = new Set();
  onProgress({phase:'saving', completed:0, total:rows.length});
  await transact(['questions'], 'readwrite', tx => {
    const store = tx.objectStore('questions');
    // Keep every read/write inside one live transaction. Never await inside it.
    const next = index => {
      if (index % 250 === 0 || index === rows.length) onProgress({phase:'saving', completed:index, total:rows.length});
      if (index >= rows.length) return;
      const row = rows[index];
      const first = seen.get(row.id);
      if (!first) seen.set(row.id, {index});
      const request = store.get(row.id);
      request.onsuccess = () => {
        if (!request.result) {
          const add = store.add(row);
          add.onsuccess = () => { imported++; next(index + 1); };
          return;
        }
        const original = request.result;
        duplicates++;
        if (first) inFile++; else existing++;
        const conflict = answerContent(original) !== answerContent(row);
        if (conflict) conflicts++;
        let updated = original;
        try { if (!conflict) updated = mergedLinks(original,row); }
        catch { tx.abort(); return; }
        const changed = JSON.stringify(updated) !== JSON.stringify(original);
        if (changed) reused.add(row.id);
        details.push({row:index + 1,kind:first ? 'within-file' : 'already-stored',...(first ? {firstRow:first.index + 1} : {}),conflict,reused:changed,
          message:`Question ${index + 1}: same identity ${first ? `as question ${first.index + 1} in this file` : 'already stored'}; ${conflict ? 'options, answer, or explanation differ — no links or content changed' : changed ? 'added preparation/provenance links to the existing record' : 'existing content and metadata kept'}.`});
        if (changed) { const put = store.put(updated); put.onsuccess = () => next(index + 1); }
        else next(index + 1);
      };
    };
    next(0);
  });
  return { imported, duplicates, inFile, existing, conflicts, reused:reused.size, details };
}
export async function exportQuestions() { return (await all('questions')).map(({id, ...question}) => question); }
