# Contributing

Thank you for your interest in the project. This page explains how to
report a problem, propose a change, and get a change merged.

## Report a problem

Open an issue and use the bug template. Include:

- what you did;
- what you expected;
- what happened instead;
- your browser, operating system, and screen size;
- a screenshot or a console error when you have one.

The page is a visual scene, so a screenshot helps a lot.

## Propose a feature

Open an issue and use the feature template. Describe the problem first
and the solution second. For a large change, wait for a reply before
you write code. This avoids work that the project cannot accept.

## Set up the project

Follow [DEVELOPMENT.md](DEVELOPMENT.md). It lists the requirements, the
commands, and the project layout.

## Make a change

1. Create a branch from `main`:

   ```sh
   git switch -c feat/short-name
   ```

2. Make the change. Follow the existing patterns. Keep one change
   per pull request.

3. Add or update tests when you change behavior.

4. Run all checks:

   ```sh
   npm test
   npm run check
   npm run build
   ```

5. Commit with a clear message:

   ```sh
   git commit -m "feat(scene): add the lighthouse note"
   ```

6. Push the branch and open a pull request against `main`.

## Commit messages

Use the conventional form: a type, a scope, and a short imperative
subject.

| Type | Use |
| --- | --- |
| `feat` | A new feature or content |
| `fix` | A defect fix |
| `perf` | A performance change |
| `test` | A test change |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, and housekeeping |

Keep the subject at 72 characters or less. Use the body for the reason
of the change, not for a list of files.

## Code and copy

- The code is TypeScript and Svelte 5. Follow the file that you edit.
- Interface text and story copy exist in Russian and English. Update
  both languages in the same change.
- Keep product names as the product writes them, for example
  "AdGuard Home" and "Meta Quest Browser".
- Do not add a dependency without a reason in the pull request.

## Pull requests

- Keep the pull request small. One purpose per pull request.
- Fill in the pull request template.
- Add a screenshot or a short recording for a visual change.
- Make sure the CI check passes.
- The maintainer reviews the change and answers with comments or a
  merge.

The project uses squash merge. The pull request title becomes the
commit subject, so write it in the same style.

## Report a security problem

Do not open a public issue for a security problem. Follow
[SECURITY.md](SECURITY.md).
