# DigiCert Quiz - Multi-Quiz Architecture Plan

## Overview

### Current State (Single Quiz)
- One hardcoded quiz with 5 questions in `App.js`
- Single leaderboard in Firebase at `/leaderboard`
- One URL: `digi-cert-quiz.vercel.app`
- To change quizzes, we must edit code and redeploy

### Goal (Multiple Quizzes)
- Multiple quizzes, one per week
- Each quiz accessible via its own URL
- Old quizzes remain accessible indefinitely
- Separate leaderboards per quiz
- Easy for non-technical team to add new quizzes
- No homepage/archive page needed yet (can add later)

### Key Requirements
- ✅ Each quiz gets unique URL (e.g., `/quiz/week-1-key-sovereignty`)
- ✅ Old quizzes never disappear
- ✅ Separate Firebase leaderboard per quiz
- ✅ Same UI/design for all quizzes
- ✅ Simple process for adding new weekly quizzes
- ✅ Team-friendly (low technical barrier)

---

## Architecture Design

### File Structure

```
DigiCertQuiz/
├── src/
│   ├── App.js                          # Router setup (NEW)
│   ├── index.js                        # Entry point (unchanged)
│   ├── styles.css                      # Global styles (unchanged)
│   ├── components/
│   │   └── QuizGame.js                 # Quiz UI component (extracted from current App.js)
│   └── quizzes/
│       ├── index.js                    # Quiz registry & current quiz config
│       ├── week-1-key-sovereignty.js   # Week 1 quiz data
│       ├── week-2-certificate-lifecycle.js  # Week 2 quiz data (example)
│       └── README.md                   # Instructions for adding quizzes
├── public/                             # Static assets (unchanged)
├── package.json                        # Dependencies (will add react-router-dom)
└── QUIZ_ARCHITECTURE_PLAN.md          # This document
```

### Component Breakdown

#### `App.js` (Router)
**Purpose:** Handle URL routing and load appropriate quiz

**Responsibilities:**
- Set up React Router
- Define routes (`/`, `/quiz/:quizId`)
- Load quiz data based on URL parameter
- Handle 404 for invalid quiz IDs
- Redirect homepage to current quiz (for now)

**Code Structure:**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizGame from './components/QuizGame';
import { quizzes, currentQuizId } from './quizzes';

// Route /quiz/:quizId → loads that quiz
// Route / → redirects to current quiz
```

#### `components/QuizGame.js` (Quiz UI)
**Purpose:** Display quiz interface and handle game logic

**Responsibilities:**
- Render intro screen, questions, leaderboard
- Handle timer, scoring, answer submission
- Interact with Firebase (using quiz-specific paths)
- All the logic currently in `App.js`

**Props:**
```javascript
<QuizGame
  quizId="week-1-key-sovereignty"
  quizTitle="Week 1: Key Sovereignty"
  questions={[...]}
/>
```

#### `quizzes/index.js` (Quiz Registry)
**Purpose:** Central registry of all quizzes

**Responsibilities:**
- Import all quiz modules
- Export quiz lookup object
- Define which quiz is "current" for homepage

**Code Structure:**
```javascript
import week1 from './week-1-key-sovereignty';
import week2 from './week-2-certificate-lifecycle';

export const quizzes = {
  'week-1-key-sovereignty': week1,
  'week-2-certificate-lifecycle': week2,
};

export const currentQuizId = 'week-2-certificate-lifecycle'; // Update weekly
```

#### `quizzes/week-1-key-sovereignty.js` (Quiz Data)
**Purpose:** Individual quiz content

**Structure:**
```javascript
export default {
  id: "week-1-key-sovereignty",
  title: "Week 1: Key Sovereignty",
  description: "Test your knowledge of key sovereignty and cryptographic control",
  week: 1,
  date: "2025-01-12",
  questions: [
    {
      question: "What best defines key sovereignty?",
      options: ["...", "...", "...", "..."],
      correctAnswer: 1
    },
    // ... more questions
  ]
};
```

---

## URL Structure

### Quiz URLs

Each quiz has its own permanent URL:

```
digi-cert-quiz.vercel.app/quiz/week-1-key-sovereignty
digi-cert-quiz.vercel.app/quiz/week-2-certificate-lifecycle
digi-cert-quiz.vercel.app/quiz/week-3-pki-fundamentals
digi-cert-quiz.vercel.app/quiz/week-4-code-signing
```

**URL Pattern:** `/quiz/{quiz-id}`

**Quiz ID Format:** `week-{number}-{topic-slug}`
- Example: `week-1-key-sovereignty`
- Lowercase, hyphenated
- Descriptive and readable

### Homepage URL

```
digi-cert-quiz.vercel.app/
```

**Current Behavior:** Redirects to current week's quiz

**Future Options:**
- Quiz archive/library page
- Featured quiz
- Quiz selector
- Company branding page

### Invalid URLs

```
digi-cert-quiz.vercel.app/quiz/invalid-quiz-id
```

**Behavior:** Show 404 or "Quiz not found" message, link to current quiz

---

## Firebase Leaderboard Strategy

### Current Structure (Single Quiz)
```
/leaderboard/
  ├── {entryId1}: { name, score, timestamp }
  ├── {entryId2}: { name, score, timestamp }
  └── ...
