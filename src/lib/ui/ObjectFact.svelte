<script lang="ts">
  import { objectFact, objectFactCopy } from '../content/object-fact';

  const left = $derived($objectFact ? Math.max(12, Math.min($objectFact.width - Math.min(320, $objectFact.width - 24) - 12, $objectFact.x - 160)) : 0);

  function outside(event: PointerEvent): void {
    if (event.target instanceof Element && !event.target.closest('.object-fact, [data-interaction]')) objectFact.set(null);
  }
</script>

<svelte:window onpointerdown={outside} onkeydown={event => { if (event.key === 'Escape') objectFact.set(null); }} />

{#if $objectFact && $objectFactCopy}
  <aside id="object-fact" class="object-fact" role="status" aria-live="polite" style={`left:${left}px;top:${Math.max(270, Math.min($objectFact.height - 20, $objectFact.y - 22))}px;--tail:${Math.max(22, Math.min(290, $objectFact.x - left))}px`}>
    <header><span>{$objectFactCopy.title}</span><button type="button" aria-label={$objectFactCopy.close} onclick={() => objectFact.set(null)}>×</button></header>
    <p>{$objectFactCopy.text}</p>
  </aside>
{/if}

<style>
  .object-fact { position: fixed; z-index: 4; width: min(320px, calc(100vw - 24px)); transform: translateY(-100%); padding: 15px 18px 17px; border: 1px solid #d9cba9; border-radius: 5px 9px 3px 6px; background: #f4ebd6; color: #526a56; box-shadow: 2px 4px 0 #54472e20; pointer-events: auto; }
  .object-fact::after { content: ''; position: absolute; bottom: -10px; left: calc(var(--tail) - 10px); width: 18px; height: 18px; background: #f4ebd6; border-right: 1px solid #d9cba9; border-bottom: 1px solid #d9cba9; transform: rotate(45deg); }
  header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  header span { font-family: var(--font-hand); font-size: 21px; line-height: 1.2; }
  button { width: 32px; height: 32px; padding: 0; background: transparent; border: 0; color: #718068; font-size: 25px; line-height: 1; }
  p { margin: 10px 0 12px; font-size: 14px; line-height: 1.65; }
  button:focus-visible { outline-color: #5d7b59; }
</style>
