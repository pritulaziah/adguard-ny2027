# AGENTS.md

## Table of Contents

- [Project Overview](#project-overview)
- [Technical Context](#technical-context)
- [Project Structure](#project-structure)
- [Build And Test Commands](#build-and-test-commands)
- [Contribution Instructions](#contribution-instructions)
- [Code Guidelines](#code-guidelines)
  - [System Design](#system-design)
  - [Architecture](#architecture)
  - [Code Quality](#code-quality)
  - [Testing](#testing)
  - [Dependency Management](#dependency-management)
  - [Configuration & Documentation](#configuration--documentation)
  - [Other](#other)

## Project Overview

AdGuard 2026 in Review is a static, single-page 3D website. It turns the
AdGuard 2026 product highlights into a paper-craft world with four
seasons and a route of story stops. AdGuard users and visitors scroll
through the scene, open a release dialog at each stop, and read short
notes on the paper figures. The site gives a quick visual tour of the
year without a long list of release notes.

## Technical Context

- **Language/Version**: TypeScript 6.0.3 (`~6.0.3`), Svelte 5.57.3,
  Node.js 24.
- **Primary Dependencies**: Three.js 0.187 (`three/webgpu`, TSL),
  Vite 8.3.6, Vitest 5.1.2, Prettier 3.10.1 with
  `prettier-plugin-svelte`.
- **Storage**: No backend and no database. The language choice persists
  in `localStorage` under the key `adguard-ny27-language`. All other
  state is in memory.
- **Testing**: Vitest 5 in the Node environment. Test files sit next to
  the code and use the `.test.mjs` extension by default.
- **Target Platform**: Current Chrome, Edge, Firefox, and Safari. The
  scene uses WebGPU when available and falls back to WebGL2. The build
  is static and deploys to GitHub Pages.
- **Project Type**: Website (static client-rendered single-page 3D
  site).
- **Performance Goals**: Keep the measured baseline: 46–95 draw calls,
  about 250 000 triangles, and about 7 ms frame time at 1440×900. Do not
  add a per-frame cost without a measurement.
- **Constraints**: No server rendering and no SvelteKit. The Vite base
  is `./`, so the site works from a subpath. The WebGL2 fallback, reduced
  motion, keyboard access, and ARIA state must stay. Interface and story
  copy exist in Russian and English.
- **Scale/Scope**: One page, four seasons, a route of story stops, six
  stories, one release dialog per story, and 19 test files. The audience
  is public.

## Project Structure

```text
.
├── index.html                  # Vite entry; mounts src/main.ts into #app
├── src/
│   ├── main.ts                 # Mounts App and imports the global CSS
│   ├── App.svelte              # Composition root: language, errors, Stage, overlays
│   ├── app.css                 # Global styles and stage/content z-index
│   ├── styles/fonts.css        # @font-face rules for the bundled fonts, Cyrillic and Latin
│   └── lib/
│       ├── content/            # RU/EN copy, story data, notes, shared Svelte stores
│       ├── ui/                 # Svelte DOM components: story card, dialog, note, help
│       └── world/              # Three.js paper world
│           ├── Stage.svelte    # Renderer and camera setup, frame loop, teardown
│           ├── YearWorld.ts    # World orchestrator: build, tick, destroy
│           ├── route.ts        # Route length, stop spacing, distance helpers
│           ├── seasons.ts      # Season borders and colour ramps
│           ├── finale.ts       # Finale layout and mascot positions
│           ├── paper-*.ts      # Shared paper material, geometry, batching, meshes
│           ├── year/           # Camera, input, stories, weather/, sparks, CSS layer
│           ├── scenery/        # Season builders: firs, meadow, ridges, sky, mascots
│           ├── animals/        # PaperAnimal classes and shared helpers
│           └── vehicles/       # Retro van, wheels, exhaust, snow trail
├── public/                     # Fonts, logo, mascot images, story covers, screenshots
├── .github/workflows/          # ci.yml for pull requests, deploy.yml for main
└── design/                     # Source art (gitignored)
```

## Build And Test Commands

- **Install**: `npm ci`
- **Build**: `npm run build`
- **Test**: `npm test`
- **Test in watch mode**: `npm run test:watch`
- **Type check**: `npm run check`
- **Lint**: N/A. No linter is configured. `npm run check` is the static
  analysis gate.
- **Format check**: `npm run format:check`
- **Format fix**: `npm run format`
- **Run**: `npm run dev`
- **Preview the build**: `npm run preview`

## Contribution Instructions

- You MUST verify the change with the formatter, the type checker, the
  tests, and the build. Use these commands:
  - `npm run format` to fix the formatting
  - `npm run format:check` to check the formatting
  - `npm run check` to run `svelte-check` and the TypeScript checks
  - `npm test` to run all tests
  - `npm run build` to confirm that the site builds
- You MUST update the unit tests for changed behavior.
- You MUST run all tests and make them pass.
- You MUST update the Russian and English copy in the same change. A
  copy change in one language alone is incomplete.
- You MUST update `src/lib/world/route.test.mjs` when you change the
  route or the seasons.
- You MUST keep every world object module at 300 lines or fewer. The
  test `src/lib/world/module-size.test.mjs` enforces this limit.
- You MUST update `README.md`, `DEVELOPMENT.md`, and `CONTRIBUTING.md`
  when a change makes them inaccurate. Update the content table in
  `DEVELOPMENT.md` when a file that holds copy moves.
- You MUST update the Project Structure section of `AGENTS.md` when the
  project structure changes.
- If a prompt asks for a refactoring or an improvement, capture the
  resulting rule in the relevant Code Guidelines section of `AGENTS.md`.
- After you complete a task, verify the code against the Code Guidelines
  in `AGENTS.md`.
- You MUST NOT add a dependency without a reason. State the reason in the
  pull request.

## Code Guidelines

### System Design

Design for a static, client-side, GPU-bound page:

- The site is static. Do not add a server, an API, authentication, or a
  runtime secret. The build in `dist/` must work from GitHub Pages with
  the `./` base.
- The frame budget is the main design constraint. Keep the shared paper
  material, the merged static batches, and the low draw-call count.
  Measure before and after a change that can touch the frame cost.
- Keep both renderers. Test the WebGPU path and the WebGL2 path
  (`?webgl`).
- Bind animation to each part at build time. Do not add a per-frame
  `switch` or a motion lookup. Skip the motion of parts that are far
  from the camera.
- Dispose every GPU resource on teardown: geometry, material, texture,
  and renderer. Reset module caches as well, so a remount starts clean.
- Stop the animation loop when the tab is hidden and while a story
  dialog is open.
- Respect `prefers-reduced-motion` in every animated subsystem.
- Write to the DOM and the CSS3D layer only when the state changes. Do
  not write on every frame.
- Keep keyboard access and ARIA state. The arrow keys move between
  stops.
- Render only after the world is built and the shaders are precompiled.
- Do not hold the user on a blank page. The loading and error states in
  `App.svelte` must stay.

### Architecture

Apply these principles:

- **Separation of Concerns** — content, DOM UI, and the 3D world each
  handle one aspect.
- **Single Responsibility Principle** — every file, class, and function
  has one reason to change.
- **Dependency Direction** — dependencies point from the shell to the
  world and the UI, and from both to content. Content is a leaf.
- **Explicit Boundaries** — modules interact through exported types,
  stores, and builder functions. Do not reach into another module's
  internals.
- **Data Flow Clarity** — content stores carry UI state. The journey
  store carries movement state. The world reads both and reacts.
- **Minimize Coupling, Maximize Cohesion** — keep each scenery object
  and each animal in its own module.
- **Make Invalid States Impossible** — use string-literal unions and
  `Record<Language, …>` types for content.
- **Observability Built-in** — report load failures to `onerror` and
  show a user-facing message. Log only at the top level.
- **Keep It Boring** - prefer a plain class or a builder function over a
  clever abstraction.
- **Weather layer** - `year/weather/` exposes one `WeatherLayer` class from
  `index.ts`. It owns three `WeatherStratum` subclasses: sky, midground,
  and foreground. Each class lives in its own file. Each stratum owns its
  season presets and particle placement. Pass build-time randomness as an
  `rng` function.

The layers, from the shell to the leaf:

| Layer     | Responsibility                                             | Examples                                              |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| App shell | Composition, language, loading and error state             | `src/App.svelte`, `src/main.ts`                       |
| World     | Three.js scene, frame loop, camera, input, DOM story layer | `src/lib/world/Stage.svelte`, `YearWorld.ts`, `year/` |
| UI        | Svelte DOM components for stories, dialogs, and notes      | `src/lib/ui/StoryModal.svelte`, `ObjectFact.svelte`   |
| Content   | Copy, story data, typed interactions, shared Svelte stores | `src/lib/content/i18n.ts`, `articles.ts`              |

```text
index.html
   ↓
src/main.ts → src/App.svelte
   ↓
world/Stage.svelte → world/YearWorld.ts → world/{year,scenery,animals,vehicles,paper-*}
   ↓
content/*  (leaf: imports only svelte/store)
```

`world/` may import `content/`. `ui/` may import `content/`. `content/`
MUST NOT import `world/` or `ui/`.

**Known exclusions** (to be fixed):

- `src/lib/ui/WallStory.svelte` imports `STOP_COUNT` from
  `../world/route`. The UI layer depends on a world constant.
- `src/lib/world/year/stories.ts` imports and mounts
  `../../ui/WallStory.svelte`. The world layer depends on a UI
  component. This is the only UI-to-world and world-to-UI coupling pair.
  Fix it when the story layer gets a separate boundary. Do not add more
  imports in either direction.

### Code Quality

- **Types**: TypeScript is strict (`@tsconfig/svelte` sets `strict`).
  `checkJs` is on. Keep `noEmit` and the two-project setup. Do not
  weaken `tsconfig.app.json` or `tsconfig.json` to silence an error.
- **Svelte**: Use Svelte 5 runes. Use `$props()` with an inline type,
  `$state` for local state, `$derived` for computed values, and
  `$effect` for side effects. Use shared Svelte stores for state that
  crosses modules. Use Svelte 5 event attributes (`onclick`,
  `onpointerdown`), not `on:click`.
- **Module size**: Keep every file in `world/animals/`, `world/scenery/`,
  `world/vehicles/`, and `world/year/`, and `YearWorld.ts` at 300 lines
  or fewer. Split by object, not by technical layer.
- **Naming**: Use kebab-case for TypeScript modules, PascalCase for
  classes and Svelte components, and UPPER_SNAKE for constants. Use
  `createX`, `addX`, `resetX`, and `unitXGeometry` prefixes for builders,
  and `*.test.mjs` for tests.
- **Class files**: Put one class in one file, named after the class. A
  module that exports several classes must be split.
- **Imports**: Use relative paths. No path aliases exist. Explicit `.ts`
  extensions are allowed (`allowImportingTsExtensions`). Tests use the
  explicit `.ts` extension.
- **Documentation**: Add a short doc comment to an exported function or
  constant when the name does not give the full rule. Explain a
  non-obvious constraint (frame cost, GPU lifetime, browser guard), not
  the code line.
- **Errors**: Throw or return from the world builder, catch at
  `YearWorld` or `Stage`, and report through `onerror` with
  `'loadError'` or `'webglError'`. Guard the `disposed` flag after an
  async step. Clamp an unstable delta with
  `Math.min(delta, 0.05)`.
- **Assets**: Build an asset URL from `import.meta.env.BASE_URL`. Do not
  start a public asset path with `/`, because the site deploys under a
  repository subpath.

### Testing

- **Placement and naming**: Put a test next to the module that it covers.
  Use the `.test.mjs` extension. `src/lib/world/year/input.test.ts` is
  the only TypeScript test.
- **Imports**: Import the TypeScript module directly with an explicit
  `.ts` extension.
- **Environment**: Tests run in Node. Do not depend on a real browser.
  Guard browser APIs, or stub them with `vi.stubGlobal` and restore them
  with `vi.unstubAllGlobals()`.
- **Mocking**: Prefer the real Three.js code. Mock only browser globals
  and input events.
- **Data tests**: Check that both languages are complete. Check the
  story list, the release links, the dialog copy, the figure notes, and
  the promo codes.
- **Cover files**: `src/lib/content/articles.test.mjs` checks that every
  story cover path exists under `public/`.
- **Budget tests**: Keep `module-size.test.mjs`, the draw-call tests, and
  the vertex-colour tests. Do not raise a limit to fit a new change.
- **Route and season tests**: Change `route.test.mjs` together with
  `route.ts` or `seasons.ts`.
- **Coverage**: No coverage threshold is configured. Cover the changed
  behavior and the new edge cases.
- **Before merge**: `npm test`, `npm run check`, `npm run format:check`,
  and `npm run build` must all pass.
- **Visual checks**: For a visual or performance change, take screenshots
  at stops 0, 2, 4, 6, and 7 in both languages, with reduced motion, and
  on the `?webgl` fallback.

### Dependency Management

- **Pin new versions**: A new dependency MUST use an exact version. Do
  not copy a range from memory. The current `package.json` uses caret
  ranges for existing packages. Do not widen them.
- **Prefer vanilla solutions**: Use the browser platform, Svelte, and
  Three.js before you add a package. The project has one runtime
  dependency, `three`.
- **Reputable sources only**: Use a well-established, actively maintained
  package.
- **Avoid unpopular libraries**: Do not add a niche or obscure package.
- **Minimize dependency count**: Justify every addition in the pull
  request. Each package adds attack surface and maintenance cost.
- **Use the latest stable version**: Check the registry when you add a
  dependency.
- **Lockfile**: Change `package-lock.json` only through npm. Install with
  `npm ci` in CI and in a clean checkout.

### Configuration & Documentation

- **Runtime configuration**: The site reads `import.meta.env.BASE_URL`
  for asset URLs and `import.meta.env.DEV` for development-only tools.
  No `.env` file exists. Do not add one for a public value.
- **Development flags**: `?stats` opens the Three.js inspector in a
  development build with WebGPU. `?webgl` forces the WebGL2 fallback.
  Keep both flags for testing.
- **Secrets**: Do not commit a secret, a token, or a private key. The
  promo codes in `src/lib/content/mascot-offers.ts` are public marketing
  copy, not secrets.
- **Content locations**: Put interface and story copy in
  `src/lib/content/`. Do not hardcode user-visible text in a component.
  The content-to-file table is in `DEVELOPMENT.md`.
- **Documents to update**: Update `README.md` for a user-visible feature,
  `DEVELOPMENT.md` for a command, layout, or content location change,
  and `CONTRIBUTING.md` for a workflow change.
- **Generated files**: Do not edit `dist/` or `package-lock.json` by
  hand. Keep `src/styles/fonts.css` in sync with the files in
  `public/fonts/`.
- **Formatting configuration**: `.prettierrc.json` is the single source
  of formatting. Do not add a path to `.prettierignore` to pass CI.

### Other

- **Commit messages**: Use Conventional Commits: a type, a scope, and a
  short imperative subject. Allowed types are `feat`, `fix`, `perf`,
  `test`, `docs`, and `chore`. Keep the subject at 72 characters or
  fewer. Put the reason in the body.
- **Branches**: Create a branch from `main` with a short name such as
  `feat/short-name`.
- **Pull requests**: Keep one purpose per pull request. The project uses
  squash merge, and the pull request title becomes the commit subject.
  Add a screenshot or a recording for a visual change.
- **Product names**: Keep the product name as the product writes it, for
  example "AdGuard Home" and "Meta Quest Browser".
- **Bilingual copy**: Russian and English are equal. A new story, note,
  label, or promo MUST have both languages.
- **Local-only directories**: `design/` and `.playwright-mcp/` are
  gitignored. Do not commit them.
