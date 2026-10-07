# Agents

## Project

- Project: Task Management CRUD application
- Description: A web application for managing personal tasks, supporting the full CRUD lifecycle of create, view, update, and delete.
- Specifications: Gherkin feature file at `specs/start/taskadmin.feature`; technical spec at `specs/start/spec.md`

## Tech Stack

- Language: Vanilla JavaScript (ES6+), no frameworks or libraries.
- Files: `index.html`, `styles.css`, `app.js`
- Persistence: Browser `localStorage`, key `tasks`, JSON array of tasks.
- Storage helpers: `getTasks()`, `saveTasks(tasks)`.
- E2E tests: Playwright (`@playwright/test`) in `tests/`, driving the system Chromium.

## Testing

- `npm test` runs the e2e suite; `npm test:headed` for a visible browser; `npm test:report` opens the last HTML report; `npm run serve` starts the static server alone.
- The app must be served over HTTP (never `file://`), otherwise `localStorage` is unavailable and the app renders empty.
- The suite uses the Alpine-provided Chromium at `/usr/bin/chromium` through `launchOptions.executablePath`. Install it with `apk add chromium`, or point `CHROMIUM_PATH` at another binary.
- Locally, do not run `npx playwright install`: the download is unnecessary and Playwright's glibc Chromium cannot run on Alpine anyway. Neither `npm install` nor `npm ci` downloads browsers (Playwright 1.63 ships no postinstall script).
- Test files:
  - `playwright.config.js`: base URL `http://127.0.0.1:4173`, Chromium launched with `--no-sandbox --disable-dev-shm-usage` (required to run as root in a container), traces and screenshots retained on failure.
  - `tests/server.js`: zero-dependency `node:http` static server for the repository root.
  - `tests/fixtures.js`: `tasks` fixture exposing `seedTasks(tasks)` (writes `localStorage` before app code runs) and `readTasks(page)` (reads it back for persistence assertions).
  - `tests/crud.spec.js`: one test per scenario in `specs/start/taskadmin.feature`.
- Video recording is intentionally off; it requires Playwright's ffmpeg binary, which is not installed.
- `package-lock.json` is committed. It pins `@playwright/test` to the exact version the suite was last verified against and makes `npm ci` usable, so installs are reproducible across machines. Regenerate it deliberately with `npm install` when changing dependencies, and commit it alongside `package.json`.
- `test-results/`, `playwright-report/`, and `playwright/.cache/` are generated and git-ignored; delete them freely.

### CI (`.github/workflows/e2e.yml`)

- Runs on push to `main`, on pull requests, and on manual dispatch.
- GitHub's Ubuntu runner has no `/usr/bin/chromium`, so `playwright.config.js` falls back to Playwright's managed browser, which the workflow installs with `npx playwright install --with-deps chromium`.
- Installs dependencies with `npm ci`, which requires `package-lock.json` to be in sync with `package.json`; if it drifts, the step fails rather than silently resolving different versions.
- Playwright 1.63 has no postinstall script, so `npm ci` downloads no browsers; the `npx playwright install --with-deps chromium` step is required.
- The browser cache lives at `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers`, keyed on `hashFiles('package-lock.json')`.
- On failure the workflow uploads `playwright-report/` and `test-results/` as the `playwright-report` artifact, which carries the traces.
- On Ubuntu, Playwright's managed Chromium is glibc-based and will not run on this Alpine box; the reverse holds too. Do not try to validate the CI path locally.

### Selector conventions in tests

- Views are toggled with a `.hidden` class (`display: none !important`), so `toBeVisible()` reflects view state exactly.
- The toast self-hides after 3 seconds; assert it immediately after the triggering click and use short timeouts for negative assertions.
- Two buttons are labelled "Delete" (the details view and the confirmation modal), so scope those clicks: `#details-view` for the first, `#confirm-modal` for the confirmation.

## Data Model

- Task fields: `id`, `title` (required, unique, max 255), `description`, `priority` (`Low`/`Medium`/`High`), `status` (`Open`/`In Progress`/`Completed`, default `Open`), `createdAt`, `updatedAt`.

## UI Conventions

- Single-page: task list, details view, create/edit form, delete confirmation modal, toast notifications.
- No page reloads or routing library.
- Success messages: "Task created successfully", "Task updated successfully", "Task deleted successfully".

## Operating System

- OS: Alpine Linux
- Version: 3.24.1
- Platform: Linux

## Package Manager

- Package manager: `apk` (Alpine Linux Package Manager)
- Binary location: `/sbin/apk`

## Common Commands

- Update package index: `apk update`
- Upgrade packages: `apk upgrade`
- Install a package: `apk add <package>`
- Remove a package: `apk del <package>`
- Search for a package: `apk search <pattern>`
- List installed packages: `apk list --installed`