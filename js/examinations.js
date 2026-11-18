import { mountAdmissionControls } from './components/admission-controls.js';
import { DEFAULT_ADMISSIONS, generatePattern } from './services/admissions.js';
import { mountQuestionFilters, questionMetadata, questionLanguage } from './components/question-filters.js';
import { setting, saveSetting, finishExam, get } from './services/db.js';
import { SUBJECTS, shuffled } from './services/questions.js';
import { scoreExam } from './services/exams.js';
import { escapeHTML as e, emptyState } from './components/ui.js';

export function reviewHTML(result) {
  return `<section class="panel p-4"><div class="section-heading"><div><p class="eyebrow">MODEL TEST RESULT</p><h2>${result.score} / ${result.maxMarks ?? result.total} marks</h2></div><span class="pill">${result.marking ? 'Per-question marking' : `−${result.negative} per wrong answer`}</span></div><div class="result-counts"><span><strong>${result.correct}</strong> Correct</span><span><strong>${result.incorrect}</strong> Incorrect</span><span><strong>${result.unanswered}</strong> Unanswered</span></div><p class="muted small">Finished ${e(new Date(result.finishedAt).toLocaleString('en-GB'))}. ${result.marking ? 'Marking follows the saved per-question pattern.' : `${result.correctMarks ?? 1} mark(s) per correct answer; ${result.negative} deducted per wrong answer.`} Unanswered questions have no penalty.</p></section>${result.admission ? `<p class="feature-note">${e([result.admission.targetName,result.admission.unit,result.admission.group,result.admission.patternName,result.admission.session,result.admission.source].filter(Boolean).join(' · '))}</p>` : ''}<section class="review-list mt-4"><h2 class="mb-3">Detailed answer review</h2>${result.questions.map((question, index) => `<article class="panel p-4 mb-3"><p class="eyebrow">${index + 1} · ${e(question.subject)} ${question.isSample ? '· TESTING SAMPLE' : ''}</p><p class="muted small">${questionMetadata(question)}</p>${result.marking ? `<p class="muted small">Correct: +${result.marking[index].correct} · Wrong: −${result.marking[index].wrong}</p>` : ''}<h3 lang="${questionLanguage(question)}" class="question-text">${e(question.question)}</h3><div class="answer-options" lang="${questionLanguage(question)}">${question.options.map((option, choice) => `<div class="answer-option ${choice === question.correctAnswer ? 'correct' : result.answers[index] === choice ? 'incorrect' : ''}"><span>${String.fromCharCode(65 + choice)}</span>${e(option)}${choice === question.correctAnswer ? ' ✓ Correct' : result.answers[index] === choice ? ' ✕ Your answer' : ''}</div>`).join('')}</div><p class="mt-3"><strong>Your answer:</strong> ${result.answers[index] === null ? 'Unanswered' : e(question.options[result.answers[index]])}</p><p class="muted mb-0 question-explanation" lang="${questionLanguage(question)}">${e(question.explanation)}</p></article>`).join('')}</section>`;
}

