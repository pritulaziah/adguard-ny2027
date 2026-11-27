<script lang="ts">
  import { onDestroy } from 'svelte';
  import { copy } from '../content/i18n';
  import { controlsHelpOpen } from '../content/controls-help';
  import { openStoryId } from '../content/story-modal';
  import { objectFact } from '../content/object-fact';

  let { ready }: { ready: boolean } = $props();
  let dialog = $state<HTMLDialogElement>();

  onDestroy(() => controlsHelpOpen.set(false));

  $effect(() => {
    if (!dialog) return;
    if ($controlsHelpOpen && !dialog.open) dialog.showModal();
    else if (!$controlsHelpOpen && dialog.open) dialog.close();
  });

  function close(): void {
    controlsHelpOpen.set(false);
  }
  function open(): void {
    objectFact.set(null);
    controlsHelpOpen.set(true);
  }
  function backdrop(event: MouseEvent): void {
    if (event.target !== dialog || !dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
      close();
  }
</script>

{#if ready && !$openStoryId}
  <button
    type="button"
    class="controls-help"
    aria-label={$copy.controls.title}
    title={$copy.controls.title}
    aria-haspopup="dialog"
    onclick={open}
  >
    <span class="help-symbol" aria-hidden="true">?</span>
  </button>
{/if}

<dialog
  bind:this={dialog}
  class="controls-dialog"
  aria-labelledby="controls-title"
  onclose={close}
  oncancel={close}
  onclick={backdrop}
>
  <h2 id="controls-title">{$copy.controls.title}</h2>
  <ul>
    <li>
      <span aria-hidden="true">↕</span>
      <p>{$copy.controls.mouse}</p>
    </li>
    <li>
      <span aria-hidden="true">☝</span>
      <p>{$copy.controls.touch}</p>
    </li>
    <li>
      <span aria-hidden="true">← →</span>
      <p>{$copy.controls.keyboard}</p>
    </li>
  </ul>
  <button type="button" class="controls-close" onclick={close}>{$copy.controls.close}</button>
</dialog>

<style>
  .controls-help {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #fff4df;
    pointer-events: auto;
  }
  .help-symbol {
    display: grid;
    place-items: center;
    width: 21px;
    height: 21px;
    border: 1px solid currentColor;
    border-radius: 50%;
    font-weight: 600;
  }
  .controls-dialog {
    width: min(460px, calc(100vw - 36px));
    max-height: calc(100dvh - 36px);
    padding: 28px;
    border: 1px solid #e0d3b7;
    border-radius: 5px 12px 7px 3px;
    overflow: auto;
    background: #f5efdf;
    color: #455c50;
    box-shadow: 0 20px 90px #192b384d;
    touch-action: pan-y;
    pointer-events: auto;
  }
  .controls-dialog::backdrop {
    background: #25394494;
    backdrop-filter: blur(4px);
  }
  h2 {
    margin: 0 0 20px;
    font-family: var(--font-hand);
    font-size: 38px;
    line-height: 1;
  }
  ul {
    display: grid;
    gap: 18px;
    margin: 0 0 24px;
    padding: 0;
    list-style: none;
  }
  li {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  li > span {
    flex: 0 0 36px;
    text-align: center;
    font-size: 20px;
    white-space: nowrap;
  }
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  }
  .controls-close {
    min-height: 44px;
    padding: 10px 22px;
    border: 1px solid #c3cdb3;
    border-radius: 3px;
    background: #dfe7d2;
    color: #455c50;
  }
  .controls-help:hover {
    background: #fff4df1a;
  }
  .controls-close:hover {
    background: #e1e8d7;
  }
  .controls-close:focus-visible {
    outline-color: #456b53;
  }
</style>
