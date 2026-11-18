export function scoreExam(exam) {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  const answers = exam.answers.map(value => Number.isInteger(value) && value >= 0 && value <= 3 ? value : null);
  exam.questions.forEach((question, index) => {
    if (answers[index] === null) unanswered++;
    else if (answers[index] === question.correctAnswer) correct++;
    else incorrect++;
  });
  const correctMarks = exam.correctMarks ?? 1;
  const marking = exam.marking || exam.questions.map(() => ({correct:correctMarks,wrong:exam.negative}));
  const score = answers.reduce((sum,answer,index) => sum + (answer === null ? 0 : answer === exam.questions[index].correctAnswer ? marking[index].correct : -marking[index].wrong),0);
  const maxMarks = marking.reduce((sum,mark) => sum + mark.correct,0);
  return { id:exam.id, questions:exam.questions, answers, correct, incorrect, unanswered,
    negative:exam.negative, correctMarks, maxMarks:Math.round(maxMarks*100)/100, ...(exam.marking ? {marking:exam.marking} : {}), ...(exam.admission ? {admission:exam.admission} : {}), score: Math.round(score * 100) / 100,
    total:exam.questions.length, startedAt:exam.startedAt, finishedAt:Date.now(), durationMinutes:exam.durationMinutes };
}
