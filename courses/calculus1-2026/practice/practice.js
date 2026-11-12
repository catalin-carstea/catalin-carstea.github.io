"use strict";

const sessionLength = 10;
const byId = (id) => document.getElementById(id);
let bank = [];
let questions = [];
let answers = [];
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
  questions = items.map((q) => ({ ...q, choices: shuffled(q.choices) }));
  answers = Array(items.length).fill(null);
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

  const choices = byId("choices");
  choices.replaceChildren();
  for (const choice of question.choices) {
    const label = document.createElement("label");
    label.className = "choice";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = choice.id;
    radio.required = true;
    radio.checked = answers[current] === choice.id;
    const text = document.createElement("span");
    text.className = "math-text";
    renderMathText(text, choice.text);
    label.append(radio, text);
    choices.append(label);
  }

  byId("previous").hidden = current === 0;
  byId("next").textContent = current === questions.length - 1 ? "Check answers" : "Next question";
  byId("position").focus();
}

function missedQuestions() {
  return questions.filter((q, index) => answers[index] !== q.correct_choice_id);
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
  const choiceText = (id) => question.choices.find((choice) => choice.id === id).text;

  for (const [label, value] of [
    ["Your answer", choiceText(answers[index])],
    ["Correct answer", choiceText(question.correct_choice_id)],
    ["Worked solution", question.solution]
  ]) {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.className = "math-text";
    renderMathText(description, value);
    details.append(term, description);
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
    if (answers[i] !== question.correct_choice_id) addReview(question, i);
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

byId("choices").addEventListener("change", (event) => {
  answers[current] = event.target.value;
});

byId("previous").addEventListener("click", () => {
  current--;
  showQuestion();
});

byId("answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
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
