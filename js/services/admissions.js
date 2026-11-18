import { setting, transact } from './db.js';
import { SUBJECTS } from './subjects.js';

// Preparation categories only. No eligibility, unit names or exam rules are assumed.
export const DEFAULT_ADMISSIONS = {version:1, targets:[
  {id:'ju', name:'Jahangirnagar University (JU)', units:[], groups:['Humanities','Science','Business Studies']},
  {id:'gst', name:'GST Integrated Admission System', units:[], groups:['Humanities','Science','Business Studies']},
  {id:'nu', name:'National University (NU)', units:[], groups:['Humanities','Science','Business Studies']},
  {id:'other', name:'Other universities', units:[], groups:['Humanities','Science','Business Studies']},
], patterns:[]};
const str = (value, max = 200) => typeof value === 'string' && value.length <= max;
const nonempty = value => str(value) && value.trim().length > 0;
const idOK = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,59}$/.test(value);
const check = (condition, message) => { if (!condition) throw new Error(message); };
const marksOK = value => Number.isFinite(value) && value >= 0 && value <= 100;
export function validateMarking(exam) {
  check(marksOK(exam.negative) && (exam.correctMarks == null || marksOK(exam.correctMarks) && exam.correctMarks > 0), 'Invalid test marking.');
  if (exam.marking != null) check(Array.isArray(exam.marking) && exam.marking.length === exam.questions.length && exam.marking.every(mark => mark && marksOK(mark.correct) && mark.correct > 0 && marksOK(mark.wrong)), 'Invalid per-question marking.');
  if (exam.admission != null) check(exam.admission && ['targetId','targetName','unit','group','patternId','patternName','session','source'].every(key => str(exam.admission[key],key === 'source' ? 1000 : 200)), 'Invalid saved admission context.');
}
export function validateAdmissionConfig(config) {
  check(config?.version === 1 && Array.isArray(config.targets) && config.targets.length >= 4 && config.targets.length <= 50 && Array.isArray(config.patterns) && config.patterns.length <= 200, 'Provide version 1, 4–50 targets, and up to 200 patterns.');
  check(new Set(config.targets.map(target => target?.id)).size === config.targets.length, 'Target IDs must be unique.');
  for (const target of config.targets) check(target && idOK(target.id) && nonempty(target.name) && ['units','groups'].every(key => Array.isArray(target[key]) && target[key].length <= 100 && target[key].every(nonempty) && new Set(target[key]).size === target[key].length), 'Each target needs id, name, units[] and groups[] with unique nonblank values.');
  check(['ju','gst','nu','other'].every(id => config.targets.some(target => target.id === id)), 'Keep the ju, gst, nu and other target IDs; add more targets as needed.');
  check(new Set(config.patterns.map(pattern => pattern?.id)).size === config.patterns.length, 'Pattern IDs must be unique.');
  for (const pattern of config.patterns) {
    const target = config.targets.find(target => target.id === pattern?.targetId);
    check(pattern && idOK(pattern.id) && nonempty(pattern.name) && target && str(pattern.unit) && str(pattern.group) && str(pattern.session) && str(pattern.source,1000) && pattern.source.trim(), 'Every pattern needs id, name, targetId, unit, group, session and a source/reference (label personal patterns as personal).');
    check((!pattern.unit || target.units.includes(pattern.unit)) && (!pattern.group || target.groups.includes(pattern.group)), 'Pattern unit/group must exist in its target configuration.');
    check(Number.isInteger(pattern.durationMinutes) && pattern.durationMinutes >= 1 && pattern.durationMinutes <= 180 && marksOK(pattern.correctMarks) && pattern.correctMarks > 0 && marksOK(pattern.wrongPenalty), 'Pattern duration must be 1–180 minutes, positive correctMarks and nonnegative wrongPenalty (up to 100).');
    check(Array.isArray(pattern.sections) && pattern.sections.length > 0 && pattern.sections.length <= 50, 'A pattern needs subject sections.');
    check(new Set(pattern.sections.map(section => section?.subject)).size === pattern.sections.length, 'Use one section per subject.');
    for (const section of pattern.sections) check(section && SUBJECTS.includes(section.subject) && Number.isInteger(section.count) && section.count > 0 && section.count <= 10000 && (section.correctMarks == null || marksOK(section.correctMarks) && section.correctMarks > 0) && (section.wrongPenalty == null || marksOK(section.wrongPenalty)), 'Sections need a supported subject, count and optional valid marking overrides.');
    check(pattern.sections.reduce((sum, section) => sum + section.count,0) <= 10000, 'A pattern may contain at most 10,000 questions.');
  }
  return config;
}
export const admissionConfig = async () => validateAdmissionConfig(await setting('admissionConfig', DEFAULT_ADMISSIONS));

