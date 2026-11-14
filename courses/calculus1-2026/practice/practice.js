"use strict";

const sessionLength = 5;
const timeLimit = 30 * 60 * 1000;
const storageKey = "calculus1-2026-timed-practice";
const byId = (id) => document.getElementById(id);
let bank = [];
let questions = [];
let current = 0;
let deadline = 0;
let timer;
let runId;
let runKind;

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Keep prose as text nodes, including inequalities and other literal markup.
function renderMathText(element, source) {
  element.replaceChildren();
  const delimiters = /(\$\$|\$)([\s\S]*?)\1/g;
  let offset = 0;
  for (const match of source.matchAll(delimiters)) {
    element.append(source.slice(offset, match.index));
    const span = document.createElement("span");
    katex.render(match[2], span, { displayMode: match[1] === "$$", throwOnError: false });
    element.append(span);
    offset = match.index + match[0].length;
  }
  element.append(source.slice(offset));
}

function showView(id) {
  for (const view of ["setup", "quiz", "results"]) {
    byId(view).hidden = view !== id;
  }
}

async function loadBank() {
  const status = byId("load-status");
  status.textContent = "Loading questions…";
  try {
    const response = await fetch("questions.json");
    if (!response.ok) throw new Error("Question bank unavailable");
    const data = await response.json();
    if (!window.katex || data.questions.length < sessionLength) {
      throw new Error("Practice resources unavailable");
    }
    bank = data.questions;
    if (coveredQuestions(bank).length >= sessionLength) {
      byId("topic").add(new Option(`Covered in class (${coverageThrough})`, "covered"));
    }
    const topics = new Map();
    for (const question of bank) {
      topics.set(question.topic, (topics.get(question.topic) || 0) + 1);
    }
    for (const [topic, count] of topics) {
      if (count >= sessionLength) byId("topic").add(new Option(topic, topic));
    }
    byId("setup-form").hidden = false;
    status.textContent = "";
    restoreTimedSession();
  } catch {
    status.textContent = "Practice could not load. Reload the page to try again.";
  }
}

function startSession(items, timed = false, kind = "practice") {
  runId = crypto.randomUUID();
  runKind = kind;
  questions = items.map((q) => ({ ...q, choices: shuffled(q.choices), selectedIds: [] }));
  current = 0;
  deadline = timed ? Date.now() + timeLimit : 0;
  saveTimedSession();
  openQuiz();
}

function saveTimedSession() {
  if (!deadline) return;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      deadline, current, runId, topic: byId("topic").value,
      questions: questions.map((q) => ({
        id: q.id, choices: q.choices.map((choice) => choice.id), selectedIds: q.selectedIds
      }))
    }));
  } catch { /* The countdown still runs when tab storage is unavailable. */ }
}

function restoreTimedSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (!saved || !Number.isFinite(saved.deadline) || saved.questions.length !== sessionLength ||
        !Number.isInteger(saved.current) || saved.current < 0 || saved.current >= sessionLength) return;
    const restored = saved.questions.map((item) => {
      const question = bank.find((q) => q.id === item.id);
      const choices = item.choices.map((id) => question.choices.find((choice) => choice.id === id));
      if (choices.some((choice) => !choice) || choices.length !== question.choices.length) {
        throw new Error("Question choices have changed");
      }
      return { ...question, choices, selectedIds: item.selectedIds.filter((id) => item.choices.includes(id)) };
    });
    questions = restored;
    runId = saved.runId || crypto.randomUUID();
    runKind = "practice";
    current = saved.current;
    deadline = saved.deadline;
    byId("topic").value = saved.topic;
    byId("timed").checked = true;
  } catch { return; }
  openQuiz();
}

function openQuiz() {
  showView("quiz");
  byId("countdown").hidden = !deadline;
  if (deadline) {
    if (updateCountdown()) return;
    timer = window.setInterval(updateCountdown, 500);
  }
  showQuestion();
}

