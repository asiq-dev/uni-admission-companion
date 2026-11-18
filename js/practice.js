import { mountAdmissionControls } from './components/admission-controls.js';
import { DEFAULT_ADMISSIONS } from './services/admissions.js';
import { mountQuestionFilters, questionMetadata, questionLanguage } from './components/question-filters.js';
import { saveAttempt, put, remove } from './services/db.js';
import { SUBJECTS, shuffled } from './services/questions.js';
import { escapeHTML as e, emptyState } from './components/ui.js';

export function mountPractice(container, data, mode = 'all', initialSubject = '', admissions = DEFAULT_ADMISSIONS) {
  const marked = new Set(data.bookmarks.map(item => item.id));
  const mistakes = new Set(data.progress.filter(item => item.needsReview).map(item => item.id));
  const pool = data.questions.filter(question => mode === 'mistakes' ? mistakes.has(question.id) : mode === 'bookmarks' ? marked.has(question.id) : true);
  container.innerHTML = `<section class="panel p-4"><form id="practice-setup"><div id="practice-targets" class="mb-3"></div><div class="form-grid"><div><label class="form-label" for="practice-subject">Subject</label><select class="form-select" id="practice-subject"><option value="">All subjects</option>${SUBJECTS.map(subject => `<option ${subject === initialSubject ? 'selected' : ''}>${e(subject)}</option>`).join('')}</select></div><div><label class="form-label" for="practice-order">Question order</label><select class="form-select" id="practice-order"><option value="random">Random</option><option value="original">Bank order</option></select></div></div><div id="practice-filters"></div><p class="muted mt-3" id="practice-count"></p><div id="practice-empty" class="feature-note mb-3" role="status" hidden></div><button class="btn btn-primary" id="start-practice">Start practice</button></form></section><section id="practice-session" class="mt-4" aria-live="polite"></section>`;
  const subjectInput = container.querySelector('#practice-subject');
  const session = container.querySelector('#practice-session');
  const targets = mountAdmissionControls(container.querySelector('#practice-targets'),pool,admissions,'practice',() => updateCount());
  const filters = mountQuestionFilters(container.querySelector('#practice-filters'), pool, {prefix:'practice', onChange:() => updateCount()});
  const updateCount = () => {
    const count = filters.filter(targets.filter(pool)).filter(question => !subjectInput.value || question.subject === subjectInput.value).length;
    container.querySelector('#practice-count').textContent = `${count} question${count === 1 ? '' : 's'} available${mode === 'mistakes' ? ' to revisit' : mode === 'bookmarks' ? ' in bookmarks' : ''}.`;
    container.querySelector('#start-practice').disabled = count === 0;
    const message = container.querySelector('#practice-empty');
    message.hidden = count > 0;
    if (count > 0) { message.replaceChildren(); return; }
    if (!data.questions.length) {
      message.innerHTML = '<div><strong>No questions have been imported in this browser.</strong><p>Open Question bank to load English vocabulary, general knowledge, licensed Bangla reading or sourced practice, import your JSON file, or try the 16 testing questions. Questions saved at a different website address, port, or browser are stored separately.</p><a class="btn btn-outline-primary" href="#/bank">Open question bank</a></div>';
    } else if (!pool.length) {
      message.innerHTML = `<div><strong>${mode === 'mistakes' ? 'No questions currently need a mistake retry.' : 'No questions are bookmarked yet.'}</strong><p>${data.questions.length} questions are stored in your bank. You can use All practice to study them.</p><a class="btn btn-outline-primary" href="#/practice">Open all practice</a></div>`;
    } else {
      message.innerHTML = `<div><strong>No questions match the selected filters.</strong><p>${data.questions.length} questions are stored in this browser. Selecting JU, GST, or NU shows only linked or explicitly common questions. Testing samples have no university links until you add them in Question bank. Previous-year mode requires sourced records.</p><div class="button-row"><button type="button" class="btn btn-outline-primary" id="practice-reset-filters">${mode === 'all' ? 'Show all bank questions' : 'Reset filters in this view'}</button><a class="text-link" href="#/bank">Manage question links</a></div></div>`;
      message.querySelector('#practice-reset-filters').onclick = () => { targets.reset(); subjectInput.value=''; filters.update(pool); filters.reset(); updateCount(); };
    }
  };
  subjectInput.addEventListener('change', () => { filters.update(pool.filter(question => !subjectInput.value || question.subject === subjectInput.value)); updateCount(); });
  filters.update(pool.filter(question => !subjectInput.value || question.subject === subjectInput.value));
  updateCount();
  container.querySelector('#practice-setup').addEventListener('submit', event => {
    event.preventDefault();
    let questions = filters.filter(targets.filter(pool)).filter(question => !subjectInput.value || question.subject === subjectInput.value);
    if (!questions.length) return;
    if (container.querySelector('#practice-order').value === 'random') questions = shuffled(questions);
    let index = 0;
    let answered = null;
    let busy = false;
    let attemptId = crypto.randomUUID();
    const show = () => {
      const question = questions[index];
      session.innerHTML = `<article class="panel question-panel"><div class="question-meta"><span>${e(question.subject)} · ${index + 1} / ${questions.length}</span>${question.isSample ? '<span class="pill">Testing sample · not a past exam</span>' : ''}<button type="button" class="btn btn-outline-primary bookmark-button" aria-pressed="${marked.has(question.id)}">${marked.has(question.id) ? 'Bookmarked ✓' : 'Bookmark'}</button></div><p class="muted small">${questionMetadata(question)}</p><h2 lang="${questionLanguage(question)}" class="question-text" tabindex="-1">${e(question.question)}</h2><div class="answer-options" lang="${questionLanguage(question)}">${question.options.map((option, choice) => `<button type="button" class="answer-option ${answered !== null && choice === question.correctAnswer ? 'correct' : answered === choice ? 'incorrect' : ''}" data-choice="${choice}" ${answered !== null ? 'disabled' : ''}><span>${String.fromCharCode(65 + choice)}</span>${e(option)}${answered !== null && choice === question.correctAnswer ? ' ✓' : answered === choice ? ' ✕' : ''}</button>`).join('')}</div><div class="answer-feedback" role="status">${answered !== null ? `<strong>${answered === question.correctAnswer ? 'Correct — well done.' : 'A useful mistake. Let’s learn from it.'}</strong><p>Correct answer: ${e(question.options[question.correctAnswer])}</p><p class="question-explanation" lang="${questionLanguage(question)}">${e(question.explanation)}</p>` : 'Choose one answer to see feedback and the explanation.'}</div><div class="session-controls"><span class="muted small">${answered !== null ? 'Answer saved on this device.' : 'Each submitted answer counts toward your progress.'}</span>${answered !== null ? `<button class="btn btn-primary next-question">${index + 1 === questions.length ? 'Finish practice' : 'Next question →'}</button>` : ''}</div><p class="form-text save-error" role="alert"></p></article>`;
      session.querySelector('.bookmark-button').addEventListener('click', async event => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
          if (marked.has(question.id)) { await remove('bookmarks', question.id); marked.delete(question.id); }
          else { await put('bookmarks', {id:question.id, createdAt:Date.now()}); marked.add(question.id); }
          button.textContent = marked.has(question.id) ? 'Bookmarked ✓' : 'Bookmark';
          button.setAttribute('aria-pressed', String(marked.has(question.id)));
        } catch (error) { session.querySelector('.save-error').textContent = error.message; }
        finally { button.disabled = false; }
      });
      session.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', async () => {
        if (busy || answered !== null) return;
        busy = true;
        session.querySelectorAll('[data-choice]').forEach(option => { option.disabled = true; });
        const choice = Number(button.dataset.choice);
        try {
          await saveAttempt({id:attemptId, questionId:question.id, subject:question.subject, questionText:question.question, selected:choice,
            correct:choice === question.correctAnswer, source:'practice', createdAt:Date.now(), isSample:question.isSample});
          answered = choice;
          show();
        } catch (error) {
          session.querySelector('.save-error').textContent = `Answer was not saved. ${error.message} Try again.`;
          session.querySelectorAll('[data-choice]').forEach(option => { option.disabled = false; });
        } finally { busy = false; }
      }));
      session.querySelector('.next-question')?.addEventListener('click', () => {
        index++;
        if (index === questions.length) {
          session.innerHTML = `<section class="panel">${emptyState('A little progress, well earned.', `${questions.length} answers saved. Your dashboard and mistake book are up to date.`, 'check', '<a class="btn btn-primary" href="#/progress">See progress</a> <a class="btn btn-outline-primary" href="#/practice">Practice more</a>')}</section>`;
          return;
        }
        answered = null;
        attemptId = crypto.randomUUID();
        show();
        session.querySelector('.question-text').focus();
      });
    };
    show();
    session.querySelector('.question-text').focus();
  });
}
