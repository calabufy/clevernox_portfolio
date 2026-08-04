# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free static portfolio. Hand-maintained entry pages live at the repository root (`index.html`, `works.html`, and `about.html`). Project and category content is defined in `data/works.js` and `data/categories.js`; `build.js` combines those records with `templates/work.html` and `templates/category.html` to generate `work-{slug}.html` and `category-{slug}.html`.

Shared presentation and behavior live in `css/style.css` and `js/main.js`. Store portfolio media under `assets/img/<category>/<project-slug>/`, using `cover.webp`, `gallery-01.webp`, and similarly numbered names. The downloadable résumé is `assets/cv.pdf`.

## Build, Test, and Development Commands

- `node build.js` regenerates all data-driven category and project pages. Run it after changing data or templates, and commit the generated HTML.
- `python3 -m http.server 8000` serves the repository locally; open `http://localhost:8000` to check navigation and assets.
- `node --check build.js && node --check js/main.js` performs basic JavaScript syntax validation.
- `git diff --check` detects whitespace errors before committing.

There is no package manager, bundler, or dependency-install step.

## Coding Style & Naming Conventions

Follow the existing style: two-space indentation in HTML, CSS, and JavaScript; double quotes in JavaScript; trailing commas in multiline data objects. Prefer semantic HTML and progressive enhancement so content remains usable without JavaScript. Reuse CSS custom properties from `:root` and existing layout utilities before adding new rules.

Use lowercase kebab-case slugs and filenames, for example `work-lavender-latte.html`. A work's `slug`, generated filename, asset directory, and internal links must agree. Provide specific Russian `alt` text for every content image.

## Testing Guidelines

No automated test framework or coverage threshold is configured. After rebuilding, inspect the home, works, affected category, and affected work pages at desktop and mobile widths. Verify missing assets, keyboard focus, menu/topic controls, reduced-motion behavior, and back/next links. Review the generated diff to ensure unrelated pages did not change.

## Commit & Pull Request Guidelines

Recent commits use short, imperative English summaries such as `Add 10 identity brand cases`. Keep each commit focused and mention the affected category or feature. Pull requests should summarize data, template, and generated-file changes; list manual checks; link an issue when applicable; and include before/after screenshots for visual or responsive changes. Do not commit local server output or temporary image exports.
