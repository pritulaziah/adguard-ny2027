<script lang="ts">
  import { snowmanFact, snowmanFactCopy } from '../content/snowman-fact';
  import { homeStoryOpen } from '../content/home-story';
  import { language } from '../content/i18n';

  const left = $derived($snowmanFact ? Math.max(12, Math.min($snowmanFact.width - Math.min(320, $snowmanFact.width - 24) - 12, $snowmanFact.x - 160)) : 0);
  $effect(() => { if ($homeStoryOpen) snowmanFact.set(null); });
  function outside(event: PointerEvent) {
    if (event.target instanceof Element && !event.target.closest('.snowman-fact, [data-interaction="snowman"]')) snowmanFact.set(null);
  }
</script>

<svelte:window onpointerdown={outside} onkeydown={event => { if (event.key === 'Escape') snowmanFact.set(null); }} />

{#if $snowmanFact}
  <aside id="snowman-fact" class="snowman-fact" role="status" aria-live="polite" style={`left:${left}px;top:${Math.max(270, Math.min($snowmanFact.height - 20, $snowmanFact.y - 22))}px;--tail:${Math.max(22, Math.min(290, $snowmanFact.x - left))}px`}>
    <header><span>{$snowmanFactCopy.title}</span><button type="button" aria-label={$snowmanFactCopy.close} onclick={() => snowmanFact.set(null)}>×</button></header>
    <p>{$snowmanFactCopy.text}</p>
    <a href={`https://adguard-dns.io/${$language}/blog/adguard-home-v1-0-beta.html`} target="_blank" rel="noreferrer">{$snowmanFactCopy.source} ↗</a>
  </aside>
{/if}

<style>
  .snowman-fact { position: fixed; z-index: 4; width: min(320px, calc(100vw - 24px)); transform: translateY(-100%); padding: 15px 18px 17px; border: 1px solid #d9cba9; border-radius: 5px 9px 3px 6px; background: #f4ebd6; color: #526a56; box-shadow: 2px 4px 0 #54472e20; pointer-events: auto; }
  .snowman-fact::after { content: ''; position: absolute; bottom: -10px; left: calc(var(--tail) - 10px); width: 18px; height: 18px; background: #f4ebd6; border-right: 1px solid #d9cba9; border-bottom: 1px solid #d9cba9; transform: rotate(45deg); }
  header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  header > span { font-family: var(--font-hand); font-size: 28px; line-height: 1; }
  button { width: 32px; height: 32px; padding: 0; background: transparent; border: 0; color: #718068; font-size: 25px; line-height: 1; }
  p { margin: 10px 0 12px; font-size: 14px; line-height: 1.65; }
  a { color: #8a9278; font-size: 10px; text-underline-offset: 3px; }
  button:focus-visible, a:focus-visible { outline-color: #5d7b59; }
</style>
