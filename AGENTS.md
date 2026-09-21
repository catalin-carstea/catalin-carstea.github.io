# Project instructions

These instructions apply to the entire academic website repository.

## Start and resume work

- Read this file and the relevant sections of [README.md](README.md) before
  editing. After context compaction or a handoff, re-read them and inspect
  `git status` and the current diff before continuing.
- Follow the user's latest instructions. Treat these files as project defaults,
  not a reason to override an explicit request.
- Preserve unrelated local changes. Synchronize with `git pull --ff-only` before
  editing when the working tree is clean; never discard work to make a pull pass.
- Keep durable rules here, procedures and feature status in the README, and
  completed-work history in Git. Update the appropriate document when a workflow
  changes. Do not depend on conversation history as the only record.

## Site structure and content

- Keep the existing plain HTML/CSS architecture, `.nojekyll`, and GitHub Pages
  hosting. Routine content updates do not need a framework, build system, or
  server. The public repository and website addresses are in the README.
- Preserve the site's established typography, colors, navigation, and responsive
  layout. Use `assets/css/site.css` for shared styling and avoid reformatting
  unrelated HTML during small edits.
- Save text as UTF-8, preserving Romanian diacritics and Chinese names. Use
  relative links within HTML pages; RSS links must be absolute HTTPS URLs.
- Headers and footers are duplicated across pages. When changing shared
  navigation or contact details, update all relevant occurrences. Do not replace
  public contact addresses with the GitHub account email.
- Keep course content in the correct semester. Consult `teaching.html` and the
  README to distinguish active courses from archives; do not assume the current
  semester from the calendar alone.
- Use provided source materials for course facts. Do not invent due dates,
  publication dates, exam dates, grading rules, or descriptions. Keep tentative
  dates marked as tentative. See the README for the Real Analysis syllabus source.
- Preserve published PDF URLs when possible; changing them can break bookmarks,
  old RSS entries, and links shared with students.

## Calculus postings must update RSS

- The Fall 2026 page is `courses/calculus1-2026.html`; its feed is
  `courses/calculus1-2026/feed.xml`.
- Whenever adding homework, lecture notes, an announcement, or an important
  correction, publish the corresponding RSS entry in the same commit as the
  page and materials. Editing HTML or replacing a PDF alone does not notify readers.
- Group related materials from one posting into one entry, newest first. Use a
  unique permanent GUID, the actual publication time with a timezone, and
  absolute links. Update `lastBuildDate`.
- Keep existing GUIDs and publication dates unchanged. A correction requiring
  a fresh notification gets a new entry and GUID even if its PDF URL is unchanged.
  Do not announce cosmetic changes as course updates.
- Preserve the visible subscription notice, instructions, and RSS autodiscovery
  link. The README contains the detailed feed-editing procedure.
- RSS reader alerts depend on the student's reader. RSS is not an email signup.
  Do not advertise email subscriptions until a provider is actually configured;
  check the README for the current status. When connecting a provider, skip the
  historical feed items. Recheck provider pricing before quoting it or choosing
  a plan; prior discussion of Buttondown is not an enabled integration.

## Analytics

- Preserve exactly one Cloudflare Web Analytics snippet per HTML page, including
  archives and new pages. Copy the existing snippet and site token; do not create
  a second tracker. It belongs immediately before `</body>`.
- The beacon token is a public site identifier, not access to analytics reports.
  Dashboard access requires a signed-in account or a separate authorized method.
- Distinguish verifying the installed snippet from verifying data arriving in
  Cloudflare. Report blocked checks accurately. Direct PDF opens are not tracked
  by the HTML-page beacon.

## Check and publish

- Run `git diff --check` and review the changed files. Check new local links,
  section anchors, and PDF targets. For RSS edits, parse the XML, check unique
  GUIDs and publication dates, and verify the links in item descriptions.
- For visible layout or interaction changes, inspect desktop and mobile rendering
  and exercise the changed links or controls. Use checks proportionate to the
  change; documentation-only edits do not require browser tests.
- Keep temporary scripts, screenshots, drafts, credentials, and account data out
  of commits. The repository and files deployed by GitHub Pages are public.
- When the task includes publishing, use the existing GitHub Pages workflow:
  commit only task-related files and push to `main`. Honor requests for a local
  draft or a separate branch instead.
- After publishing site changes, check the matching Pages deployment and the
  affected public URLs before calling the change live. If verification is blocked,
  distinguish what was committed, pushed, deployed, and actually checked.
