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

## Portrait

`assets/images/portrait.webp` is the optimized site copy. `portrait-source.png` is retained so the photo can be replaced or recropped later.

## Course archive

The `courses/` directory contains current course pages and local HTML reconstructions of earlier Wix course pages. 
The Fall 2026 Calculus A (I) page is `courses/calculus1-2026.html`. The Research page and the Fall 2026 Real Analysis page are intentionally marked under construction.
