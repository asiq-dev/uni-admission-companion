import { escapeHTML as e } from './ui.js';
import { targetMatches, questionOccurrences, legacyTarget } from '../services/admissions.js';

export function mountAdmissionControls(container, questions, config, prefix, onChange) {
  container.innerHTML = `<div class="form-grid"><div><label class="form-label" for="${prefix}-target">Admission target / university</label><select class="form-select" id="${prefix}-target"><option value="">All targets and unassigned questions</option>${config.targets.map(target => `<option value="${e(target.id)}">${e(target.name)}</option>`).join('')}</select></div><div><label class="form-label" for="${prefix}-group">Preparation group</label><select class="form-select" id="${prefix}-group"></select></div><div><label class="form-label" for="${prefix}-unit">Admission unit</label><select class="form-select" id="${prefix}-unit"></select></div><div><label class="form-label" for="${prefix}-content">Question category</label><select class="form-select" id="${prefix}-content"><option value="">Preparation + common questions</option><option value="previous">Previous-year records with a source</option></select></div><div><label class="form-label" for="${prefix}-paper-year">Previous examination year</label><select class="form-select" id="${prefix}-paper-year"></select></div></div><p class="form-text">Humanities is the primary preparation group. Target links show study relevance, not eligibility or proof that a question appeared in an exam. Common questions are included only in preparation; previous-year view uses recorded sources.</p>`;
  const select = suffix => container.querySelector(`#${prefix}-${suffix}`);
  const fill = (control, values, first) => {
    const current = control.value;
    control.innerHTML = `<option value="">${first}</option>${[...new Set(values.filter(Boolean))].map(value => `<option value="${e(String(value))}">${e(String(value))}</option>`).join('')}`;
    control.value = values.map(String).includes(current) ? current : '';
  };
  const refresh = () => {
    const targetId = select('target').value;
    const targets = config.targets.filter(target => !targetId || target.id === targetId);
    const links = questions.flatMap(question => [
      ...(question.admissionTargets || []),...questionOccurrences(question,config),
      ...(legacyTarget(question,config) ? [{targetId:legacyTarget(question,config),unit:question.admissionUnit || '',group:''}] : []),
    ]).filter(link => !targetId || link.targetId === targetId);
    fill(select('unit'), [...targets.flatMap(target => target.units),...links.map(link => link.unit)], 'All units / unit not specified');
    fill(select('group'), ['Humanities',...targets.flatMap(target => target.groups),...links.map(link => link.group)], 'All preparation groups');
    const years = questions.flatMap(question => questionOccurrences(question,config)).filter(link => (!targetId || link.targetId === targetId) && (!targetId || !select('unit').value || link.unit === select('unit').value) && (!targetId || !select('group').value || link.group === select('group').value)).map(link => link.examYear).sort((a,b)=>b-a);
    fill(select('paper-year'),years,'All previous examination years');
    select('paper-year').disabled = select('content').value !== 'previous';
    select('unit').disabled = !targetId;
    select('group').disabled = !targetId;
  };
  const selection = () => ({targetId:select('target').value,unit:select('target').value ? select('unit').value : '',group:select('target').value ? select('group').value : '',previousOnly:select('content').value === 'previous',year:select('paper-year').value});
  refresh();
  select('group').value = 'Humanities';
  refresh();
  for (const control of container.querySelectorAll('select')) control.addEventListener('change',() => { refresh(); onChange(); });
  return {selection, reset:() => { for (const control of container.querySelectorAll('select')) control.value = ''; refresh(); select('group').value='Humanities'; refresh(); }, setSelection:values => { if (values.targetId != null) select('target').value = values.targetId; refresh(); for (const key of ['unit','group']) if (values[key] != null) select(key).value=values[key]; refresh(); }, filter:pool => pool.filter(question => targetMatches(question,selection(),config)), update:pool => { questions=pool; refresh(); }};
}
