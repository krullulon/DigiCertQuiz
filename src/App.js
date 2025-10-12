import React, { useState, useEffect } from "react";
import { Clock, Trophy, CheckCircle, XCircle } from "lucide-react";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1yq_R7RJF25bYpAAtxIeVz_t-V-BJcUk",
  authDomain: "digicert-product-quiz.firebaseapp.com",
  databaseURL: "https://digicert-product-quiz-default-rtdb.firebaseio.com",
  projectId: "digicert-product-quiz",
  storageBucket: "digicert-product-quiz.firebasestorage.app",
  messagingSenderId: "991829115649",
  appId: "1:991829115649:web:194bc1beab20a5f6011100",
  measurementId: "G-L5GNC3T94X",
};

// Per-quiz identifier for leaderboard partitioning
const QUIZ_ID = "week-1-key-sovereignty";

// Simple name validation (2–30 allowed characters)
const NAME_REGEX = /^[A-Za-z0-9 .,'_-]{2,30}$/;
const sanitizeName = (s) => s.trim().replace(/\s+/g, " ");

const QUESTIONS = [
    {
    question: "What best defines key sovereignty?",
    options: ["The right of an organization to choose any cloud provider it wants", "The principle that organizations must retain full control and ownership of their cryptographic keys, without reliance on external jurisdictions", "The process of backing up encryption keys to multiple cloud regions for redundancy", "The practice of sharing encryption keys between partner organizations to ensure interoperability"],
    correctAnswer: 1,
  },
  {
    question: "Why is key sovereignty important for global organizations?",
    options: ["It helps reduce the cost of encryption hardware", "It allows data to be encrypted across multiple clouds", "It ensures compliance with data privacy laws and prevents unauthorized access by foreign entities", "It simplified password management for employees"],
    correctAnswer: 2,
  },
  {
    question: "What is the best DigiCert solution to provide key sovereignty for customers?",
    options: [
      "On-prem DC1: entire DigiCert ONE hosted by customer on premise",
      "Regional DC1: entire DigiCert ONE hosted in regional cloud",
      "On-prem hybrid: on-prem private CA for certificate issuance & DigiCert ONE hosted DC1 visibility and management",
      "None of the above",
    ],
    correctAnswer: 2,
  },
  {
    question: "Which of the following supports key sovereignty?",
    options: [
      "Using a cloud provider's default encryption keys",
      "Storing keys in Hardware Security Modules (HSMs) controlled by the customer",
      "Allowing third parties to rotate encryption keys automatically",
      "Sharing encryption keys with the cloud provider for backup",
        ],
    correctAnswer: 1,
  },
  {
    question: "What is DigiCert's position on offering private CA to customers",
    options: ["Always offer our multi-tenant SaaS private CA", "Always offer our On-Prem CA", "Always lead with multi-tenant SaaS private CA but offer On-Prem CA if key sovereignty is a deal-breaker", "Present both options to the customer: multi-tenant SaaS private CA and On-Prem CA Hybrid"],
    correctAnswer: 2
  }
];

const MAX_TIME = 180;
const DB_URL = firebaseConfig.databaseURL;

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [playerName, setPlayerName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load leaderboard from Firebase
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${DB_URL}/leaderboard/${QUIZ_ID}.json`);
      if (response.ok) {
        const data = await response.json();
        const values = data ? Object.values(data) : [];
        const leaderboardArray = values.sort(
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
  };

  // Save score to Firebase
  const saveScore = async (name, score) => {
    try {
      // Optional gentle friction: prevent repeat submissions per quiz
      try {
        if (typeof localStorage !== "undefined" && localStorage.getItem(`submitted:${QUIZ_ID}`)) {
          return; // Already submitted; allow play but don't save again
        }
      } catch (_) {}

      // Clamp score to a safe maximum
      const maxPossible = MAX_TIME * QUESTIONS.length;
      const safeScore = Math.max(0, Math.min(score, maxPossible));

      const newEntry = {
        name: name,
        score: safeScore,
        // Use server timestamp to avoid client tampering
        timestamp: { ".sv": "timestamp" },
        quizId: QUIZ_ID,
      };

      const response = await fetch(`${DB_URL}/leaderboard/${QUIZ_ID}.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        await loadLeaderboard();
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(`submitted:${QUIZ_ID}`, "1");
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error("Error saving score:", err);
      setError(
        "Failed to save score. Please check your Firebase configuration."
      );
    }
  };

  useEffect(() => {
    if (screen === "intro") {
      loadLeaderboard();
    }
  }, [screen]);

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
    setPlayerName(clean);
    setScreen("question");
    setTimeLeft(MAX_TIME);
    setError("");
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === QUESTIONS[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setTotalScore((prev) => prev + timeLeft);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(MAX_TIME);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      const finalScore = totalScore + (isCorrect ? timeLeft : 0);
      await saveScore(playerName, finalScore);
      setScreen("leaderboard");
    }
  };

  const handleRestart = () => {
    setScreen("intro");
    setPlayerName("");
    setCurrentQuestion(0);
    setTimeLeft(MAX_TIME);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setTotalScore(0);
    setError("");
  };

  if (screen === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              DigiCert Weekly Product Quiz #1
            </h1>
            <p className="text-gray-600">
              Test your knowledge against the clock!
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              How It Works:
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Each question starts with 180 points (3 minutes)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>You lose 1 point per second, so answer quickly!</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Only correct answers earn points</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Compete for the top spot on the leaderboard</span>
              </li>
            </ul>
          </div>

          {leaderboard.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                Current Top 3:
              </h3>
              <div className="space-y-1">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {index + 1}. {entry.name}
                    </span>
                    <span className="font-bold text-blue-600">
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Enter Your Name:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStart()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              placeholder="Your name here..."
              maxLength={30}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!playerName.trim() || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Start Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "question") {
    const question = QUESTIONS[currentQuestion];
    const progress = (currentQuestion / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                Total Score: {totalScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg ${
                timeLeft > 60
                  ? "bg-green-100"
                  : timeLeft > 30
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              <Clock
                className={`w-6 h-6 ${
                  timeLeft > 60
                    ? "text-green-600"
                    : timeLeft > 30
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              />
              <span
                className={`text-2xl font-bold ${
                  timeLeft > 60
                    ? "text-green-700"
                    : timeLeft > 30
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {timeLeft} points
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && setSelectedAnswer(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"} ${
                  showFeedback && index === question.correctAnswer
                    ? "border-green-600 bg-green-50"
                    : ""
                } ${
                  showFeedback && selectedAnswer === index && !isCorrect
                    ? "border-red-600 bg-red-50"
                    : ""
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                isCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <span
                  className={`font-bold ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              {isCorrect && (
                <p className="text-green-700">
                  You earned <span className="font-bold">{timeLeft}</span>{" "}
                  points!
                </p>
              )}
              {!isCorrect && (
                <p className="text-red-700">
                  The correct answer was:{" "}
                  <span className="font-bold">
                    {question.options[question.correctAnswer]}
                  </span>
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
              {currentQuestion < QUESTIONS.length - 1
                ? "Next Question"
                : "View Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "leaderboard") {
    const currentPlayerEntry = leaderboard.find(
      (entry) =>
        entry.name === playerName &&
        entry.score === totalScore + (isCorrect ? timeLeft : 0)
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Quiz Complete!
            </h1>
            <p className="text-xl text-gray-600">
              {playerName}, your final score:{" "}
              <span className="font-bold text-blue-600">
                {totalScore + (isCorrect ? timeLeft : 0)}
              </span>
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Global Leaderboard
            </h2>
            <div className="space-y-2">
              {loading ? (
                <p className="text-center text-gray-600">
                  Loading leaderboard...
                </p>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-gray-600">
                  Be the first to play!
                </p>
              ) : (
                leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.timestamp === currentPlayerEntry?.timestamp
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-2xl font-bold ${
                          index === 0
                            ? "text-yellow-500"
                            : index === 1
                            ? "text-gray-400"
                            : index === 2
                            ? "text-orange-600"
                            : "text-gray-500"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {entry.score}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
