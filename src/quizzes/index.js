import week1 from "./week-1-key-sovereignty";
import week2 from "./week-2-x9-extended-key-usage";

export const quizzes = {
  [week1.id]: week1,
  [week2.id]: week2,
};

export const currentQuizId = week2.id;

export function getQuiz(id) {
  return quizzes[id];
}
