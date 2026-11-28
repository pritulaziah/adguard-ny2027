# AdGuard 2026 in Review

A paper-craft world of AdGuard's 2026 highlights.

## Description

AdGuard 2026 in Review turns the year into a paper-craft world with four
seasons, a welcome, six story stops, and a finale. At each story stop a
story fades in. Its button opens a longer release dialog, and glowing
marks on the figures behind it show short notes. The page is for AdGuard
users and anyone who wants a quick tour of what the team shipped in
2026, without reading a long list of release notes.

## Access

- **URL**: https://pritulaziah.github.io/adguard-ny2027/
- **Browsers**: a current Chrome, Edge, Firefox, or Safari. The scene
  uses WebGPU when the browser provides it and falls back to WebGL2.
- **Account**: no account and no sign-in.

## Quick start

1. Open the page URL.
2. Scroll or drag to move through the seasons.
3. Open a story with its button. Click a glowing mark on a figure for a
   short note.
4. Switch the language from the top corner.

## Features

- Six stories, one at each story stop, across four seasons.
- A release dialog for every story, with a cover image and a link to the
  AdGuard blog.
- A short note for every interactive figure.
- A curved wooden summer bridge over a stream. The van climbs and descends its deck.
- Keyboard support: the arrow keys move between stops.
- A language switch for the whole page.

## Documentation

- [Development](DEVELOPMENT.md) — set up the project, run the commands,
  change the content
- [Contributing](CONTRIBUTING.md) — report a problem, propose a change,
  open a pull request
- [Security](SECURITY.md) — report a vulnerability privately

## TODO

- [ ] Explore a distinct, expressive animation for each figure that presents
      an interesting fact, including animals and the snowman. Reduce repeated
      movements, try different ideas, and choose the most interesting animation
      for each figure.
- [ ] Decide whether one vehicle runs the whole route: a car in every season
      or a train in every season. The summer scene has a bright meadow with
      a narrow stream and a curved wooden bridge. Decide the future of the
      bicycle and the punt. Wait for concept approval before this work starts.
- [ ] Decide the final font set and delete the unused fonts. Unbounded is
      declared but not used in code today. Keep it while the design is in
      progress, then delete the unused files in `public/fonts` and their
      `@font-face` rules in `src/styles/fonts.css`.
- [ ] Shrink the mascot portrait textures further. The three WebP portraits
      weigh 432 KB at full resolution. The scene shows a figure about 200 px
      high on a desktop screen. To go lower, crop each image to its box in
      `portraits.json`, resize it to 800 px high, update the crop numbers, and
      remove the UV remap in `paper-sprite.ts`. The result is about 145 KB.
      Take this step only if the smaller texture looks the same in the finale.
