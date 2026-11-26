/**
 * Lets the browser paint the loading screen between heavy build steps.
 *
 * `scheduler.yield` continues the work at the same priority once the browser
 * has had its chance to render. Other engines wait for the next frame instead.
 */
export async function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (typeof scheduler?.yield === 'function') {
    await scheduler.yield();
    return;
  }
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

/**
 * Yields only after `interval` milliseconds of continuous work, so short steps
 * keep the loading time low and long steps never block a frame for long.
 */
export function createYieldPacer(interval = 12): () => Promise<void> {
  let since = performance.now();
  return async (): Promise<void> => {
    if (performance.now() - since < interval) return;
    await yieldToMain();
    since = performance.now();
  };
}