```

### New Structure (Multiple Quizzes)
```
/leaderboard/
  ├── week-1-key-sovereignty/
  │   ├── {entryId1}: { name, score, timestamp }
  │   ├── {entryId2}: { name, score, timestamp }
  │   └── ...
  ├── week-2-certificate-lifecycle/
  │   ├── {entryId1}: { name, score, timestamp }
  │   └── ...
  └── week-3-pki-fundamentals/
      └── ...
```

### Implementation

**Save Score:**
```javascript
const DB_URL = firebaseConfig.databaseURL;
const quizId = "week-1-key-sovereignty";

await fetch(`${DB_URL}/leaderboard/${quizId}.json`, {
  method: "POST",
  body: JSON.stringify({ name, score, timestamp })
});
```

**Load Leaderboard:**
```javascript
const response = await fetch(`${DB_URL}/leaderboard/${quizId}.json`);
const data = await response.json();
```

### Benefits
- ✅ Each quiz has independent leaderboard
- ✅ Scores never mix between quizzes
- ✅ Can compare performance across weeks
- ✅ Easy to add global leaderboard later (aggregate all quizzes)

---

## Implementation Steps

### Phase 1: Setup & Dependencies

**Step 1.1:** Install React Router
```bash
npm install react-router-dom
```

**Step 1.2:** Create folder structure
```bash
mkdir src/components
mkdir src/quizzes
```

### Phase 2: Extract Quiz Component

**Step 2.1:** Create `components/QuizGame.js`
- Copy all current quiz logic from `App.js`
- Convert to accept props: `{ quizId, quizTitle, questions }`
- Update Firebase paths to include `quizId`
- Export as default

**Step 2.2:** Update state management
- Keep all existing state (screen, playerName, currentQuestion, etc.)
- Add quiz data as props instead of constants

### Phase 3: Create Quiz Data Files

**Step 3.1:** Create `quizzes/week-1-key-sovereignty.js`
- Export quiz object with id, title, description, questions
- Use your current 5 Key Sovereignty questions

**Step 3.2:** Create `quizzes/index.js`
- Import week-1 quiz
- Export `quizzes` object
- Export `currentQuizId`

**Step 3.3:** Create `quizzes/README.md`
- Instructions for adding new quizzes
- Template for quiz files
- Guidelines for quiz IDs

### Phase 4: Implement Routing

**Step 4.1:** Update `App.js`
- Import React Router components
- Import QuizGame component
- Import quizzes registry
- Set up routes

**Step 4.2:** Add route handlers
- `/quiz/:quizId` → QuizGame with quiz data
- `/` → Redirect to current quiz
- `*` → 404 handler

**Step 4.3:** Add URL parameter handling
- Extract `quizId` from URL
- Look up quiz in registry
- Pass quiz data to QuizGame

### Phase 5: Testing

**Step 5.1:** Test locally
```bash
npm start
```

**Step 5.2:** Test scenarios
- Navigate to `/quiz/week-1-key-sovereignty`
- Take quiz, verify leaderboard saves correctly
- Navigate to `/` (should redirect)
- Try invalid URL (should show 404)

**Step 5.3:** Test on dev branch
- Push to `dev` branch
- Check Vercel preview URL
- Verify all routes work in production build

### Phase 6: Deploy

**Step 6.1:** Merge to main
```bash
# In GitHub Desktop:
# 1. Switch to main
# 2. Merge dev into main
# 3. Push
```

**Step 6.2:** Update existing links
- Update any shared links to use new URL format
- `/quiz/week-1-key-sovereignty` instead of just `/`

**Step 6.3:** Verify production
- Check `digi-cert-quiz.vercel.app/quiz/week-1-key-sovereignty`
- Take quiz, verify leaderboard works
- Check Firebase to see new path structure

---

## Adding New Quizzes (Team Instructions)

### For Non-Technical Team Members

**Step 1: Copy the Template**

1. Navigate to `src/quizzes/` folder
2. Copy `week-1-key-sovereignty.js`
3. Rename to `week-{N}-{topic}.js` (e.g., `week-2-certificate-lifecycle.js`)

**Step 2: Update Quiz Content**

Open your new file and update:

```javascript
export default {
  id: "week-2-certificate-lifecycle",  // ← Change this
  title: "Week 2: Certificate Lifecycle",  // ← Change this
  description: "Test your knowledge of certificate management",  // ← Change this
  week: 2,  // ← Change this
  date: "2025-01-19",  // ← Change this
  questions: [
    {
      question: "Your new question here?",  // ← Change these
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: 0  // ← 0 = first option, 1 = second, etc.
    },
    // Add 4-5 questions total
  ]
};
```

**Step 3: Register the Quiz**

Open `src/quizzes/index.js` and add two lines:

```javascript
import week1 from './week-1-key-sovereignty';
import week2 from './week-2-certificate-lifecycle';  // ← Add this line

