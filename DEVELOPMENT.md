# Development

How to set up the project, run it, and change it.

## Requirements

- Node.js 24 (the version the deploy workflow uses).
- npm, included with Node.js.

## Set up

```sh
npm ci
```

`npm ci` installs the exact versions from `package-lock.json`.

## Run

```sh
npm run dev
```

Open the address that Vite prints, usually
http://localhost:5173.

## Commands

| Command                | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Starts the development server.                 |
| `npm run build`        | Builds the site into `dist/`.                  |
| `npm run preview`      | Serves the built site.                         |
| `npm test`             | Runs every test once with Vitest.              |
| `npm run test:watch`   | Runs the tests in watch mode.                  |
| `npm run check`        | Runs `svelte-check` and the TypeScript checks. |
| `npm run format`       | Rewrites every file with Prettier.             |
| `npm run format:check` | Reports files that Prettier would change.      |

Run `npm run format:check`, `npm test`, `npm run check`, and
`npm run build` before you open a pull request.

## Formatting

The code is formatted with Prettier. The settings are in
`.prettierrc.json`, and `.prettierignore` lists the paths that Prettier
does not touch. Run `npm run format` to rewrite the files, or
`npm run format:check` to list the files that need a change. CI fails
when a file does not match the settings.

The VS Code extension `esbenp.prettier-vscode` formats a file on save
when you make it the default formatter.

## Browser support

The scene uses WebGPU when the browser provides it. Otherwise it falls
back to WebGL2. Chrome and Edge provide WebGPU on most current systems.
The console prints a warning when the app uses the WebGL2 fallback.

## Project layout

| Path                             | Content                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `src/lib/content/`               | Stories, dialog copy, figure notes, UI strings, language store      |
| `src/lib/ui/`                    | Svelte components: wall story, story dialog, figure note            |
| `src/lib/world/`                 | Three.js scene: route, seasons, scenery, vehicles, camera, weather  |
| `src/lib/world/summer-bridge.ts` | Summer bridge position and deck profile shared with the van         |
| `src/lib/world/vehicles/`        | Retro van, separate roof cargo builder, wheels, exhaust, snow trail |
| `src/App.svelte`                 | Page frame, language switch, loading and error states               |
| `public/`                        | Fonts, logo, story covers, and screenshots                          |
| `.github/workflows/`             | GitHub Actions: deploy and CI                                       |

## Where to change content

| Change                                                 | File                                 |
| ------------------------------------------------------ | ------------------------------------ |
| Story title, summary, station, cover, release link     | `src/lib/content/articles.ts`        |
| Story dialog copy: lead, timeline, passages, afterword | `src/lib/content/story-deep-dive.ts` |
| Note for one figure                                    | `src/lib/content/figure-facts.ts`    |
| Interface text and language labels                     | `src/lib/content/i18n.ts`            |
| Welcome and finale copy                                | `src/lib/content/i18n.ts`            |
| Route length and stop positions                        | `src/lib/world/route.ts`             |
| Season borders and colour ramps                        | `src/lib/world/seasons.ts`           |

Every change to the route or the seasons needs the matching update in
`src/lib/world/route.test.mjs`.

## Tests

Tests use Vitest and run in a Node environment. A test file sits next
to the code it covers and has the `.test.mjs` extension. The one
TypeScript test is `src/lib/world/year/input.test.ts`. Tests import
TypeScript modules directly.

Some test files are:

- `src/lib/world/route.test.mjs` — route geometry, seasons, movement.
- `src/lib/content/articles.test.mjs` — story data and release links.
- `src/lib/content/story.test.mjs` — dialog copy and figure notes.
- `src/lib/world/module-size.test.mjs` — the 300-line module limit.

## Deployment

A push to `main` runs `.github/workflows/deploy.yml`. The workflow
tests, builds, and publishes `dist/` to GitHub Pages at
https://pritulaziah.github.io/adguard-ny2027/.

Pull requests run `.github/workflows/ci.yml`, which runs the same tests,
the type check, and the build without publishing.
