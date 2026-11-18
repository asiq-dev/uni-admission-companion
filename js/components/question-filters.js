import { escapeHTML as e } from './ui.js';

const FIELDS = [['collection','Question collection'], ['chapter','Chapter'], ['topic','Topic'], ['university','University'], ['admissionUnit','Admission unit'], ['examYear','Examination year'], ['difficulty','Difficulty'], ['language','Language']];
const label = value => ({bn:'বাংলা', en:'English', mixed:'Bangla & English'}[value] || value);

// Small shared controls keep bank browsing, practice and test selection consistent.
export function mountQuestionFilters(container, questions, {prefix, onChange, omit = []}) {
  const fields = FIELDS.filter(([key]) => !omit.includes(key));
  const controlHTML = ([key,title]) => `<div><label class="form-label" for="${prefix}-${key}">${title}</label><select class="form-select" id="${prefix}-${key}" data-field="${key}"></select></div>`;
  container.innerHTML = `${fields.some(([key])=>key==='collection') ? `<div class="mt-3">${controlHTML(['collection','Question collection'])}<p class="form-text">Collections keep their original questions, answers and source labels. Load a pack in Question bank first; saved collections remain available offline.</p></div>` : ''}<details class="mt-3"><summary>Chapter, topic, university and other filters</summary><div class="form-grid mt-3">${fields.filter(([key])=>key!=='collection').map(controlHTML).join('')}</div></details>`;
  const controls = [...container.querySelectorAll('select')];
  const update = pool => {
    for (const control of controls) {
      const selected = control.value;
      const values = [...new Set(pool.map(question => question[control.dataset.field]).filter(value => value !== '' && value != null).map(String))];
      values.sort((a,b) => control.dataset.field === 'examYear' ? Number(b) - Number(a) : a.localeCompare(b, 'bn'));
      control.innerHTML = `<option value="">All</option>${values.map(value => `<option value="${e(value)}">${e(label(value))}</option>`).join('')}`;
      control.value = values.includes(selected) ? selected : '';
    }
  };
  for (const control of controls) control.addEventListener('change', onChange);
  update(questions);
  return {
    update,
    reset: () => { for (const control of controls) control.value = ''; },
    filter: pool => pool.filter(question => controls.every(control => !control.value || String(question[control.dataset.field] ?? '') === control.value)),
  };
}

export function questionMetadata(question) {
  const metadata = [question.collection ? `Collection: ${question.collection}` : '', question.chapter, question.topic, question.university, question.admissionUnit, question.examYear, question.difficulty,
    question.source ? `Source: ${question.source}` : 'Source: not recorded',
    question.common ? 'Common preparation' : '',
    ...(question.admissionTargets || []).map(link => `Preparation: ${link.targetId.toUpperCase()} ${link.unit || ''} ${link.group || ''}`),
    ...(question.previousYears || []).map(link => `Previous-year record: ${link.targetId.toUpperCase()} ${link.unit || ''} ${link.group || ''} ${link.examYear}; ${link.source}`),
  ].filter(Boolean).join(' · ');
  return metadata.split(/(https?:\/\/[^\s<>"']+)/g).map(part => /^https?:\/\//.test(part)
    ? `<a href="${e(part)}" target="_blank" rel="noopener noreferrer">${e(part)}</a>` : e(part)).join('');
}
export const questionLanguage = question => ['bn','en'].includes(question.language) ? question.language : '';