export const quizzes = {
  'week-1-key-sovereignty': week1,
  'week-2-certificate-lifecycle': week2,  // ← Add this line
};

export const currentQuizId = 'week-2-certificate-lifecycle';  // ← Update this
```

**Step 4: Commit and Deploy**

1. Open GitHub Desktop
2. You'll see your changes in the left panel
3. Write a commit message: "Add Week 2: Certificate Lifecycle quiz"
4. Click "Commit to dev"
5. Click "Push origin"
6. Wait 2 minutes, check Vercel for preview URL
7. Test the quiz: `digi-cert-quiz.vercel.app/quiz/week-2-certificate-lifecycle`
8. When ready, merge dev → main for production

**Step 5: Share the Link**

Your new quiz is live at:
```
https://digi-cert-quiz.vercel.app/quiz/week-2-certificate-lifecycle
```

Share this link via email, Slack, etc.

### Quiz ID Guidelines

**Format:** `week-{number}-{topic-slug}`

**Good Examples:**
- `week-1-key-sovereignty`
- `week-2-certificate-lifecycle`
- `week-3-pki-fundamentals`
- `week-4-code-signing-basics`

**Bad Examples:**
- `Week 1 Key Sovereignty` (no spaces, no capitals)
- `week1` (include topic for clarity)
- `key-sovereignty` (include week number)

**Rules:**
- All lowercase
- Use hyphens, not spaces or underscores
- Include week number
- Include descriptive topic
- Keep it concise but readable

---

## Technical Details

### React Router Configuration

```javascript
// App.js
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import QuizGame from './components/QuizGame';
import { quizzes, currentQuizId } from './quizzes';

