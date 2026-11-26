# Seasonal Scene Improvements

Status: Draft for discussion. This document does not approve implementation.

## Purpose

This document records proposed scene changes and their implementation order.
It separates user constraints from recommendations and unresolved decisions.
The scope covers objects, animation, weather, seasonal transitions, and the
December finale.

## User constraints

- Preserve the existing work where possible.
- Preserve the summer boat, waves, and fish.
- Preserve the main autumn scene.
- Review the lighthouse. It currently communicates a coastal location more
  strongly than the summer season.
- Review spring density and appearance. Spring may be too uniformly lush.
- Add visible changes between seasons, including leaves falling from trees.
- The final scene represents December, winter, and New Year.
- Determine how visitors who reach the end receive a gift or discount.
- Do not implement scene changes during this discussion.

## Current implementation

The route contains five seasonal sections and six release stories, followed
by a finale. Section lengths are not equal. Summer has one story stop,
while spring and autumn each have two.

Existing seasonal color ramps blend the background, ground, and distant
landscape. Existing weather zones provide seasonal particles.
These systems provide a starting point for changes to object state.

### Scene inventory

- Initial winter: train, snow-covered firs, deer, and snowman.
- Spring: bicycle with flowers, green and flowering trees, flower groups,
  garden gate, fox, pond, and frog.
- Summer: sailboat, wave strips, lighthouse, coastal pines, sea dragon,
  crab, fish, and gull.
- Autumn: van, birch, maple, oak, fallen leaves, airborne leaves, cat,
  rabbit, and interactive mailbox.
- Final winter: festive train, decorated firs, snowman, and cabin.

Existing animal motions include ear movement, blinking, tail movement,
crab steps, fish jumps, splashes, and gull flight. Review and reuse these
motions before adding replacements.

### Relevant source files

All world paths below are relative to `src/lib/world/`.

- `route.ts`: route length, stop positions, and scroll movement.
- `seasons.ts`: season borders and color ramps.
- `paper-scenery.ts`: scenery construction, trees, travel surfaces,
  transfer points, and object registration.
- `paper-backdrop.ts`: landscape layers, sky objects, and foreground framing.
- `paper-animals.ts`: animal geometry and moving parts.
- `paper-vehicles.ts`: seasonal vehicles and their movement.
- `paper-train.ts`: initial and final trains.
- `part-motion.ts`: motion functions and shared frame data.
- `paper-materials.ts`: paper materials and weather fields.
- `YearWorld.ts`: scene lifecycle, weather, interactions, and frame updates.

Interaction labels and figure notes are in `src/lib/content/i18n.ts` and
`src/lib/content/figure-facts.ts`.

## Proposed seasonal changes

### Initial winter: January and February

Keep the current vehicle and main objects.

- Use a restrained palette and sparse snowfall.
- Keep train steam visible during movement.
- Make the deer react occasionally to the approaching train.
- Use a short snowman greeting when the visitor approaches or interacts.
- Reduce snow coverage near the spring boundary.
- Introduce exposed ground, small wet areas, and occasional drops near
  the boundary.

Acceptance criteria:

- The section reads as winter without New Year decorations.
- The spring boundary includes an intermediate thaw state.
- Character gestures have pauses between actions.

### Spring: March to May

Keep the bicycle, fox, garden, pond, and frog. Distribute vegetation along
the route to represent successive stages of spring.

- Early spring: residual snow, exposed soil, bare branches, buds, and
  limited flowers.
- Middle spring: small leaves, isolated flowering trees, and early
  flower groups.
- Late spring: fuller green canopies, more flowers, and the existing
  flower-filled bicycle basket.

Review flower density before reducing saturation across the whole section.
Keep the most developed vegetation near late spring.

Animation proposals:

- Fox: occasional head or ear movement with a pause afterward.
- Frog: a discrete jump followed by a splash or expanding water rings.
- Trees and flowers: low-amplitude movement during shared wind events.
- Blossoms: occasional falling petals near the summer boundary.

Acceptance criteria:

