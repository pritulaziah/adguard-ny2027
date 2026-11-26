# Refactoring and Performance Ideas

Status: Draft for discussion. This document does not approve
implementation.

## Purpose

This document lists performance and refactoring work for the paper
world. It is a companion to `IDEAS.md`. `IDEAS.md` covers the seasonal
story and scene content. This document covers how the scene is built,
animated, and drawn.

The goal is a short list of changes with evidence, expected effect,
risk, and order. It is not a plan. Pick one item, write a short design,
then implement it.

## Constraints

- Preserve the current visual result at every stop.
- Keep the shared paper material and the merged static batches.
- Keep reduced motion, keyboard access, ARIA state, and both renderers.
- Do not change story copy, timing, camera feel, or scene content here.
- Measure before and after each change. Attach a before and after table
  and screenshots at fixed stops.
- Do not merge a change that adds a per-frame cost without a measured
  reason.
- Do not start implementation from this document.

## How to read the catalog

| Mark | Meaning |
| --- | --- |
| P0 | Do first. It enables measurement of everything else. |
| P1 | Clear win with low risk. |
| P2 | Likely win. Measure on the target device first. |
| P3 | Optional or large work. |

Effort is S for under a day, M for a few days, L for a week or more.
Risk is low, medium, or high. A high-risk item needs a prototype before
it enters a plan.

## Baseline

Measured on 26 November 2026 from the working tree at that time. The
scene content was in the middle of the December finale work, so these
numbers move with content changes. Treat them as a starting point, not
as a permanent budget.

Method: a temporary development hook exposed the renderer and scene.
A Playwright script opened the page in Edge with WebGPU at 1440x900 and
device pixel ratio 1. It waited for a settled stop, then read
`renderer.info` and 90 frame intervals.

| Stop | Calls | Triangles | Geom. | Med. ms | P95 ms |
| --- | --- | --- | --- | --- | --- |
| 0 | 53 | 250857 | 249 | 6.9 | 7.0 |
| 2 | 59 | 251585 | 252 | 6.9 | 7.1 |
| 4 | 95 | 249581 | 256 | 6.9 | 7.1 |
| 6 | 46 | 248049 | 256 | 7.0 | 7.1 |
| 7 | 55 | 251109 | 259 | 6.9 | 7.0 |

Headless frame times are not a device benchmark. The counter values are
reliable and repeatable.

Scene graph at stop 0:

- 516 nodes in total.
- 234 groups. 188 of them are empty.
- 268 meshes, 8 instanced meshes, 12 sprites.
- 3 textures.

Static batches:

- `folded-paper-details`: 194904 vertices in one mesh.
- `folded-paper-firs`: 44412 vertices in one mesh.

Fleet after the merge commit:

- 41 meshes, 29 geometries, 1 material.

Two observations set the order below.

1. Draw calls are already low. The current range is 46 to 95. Batching
   works. Do not add draw calls without a clear reason.
2. Rendered triangles stay near 250000 at every stop. The two large
   static batches span the whole route, so their bounding spheres cover
   everything and the renderer never culls them. Off-screen parts of
   the route are processed on every frame.

## Already done, do not regress

- One shared sheet material for all paper shapes. Colour rides in the
  vertex colours.
- Static scenery batches into two draw calls.
- Every vehicle merges its still parts. Wheels share cached geometry.
- Motion functions bind to parts at build time. The frame loop has no
  switch and no kind lookup.
- Parts farther than 13 units from the camera skip their motion.
- Stories and sparks write to the DOM only when their state changes.
- The build runs in slices. The renderer precompiles the route.
- Pixel ratio is capped at 1.6. A hidden tab stops the animation loop.
- Draw-call and vertex-colour tests guard the fleet.

## Catalog

### 0. Measurement and guardrails

Evidence: every later item needs a before and after number. The last
measurement used a temporary hook that is not in the repository.

Change:

- Add a development-only stats panel behind `?stats`. Show draw calls,
  triangles, geometries, textures, build time, and JavaScript frame
  time.
- Add `scripts/perf.mjs`. It drives the page to the five measured stops
  and prints the table above.
- Add budget tests: fleet mesh count exists; add scenery node count,
  empty group count, and draw call count in the browser script.
- Run the script for WebGPU and for `?webgl`.

Expected: a repeatable baseline and a guard against regressions.

Risk: low. Effort: S. Priority: P0.

Files: `src/lib/world/Stage.svelte`, `scripts/`, `package.json`.

### 1. Split static batches into route chunks

Evidence: `folded-paper-details` has 194904 vertices and
`folded-paper-firs` has 44412. Both meshes span the whole route. Their
bounding spheres always intersect the view, so the renderer draws about
250000 triangles at every stop, including triangles far behind the
camera. Draw calls are only 46 to 95, so there is room to trade draw
calls for fewer triangles.