export function validateQuestionLinks(row) {
  check(row.common == null || typeof row.common === 'boolean', 'common must be a boolean.');
  for (const field of ['admissionTargets','previousYears']) {
    check(row[field] == null || Array.isArray(row[field]) && row[field].length <= 100, `${field} must be an array with at most 100 entries.`);
    for (const link of row[field] || []) {
      check(link && idOK(link.targetId) && (link.unit == null || str(link.unit)) && (link.group == null || str(link.group)), `${field} entries need targetId and optional unit/group strings.`);
      if (field === 'previousYears') check(Number.isInteger(link.examYear) && link.examYear >= 1900 && link.examYear <= 2100 && str(link.source,1000) && link.source.trim() && row.isSample !== true, 'previousYears requires examYear and a nonblank source; testing samples cannot claim previous-year provenance.');
    }
  }
}
export const cleanLinks = (rows = [], previous = false) => [...new Map(rows.map(link => {
  const value = {targetId:link.targetId, unit:(link.unit || '').trim(), group:(link.group || '').trim(), ...(previous ? {examYear:link.examYear,source:link.source.trim()} : {})};
  return [JSON.stringify(value),value];
})).values()];
export function mergedLinks(original, incoming) {
  const result = {...original};
  for (const key of ['admissionTargets','previousYears']) if (incoming[key]?.length) result[key] = cleanLinks([...(original[key] || []),...incoming[key]], key === 'previousYears');
  if (incoming.common === true) result.common = true;
  validateQuestionLinks(result);
  return result;
}
const aliases = {ju:['ju','jahangirnagar university','জাহাঙ্গীরনগর বিশ্ববিদ্যালয়','জাহাঙ্গীরনগর বিশ্ববিদ্যালয়'],gst:['gst','gst integrated admission system','গুচ্ছ'],nu:['nu','national university','জাতীয় বিশ্ববিদ্যালয়','জাতীয় বিশ্ববিদ্যালয়']};
export function legacyTarget(question, config) {
  const name = question.university?.normalize('NFC').trim().toLowerCase();
  return config.targets.find(target => target.name.normalize('NFC').toLowerCase() === name || aliases[target.id]?.some(alias => alias.normalize('NFC') === name))?.id;
}
export function questionOccurrences(question, config) {
  const result = [...(question.previousYears || [])];
  const targetId = legacyTarget(question,config);
  if (targetId && !question.isSample && question.examYear && question.source) result.push({targetId,unit:question.admissionUnit || '',group:'',examYear:question.examYear,source:question.source});
  return result;
}
export function targetMatches(question, selection, config) {
  const {targetId,unit='',group='',previousOnly=false,year=''} = selection;
  if (!targetId && !previousOnly) return true; // Existing all-bank flows retain all legacy questions.
  const matches = (link, allowBlank) => (!targetId || link.targetId === targetId) && (!unit || link.unit === unit || allowBlank && !link.unit) && (!group || link.group === group || allowBlank && !link.group);
  if (previousOnly) return questionOccurrences(question,config).some(link => matches(link,false) && (!year || String(link.examYear) === year));
  if (question.common) return true;
  const links = [...(question.admissionTargets || []),...questionOccurrences(question,config)];
  const legacy = legacyTarget(question,config);
  if (legacy) links.push({targetId:legacy,unit:question.admissionUnit || '',group:''});
  return links.some(link => matches(link,true));
}
export async function assignQuestions(ids, link, common = false) {
  validateQuestionLinks({admissionTargets:link ? [link] : [], common});
  await transact(['questions'],'readwrite',tx => {
    const store = tx.objectStore('questions');
    for (const id of ids) {
      const request = store.get(id);
      request.onsuccess = () => { try { if (request.result) store.put(mergedLinks(request.result,{admissionTargets:link ? [link] : [],common})); } catch { tx.abort(); } };
    }
  });
}
// Fisher-Yates and IDs ensure selection without replacement, even across reusable links.
export function generatePattern(pool, pattern) {
  const unique = [...new Map(pool.map(question => [question.id,question])).values()];
  const questions = [], marking = [];
  for (const section of pattern.sections) {
    const choices = unique.filter(question => question.subject === section.subject);
    if (choices.length < section.count) throw new Error(`${section.subject}: pattern needs ${section.count} questions; only ${choices.length} match. Import/link more questions or change filters. No test was started.`);
    for (let i=choices.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [choices[i],choices[j]]=[choices[j],choices[i]]; }
    questions.push(...choices.slice(0,section.count));
    marking.push(...Array.from({length:section.count},() => ({correct:section.correctMarks ?? pattern.correctMarks,wrong:section.wrongPenalty ?? pattern.wrongPenalty})));
  }
  return {questions,marking};
}