- Early and late spring are distinguishable without interface labels.
- Full blossoms and dense flowers do not cover the entire section.
- The pond and frog remain visible beside the story interface.

### Summer: retain the boat and review the shore

The recommended direction is a summer bay with a vegetated shore.
This is a proposal, not a selected design.

Options:

1. Summer bay: retain marine animals and existing water geometry.
   Replace or reduce the lighthouse and add a shaded shore.
2. River or lake: retain the boat and fish. Review the crab, gull,
   coastal pines, and lighthouse for consistency with the new setting.
3. Longer summer: use two consecutive water sections with different
   shore treatments. Keep the boat throughout both sections.

Option 1 preserves the most existing work. Option 2 changes more objects.
Option 3 changes route proportions and needs a second distinct scene.
Do not double the section length before choosing its content.

Recommended changes for option 1:

- Replace the dominant lighthouse silhouette with a tree beside a small
  pier, subject to design review.
- Add one secondary summer object: a striped umbrella, bathing ladder,
  or towel. Choose one before implementation.
- Retain the boat, wave movement, fish jump, and splash.
- Retain the crab and gull if the bay setting is selected.
- Review the dragon's size, position, and activity. Consider occasional
  movement farther from the foreground.
- Preserve clear space around the boat and story text.

Animation proposals:

- Coordinate sail movement and shore vegetation through shared wind.
- Show a small wake while the boat moves.
- Keep the fish jump, dive, splash, and water rings as one sequence.
- Let the gull approach, accompany the boat briefly, and leave.
- Keep pauses between crab movement and claw gestures.

The lighthouse currently has an interaction, a label, and a figure note.
If removed, transfer or replace that interaction deliberately. Update both
languages and the related content tests. Do not leave an invisible target.

Acceptance criteria:

- The boat, waves, and fish remain part of the scene.
- Summer is recognizable from the shore, vegetation, and lighting.
- The lighthouse no longer determines the entire section's identity.
- The selected setting is consistent with its animals and vegetation.

### Autumn: September to November

Keep the van, main tree species, animals, and mailbox.

- Early autumn: retain some green foliage and add limited yellow leaves.
- Middle autumn: use the existing gold, orange, and red canopies.
- Late autumn: reduce canopy density and expose more branches.
- Increase ground leaf coverage as canopy coverage decreases.
- Let passing vehicle movement disturb a small number of ground leaves.
- Reduce color saturation near the final winter boundary.

Animation proposals:

- Cat: retain blinking and occasional tail movement.
- Rabbit: retain occasional ear movement. Review any additional movement
  against the available space.
- Trees: detach selected leaves during wind events.
- Detached leaves: fall, settle, and become part of the ground coverage.

Acceptance criteria:

- Late autumn has visibly fewer leaves on trees than middle autumn.
- Falling leaves originate from visible foliage.
- Leaves settle rather than disappear in the middle of a fall.
- The mailbox interaction remains accessible.

### Final winter: December and New Year

The final scene remains under design. Keep the existing festive train,
decorated firs, snowman, and cabin as candidate assets.

Recommended direction:

- Use a small destination station or arrival area.
- Distinguish it from initial winter through warm windows, decorations,
  and evening lighting.
- Provide a visible arrival point for the train.
- Place one gift object near the platform, cabin door, or decorated tree.
- Present the reward action after arrival.

Deferred decisions:

- Final layout and train stopping position.
- Gift appearance and reveal animation.
- Gift or discount type and eligibility.
- Reward delivery: link, displayed code, or another mechanism.
- Behavior when the visitor returns, reloads, or reaches the end again.

Do not infer reward rules from decorative scene interactions. Define the
rules before implementing reward state or interface behavior.

## Seasonal transitions

### Winter to spring

Reduce snowfall and snow coverage. Reveal soil and wet patches. Introduce
buds before full leaves. Keep residual snow through the start of spring.

### Spring to summer

Reduce blossoms and falling petals. Increase leaf coverage and grass
height. Introduce the shore before the boat section. Preserve a readable
transfer point between the bicycle path and water.