export async function mountExams(container, questions, isCurrent = () => true, admissions = DEFAULT_ADMISSIONS) {
  let timer;
  let disposed = false;
  let active = await setting('activeExam', null);
  if (disposed || !isCurrent()) return () => {};
  const setup = () => {
    container.innerHTML = `<section class="panel p-4"><h2 class="mb-3">Your next model test</h2><p class="muted">Choose a subject and test length. Answers are saved as you go; the timer continues if you leave or close the app.</p>${!questions.length ? emptyState('Add questions to begin', 'Import your question bank first.', 'exam', '<a class="btn btn-primary" href="#/bank">Open question bank</a>') : `<form id="exam-setup"><div id="exam-targets" class="mb-3"></div><label class="form-label" for="exam-pattern">Examination pattern</label><select class="form-select mb-2" id="exam-pattern"><option value="">Custom practice test — personal settings</option></select><p class="form-text" id="exam-pattern-status">No official rules are prefilled. Custom settings are for personal practice.</p><div class="form-grid"><div><label for="exam-subject" class="form-label">Subject</label><select id="exam-subject" class="form-select"><option value="">All subjects</option>${SUBJECTS.map(subject => `<option>${e(subject)}</option>`).join('')}</select></div><div><label for="exam-count" class="form-label">Questions</label><input id="exam-count" type="number" class="form-control" min="1" max="${questions.length}" value="${Math.min(10, questions.length)}" required></div><div><label for="exam-duration" class="form-label">Time (minutes)</label><input id="exam-duration" type="number" class="form-control" min="1" max="180" value="10" required></div><div><label for="exam-negative" class="form-label">Penalty per wrong answer</label><select id="exam-negative" class="form-select"><option value="0">No penalty</option><option value="0.25">0.25 marks</option><option value="0.5">0.50 marks</option><option value="1">1 mark</option></select></div><div><label class="form-label" for="exam-correct">Marks per correct answer</label><input class="form-control" id="exam-correct" type="number" min="0.01" max="100" step="0.01" value="1" required></div></div><div id="exam-filters"></div><p class="form-text" id="exam-available">${questions.length} questions available. Custom personal practice settings.</p><p id="exam-empty-pool" class="form-text" hidden><a href="#/bank">Link or import questions for this target in Question bank</a>, or widen the filters.</p><button class="btn btn-primary mt-3" id="exam-start">Start model test</button><p class="form-text" id="exam-error" role="alert"></p></form>`}</section>`;
    const form = container.querySelector('#exam-setup');
    if (!form) return;
    const targets = mountAdmissionControls(form.querySelector('#exam-targets'),questions,admissions,'exam',() => { resetCustom(); refreshPatterns(); updateCount(); });
    const filters = mountQuestionFilters(form.querySelector('#exam-filters'), questions, {prefix:'exam', onChange:() => updateCount()});
    const patternControl = form.querySelector('#exam-pattern');
    const chosenPattern = () => admissions.patterns.find(pattern => pattern.id === patternControl.value);
    const resetCustom = () => {
      patternControl.value = '';
      form.querySelector('#exam-subject').disabled = false;
      for (const id of ['exam-count','exam-duration','exam-correct']) form.querySelector('#'+id).readOnly = false;
      form.querySelector('#exam-negative').disabled = false;
      form.querySelector('#exam-duration').value = 10;
      form.querySelector('#exam-correct').value = 1;
      form.querySelector('#exam-negative').value = '0';
      form.querySelector('#exam-pattern-status').textContent = 'Custom practice settings; no official university pattern is implied. Import a sourced pattern configuration to use its subject distribution and marking.';
    };
    const refreshPatterns = () => {
      const selection = targets.selection();
      const patterns = admissions.patterns.filter(pattern => pattern.targetId === selection.targetId && (!selection.unit || !pattern.unit || pattern.unit === selection.unit) && (!selection.group || !pattern.group || pattern.group === selection.group));
      patternControl.innerHTML = '<option value="">Custom practice test — personal settings</option>' + patterns.map(pattern => `<option value="${e(pattern.id)}">${e(pattern.name)}${pattern.session ? ' · '+e(pattern.session) : ''}</option>`).join('');
    };
    const updateCount = () => {
      const subject = form.querySelector('#exam-subject').value;
      const pool = filters.filter(targets.filter(questions)).filter(question => !subject || question.subject === subject);
      const pattern = chosenPattern();
      const input = form.querySelector('#exam-count');
      input.max = pattern ? 10000 : pool.length;
      input.value = pattern ? pattern.sections.reduce((sum,section) => sum+section.count,0) : Math.min(Number(input.value), pool.length) || 1;
      form.querySelector('#exam-available').textContent = `${pool.length} questions available${pattern ? ' in the selected target/filter pool. The pattern requires its exact subject counts.' : '. Custom personal practice; no official distribution is implied.'}`;
      form.querySelector('#exam-start').disabled = pool.length === 0;
      form.querySelector('#exam-empty-pool').hidden = pool.length > 0;
    };
    patternControl.addEventListener('change', () => {
      const pattern = chosenPattern();
      if (!pattern) { resetCustom(); updateCount(); return; }
      targets.setSelection({targetId:pattern.targetId,unit:pattern.unit,group:pattern.group});
      form.querySelector('#exam-subject').value = '';
      form.querySelector('#exam-subject').disabled = true;
      for (const id of ['exam-count','exam-duration','exam-correct']) form.querySelector('#'+id).readOnly = true;
      form.querySelector('#exam-duration').value = pattern.durationMinutes;
      form.querySelector('#exam-correct').value = pattern.correctMarks;
      const penalty = form.querySelector('#exam-negative');
      if (![...penalty.options].some(option => Number(option.value) === pattern.wrongPenalty)) penalty.add(new Option(String(pattern.wrongPenalty),String(pattern.wrongPenalty)));
      penalty.value = String(pattern.wrongPenalty); penalty.disabled = true;
      form.querySelector('#exam-pattern-status').textContent = `${pattern.name} · ${pattern.session || 'session not specified'} · ${pattern.sections.map(section => `${section.subject}: ${section.count} questions, +${section.correctMarks ?? pattern.correctMarks}/−${section.wrongPenalty ?? pattern.wrongPenalty}`).join('; ')}. Source/reference: ${pattern.source}. Confirm this matches the intended session; this is a saved configuration, not automatic verification.`;
      updateCount();
    });
    form.querySelector('#exam-subject').addEventListener('change', event => { filters.update(questions.filter(question => !event.target.value || question.subject === event.target.value)); updateCount(); });
    refreshPatterns();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      form.querySelector('#exam-start').disabled = true;
      try {
        const subject = form.querySelector('#exam-subject').value;
        const pool = shuffled(filters.filter(targets.filter(questions)).filter(question => !subject || question.subject === subject));
        const count = Number(form.querySelector('#exam-count').value);
        if (count > pool.length || count < 1) throw new Error('Choose a question count within the available bank.');
        const durationMinutes = Number(form.querySelector('#exam-duration').value);
        const pattern = chosenPattern();
        const generated = pattern ? generatePattern(pool,pattern) : {questions:pool.slice(0,count)};
        const selection = targets.selection();
        const target = admissions.targets.find(target => target.id === selection.targetId);
        const context = {targetId:selection.targetId,targetName:target?.name || 'All targets',unit:selection.unit,group:selection.group,patternId:pattern?.id || '',patternName:pattern?.name || 'Custom personal practice',session:pattern?.session || '',source:pattern?.source || ''};
        const startedAt = Date.now();
        active = {id:crypto.randomUUID(), questions:generated.questions, answers:Array(generated.questions.length).fill(null), index:0,
          negative:Number(form.querySelector('#exam-negative').value), correctMarks:Number(form.querySelector('#exam-correct').value), ...(generated.marking ? {marking:generated.marking} : {}), admission:context, durationMinutes, startedAt, deadline:startedAt + durationMinutes * 60000};
        await saveSetting('activeExam', active);
        if (!isCurrent()) return;
        draw();
        startClock();
      } catch (error) { form.querySelector('#exam-error').textContent = error.message; form.querySelector('#exam-start').disabled = false; }
    });
  };
  let busy = false;
  let submitting = false;
  const submit = async (expired = false) => {
    if (submitting || !active) return;
    submitting = true;
    clearInterval(timer);
    try {
      const result = scoreExam(active);
      const attempts = result.questions.flatMap((question, index) => result.answers[index] === null ? [] : [{
        id:`${active.id}:${question.id}`, questionId:question.id, subject:question.subject, questionText:question.question,
        selected:result.answers[index], correct:result.answers[index] === question.correctAnswer, source:'exam', examId:active.id,
        createdAt:result.finishedAt, isSample:question.isSample,
      }]);
      await finishExam(result, attempts);
      active = null;
      if (isCurrent()) container.innerHTML = `${expired ? '<p class="feature-note">Time is up. Your answers were submitted automatically.</p>' : ''}${reviewHTML(result)}<a class="btn btn-primary mt-3" href="#/progress">See all progress</a><a class="btn btn-outline-primary mt-3 ms-2" href="#/examinations">New test</a>`;
      // Clicking the same hash does not navigate; handle a new test locally.
      container.querySelector('a[href="#/examinations"]')?.addEventListener('click', event => { event.preventDefault(); setup(); });
    } catch (error) {
      if (isCurrent()) {
        const message = container.querySelector('#exam-status');
        if (message) message.textContent = `Could not submit: ${error.message}. Your test remains saved. Retry submission.`;
        container.querySelectorAll('button').forEach(button => { button.disabled = false; });
        if (active && Date.now() < active.deadline) startClock();
      }
    } finally { submitting = false; }
  };
  const tick = () => {
    if (!active || disposed || !isCurrent()) return;
    const remaining = Math.max(0, Math.ceil((active.deadline - Date.now()) / 1000));
    const element = container.querySelector('#exam-timer');
    if (element) element.textContent = `${Math.floor(remaining / 60).toString().padStart(2,'0')}:${(remaining % 60).toString().padStart(2,'0')}`;
    if (!remaining) submit(true);
  };
  const startClock = () => { clearInterval(timer); tick(); if (active) timer = setInterval(tick, 500); };
  const draw = () => {
    if (!active || disposed || !isCurrent()) return;
    const question = active.questions[active.index];
    container.innerHTML = `<section class="panel question-panel"><div class="question-meta"><span>${active.admission ? e([active.admission.targetName,active.admission.unit,active.admission.group].filter(Boolean).join(' · ')) + ' · ' : ''}Question ${active.index + 1} / ${active.questions.length}</span><strong class="exam-timer" id="exam-timer" aria-label="Time remaining"></strong></div><div class="exam-nav" aria-label="Question navigation">${active.questions.map((_,index) => `<button class="question-number ${index === active.index ? 'current' : ''} ${active.answers[index] !== null ? 'answered' : ''}" data-index="${index}" aria-label="Question ${index + 1}${active.answers[index] !== null ? ', answered' : ', unanswered'}" ${index === active.index ? 'aria-current="step"' : ''}>${index + 1}</button>`).join('')}</div><p class="eyebrow">${e(question.subject)} ${question.isSample ? '· TESTING SAMPLE' : ''}</p><p class="muted small">${questionMetadata(question)}</p><h2 lang="${questionLanguage(question)}" class="question-text">${e(question.question)}</h2><div class="answer-options" lang="${questionLanguage(question)}" role="group" aria-label="Answer choices">${question.options.map((option,index) => `<button class="answer-option ${active.answers[active.index] === index ? 'selected' : ''}" data-exam-choice="${index}" aria-pressed="${active.answers[active.index] === index}"><span>${String.fromCharCode(65 + index)}</span>${e(option)}</button>`).join('')}</div><div class="session-controls mt-3"><button class="btn btn-outline-primary" id="clear-answer" ${active.answers[active.index] === null ? 'disabled' : ''}>Clear answer</button><div><button class="btn btn-outline-primary" data-move="-1" ${active.index === 0 ? 'disabled' : ''}>Previous</button> <button class="btn btn-outline-primary" data-move="1" ${active.index === active.questions.length - 1 ? 'disabled' : ''}>Next</button></div></div><p class="form-text" id="exam-status" role="status">Answers saved on this device. Leaving does not pause the timer.</p><button class="btn btn-primary" id="exam-submit">Submit test</button><div id="submit-confirm" class="mt-3"></div></section>`;
    container.querySelectorAll('[data-index]').forEach(button => button.addEventListener('click', () => { if (!busy && !submitting) { active.index = Number(button.dataset.index); draw(); tick(); } }));
    container.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => { if (!busy && !submitting) { active.index += Number(button.dataset.move); draw(); tick(); } }));
    const choose = async value => {
      if (busy || submitting || Date.now() >= active.deadline) { tick(); return; }
      busy = true;
      const previous = active.answers[active.index];
      active.answers[active.index] = value;
      container.querySelectorAll('button').forEach(button => { button.disabled = true; });
      try { await saveSetting('activeExam', structuredClone(active)); draw(); tick(); }
      catch (error) { active.answers[active.index] = previous; draw(); container.querySelector('#exam-status').textContent = `Answer not saved: ${error.message}`; }
      finally { busy = false; }
    };
    container.querySelectorAll('[data-exam-choice]').forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.examChoice))));
    container.querySelector('#clear-answer').addEventListener('click', () => choose(null));
    container.querySelector('#exam-submit').addEventListener('click', () => {
      if (busy || submitting) return;
      const unanswered = active.answers.filter(answer => answer === null).length;
      container.querySelector('#submit-confirm').innerHTML = `<div class="feature-note"><div><p>${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Submit this test now?</p><button class="btn btn-primary" id="confirm-submit">Submit now</button> <button class="btn btn-outline-primary" id="cancel-submit">Keep studying</button></div></div>`;
      container.querySelector('#confirm-submit').addEventListener('click', () => submit());
      container.querySelector('#cancel-submit').addEventListener('click', () => { container.querySelector('#submit-confirm').innerHTML = ''; });
    });
  };
  if (active) {
    const existing = await get('exams', active.id);
    if (!isCurrent()) return () => {};
    if (existing) { active = null; setup(); }
    else { draw(); startClock(); }
  } else setup();
  return () => { disposed = true; clearInterval(timer); };
}
