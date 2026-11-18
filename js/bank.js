import { mountAdmissionControls } from './components/admission-controls.js';
import { DEFAULT_ADMISSIONS, assignQuestions, validateAdmissionConfig } from './services/admissions.js';
import { SUBJECTS, importQuestions, exportQuestions, MAX_IMPORT_BYTES, normalize } from './services/questions.js';
import { mountQuestionFilters, questionMetadata, questionLanguage } from './components/question-filters.js';
import { all, saveSetting } from './services/db.js';
import { BANK_NOTICES } from './services/bank-notices.js';
import { SUBJECT_NOTICES } from './services/subject-notices.js';
import { questionExportParts } from './services/question-export.js';
import { escapeHTML as e, emptyState } from './components/ui.js';

export function downloadJSON(value, filename, compact = false) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, compact ? undefined : 2)], {type:'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function bankPreview(text) {
  if (text.length <= 240) return text;
  const marker = '\n\nপ্রশ্ন: ';
  const start = text.lastIndexOf(marker);
  const preview = start >= 0 ? text.slice(start + marker.length) : text;
  return preview.length > 240 ? preview.slice(0,237) + '…' : preview;
}
export function mountBank(container, initialQuestions, admissions = DEFAULT_ADMISSIONS) {
  let questions = initialQuestions;
  container.innerHTML = `<section class="panel p-4"><h2>Load study questions on this device.</h2><p class="muted mt-2">Choose a subject pack below to add questions to this browser. Packs are not imported automatically. You can also import a UTF-8 JSON question bank. Invalid files are rejected as a whole; duplicates never replace existing question content; matching records can gain explicit target links.</p><p class="form-text">The selected Satt Humanities pack adds 15 short public-page questions: JU 3, GST 9 and NU 3, with source answers and Bangla editorial explanations. University/year associations are third-party claims, not independently authenticated papers. This is a limited attributed excerpt selection for personal study, not a full bank or an open reuse licence. BLUCK adds 1,301 published Bangla MCQs and 785 Bangladesh-affairs MCQs. <strong>BLUCK provides answer keys only: detailed rationales and original exam papers were not supplied. Original-paper claims and keys are not independently verified.</strong> International-affairs packs add 51 US-history and 32 US-government questions; these cover US examples, not Bangladesh civics or all world affairs. Published subject packs add 3,000 SciQ science MCQs, 1,500 GSM8K arithmetic problems with adapted numeric choices, 166 OpenStax sociology MCQs and 45 OpenStax ICT MCQs. These are English-language subject practice, not authenticated JU/GST/NU papers. Source answers and explanations/context are retained; see <a href="SUBJECT_COVERAGE.md" download>subject coverage and remaining gaps</a>. The sourced practice pack contains selected third-party questions with source links and editorial explanations. Past-paper claims are not independently verified. The separate licensed reading supplement adds 2,875 passage-based Bangla exercises shared across JU/GST/NU Humanities. The English supplement adds 2,000 WordNet vocabulary drills; General knowledge adds 945 world-geography drills from the Countries dataset. All three supplements share JU/GST/NU Humanities preparation links. These are source-derived supplementary practice, not university past papers. Source matching is checked automatically; answers, distractors and current facts are NOT independently expert-verified. Difficulty is not calibrated. <a href="THIRD_PARTY_NOTICES.md" download>Source licenses and reuse notices</a>.</p><form id="import-form"><label class="form-label" for="question-file">Question JSON file (up to 20 MB / 10,000 questions)</label><input class="form-control" type="file" accept=".json,application/json" id="question-file" required><div class="button-row mt-3"><button class="btn btn-primary" type="submit">Validate & import</button><button class="btn btn-outline-primary" type="button" id="load-satt-humanities">Load selected Satt Humanities (15 questions)</button><button class="btn btn-outline-primary" type="button" id="load-bluck-bangla">Load published Bangla — source keys only (1,301 questions)</button><button class="btn btn-outline-primary" type="button" id="load-bd">Load Bangladesh affairs — source keys only (785 questions)</button><button class="btn btn-outline-primary" type="button" id="load-history">Load international history (US focus) (51 questions)</button><button class="btn btn-outline-primary" type="button" id="load-government">Load comparative government (US focus) (32 questions)</button><button class="btn btn-outline-primary" type="button" id="load-science">Load published science (3,000 questions)</button><button class="btn btn-outline-primary" type="button" id="load-arithmetic">Load mental arithmetic (1,500 questions)</button><button class="btn btn-outline-primary" type="button" id="load-sociology">Load sociology (166 questions)</button><button class="btn btn-outline-primary" type="button" id="load-ict">Load ICT (45 questions)</button><button class="btn btn-outline-primary" type="button" id="load-english">Load English vocabulary (2,000 questions)</button><button class="btn btn-outline-primary" type="button" id="load-gk">Load general knowledge (945 questions)</button><button class="btn btn-outline-primary" type="button" id="load-reading">Load licensed reading supplement (2,875 questions)</button><button class="btn btn-outline-primary" type="button" id="load-sourced">Load sourced practice (28 questions)</button><button class="btn btn-outline-primary" type="button" id="load-sample">Load testing sample (16 questions)</button><a href="data/sample-questions.json" download class="text-link">Download sample JSON</a><a href="QUESTION_SOURCES.md" download class="text-link">Question sources & verification guide</a></div></form><button class="btn btn-outline-primary mt-3" id="import-report" type="button" hidden>Download import report</button><p class="import-status mt-3 mb-0" id="import-status" role="status"></p><details class="mt-3"><summary>Question format and duplicate rules</summary><p class="muted mt-2">Use an array or {"questions": [...]}. Required: subject, question, options (four distinct strings), correctAnswer (zero-based 0–3), explanation. Optional: collection, chapter, topic, university, admissionUnit, examYear (integer or null), difficulty (easy/medium/hard), source (reference text, up to 1000 characters), language (bn/en/mixed or null), isSample (boolean). Duplicates use normalized subject + question text, including duplicates inside a file. Existing question content is never overwritten. Matching duplicates may add explicit admissionTargets/previousYears links or a common flag. Conflicting answers are flagged in the import report. Samples are original testing examples, not historical admission questions.</p></details></section><section class="panel p-4 mt-4"><div class="section-heading"><h2>Your question bank</h2><button class="btn btn-outline-primary" id="export-bank">Export bank JSON</button></div><div id="bank-targets" class="mb-3"></div><div class="form-grid"><div><label for="bank-search" class="form-label">Search</label><input class="form-control" id="bank-search" type="search" placeholder="Question, chapter, topic, university, unit, year, source…"></div><div><label for="bank-subject" class="form-label">Subject</label><select class="form-select" id="bank-subject"><option value="">All subjects</option>${SUBJECTS.map(subject => `<option>${e(subject)}</option>`).join('')}</select></div><div><label for="bank-difficulty" class="form-label">Difficulty</label><select class="form-select" id="bank-difficulty"><option value="">All difficulties</option><option>easy</option><option>medium</option><option>hard</option></select></div></div><div id="bank-filters"></div><p class="muted mt-3" id="bank-count"></p><div id="bank-list"></div><button class="btn btn-outline-primary mt-3" id="bank-more" hidden>Show more</button></section>`;
  const status = container.querySelector('#import-status');
  container.querySelector('#export-bank').closest('.section-heading').insertAdjacentHTML('afterend','<div id="bank-export-parts" class="button-row mt-3" hidden></div>');
  container.insertAdjacentHTML('beforeend', `<section class="panel p-4 mt-4"><h2>Reuse questions for admission targets</h2><p class="muted">Select questions using their checkboxes above. Add study links without duplicating content or changing previous-year sources.</p><p id="reuse-count">0 selected</p><div class="form-grid"><div><label for="reuse-target" class="form-label">Target</label><select id="reuse-target" class="form-select">${admissions.targets.map(target => `<option value="${e(target.id)}">${e(target.name)}</option>`).join('')}</select></div><div><label for="reuse-unit" class="form-label">Unit (optional, use verified names)</label><input id="reuse-unit" class="form-control" maxlength="200"></div><div><label for="reuse-group" class="form-label">Preparation group</label><input id="reuse-group" class="form-control" maxlength="200" value="Humanities"></div></div><div class="button-row mt-3"><button class="btn btn-outline-primary" id="reuse-questions">Link selected to target</button><button class="btn btn-outline-primary" id="common-questions">Mark selected as common preparation</button></div><p class="form-text" id="reuse-status" role="status"></p><details class="mt-3"><summary>Configure universities, units and examination patterns</summary><p class="muted mt-2">Export the configuration, edit it using <a href="ADMISSION_TARGETS.md" download>the admission configuration guide</a>, then import it here. No official rules are prefilled. Keep existing target IDs so question links remain valid. Active and completed tests retain their saved rules.</p><button id="export-admissions" class="btn btn-outline-primary">Export admission configuration</button><label class="form-label mt-3" for="admissions-file">Admission configuration JSON (up to 1 MiB)</label><input class="form-control" id="admissions-file" type="file" accept=".json,application/json"><button id="import-admissions" class="btn btn-outline-primary mt-3">Validate & save configuration</button><p class="form-text" id="admissions-status" role="status"></p></details></section>`);
  let limit = 50;
  const selected = new Set();
  let targets = mountAdmissionControls(container.querySelector('#bank-targets'),questions,admissions,'bank',() => { limit = 50; render(); });
  let report;
  const reportButton = container.querySelector('#import-report');
  reportButton.addEventListener('click', () => downloadJSON(report, 'admission-companion-import-report.json'));
  const filters = mountQuestionFilters(container.querySelector('#bank-filters'), questions, {prefix:'bank', omit:['difficulty'], onChange:() => { limit = 50; render(); }});
  const render = () => {
    const search = normalize(container.querySelector('#bank-search').value);
    const subject = container.querySelector('#bank-subject').value;
    const difficulty = container.querySelector('#bank-difficulty').value;
    const filtered = filters.filter(targets.filter(questions)).filter(question => (!subject || question.subject === subject) && (!difficulty || question.difficulty === difficulty) && normalize([question.question,question.collection,question.chapter,question.topic,question.university,question.admissionUnit,String(question.examYear || ''),question.source,...(question.admissionTargets || []).flatMap(link => [link.targetId,link.unit,link.group]),...(question.previousYears || []).flatMap(link => [link.targetId,link.unit,link.group,link.examYear,link.source])].join(' ')).includes(search));
    container.querySelector('#reuse-count').textContent = `${selected.size} selected`;
    container.querySelector('#bank-count').textContent = `${filtered.length} matching · ${questions.length} questions stored on this device.`;
    container.querySelector('#export-bank').disabled = questions.length === 0;
    container.querySelector('#bank-more').hidden = filtered.length <= limit;
    container.querySelector('#bank-list').innerHTML = filtered.length ? filtered.slice(0,limit).map(question => `<details class="bank-question"><summary><input type="checkbox" class="me-2" data-select-question="${e(question.id)}" aria-label="Select question for target reuse" ${selected.has(question.id) ? 'checked' : ''}><span class="pill">${e(question.subject)}</span> <span lang="${questionLanguage(question)}">${e(bankPreview(question.question))}</span> ${question.isSample ? '<small class="muted">· Testing sample</small>' : ''}</summary>${question.question.length > 240 ? `<p class="question-text mt-3" lang="${questionLanguage(question)}">${e(question.question)}</p>` : ''}<p class="muted mt-3">${questionMetadata(question)}</p><ol type="A" lang="${questionLanguage(question)}">${question.options.map((option,index) => `<li>${e(option)} ${index === question.correctAnswer ? '✓' : ''}</li>`).join('')}</ol><p class="question-explanation" lang="${questionLanguage(question)}">${e(question.explanation)}</p></details>`).join('') : emptyState(questions.length ? 'No matching questions' : 'Your question bank is empty', questions.length ? 'Choose All targets to find unassigned questions, or adjust your filters. Use the reuse controls below to link questions to a target.' : 'Import your questions above, or load the testing sample.', 'book');
  };
  const runImport = async load => {
    const buttons = container.querySelectorAll('#import-form button');
    buttons.forEach(button => { button.disabled = true; });
    reportButton.hidden = true;
    report = null;
    status.textContent = 'Validating and saving…';
    try {
      const result = await importQuestions(await load(), progress => { status.textContent = `Validating and saving… ${progress.phase === 'validation' ? 'Checked' : 'Saving'} ${progress.completed} / ${progress.total} questions.`; });
      status.textContent = `Imported ${result.imported} questions. Skipped ${result.duplicates} duplicates (${result.inFile} within file, ${result.existing} already stored). ${result.conflicts} with different options, answers, or explanations. Added target/source links to ${result.reused} existing records. Saved on this device.`;
      report = result;
      reportButton.hidden = result.duplicates === 0;
      questions = await all('questions');
      container.querySelector('#bank-export-parts').hidden = true;
      targets.update(questions);
      filters.update(questions.filter(question => !container.querySelector('#bank-subject').value || question.subject === container.querySelector('#bank-subject').value));
      render();
    } catch (error) { status.textContent = error instanceof SyntaxError ? 'Invalid JSON. Check commas, quotation marks, and brackets. Nothing was imported.' : error.message; if (error.issues) { report = {imported:0, errors:error.issues}; reportButton.hidden = false; } }
    finally { buttons.forEach(button => { button.disabled = false; }); }
  };
  container.querySelector('#import-form').addEventListener('submit', event => {
    event.preventDefault();
    runImport(async () => {
      const file = container.querySelector('#question-file').files[0];
      if (!file) throw new Error('Choose a JSON file first.');
      if (file.size > MAX_IMPORT_BYTES) throw new Error('File is larger than 20 MB. Split it into smaller files. Nothing was imported.');
      return JSON.parse((await file.text()).replace(/^\uFEFF/, ''));
    });
  });
  container.querySelector('#load-reading').addEventListener('click', () => runImport(async () => {
    const response = await fetch('data/licensed-reading.json');
    if (!response.ok) throw new Error('Could not load the licensed supplement. Reopen online to finish the app update, then retry.');
    return response.json();
  }));
  for (const [id, file] of [['load-satt-humanities','satt-humanities'], ['load-english','english-vocabulary'], ['load-gk','general-knowledge'], ['load-science','science-practice'], ['load-arithmetic','mental-arithmetic'], ['load-sociology','sociology-practice'], ['load-ict','ict-practice'], ['load-bluck-bangla','bluck-bangla'], ['load-bd','bangladesh-affairs'], ['load-history','international-history'], ['load-government','comparative-government']]) {
    container.querySelector('#'+id).addEventListener('click', () => runImport(async () => {
      const response = await fetch(`data/${file}.json`);
      if (!response.ok) throw new Error('Could not load this supplement. Reopen online to finish the app update, then retry.');
      return response.json();
    }));
  }
  container.querySelector('#load-sourced').addEventListener('click', () => runImport(async () => {
    const response = await fetch('data/sourced-practice.json');
    if (!response.ok) throw new Error('Could not load the sourced pack. Reopen online to finish the app update, then retry.');
    return response.json();
  }));
  container.querySelector('#load-sample').addEventListener('click', () => runImport(async () => {
    const response = await fetch('data/sample-questions.json');
    if (!response.ok) throw new Error('Could not load the sample. Finish offline setup and retry.');
    return response.json();
  }));
  container.querySelector('#export-bank').addEventListener('click', async () => {
    try {
      const questions = await exportQuestions();
      const licensed = questions.some(question => /^(WordNet|Countries|SciQ|GSM8K|OpenStax|BLUCK) —/.test(question.collection || ''));
      const notices = licensed ? {...BANK_NOTICES,...SUBJECT_NOTICES} : undefined;
      const parts = questionExportParts(questions,notices);
      const choices = container.querySelector('#bank-export-parts');
      choices.hidden = true;
      if (parts.length <= 1) downloadJSON(licensed ? parts[0] : questions, 'admission-companion-questions.json', true);
      else {
        choices.replaceChildren(); choices.hidden = false;
        for (const [index,part] of parts.entries()) {
          const button = document.createElement('button');
          button.className = 'btn btn-outline-primary';
          button.textContent = `Download part ${index+1} / ${parts.length} (${part.questions.length} questions)`;
          button.onclick = () => downloadJSON(part,`admission-companion-questions-part-${index+1}-of-${parts.length}.json`,true);
          choices.append(button);
        }
        status.textContent = `Your bank needs ${parts.length} importable files. Download every part below. Each stays within the 20 MB / 10,000-question limit and includes source notices.`;
      }
    }
    catch (error) { status.textContent = error.message; }
  });
  for (const id of ['bank-search','bank-subject','bank-difficulty']) container.querySelector('#' + id).addEventListener('input', () => { limit = 50; if (id === 'bank-subject') filters.update(questions.filter(question => !container.querySelector('#bank-subject').value || question.subject === container.querySelector('#bank-subject').value)); render(); });
  container.querySelector('#bank-list').addEventListener('change', event => {
    const checkbox = event.target.closest('[data-select-question]');
    if (!checkbox) return;
    if (checkbox.checked) selected.add(checkbox.dataset.selectQuestion); else selected.delete(checkbox.dataset.selectQuestion);
    container.querySelector('#reuse-count').textContent = `${selected.size} selected`;
  });
  for (const [id,common] of [['reuse-questions',false],['common-questions',true]]) container.querySelector('#'+id).addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      if (!selected.size) throw new Error('Select at least one question above.');
      await assignQuestions([...selected], common ? null : {targetId:container.querySelector('#reuse-target').value,unit:container.querySelector('#reuse-unit').value.trim(),group:container.querySelector('#reuse-group').value.trim()},common);
      questions = await all('questions'); targets.update(questions);
      container.querySelector('#reuse-status').textContent = `${selected.size} questions ${common ? 'marked as common preparation' : 'linked to the target'}. No duplicate records or previous-year claims added.`;
      selected.clear(); render();
    } catch (error) { container.querySelector('#reuse-status').textContent = error.message; }
    finally { button.disabled = false; }
  });
  container.querySelector('#export-admissions').onclick = () => downloadJSON(admissions,'admission-targets.json');
  container.querySelector('#import-admissions').onclick = async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const file = container.querySelector('#admissions-file').files[0];
      if (!file || file.size > 1024*1024) throw new Error('Choose a configuration JSON file up to 1 MiB.');
      const config = validateAdmissionConfig(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));
      // A configuration replacement cannot silently orphan existing custom target links.
      const previousIds = admissions.targets.map(target => target.id);
      if (!previousIds.every(id => config.targets.some(target => target.id === id))) throw new Error('Keep all existing target IDs; rename labels or add targets instead.');
      await saveSetting('admissionConfig',config);
      admissions = config;
      targets = mountAdmissionControls(container.querySelector('#bank-targets'),questions,admissions,'bank',() => { limit=50; render(); });
      container.querySelector('#reuse-target').innerHTML = admissions.targets.map(target => `<option value="${e(target.id)}">${e(target.name)}</option>`).join('');
      render();
      container.querySelector('#admissions-status').textContent = 'Admission configuration saved on this device. Open Examinations to use the updated patterns.';
    } catch (error) { container.querySelector('#admissions-status').textContent = `Configuration not saved: ${error.message}`; }
    finally { button.disabled = false; }
  };
  container.querySelector('#bank-more').addEventListener('click', () => { limit += 50; render(); });
  render();
}
