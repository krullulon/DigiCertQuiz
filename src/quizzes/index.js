import week1 from "./week-1-key-sovereignty";
import week2 from "./week-2-x9-extended-key-usage";
import week3 from "./week-3-protocols";
import week4 from "./week-4-acme";
import week5 from "./week-5-trustcore";

export const quizzes = {
  [week1.id]: week1,
  [week2.id]: week2,
  [week3.id]: week3,
  [week4.id]: week4,
  [week5.id]: week5,
};

export const currentQuizId = week4.id;

export function getQuiz(id) {
  return quizzes[id];
}
