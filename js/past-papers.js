import { all, setting } from './services/db.js';
import { importQuestions, validateQuestions } from './services/questions.js';
import { questionMetadata, questionLanguage } from './components/question-filters.js';
import { escapeHTML as e } from './components/ui.js';
import { mountPractice } from './practice.js';
import { mountExams } from './examinations.js';

const external = (url,label) => /^https?:\/\//.test(url || '') ? `<a class="text-link" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>` : '';

export async function mountPastPapers(container,data,admissions,isCurrent=()=>true) {
  const response=await fetch('data/past-papers.json');
  if(!response.ok) throw new Error('Past-paper catalogue unavailable. Reopen online to finish the app update.');
  const catalog=await response.json();
  if(!isCurrent())return ()=>{};
  let questions=data.questions,stop=()=>{},revision=0;
  container.innerHTML=`<section class="panel p-4"><p class="muted">জাবি · গুচ্ছ · জাতীয় বিশ্ববিদ্যালয় — মানবিক</p><p class="mt-2">Browse the last ten examination years (${catalog.firstYear}–${catalog.lastYear}). Academic sessions and exam years can differ. This is a growing catalogue, not a complete ten-year archive: only 15 selected source excerpts are bundled so far. Full papers and original keys have not been authenticated.</p><div class="form-grid mt-3"><div><label class="form-label" for="papers-target">University</label><select class="form-select" id="papers-target">${catalog.targets.map(t=>`<option value="${e(t.id)}">${e(t.name)}</option>`).join('')}</select></div><div><label class="form-label" for="papers-year">Examination year</label><select class="form-select" id="papers-year">${Array.from({length:catalog.lastYear-catalog.firstYear+1},(_,i)=>catalog.lastYear-i).map(y=>`<option value="${y}">${y}</option>`).join('')}</select></div></div><p class="form-text" id="papers-scope"></p><div class="button-row mt-3" id="papers-years" aria-label="Ten-year coverage"></div><p class="form-text">A saved question's year is a source claim unless independently verified. Selecting a year never borrows another year's questions.</p></section><section class="panel p-4 mt-4" id="papers-results"></section><div id="papers-study" class="mt-4"></div>`;
  const target=container.querySelector('#papers-target'),year=container.querySelector('#papers-year');
  const results=container.querySelector('#papers-results'),study=container.querySelector('#papers-study');
  const selectedPapers=()=>catalog.papers.filter(p=>p.targetId===target.value&&p.examYear===Number(year.value));
  const gapFor=y=>catalog.gaps.find(g=>g.targetId===target.value&&y>=g.fromYear&&y<=g.toYear);
  const poolFor=y=>{
    const refs=new Set(catalog.papers.filter(p=>p.targetId===target.value&&p.examYear===y).flatMap(p=>p.questionIds));
    return questions.filter(q=>refs.has(q.id)||(q.previousYears||[]).some(link=>link.targetId===target.value&&link.examYear===y&&link.group==='Humanities'));
  };
  const render=()=>{
    stop();stop=()=>{};revision++;study.replaceChildren();
    const t=catalog.targets.find(t=>t.id===target.value),papers=selectedPapers(),gap=gapFor(Number(year.value)),pool=poolFor(Number(year.value));
    container.querySelector('#papers-scope').textContent=t.scope;
    container.querySelector('#papers-years').innerHTML=Array.from({length:10},(_,i)=>catalog.lastYear-i).map(y=>{
      const count=poolFor(y).length,known=catalog.papers.filter(p=>p.targetId===target.value&&p.examYear===y).reduce((n,p)=>n+p.questionIds.length,0);
      const label=count?`${count} saved`:gapFor(y)?'not held':known?`${known} excerpts available`:'not collected';
      return `<button class="btn btn-outline-primary" type="button" data-paper-year="${y}" aria-pressed="${Number(year.value)===y}">${y} · ${e(label)}</button>`;
    }).join('');
    const imported=pool.filter(q=>(q.previousYears||[]).some(link=>link.targetId===target.value&&link.examYear===Number(year.value)&&link.group==='Humanities'));
    results.innerHTML=`<h2>${e(t.name)} · ${e(year.value)}</h2><p class="mt-2" id="papers-count">${pool.length} questions saved for this university/year.</p>${gap?`<div class="feature-note mt-3"><strong>No regular examination in this category</strong><p>${e(gap.note)}</p>${external(gap.sourceURL,'Historical source')}${imported.length?'<p>Imported records claim this year despite the historical gap. Check their provenance; they are shown below without certifying the claim.</p>':''}</div>`:''}${papers.map(p=>`<article class="bank-question"><h3>${e(p.title)}</h3><p>Session ${e(p.session)} · Unit ${e(p.unit)}${p.set?` · Set ${e(p.set)}`:''} · <strong>Partial selection: ${p.questionIds.length} excerpts</strong></p><p class="form-text">Publisher claim — original paper not independently verified. ${e(p.note)}</p>${external(p.sourceURL,'Publisher listing (online)')}<p class="form-text">${e(p.answerStatus)}</p><button type="button" class="btn btn-outline-primary" data-load-paper="${e(p.id)}">Load this selection (${p.questionIds.length})</button><p class="form-text" data-paper-import-status="${e(p.id)}" role="status"></p></article>`).join('')}${!papers.length&&!gap?'<div class="feature-note mt-3"><strong>No bundled paper collected for this year.</strong><p>This does not mean the exam was not held. No paper or answer key has been invented to fill this slot.</p></div>':''}${imported.length?`<p class="form-text">${imported.length} questions have imported Humanities previous-year records. Their sources are shown on each question; importing a year claim does not independently authenticate it.</p>`:''}${pool.length?'<div class="button-row mt-3"><button id="papers-practice" class="btn btn-primary">Practise this year</button><button id="papers-test" class="btn btn-outline-primary">Custom test from this year</button></div>':''}<details class="mt-3" ${pool.length?'':'hidden'}><summary>View saved questions and explanations (${pool.length})</summary><div id="papers-question-list">${pool.slice(0,50).map(q=>`<details class="bank-question"><summary lang="${questionLanguage(q)}">${e(q.question)}</summary><p class="muted mt-3">${questionMetadata(q)}</p><ol type="A" lang="${questionLanguage(q)}">${q.options.map((o,i)=>`<li>${e(o)}${i===q.correctAnswer?' ✓':''}</li>`).join('')}</ol><p class="question-explanation" lang="${questionLanguage(q)}">${e(q.explanation)}</p></details>`).join('')}</div>${pool.length>50?'<p>Showing the first 50 previews. Practice and custom tests use all questions in this year.</p>':''}</details><div class="button-row mt-4"><a href="#/bank" class="text-link">Import or manage question JSON</a><a href="#/examinations" class="text-link">Examinations / resume active test</a>${catalog.sources.filter(s=>s.targetId===target.value).map(s=>external(s.url,s.name+' (online)')).join('')}</div>`;
    results.querySelectorAll('[data-load-paper]').forEach(button=>button.onclick=async()=>{
      const p=papers.find(p=>p.id===button.dataset.loadPaper),status=results.querySelector(`[data-paper-import-status="${p.id}"]`),token=revision;
      button.disabled=true;status.textContent='Validating and saving the selected questions…';
      try{
        const r=await fetch(p.bundle);if(!r.ok)throw Error('Local excerpt pack unavailable. Finish the app update online and retry.');
        const validated=await validateQuestions(await r.json());const ids=new Set(p.questionIds);const chosen=validated.filter(q=>ids.has(q.id));
        if(chosen.length!==ids.size)throw Error('Selection/source mismatch. Nothing imported.');
        const outcome=await importQuestions(chosen);questions=await all('questions');
        if(!isCurrent()||token!==revision)return;
        render();results.querySelector(`[data-paper-import-status="${p.id}"]`).textContent=`Imported ${outcome.imported}; skipped ${outcome.duplicates} duplicates. Existing progress preserved.`;
      }catch(error){if(isCurrent()&&token===revision){status.textContent=error.message;button.disabled=false;}}
    });
    results.querySelector('#papers-practice')?.addEventListener('click',async()=>{
      const token=revision;
      const [bookmarks,progress]=await Promise.all([all('bookmarks'),all('progress')]);
      if(token!==revision||!isCurrent())return;
      stop();stop=()=>{};mountPractice(study,{...data,bookmarks,progress,questions:pool},'all','',admissions);study.scrollIntoView({behavior:'smooth',block:'start'});
    });
    results.querySelector('#papers-test')?.addEventListener('click',async()=>{
      const token=revision;
      if(await setting('activeExam',null)){if(token===revision&&isCurrent())study.innerHTML='<p class="feature-note">An existing test is active. <a href="#/examinations">Resume or submit it in Examinations</a> before starting another. Its questions and deadline have been preserved.</p>';return;}
      if(token!==revision||!isCurrent())return;
      stop();stop=()=>{};
      const dispose=await mountExams(study,pool,()=>isCurrent()&&token===revision,admissions);
      if(token!==revision||!isCurrent()){dispose();return;}
      stop=dispose;
      const count=study.querySelector('#exam-count');if(count)count.value=String(Math.min(20,pool.length));
      study.scrollIntoView({behavior:'smooth',block:'start'});
    });
  };
  const chooseAvailableYear=()=>{
    const available=Array.from({length:catalog.lastYear-catalog.firstYear+1},(_,i)=>catalog.lastYear-i).find(y=>poolFor(y).length||catalog.papers.some(p=>p.targetId===target.value&&p.examYear===y));
    year.value=String(available??catalog.lastYear);
  };
  target.onchange=()=>{chooseAvailableYear();render();};year.onchange=render;
  container.querySelector('#papers-years').onclick=event=>{const button=event.target.closest('[data-paper-year]');if(button){year.value=button.dataset.paperYear;render();}};
  chooseAvailableYear();render();return ()=>{revision++;stop();};
}