Change: build one batch per route window, for example 8 to 12 units
wide, or one batch per station and transfer. Attach a name and a
bounding sphere to each batch. The renderer then culls off-screen
windows. Consider `THREE.BatchedMesh` if the WebGPU backend in r187
supports per-geometry culling; test it before using it.

Expected: rendered triangles fall sharply. Draw calls rise by roughly
8 to 20. Verify the balance on the target mobile device.

Risk: medium. More draw calls and more build code. Opaque materials and
depth testing keep the visual result the same. Effort: M. Priority: P1.

Files: `paper-brush.ts`, `paper-scenery.ts`, `paper-backdrop.ts`.

### 2. Remove empty groups

Evidence: 188 of 516 scene nodes are empty groups. `PaperDetail` creates
a group for every still detail, but the geometry goes into a batch. The
group stays in the scene graph and is traversed every frame.

Change: prune empty groups after the build, or create the group only
when a mesh is parented to it. Keep the current static matrix update on
the groups that remain.

Expected: 36 percent fewer scene nodes. Small CPU gain. Cleaner graph.

Risk: low. Effort: S. Priority: P1.

Files: `paper-brush.ts`, `paper-scenery.ts`.

### 3. Dispose module-level caches

Evidence: `templates` in `paper-brush.ts` and `wheelTemplates` in
`paper-train.ts` and `paper-vehicles.ts` are module-level maps.
`YearWorld.destroy` resets materials but not these maps. A remount or a
hot update keeps the geometries alive.

Change: export one reset function for each cache. Call it from
`YearWorld.destroy`. Add a test that the caches are empty after reset.

Expected: no leak across remounts and hot updates.

Risk: low. Effort: S. Priority: P1.

Files: `paper-brush.ts`, `paper-train.ts`, `paper-vehicles.ts`,
`YearWorld.ts`.

### 4. Replace dimension-keyed templates with unit shapes

Evidence: templates are keyed by exact width, height, and depth. Most
calls use new dimensions, so the cache misses and each call builds an
`ExtrudeGeometry`. Autumn leaf drifts use a random size for each leaf,
which creates many near-identical templates.

Change: keep one unit oval, one unit leaf, and one unit rectangle.
Apply width and height as a placement scale for batched shapes. Use a
small ladder of leaf sizes, for example 4 sizes, and scale those. Keep
two or three depth variants so the fold thickness stays close to the
current value.

Expected: fewer geometries, less build work, less memory. Add a
development counter for template entries to confirm the drop.

Risk: medium. Non-uniform scale changes the fold thickness unless depth
is handled. Check the leaves, blossoms, and clouds at all stops.

Effort: M. Priority: P1.

Files: `paper-brush.ts`, `paper-shapes.ts`, `paper-scenery.ts`,
`paper-backdrop.ts`.

### 5. Compute route state once per frame

Evidence: `seasonalState(distance)` returns a new object. The
`thaw-snow` and `frost-snow` motions call it for every snow mesh and
every frame. `leafFallProgress` calls it for every leaf. The route value
is the same for all of them on one frame.

Change: compute the seasonal state once in `YearWorld.tick`, store it on
`MotionFrame`, and pass it to the motions. Add a function that takes the
already-computed autumn value. Add `distanceChanged` so route-driven
motions can skip work while the camera is at rest.

Expected: fewer allocations and fewer smoothstep calls per frame. The
effect is small on desktop and larger on mobile.

Risk: low. Effort: S. Priority: P1.

Files: `seasons.ts`, `part-motion.ts`, `seasonal-leaves.ts`,
`YearWorld.ts`.

### 6. Stop updating seasonal leaves when the result is stable

Evidence: each crown is one `InstancedMesh` with 140 leaves. Six crowns
give 840 instances. The update writes 140 matrices per active crown on
every frame and always sets `instanceMatrix.needsUpdate`. Culling is
disabled. A Node measurement gives about 0.1 ms per frame for all six
crowns, before GPU upload.

Change:

- Skip the whole update when the autumn progress is 0 or 1 and there is
  no wind.
- Update only while the route value changes.
- Set `visible` or `count` instead of writing matrices for leaves that
  cannot be seen.
- Give the mesh a large manual bounding sphere instead of disabling
  frustum culling.
- Reduce the leaf count for small or distant crowns.

Expected: near-zero cost on most frames.

Risk: low. Effort: S. Priority: P2.

Files: `seasonal-leaves.ts`, `part-motion.ts`.

### 7. Merge the weather fields by layer

Evidence: `createWeather` builds 12 sprite systems with 12 materials.
The renderer reports 12 sprites. Counts range from 68 to 190 particles.