function QuizRoute() {
  const { quizId } = useParams();
  const quiz = quizzes[quizId];

  if (!quiz) {
    return (
      <div>
        <h1>Quiz Not Found</h1>
        <p>The quiz "{quizId}" doesn't exist.</p>
        <a href={`/quiz/${currentQuizId}`}>Go to current quiz</a>
      </div>
    );
  }

  return <QuizGame {...quiz} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/quiz/${currentQuizId}`} replace />} />
        <Route path="/quiz/:quizId" element={<QuizRoute />} />
        <Route path="*" element={<Navigate to={`/quiz/${currentQuizId}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### QuizGame Component Props

```javascript
// components/QuizGame.js
export default function QuizGame({ id, title, description, questions }) {
  // All existing quiz logic
  // Update Firebase paths to use `id`

  const DB_URL = firebaseConfig.databaseURL;

  const saveScore = async (name, score) => {
    await fetch(`${DB_URL}/leaderboard/${id}.json`, {  // ← Use quiz id
      method: "POST",
      body: JSON.stringify({ name, score, timestamp: Date.now() })
    });
  };

  const loadLeaderboard = async () => {
    const response = await fetch(`${DB_URL}/leaderboard/${id}.json`);  // ← Use quiz id
    // ...
  };

  // Rest of component unchanged
}
```

### Vercel Configuration

No special configuration needed! React Router works automatically with Vercel because:
- Vercel detects Create React App
- Automatically configures SPA routing
- All routes serve `index.html`
- React Router handles client-side routing

---

## Future Enhancements

### Phase 2: Quiz Archive Page

**Homepage (`/`):**
- List all quizzes with cards
- Show quiz title, description, date
- "Start Quiz" button for each
- Highlight current week's quiz
- Search/filter by topic

**URL:** `digi-cert-quiz.vercel.app/`

### Phase 3: Quiz Categories

Organize quizzes by topic:
- Key Management
- Certificate Lifecycle
- PKI Fundamentals
- Code Signing
- IoT Security

### Phase 4: User Profiles

Track user progress:
- Login system (Firebase Auth)
- Quiz history (which quizzes completed)
- Aggregate scores
- Achievements/badges

### Phase 5: Quiz Analytics

Admin dashboard:
- How many people took each quiz
- Average scores per quiz
- Question difficulty analysis
- Time spent per question

### Phase 6: Dynamic Quiz Management

CMS or admin interface:
- Create quizzes via UI (no code)
- Edit existing quizzes
- Schedule future releases
- A/B test questions

---

## Migration Plan

### Pre-Migration (Current State)

**URL:** `digi-cert-quiz.vercel.app/`
**Shows:** Week 1 Key Sovereignty quiz
**Leaderboard:** `/leaderboard` (flat structure)

### Post-Migration (New Structure)

**URL:** `digi-cert-quiz.vercel.app/quiz/week-1-key-sovereignty`
**Shows:** Same quiz, new URL
**Leaderboard:** `/leaderboard/week-1-key-sovereignty`

### Handling Old Leaderboard Data

**Option A: Migrate Existing Data**
- Copy `/leaderboard` to `/leaderboard/week-1-key-sovereignty`
- Preserve existing scores
- Keep old data for reference

**Option B: Start Fresh**
- Leave old leaderboard at `/leaderboard`
- New structure starts clean
- Less complexity

**Recommendation:** Option A (migrate) to preserve user scores

### Communication Plan

**Internal Team:**
- Share this document
- Demo the new workflow
- Update any internal links

**External Users:**
- Old links to homepage will redirect to Week 1 quiz
- Share new specific quiz URLs going forward
- No disruption to user experience

---

## Key Benefits

### For Users
- ✅ Can revisit old quizzes anytime
- ✅ Consistent quiz experience
- ✅ Clear leaderboard per quiz
- ✅ Shareable quiz links

### For Content Team
- ✅ Easy to add new quizzes (copy/paste file)
- ✅ No code expertise required
- ✅ Safe (can't break old quizzes)
- ✅ Preview before production (dev branch)

### For Development
- ✅ Clean separation of concerns
- ✅ Scalable architecture
- ✅ Easy to add features later
- ✅ Type-safe quiz data structure

### For Maintenance
- ✅ Each quiz is independent
- ✅ Easy to fix individual quizzes
- ✅ No tangled dependencies
- ✅ Clear file organization

---

## Questions & Answers

### Q: What happens to the current production URL?
**A:** The root URL (`digi-cert-quiz.vercel.app/`) will redirect to the current quiz. Week 1 will now be at `/quiz/week-1-key-sovereignty`.

### Q: Can we change old quizzes after they're deployed?
**A:** Yes! Just edit the quiz file and redeploy. The URL stays the same, content updates.

### Q: What if we want to retire/hide an old quiz?
**A:** Remove it from the `quizzes` registry in `index.js`. The file stays for reference but URL becomes inactive.

### Q: How do we handle quiz versioning if we fix errors?
**A:** Just update the quiz file and redeploy. Consider adding a `version` field to track updates.

### Q: Can we have quizzes with different numbers of questions?
**A:** Yes! Each quiz can have any number of questions. The component handles it dynamically.

### Q: What if we want to change the timer or scoring?
**A:** Those are currently global constants. Future enhancement: make them per-quiz configurable.

### Q: How do we test quizzes before making them public?
**A:** Use the dev branch workflow. Push to dev, get preview URL, test, then merge to main when ready.

### Q: Can we schedule quizzes to go live automatically?
**A:** Not yet. Currently requires manual deployment. Future enhancement: add scheduling system.

---

## Getting Help

### During Implementation
- Ask questions in Slack/Teams
- Refer to this document
- Check `src/quizzes/README.md` for quick reference

### After Implementation
- For adding quizzes: See "Adding New Quizzes" section above
- For bugs: Create GitHub issue
- For features: Discuss with team, update this plan

### Resources
- React Router Docs: https://reactrouter.com/
- Firebase REST API: https://firebase.google.com/docs/database/rest/start
- Create React App: https://create-react-app.dev/

---

## Timeline Estimate

**Phase 1 (Setup):** 15 minutes
- Install dependencies
- Create folders

**Phase 2 (Extract Component):** 30-45 minutes
- Move quiz logic to QuizGame component
- Test locally

**Phase 3 (Quiz Data Files):** 20 minutes
- Create quiz data structure
- Set up registry

**Phase 4 (Routing):** 30-45 minutes
- Implement React Router
- Handle URL parameters
- Test routes

**Phase 5 (Testing):** 30 minutes
- Test locally
- Test on dev branch
- Fix any issues

**Phase 6 (Deploy):** 10 minutes
- Merge to main
- Verify production

**Total Time:** 2.5 - 3 hours

---

## Success Criteria

Implementation is complete when:

- ✅ Week 1 quiz accessible at `/quiz/week-1-key-sovereignty`
- ✅ Homepage redirects to current quiz
- ✅ Leaderboard saves to quiz-specific path
- ✅ Can add new quiz by copying file
- ✅ All routes work in production
- ✅ No broken functionality from current version
- ✅ Team can follow instructions to add quizzes
- ✅ Documentation is clear and complete

---

**Document Version:** 1.0
**Created:** 2025-01-12
**Last Updated:** 2025-01-12
**Author:** Claude (AI Assistant)
**Maintained By:** DigiCert Quiz Team
