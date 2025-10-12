import week1 from "./week-1-key-sovereignty";

export const quizzes = {
  [week1.id]: week1,
};

export const currentQuizId = week1.id;

export function getQuiz(id) {
  return quizzes[id];
}

