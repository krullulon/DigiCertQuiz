# Quiz Authoring Guide

## Purpose

This guide walks marketing and product teams through creating, registering, and verifying weekly DigiCert quizzes without touching application logic.

## Quick Checklist

1. Copy the template file.
2. Update quiz metadata, timer, and questions.
3. Register the quiz in [`index.js`](./index.js).
4. Set [`currentQuizId`](./index.js) if this is the latest quiz.
5. Run `npm run test:quizzes` to validate structure and registration.
6. Smoke test the quiz locally and publish.

## Step-by-Step Instructions

### 1. Copy the Template

- In VS Code or GitHub, duplicate `src/quizzes/week-1-key-sovereignty.js`.
- Rename the new file using `week-{number}-{topic}.js` (e.g., `week-2-certificate-lifecycle.js`).

### 2. Update Quiz Content

Replace the placeholder fields in your new file:

```javascript
const quiz = {
  id: "week-2-certificate-lifecycle",          // Must match file name slug
  title: "DigiCert Weekly Product Quiz #2",     // Display title
  intro: "This week's quiz focuses on ...",     // Optional: intro copy shown on the start screen
  maxTime: 100,                                 // Seconds per question (default 100)
  questions: [
    {
      question: "Your question text?",
      options: ["Answer A", "Answer B", "Answer C", "Answer D"],
      correctAnswer: 1,                         // Index of correct option (0-based)
    },
    // Add 4–5 total questions
  ],
};

export default quiz;
```

**Field requirements**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique, lowercase, hyphenated slug (`week-3-pki-fundamentals`). Must stay in sync with file name and registry entry. |
| `title` | string | Appears on the intro and leaderboard screens. |
| `intro` | string (optional) | Short description of the week’s theme; shown on the intro screen. |
| `maxTime` | number | Countdown (seconds) per question. Leave at 100 unless a different pace is desired. |
| `questions` | array | Each entry needs `question` (string), `options` (array of 4), and `correctAnswer` (0–3). |

### 3. Register the Quiz

Open [`src/quizzes/index.js`](./index.js) and:

- Add an import for your new module.
- Add the quiz to the exported `quizzes` map.
- Update `currentQuizId` if this is the newest quiz.

Example:

```javascript
import week1 from "./week-1-key-sovereignty";
import week2 from "./week-2-certificate-lifecycle";

export const quizzes = {
  [week1.id]: week1,
  [week2.id]: week2,
};

export const currentQuizId = week2.id;
```

### 4. Run Automated Validation

From the project root:

```bash
npm run test:quizzes
```

This command ensures:

- Every quiz file exports the required fields.
- Registry entries in `index.js` reference real modules.
- No quiz file is left unregistered.

### 5. Manual Smoke Test

1. `npm start` to launch the app.
2. Navigate to `/quiz/{your-quiz-id}`.
3. Confirm intro text, timer, question flow, and leaderboard submission.
4. Verify that the new quiz is the default redirect if you updated `currentQuizId`.

### 6. Commit and Deploy

1. Stage changes in GitHub Desktop (or your preferred tool).
2. Commit with a message like `Add Week N: Topic quiz`.
3. Push to `dev` for preview, test the Vercel URL, then merge into `main`.

## Display Name Policy

Leaderboard entries enforce unique display names per quiz to keep scores attributable to individual employees. Because this quiz programme targets DigiCert staff, duplicated names are not expected. If the audience changes (e.g., external partners), reassess whether duplicate names should be permitted and update [`components/QuizGame.js`](../components/QuizGame.js) accordingly.

## Troubleshooting

- **`npm run test:quizzes` fails**: read the error message—it typically reports the file or field that’s missing.
- **Quiz 404s in the browser**: ensure the quiz ID matches in the file name, `id` field, and registry entry.
- **Timer appears incorrect**: verify the `maxTime` value in your quiz file.

For additional questions, refer to [`QUIZ_ARCHITECTURE_PLAN.md`](../../QUIZ_ARCHITECTURE_PLAN.md) or reach out to the engineering team.
