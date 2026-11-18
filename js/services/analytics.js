import { SUBJECTS } from './questions.js';
export function dayKey(time) { return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Dhaka', year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time)); }
export function summarize(history, questions, exams) {
  const correct = history.filter(answer => answer.correct).length;
  const today = history.filter(answer => dayKey(answer.createdAt) === dayKey(Date.now())).length;
  const subjects = SUBJECTS.map(subject => {
    const answers = history.filter(answer => answer.subject === subject);
    const right = answers.filter(answer => answer.correct).length;
    const bank = questions.filter(question => question.subject === subject);
    const attempted = new Set(answers.map(answer => answer.questionId)).size;
    return { subject, total: answers.length, correct: right, accuracy: answers.length ? Math.round(right / answers.length * 100) : null,
      attempted, available: bank.length, coverage: bank.length ? Math.round(attempted / bank.length * 100) : 0 };
  });
  return { total:history.length, correct, today, accuracy:history.length ? Math.round(correct / history.length * 100) : null, exams:exams.length, subjects };
}
