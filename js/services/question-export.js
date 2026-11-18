import { MAX_IMPORT_BYTES, MAX_QUESTIONS } from './questions.js';

// Exact sizes for compact JSON: every part can pass the existing importer.
export function questionExportParts(questions, notices, maxBytes = MAX_IMPORT_BYTES, maxQuestions = MAX_QUESTIONS) {
  const bytes = value => new TextEncoder().encode(JSON.stringify(value)).byteLength;
  const envelope = notices ? {questions:[], notices} : {questions:[]};
  const overhead = bytes(envelope);
  const parts = [];
  let current = [], size = overhead;
  for (const question of questions) {
    const rowBytes = bytes(question);
    if (rowBytes + overhead > maxBytes) throw new Error('A question is too large to export. Use a full backup.');
    if (current.length && (current.length >= maxQuestions || size + rowBytes + 1 > maxBytes)) {
      parts.push(notices ? {questions:current, notices} : {questions:current});
      current = []; size = overhead;
    }
    size += rowBytes + (current.length ? 1 : 0);
    current.push(question);
  }
  if (current.length) parts.push(notices ? {questions:current, notices} : {questions:current});
  return parts;
}