// Use the deadline even when a background tab or sleeping phone delays a tick.
function updateCountdown() {
  if (!deadline) return false;
  const seconds = Math.ceil((deadline - Date.now()) / 1000);
  if (seconds <= 0) {
    showResults(true);
    return true;
  }
  const minutes = Math.floor(seconds / 60);
  byId("countdown").textContent = `Time left ${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  return false;
}

document.addEventListener("visibilitychange", updateCountdown);
window.addEventListener("pageshow", updateCountdown);

function showQuestion() {
  const question = questions[current];
  byId("position").textContent = `Question ${current + 1} of ${questions.length}`;
  byId("progress").max = questions.length;
  byId("progress").value = current + 1;
  byId("question-topic").textContent = question.topic;
  renderMathText(byId("prompt"), question.prompt);

  const multiple = question.type === "multiple";
  byId("answer-instruction").textContent = multiple ? "Select all that apply." : "Select one answer.";
  const choices = byId("choices");
  choices.replaceChildren();
  for (const choice of question.choices) {
    const label = document.createElement("label");
    label.className = "choice";
    const input = document.createElement("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = "answer";
    input.value = choice.id;
    input.required = !multiple;
    input.checked = question.selectedIds.includes(choice.id);
    const text = document.createElement("span");
    text.className = "math-text";
    renderMathText(text, choice.text);
    label.append(input, text);
    choices.append(label);
  }

  byId("previous").hidden = current === 0;
  byId("next").textContent = current === questions.length - 1 ? "Check answers" : "Next question";
  byId("position").focus();
}

function correctIds(question) {
  return question.type === "multiple" ? question.correct_choice_ids : [question.correct_choice_id];
}

function isCorrect(question) {
  const expected = correctIds(question);
  return question.selectedIds.length === expected.length &&
    expected.every((id) => question.selectedIds.includes(id));
}

function missedQuestions() {
  return questions.filter((question) => !isCorrect(question));
}

function addReview(question, index) {
  const item = document.createElement("article");
  item.className = "review-item";
  const heading = document.createElement("h3");
  heading.textContent = `Question ${index + 1} · ${question.topic}`;
  const prompt = document.createElement("p");
  prompt.className = "review-prompt math-text";
  renderMathText(prompt, question.prompt);
  const details = document.createElement("dl");
  details.className = "review-answers";
  const choiceTexts = (ids) => question.choices.filter((choice) => ids.includes(choice.id)).map((choice) => choice.text);
  const expected = correctIds(question);

  for (const [label, values] of [
    [question.selectedIds.length > 1 ? "Your answers" : "Your answer",
      question.selectedIds.length ? choiceTexts(question.selectedIds) : ["Unanswered"]],
    [expected.length === 1 ? "Correct answer" : "Correct answers", choiceTexts(expected)],
    ["Worked solution", [question.solution]]
  ]) {
    const term = document.createElement("dt");
    term.textContent = label;
    details.append(term);
    for (const value of values) {
      const description = document.createElement("dd");
      description.className = "math-text";
      renderMathText(description, value);
      details.append(description);
    }
  }
  item.append(heading, prompt, details);
  byId("review").append(item);
}

function showResults(expired = false) {
  if (!runId) return;
  const mode = deadline ? "timed" : "untimed";
  const completedAt = new Date(expired ? deadline : Date.now()).toISOString();
  const missed = missedQuestions().length;
  runLog.record({
    id: runId, completedAt, correct: questions.length - missed, total: questions.length,
    kind: runKind, mode, finish: expired ? "time_limit" : "submitted"
  });
  runId = null;
  clearInterval(timer);
  if (deadline) {
    deadline = 0;
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage may be unavailable. */ }
  }
  byId("score").textContent = `${questions.length - missed} of ${questions.length} correct`;
  const feedback = missed ? "Review the questions you missed below." : "You answered every question correctly.";
  byId("result-note").textContent = expired ? `Time is up. ${feedback}` : feedback;
  byId("retry").hidden = missed === 0;
  byId("review").replaceChildren();
  questions.forEach((question, i) => {
    if (!isCorrect(question)) addReview(question, i);
  });
  showView("results");
  byId("score").focus();
}

byId("setup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const topic = byId("topic").value;
  let pool = bank;
  if (topic === "covered") pool = coveredQuestions(bank);
  else if (topic) pool = bank.filter((q) => q.topic === topic);
  startSession(shuffled(pool).slice(0, sessionLength), byId("timed").checked);
});

byId("choices").addEventListener("change", () => {
  if (updateCountdown() || byId("quiz").hidden) return;
  byId("choices").querySelector("input").setCustomValidity("");
  questions[current].selectedIds = new FormData(byId("answer-form")).getAll("answer");
  saveTimedSession();
});

byId("previous").addEventListener("click", () => {
  if (updateCountdown() || byId("quiz").hidden) return;
  current--;
  saveTimedSession();
  showQuestion();
});

byId("answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (updateCountdown() || byId("quiz").hidden) return;
  if (questions[current].selectedIds.length === 0) {
    const firstChoice = byId("choices").querySelector("input");
    firstChoice.setCustomValidity("Select at least one answer.");
    firstChoice.reportValidity();
    return;
  }
  if (current === questions.length - 1) {
    showResults();
  } else {
    current++;
    saveTimedSession();
    showQuestion();
  }
});

byId("retry").addEventListener("click", () => startSession(missedQuestions(), false, "retry"));
byId("new-session").addEventListener("click", () => {
  showView("setup");
  byId("setup-title").focus();
});

loadBank();