### Summer to autumn

Introduce isolated yellow leaves while most foliage remains green.
Reduce bright summer accents, dry selected grasses, and increase wind.
Keep the water exit and van arrival consistent with the shore layout.

### Autumn to winter

Use this visual sequence: leaf fall, exposed branches, frost, sparse
snowfall, then established snow coverage. Allow visible overlap between
fallen leaves and the first snow. Preserve the transfer to the final train.

## Animation and state requirements

Separate route-dependent state from time-dependent animation.

- Derive seasonal state from route distance. This includes snow coverage,
  leaf coverage, blossom density, and transition progress.
- Keep ambient motion time-dependent. This includes waves, steam, and
  small animal gestures.
- Use consistent route state when scrolling backward or jumping ahead.
- Keep the seasonal state stable when the visitor stops scrolling.
- Make shared wind affect related objects with compatible direction
  and timing.
- Avoid simultaneous prominent gestures in the same camera view.
- Preserve immediate feedback for deliberate user interactions.
- Preserve seasonal state with reduced motion enabled. Suppress optional
  movement without hiding essential scenery or controls.
- Use reproducible leaf positions and transition state. Do not accumulate
  permanent leaf loss on every visit to a section.

Leaf fall needs a specific decision before implementation: use spatial
stages, route-driven animation, or a combination. It must support reverse
scrolling without detached leaves appearing unrelated to canopy changes.

Existing scenery uses shared geometry batches. Review which canopy and snow
parts need independent state before changing their geometry or materials.
Preserve batching for static scenery and limit animated detail to visible
objects. Compare performance against the current scene.

## Proposed implementation order

This is a draft work sequence. Exact interfaces, transition widths, and
visual values remain subject to design review.

1. Resolve visual decisions.
   Select the summer setting, lighthouse replacement, leaf-fall model,
   and finale scope. Keep existing route lengths until this review ends.
2. Define seasonal state.
   Extend `seasons.ts` with continuous transition progress. Integrate
   state updates through `YearWorld.ts` and `part-motion.ts` as needed.
   Verify forward travel, reverse travel, direct jumps, and stationary state.
3. Implement vegetation and snow stages.
   Update tree and surface construction in `paper-scenery.ts`. Update
   `paper-materials.ts` and `paper-backdrop.ts` only where required.
   Complete winter-to-spring and autumn-to-winter state changes first.
4. Revise spring and summer composition.
   Redistribute spring vegetation. Apply the selected summer treatment.
   Update affected interactions and labels. Complete the remaining two
   seasonal transitions. Change `route.ts` only if length changes are chosen.
5. Coordinate animation.
   Review existing motions in `part-motion.ts`, animals in
   `paper-animals.ts`, and vehicles in `paper-vehicles.ts`.
   Add pauses, shared wind, leaf settling, and movement-dependent effects.
6. Design and implement the finale after reward decisions.
   Review `paper-train.ts`, finale scenery, and localized interface text.
   Select reward integration files after the delivery mechanism is defined.
7. Validate the complete journey.
   Run automated checks and inspect every section and boundary in a browser.
   Adjust density, timing, and performance from the observed result.

## Verification for future implementation

Automated checks:

- Add route-state tests for transition bounds, reverse travel, and jumps.
- Extend motion tests for leaf state, event timing, and reduced motion.
- Extend content tests if an interaction is removed or reassigned.
- Update `src/lib/world/route.test.mjs` if route or season boundaries change.
- Run `npm test`, `npm run check`, and `npm run build`.

Visual checks:

- Inspect every section at its start, middle, and end.
- Cross each seasonal boundary in both directions.
- Stop inside each transition and wait. Seasonal state must stay stable.
- Jump across several sections and inspect the resulting state.
- Check desktop and portrait layouts, including text overlap and controls.
- Check reduced motion, WebGPU rendering, and the WebGL2 fallback.
- Compare frame time and scene loading before and after changes.
- Verify that the final reward remains available after arrival under the
  selected reward rules.
