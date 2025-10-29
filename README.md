# DigiCertQuiz

## Full Leaderboard (Screenshot View)

- Route: open `/leaderboard/full` to show the current quiz’s full leaderboard (top 30) formatted for a 1920×1080 desktop screenshot.
- Optional: open `/leaderboard/full/:quizId` to target a specific quiz id.
- Layout: three columns of 10 entries (10/10/10), ranks continue across columns.
- Header includes the quiz title and today’s date for convenient email screenshots.

Implementation files:
- `src/components/FullLeaderboard.js`
- `src/App.js`
