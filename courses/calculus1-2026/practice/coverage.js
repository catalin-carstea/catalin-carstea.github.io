"use strict";

// Generated from confirmed Calculus teaching records.
const coverageThrough = "Lecture 17 · Nov 12";
const coveredTopics = new Set([
  "Exponential, logarithmic and inverse functions",
  "Finite and one-sided limits",
  "Limit definitions and proofs",
  "Continuity and the Intermediate Value Theorem",
  "Asymptotes and L’Hôpital’s rule",
  "Derivatives, linear approximation and differentials",
  "Differentiation rules and composition",
  "Implicit, inverse and logarithmic differentiation",
  "Extrema and the Mean Value Theorem",
  "Monotonicity, concavity and curve sketching",
  "Antiderivatives and net change",
  "Riemann sums and integrability",
  "Definite integrals and their properties",
  "Fundamental Theorem of Calculus",
  "Integration by substitution",
  "Areas between curves",
  "Volumes by cross-sections, disks and washers",
  "Cylindrical shells",
  "Integration by parts"
]);
// End of generated coverage.

// Some questions also use a technique outside their primary topic.
const additionalPrerequisites = {
  "Trigonometric integrals": [
    "calc1-definite-integrals-003", "calc1-definite-integrals-020",
    "calc1-cross-sections-006", "calc1-multi-parts-014", "nycu-calc1-101-s09",
    "nycu-calc1-105-s08", "nycu-calc1-107-s10", "nycu-calc1-112-s05", "nycu-calc1-114-s05"
  ],
  "Improper integrals": [
    "calc1-parts-019", "calc1-multi-substitution-005", "calc1-multi-washers-015",
    "calc1-multi-shells-019", "calc1-multi-parts-015", "nycu-calc1-95-s09",
    "nycu-calc1-102-s04", "nycu-calc1-109-s07", "nycu-calc1-109-s10",
    "nycu-calc1-109-m14", "nycu-calc1-110-s02"
  ]
};

function coveredQuestions(questions) {
  const deferred = new Set(Object.entries(additionalPrerequisites)
    .filter(([topic]) => !coveredTopics.has(topic))
    .flatMap(([, ids]) => ids));
  return questions.filter((q) => coveredTopics.has(q.topic) && !deferred.has(q.id));
}
