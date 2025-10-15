import React, { useEffect, useState, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Trophy } from "lucide-react";
import { DB_URL } from "../services/firebaseConfig";
import { getValidAuth } from "../services/firebaseAuth";

// Simple name validation (2–30 allowed characters)
const NAME_REGEX = /^[A-Za-z0-9 .,'_-]{2,30}$/;
const TROPHY_COLORS = ["text-yellow-500", "text-gray-400", "text-orange-500"];
const sanitizeName = (s) => s.trim().replace(/\s+/g, " ");

const SCREEN_BACKGROUND_STYLE = {
  backgroundImage:
    'url("/images/quiz_background2.png"), linear-gradient(to bottom right, #3b82f6, #9333ea)',
  backgroundRepeat: "no-repeat, no-repeat",
  backgroundAttachment: "fixed, fixed",
  backgroundPosition: "top left, center",
  backgroundSize: "auto, cover",
};

export default function QuizGame({ quizId, title, questions, maxTime = 180 }) {
  const [screen, setScreen] = useState("intro");
  const [playerName, setPlayerName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [finalScoreValue, setFinalScoreValue] = useState(null);

  // Load leaderboard for this quiz
  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${DB_URL}/leaderboard/${quizId}.json?t=${Date.now()}`;
      const response = await fetch(url, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const entries = data && typeof data === 'object' ? Object.values(data) : [];
        // Log count for troubleshooting
        try { console.debug('[leaderboard]', quizId, 'entries:', entries.length); } catch (_) {}
        const leaderboardArray = entries.sort(
          (a, b) => (b.score - a.score) || (b.timestamp - a.timestamp)
        );
        setLeaderboard(leaderboardArray);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError(
        "Failed to load leaderboard. Please check your Firebase configuration."
      );
      setLoading(false);
    }
  }, [quizId]);

  // Save score for this quiz
  const saveScore = async (name, score) => {
    try {
      // Prevent obvious repeat submissions per quiz (client-side guard)
      try {
        if (
          typeof localStorage !== "undefined" &&
          localStorage.getItem(`submitted:${quizId}`)
        ) {
          return;
        }
      } catch (_) {}

      // Clamp score to a safe maximum
      const maxPossible = maxTime * questions.length;
      const safeScore = Math.max(0, Math.min(score, maxPossible));

      // Ensure authenticated uid and token for protected write
      const { idToken, uid } = await getValidAuth();

      const newEntry = {
        name: name,
        score: safeScore,
        // Use server timestamp to avoid client clock skew
        timestamp: { ".sv": "timestamp" },
      };

      const response = await fetch(
        `${DB_URL}/leaderboard/${quizId}/${uid}.json?auth=${encodeURIComponent(idToken)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        }
      );

      if (response.ok) {
        await loadLeaderboard();
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(`submitted:${quizId}`, "1");
            setAlreadySubmitted(true);
          }
        } catch (_) {}
      } else {
        try {
          const errText = await response.text();
          console.error("Save failed:", response.status, errText);
        } catch (_) {}
        setError("Could not save score. Please try again.");
      }
    } catch (err) {
      console.error("Error saving score:", err);
      setError(
        "Failed to save score. Please check your Firebase configuration."
      );
    }
  };

  useEffect(() => {
    if (screen === "intro" || screen === "leaderboard") {
      loadLeaderboard();
    }
  }, [screen, loadLeaderboard]);

  // Detect if the user has already submitted a score for this quiz
  useEffect(() => {
    try {
      const flag = typeof localStorage !== "undefined" && localStorage.getItem(`submitted:${quizId}`);
      setAlreadySubmitted(Boolean(flag));
    } catch (_) {
      setAlreadySubmitted(false);
    }
  }, [quizId]);

  // Also check server for an existing record for this device's anonymous UID
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { uid } = await getValidAuth();
        if (cancelled) return;
        const res = await fetch(`${DB_URL}/leaderboard/${quizId}/${uid}.json`, {
          cache: "no-store",
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data) setAlreadySubmitted(true);
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [quizId]);

  // Note: name uniqueness validation is performed on Start to avoid blocking typing

  useEffect(() => {
    if (screen === "question" && !showFeedback && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, showFeedback, timeLeft]);

  const handleStart = () => {
    const clean = sanitizeName(playerName);
    if (!NAME_REGEX.test(clean)) {
      setError("Please enter a valid name (2–30 characters).");
      return;
    }
    // Prevent using an existing leaderboard name (case-insensitive exact match)
    const taken = leaderboard.some(
      (e) => sanitizeName(e.name || "").toLowerCase() === clean.toLowerCase()
    );
    if (taken) {
      setError(
        "That display name is already on the leaderboard. Please make it unique (e.g., 'Chuck J.' or 'Chuck Jones')."
      );
      return;
    }
    setPlayerName(clean);
    setScreen("question");
    setTimeLeft(maxTime);
    setError("");
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setTotalScore((prev) => prev + timeLeft);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(maxTime);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // Final score already includes the last question if correct
      const finalScore = totalScore;
      setFinalScoreValue(finalScore);
      await saveScore(playerName, finalScore);
      setScreen("leaderboard");
    }
  };

  const handleRestart = () => {
    setScreen("intro");
    setPlayerName("");
    setCurrentQuestion(0);
    setTimeLeft(maxTime);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setTotalScore(0);
    setError("");
    setFinalScoreValue(null);
  };

  if (screen === "intro") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={SCREEN_BACKGROUND_STYLE}
      >
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <img
              src="/images/digicert-blue-logo-large.jpg"
              alt="DigiCert"
              className="h-16 mx-auto mb-4 object-contain"
            />
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "#0e75ba" }}
            >
              {title}
            </h1>
            <p className="text-gray-600">This week's quiz focuses on <b>key sovereignty</b></p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {alreadySubmitted && (
            <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              You’ve already played this quiz. Thanks for participating! You can view the leaderboard below.
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-6 mb-6 shadow-lg">
            <div className="md:flex md:items-center">
              <div className="md:flex-1 md:pr-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">How It Works:</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Each question starts with {maxTime} points</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>You lose 1 point per second, so answer quickly!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Only correct answers earn points</span>
                  </li>
                </ul>
              </div>
              <div className="hidden lg:flex lg:pl-6 justify-end">
                <img
                  src="/images/quiz_icon.png"
                  alt="Quiz icon"
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
          </div>

          {leaderboard.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">This Week's High Scores:</h3>
              <div className="space-y-1">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 items-center bg-white rounded-lg px-4 py-3 text-sm"
                    style={{ gridTemplateColumns: "1fr auto auto" }}
                  >
                    <span className="text-blue-600 font-bold text-base md:text-lg">
                      {index + 1}. {entry.name}
                    </span>
                    <span className="font-semibold text-blue-600 text-base md:text-lg pr-4 md:pr-6">
                      {entry.score}
                    </span>
                    <Trophy
                      className={`w-9 h-9 ${TROPHY_COLORS[index] ?? "text-blue-400"} justify-self-center`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name to start"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={alreadySubmitted}
            />
            <button
              onClick={handleStart}
              disabled={!playerName.trim() || alreadySubmitted}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Quiz
            </button>
            <button
              onClick={() => { setFinalScoreValue(null); setScreen("leaderboard"); }}
              className="w-full border-2 border-blue-600 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
            >
              View the leaderboard top 10
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "question") {
    const question = questions[currentQuestion];
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={SCREEN_BACKGROUND_STYLE}
      >
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-800">Time Left: {timeLeft}s</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">Score: {totalScore}</span>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && setSelectedAnswer(index)}
                disabled={showFeedback}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"} ${
                  showFeedback && index === question.correctAnswer
                    ? "bg-green-50 border-green-500"
                    : ""
                } ${
                  showFeedback && selectedAnswer === index && !isCorrect
                    ? "bg-red-50 border-red-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center gap-3 text-center">
                  <span className="text-gray-800 text-center">{option}</span>
                  {showFeedback && index === question.correctAnswer && (
                    <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                  )}
                  {showFeedback && selectedAnswer === index && !isCorrect && (
                    <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              {isCorrect ? (
                <p className="text-green-700">
                  You earned <span className="font-bold">{timeLeft}</span> points!
                </p>
              ) : (
                <p className="text-red-700">
                  The correct answer was: <span className="font-bold">{question.options[question.correctAnswer]}</span>
                </p>
              )}
            </div>
          )}

          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || timeLeft === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "leaderboard") {
    const currentPlayerEntry =
      finalScoreValue != null && playerName
        ? leaderboard.find((entry) => entry.name === playerName && entry.score === finalScoreValue)
        : null;

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={SCREEN_BACKGROUND_STYLE}
      >
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-300 text-red-800">
              {error}
            </div>
          )}
          <div className="text-center mb-8">
            <img
              src="/images/digicert-blue-logo-large.jpg"
              alt="DigiCert"
              className="h-20 mx-auto mb-4 object-contain"
            />
            {finalScoreValue != null && playerName && (
              <>
                <h1 className="text-4xl font-bold" style={{ color: "#0e75ba" }}>Quiz Complete!</h1>
                <p className="text-xl text-gray-600">
                  {playerName}, your final score: <span className="font-bold text-blue-600">{finalScoreValue}</span>
                </p>
              </>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-2xl font-bold"
                style={{ color: "#0e75ba" }}
              >
                Global Leaderboard
              </h2>
              <div className="flex items-center">
                <button
                  onClick={loadLeaderboard}
                  className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {loading ? (
                <p className="text-center text-gray-600">Loading leaderboard...</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-gray-600">Be the first to play!</p>
              ) : (
                leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.timestamp === currentPlayerEntry?.timestamp ? "bg-blue-100 border-2 border-blue-500" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-orange-600" : "text-gray-500"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{entry.name}</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{entry.score}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Return to Start
          </button>
        </div>
      </div>
    );
  }

  return null;
}
