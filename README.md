# Cătălin I. Cârstea — academic website

This is a hosting-neutral static website: plain HTML/CSS, no build step, no server-side dependencies.

## Preview locally

From this folder, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000/>. Press Ctrl+C in the terminal to stop the preview.

## GitHub Pages setup

GitHub account: **catalin-carstea**, verified as the account associated with
`carstea@uchicago.edu`.

- Repository: <https://github.com/catalin-carstea/catalin-carstea.github.io>
- Website address: <https://catalin-carstea.github.io/>

The setup steps below describe how to configure or recreate the hosting.

For the shortest address, use a public repository named `USERNAME.github.io`,
replacing `USERNAME` with the actual GitHub username. This publishes at
`https://USERNAME.github.io/`. If that repository already hosts another site,
use a separate public repository such as `academic-website`, which publishes at
`https://USERNAME.github.io/academic-website/`.

1. Create the empty repository under the correct GitHub account. Do not add a
   generated README, license, or .gitignore; this folder already has its files.
2. Push this project's `main` branch to that repository.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**,
   choose **Deploy from a branch**, select **main** and **/(root)**, then **Save**.
4. Wait for GitHub's Pages deployment to finish, then open the live URL shown in
   **Settings → Pages**. Check the homepage and a course page before sending the
   URL to the department.

The existing `.nojekyll` file makes GitHub serve the plain static files without
Jekyll processing. No custom build workflow, hosting credentials, paid domain,
or application server is needed. All internal links are relative, so both URL
layouts work. The repository source and the published website will be public.

Official instructions: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
and [Configuring the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Maintain the website

Edit the relevant file, preview locally, and publish the changes through Git:

```powershell
git pull --ff-only
# Edit and preview your changes, then inspect them:
git status
git diff
# Stage the specific files you changed, for example:
git add teaching.html courses/calculus1-2026.html
git commit -m "Update course information"
git push
```

Run `git pull --ff-only` before editing when another computer or the GitHub web
editor may have changed the repository. Each push to `main` republishes the site.
If a deployment fails, inspect the repository's **Actions** tab.

| Content | File |
| --- | --- |
| Homepage, contact details, recent work | `index.html` |
| Research overview | `research.html` |
| Publications and preprints | `publications.html` |
| Current courses and teaching archive | `teaching.html` |
| Individual course details | `courses/*.html` |
| Curriculum vitae | `cv.html` |
| Shared visual styling | `assets/css/site.css` |

Navigation and contact footers are repeated in the HTML files. When changing
shared links or contact details, update every occurrence. Save HTML as UTF-8 to
preserve diacritics and Chinese text. The GitHub account email does not determine
the public contact emails displayed on the website.

You can also make small edits directly on GitHub by opening a file, choosing the
pencil icon, and committing the change. Pull those edits into this local project
before making further local changes.

## Calculus RSS updates

The Fall 2026 Calculus A (I) feed is
`courses/calculus1-2026/feed.xml`, advertised near the top of the course page and
through an RSS autodiscovery link in its HTML head. It is served as a static file;
there is no build step or external subscription service. Initial publication
dates reflect the commits that posted the existing materials.

Whenever posting new homework, lecture notes, an announcement, or an important
correction, update the feed in the same commit as the course page and PDFs:

1. Add a new `<item>` at the top of the channel's item list. Group related
   materials from the same posting into one entry.
2. Give it a short title, an absolute HTTPS link to the relevant course section,
   and a description with absolute links to the new materials. Follow an
   existing item's structure; escape XML characters in titles (e.g. `&amp;`).
3. Set a unique, permanent `<guid isPermaLink="false">`, for example
   `calculus1-2026:2026-09-21:lecture-05`, and the actual publication time in
   `<pubDate>` using the existing RFC 2822 date format with a timezone.
4. Update `<lastBuildDate>`. Keep existing items' GUIDs and publication dates
   unchanged, so readers do not announce them again. To notify students of a
   correction to an existing PDF, create a separate correction item with a new
   GUID, even when the PDF URL stays the same.
5. Validate the XML with
   `python -c "import xml.etree.ElementTree as ET; ET.parse('courses/calculus1-2026/feed.xml')"`
   and publish the feed along with the page and materials.

Editing the course page or replacing a PDF alone does **not** create an RSS
notification. Students subscribe by pasting the feed address into a reader;
notification availability and polling intervals depend on their reader.

The feed can later be connected to an RSS-to-email provider. Email subscriptions
are not enabled yet. When connecting a provider, skip historical items to avoid
emailing the initial archive to new subscribers.

## Traffic analytics

Every HTML page includes the Cloudflare Web Analytics snippet immediately before
`</body>`. When creating a new page, include the same snippet so it appears in the
site-wide dashboard. The beacon token in the snippet is a public site identifier,
not an account credential.

View traffic in the site's Cloudflare account under **Web Analytics**. Collection
starts after deployment; historical traffic is not recovered. Script blockers
can prevent visits from being counted, and direct PDF opens are not measured by
the HTML-page beacon.

## Portrait

`assets/images/portrait.webp` is the optimized site copy. `portrait-source.png` is retained so the photo can be replaced or recropped later.

## Course archive

The `courses/` directory contains current course pages and local HTML reconstructions of earlier Wix course pages. 
The Fall 2026 Calculus A (I) page is `courses/calculus1-2026.html`. The Fall 2026 Real Analysis page is `courses/real-analysis-2026.html`. The Research page remains under construction.

The Real Analysis course information follows the September 8, 2026 version of
`../RealAnalysis/syllabus.tex`. When the syllabus changes, update the course page
to match; exam dates remain tentative until confirmed.
