"use strict";

const sessionLength = 10;
const byId = (id) => document.getElementById(id);
let bank = [];
let questions = [];
let current = 0;

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
    const topics = new Map();
    for (const question of bank) {
      topics.set(question.topic, (topics.get(question.topic) || 0) + 1);
    }
    for (const [topic, count] of topics) {
      if (count >= sessionLength) byId("topic").add(new Option(topic, topic));
    }
    byId("setup-form").hidden = false;
    status.textContent = "";
  } catch {
    status.textContent = "Practice could not load. Reload the page to try again.";
  }
}

function startSession(items) {
  questions = items.map((q) => ({ ...q, choices: shuffled(q.choices), selectedIds: [] }));
  current = 0;
  showView("quiz");
  showQuestion();
}

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
    [question.selectedIds.length === 1 ? "Your answer" : "Your answers", choiceTexts(question.selectedIds)],
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

function showResults() {
  const missed = missedQuestions().length;
  byId("score").textContent = `${questions.length - missed} of ${questions.length} correct`;
  byId("result-note").textContent = missed ? "Review the questions you missed below." : "You answered every question correctly.";
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
  const pool = topic ? bank.filter((q) => q.topic === topic) : bank;
  startSession(shuffled(pool).slice(0, sessionLength));
});

byId("choices").addEventListener("change", () => {
  byId("choices").querySelector("input").setCustomValidity("");
  questions[current].selectedIds = new FormData(byId("answer-form")).getAll("answer");
});

byId("previous").addEventListener("click", () => {
  current--;
  showQuestion();
});

byId("answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
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
    showQuestion();
  }
});

byId("retry").addEventListener("click", () => startSession(missedQuestions()));
byId("new-session").addEventListener("click", () => {
  showView("setup");
  byId("setup-title").focus();
});

loadBank();
