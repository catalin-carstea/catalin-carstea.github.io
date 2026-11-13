#!/usr/bin/env python3
"""Refresh the static practice snapshot from the Fall 2026 course records."""
import argparse
import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
COURSE = SITE.parent / "Calculus"
OUTPUT = SITE / "courses/calculus1-2026/practice/coverage.js"
END_MARKER = "// End of generated coverage.\n"

# Each question-bank topic requires all of the corresponding checklist rows.
REQUIREMENTS = {
    "Exponential, logarithmic and inverse functions": "F01 F02 F03",
    "Finite and one-sided limits": "L01 L02",
    "Limit definitions and proofs": "L03 P01 P02 P03 P04 P05 P06 P07 P08 P09",
    "Continuity and the Intermediate Value Theorem": "L04 L05",
    "Asymptotes and L’Hôpital’s rule": "L06 A04",
    "Derivatives, linear approximation and differentials": "D01 D02 D09",
    "Differentiation rules and composition": "D03 D04 D05 D06",
    "Implicit, inverse and logarithmic differentiation": "D07 D08",
    "Extrema and the Mean Value Theorem": "A01 A02",
    "Monotonicity, concavity and curve sketching": "A03 A05",
    "Antiderivatives and net change": "A06 I04",
    "Riemann sums and integrability": "I01 I02",
    "Definite integrals and their properties": "I02",
    "Fundamental Theorem of Calculus": "I03",
    "Integration by substitution": "I05",
    "Areas between curves": "G01",
    "Volumes by cross-sections, disks and washers": "G02",
    "Cylindrical shells": "G03",
    "Integration by parts": "T01",
    "Trigonometric integrals": "T02",
    "Trigonometric substitution": "T03",
    "Partial fractions": "T04",
    "Improper integrals": "T05",
    "Arc length": "G04",
    "Surface area of revolution": "G05",
}


def snapshot():
    log = (COURSE / "TEACHING_LOG.md").read_text(encoding="utf-8")
    headings = {
        int(number): title for number, title in
        re.findall(r"^## L(\d+)\s+—\s+(.+)$", log, flags=re.MULTILINE)
    }
    # A report may confirm a review class even if no checklist row changes.
    reported = {n for n, title in headings.items()
                if re.search(r"\breports? received\s+[A-Z][a-z]+\s+\d+", title)}

    statuses = {}
    with (COURSE / "COVERAGE.csv").open(encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            code, status = row["topic_id"].strip(), row["coverage_status"].strip()
            if code in statuses or status not in {"taught", "partial", "awaiting_report", "not_yet_taught"}:
                raise ValueError(f"unexpected checklist row for {code} ({status})")
            statuses[code] = status
            if status in {"taught", "partial"}:
                evidence = re.fullmatch(r"TEACHING_LOG\.md#l(\d+)", row["evidence_log"].strip())
                if not evidence or int(evidence[1]) not in headings:
                    raise ValueError(f"{code} needs a matching teaching-log entry")
                reported.add(int(evidence[1]))

    if not reported:
        raise ValueError("no confirmed lecture in the teaching records")
    lecture = max(reported)
    date_text = headings[lecture].split(";")[0].strip()
    date = datetime.strptime(date_text + " 2026", "%B %d %Y")
    label = f"Lecture {lecture} · {date:%b} {date.day}"

    required = {code for codes in REQUIREMENTS.values() for code in codes.split()}
    if missing := required - statuses.keys():
        raise ValueError("missing checklist rows: " + ", ".join(sorted(missing)))
    topics = [topic for topic, codes in REQUIREMENTS.items()
              if all(statuses[code] == "taught" for code in codes.split())]
    data = json.dumps(topics, ensure_ascii=False, indent=2)
    content = ('"use strict";\n\n'
               '// Generated from confirmed Calculus teaching records.\n'
               f'const coverageThrough = "{label}";\n'
               f'const coveredTopics = new Set({data});\n')
    return content, f"{label}, {len(topics)} covered topics"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare without writing")
    args = parser.parse_args()
    content, summary = snapshot()
    existing = OUTPUT.read_text(encoding="utf-8")
    if existing.count(END_MARKER) != 1:
        raise ValueError("cannot locate the generated section of coverage.js")
    content += END_MARKER + existing.split(END_MARKER, 1)[1]
    if existing == content:
        print(f"Practice coverage is current ({summary}).")
        return 0
    if args.check:
        print(f"Practice coverage needs an update ({summary}).")
        return 1
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Updated practice coverage ({summary}).")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, KeyError, ValueError) as error:
        sys.exit(f"Could not refresh practice coverage: {error}")