Change: use one system per stratum, so three systems instead of twelve.
Move colour, size, fall speed, drift, and opacity into instanced
attributes. Keep the current three depth layers so the parallax result
does not change.

Expected: 12 draw calls become 3, and 12 materials become 3. Less
pipeline setup and better batching of particle work.

Risk: medium. This is a shader change. Test WebGPU and WebGL2, and
compare the particle look at every stop. Effort: M. Priority: P2.

Files: `paper-materials.ts`, `YearWorld.ts`.

### 8. Lower the remaining allocation in the batch writer

Evidence: `PaperBatch` writes into plain number arrays and then copies
into `Float32Array`. It allocates a mask per extrusion and a `Color` per
part. Stroke geometry still builds one extrusion per segment and merges
them.

Change:

- Preallocate or grow typed arrays, and write the final buffer once.
- Cache colours by value.
- Write stroke segments directly into the batch.
- Skip the mask allocation when the shape has no fold.

Expected: lower build time and less garbage. No visual change.

Risk: low. Effort: M. Priority: P2.

Files: `paper-brush.ts`.

### 9. Reduce the remaining fleet draw calls

Evidence: the fleet has 41 meshes. Steam is three meshes per train,
exhaust is five meshes, and wheels are one mesh each.

Change: use one `InstancedMesh` for the steam of each train, one for the
van exhaust, and one per wheel set. Keep the merged body meshes.

Expected: about 41 to 28 draw calls. Small, because the fleet is already
merged. Effort: S. Priority: P3.

Files: `paper-train.ts`, `paper-vehicles.ts`.

### 10. Update CSS 3D and DOM on demand

Evidence: `CSS3DRenderer.render` runs every frame for 12 sparks and 8
stories. Most of them are hidden. Story and spark writes are cached, but
the renderer still traverses its scene.

Change: render the CSS scene only when the camera moved or a visible
sprite moved. Keep a dirty flag. Cache `openStoryId` with a subscription
too; `objectFact` already has one.

Expected: less DOM and style work on still frames.

Risk: medium. A missed update makes a spark lag. Test clicks, facts, and
language changes. Effort: M. Priority: P2.

Files: `YearWorld.ts`.

### 11. Adaptive resolution and renderer settings

Evidence: antialiasing is on, the pixel ratio is capped at 1.6, and the
headless frame time is close to the display refresh. Real devices were
not measured.

Change:

- Lower the render scale when the frame time exceeds a target, and raise
  it when the frame time is stable.
- Cap the pixel ratio at 1.5 on high-density mobile screens.
- Test antialiasing off together with a higher render scale.
- Set `powerPreference: 'high-performance'`.

Expected: stable frame time on weaker GPUs, at some cost in sharpness.

Risk: medium. Visual quality changes. Effort: M. Priority: P2.

Files: `Stage.svelte`.

### 12. Audit materials and pipelines

Evidence: the scenery reports 6 materials, the weather builds 12, and
the wall, floor, ground, and three ridges each build their own seasonal
material. Every unique node material is a pipeline to compile.

Change:

- Count pipelines in development and keep the number flat.
- Consider one seasonal sheet material with a small ramp texture and
  uniforms for the wash and grain. Reuse it for the wall, floor, ground,
  and ridges.
- Keep the transparent sheet shared.

Expected: fewer pipeline compiles and less setup on the first frame.
Small steady-state gain.

Risk: medium. The ramp and grain shader must match the current look.
Effort: M. Priority: P2.

Files: `paper-materials.ts`, `YearWorld.ts`, `paper-backdrop.ts`.

### 13. Verify precompile coverage for new content

Evidence: `precompileRoute` uses a wide field of view from the middle of
the route. New material paths for leaves, the pier, the gift, and snow
may not be inside that pass. A missing pipeline causes a stall on the
first visit.

Change: extend the precompile script to both ends of the route, or run
one pass per station. Read the pipeline count before and after.

Expected: no first-visit stall at the finale.

Risk: low. Effort: S. Priority: P2.

Files: `YearWorld.ts`.

### 14. Make procedural content deterministic

Evidence: weather placement uses `Math.random()`. Leaf crowns use a
seeded generator. A different layout on each load defeats screenshot
comparison and build-time benchmarks.

Change: one build seed per scene. Use a seeded generator for weather,
flowers, and leaf drifts. Expose the seed in development.

Expected: repeatable screenshots and tests. Simpler visual review.

Risk: low. Effort: S. Priority: P2.

Files: `YearWorld.ts`, `seasons.ts`, `paper-scenery.ts`.

### 15. Split scenery into section modules

Evidence: `paper-scenery.ts` owns route surfaces, transfers, every
season, the finale, and the shared builders. It is hard to review and
blocks the chunked-batch work.

Change: one module per section with a small interface:

- `buildSurfaces`
- `buildTransfers`
- `buildWinterStart`
- `buildSpring`
- `buildSummer`
- `buildAutumn`
- `buildFinale`

Pass the shared builders, the batch, and the part registry. The top
level becomes a table of sections.

Expected: smaller files, easier review, and a natural place for route
chunks.

Risk: low to medium. This is a move, not a rewrite. Effort: M.
Priority: P3.

Files: `paper-scenery.ts`, new section files.

### 16. Consolidate the paper builder API

Evidence: scene code uses four overlapping APIs: `carded`,
`paper-shapes` functions, `PaperDetail`, and `PaperBatch`. Each has a
different rule for colour, depth, and parenting. New code must know all
four.

Change: one builder with three methods:

- `static(geometry, colour, placement)`: goes into the shared batch.
- `node(name, placement)`: creates a group for animated children.
- `part(mesh, motion)`: registers a motion.

Keep the old functions as thin wrappers during the move.

Expected: fewer mistakes and less duplicate code. No direct frame gain.

Risk: medium. It touches every scenery file. Effort: L. Priority: P3.

Files: `paper-brush.ts`, `paper-shapes.ts`, `paper-mesh.ts`, scene files.

### 17. Move the scene build to a worker

Evidence: the build still runs on the main thread. Slices keep the
loading screen alive, but long sections compete with rendering.

Change: build geometry in a worker and transfer position and colour
buffers. Keep DOM stories and fonts on the main thread. This needs a
serializable scene description and the consolidated builder from item
16.

Expected: smooth loading on slow devices. No steady-state gain.

Risk: high. Effort: L. Priority: P3.

Files: build layer, `schedule.ts`, scene files.

### 18. Set GPU and overdraw budgets

Evidence: 12 weather systems use large soft sprites. Transparent leaves
and snow add overdraw. Draw calls do not show this cost.

Change: measure GPU time on the target device. Set particle counts and
sprite sizes per device class. Reduce the largest soft sprites first.

Expected: better frame time on mobile GPUs.

Risk: medium. The atmosphere can become sparse. Effort: M. Priority:
P3.

Files: `YearWorld.ts`, `seasonal-leaves.ts`.

### 19. Micro fixes

Each fix is small. Group them in one change after the main items.

- Set thaw and frost snow `visible = false` when cover is near zero.
  A zero scale still submits a draw call.
- Hoist colour constants out of loops. For example, the leaf tint base
  colour is created 840 times at build.
- Replace `mesh.userData.leafSeeds` with a typed field or a `WeakMap`.
- Remove the dead `else if (false)` branch in `broadTree`.
- Cache the `openStoryId` value with a subscription.
- Reuse the spark bounding box instead of computing it for each spark.
- Consider a single-channel grain texture. The shader reads only red.
- Check whether `camera.updateMatrixWorld()` is still needed before
  `positionFact`. Let the renderer update the matrix if it is not.

Priority: P3. Effort: S.

## Proposed order

| Phase | Items | Reason |
| --- | --- | --- |
| 0 | 0, 3, 2, 5 | Measure, stop leaks, remove dead nodes, cut churn |
| 1 | 4, 1, 12, 7 | Build cost and rendered triangles |
| 2 | 6, 8, 9, 10, 11, 13, 14 | Steady-state cost and quality checks |
| 3 | 15, 16, 17, 18 | Structure, worker build, GPU budgets |

Item 1 is the largest expected render gain. Item 4 is the largest
expected build gain. Item 0 must come first.

## Verification

For each item:

1. Record the stop table from `scripts/perf.mjs` before the change.
2. Apply the change.
3. Record the same table and the build time.
4. Take screenshots at stops 0, 2, 4, 6, and 7 in English and Russian.
5. Check reduced motion.
6. Check `?webgl`.
7. Run `npm test`, `npm run check`, and `npm run build`.

Add these tests with the first implementation:

- Fleet and scenery node budgets.
- Empty group count is zero after the build.
- Module caches are empty after `destroy`.
- Seasonal leaves do not touch their matrices while the season is
  stable.

## Open questions

1. Which devices are the target? Name the slowest phone and laptop.
2. Is 60 fps required on mobile, or is a stable 30 acceptable?
3. May draw calls rise by 20 to cut rendered triangles by half?
4. May particle and leaf counts depend on the device?
5. Is WebGL2 on mobile a supported target, or a fallback only?
6. Should the December finale work land before performance work starts,
   so the baseline stops moving?

## Non-goals

- New scenes, stories, or seasonal content. See `IDEAS.md`.
- A new renderer or framework.
- Changes to camera feel, scroll timing, or story copy.
- Optimizing code that no measurement shows to be slow.
