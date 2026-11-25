<script lang="ts">
  import { articlesByLanguage } from '../content/articles';
  import { language, copy } from '../content/i18n';
  import { STOP_COUNT } from '../world/route';
  import { openHomeStory, homeStoryCopy } from '../content/home-story';

  let { index }: { index: number } = $props();
  let isFinal = $derived(index === STOP_COUNT);
  let article = $derived(index > 0 && index < STOP_COUNT ? articlesByLanguage[$language][index - 1] : null);
</script>

<article class="wall-story" class:welcome={index === 0 || isFinal} aria-label={article?.station ?? $copy.station}>
  {#if article}
    <p class="wall-eyebrow">{$copy.story} 0{index} · ADGUARD 2026</p>
    <h1>{article.title}</h1>
    <p class="wall-summary">{article.summary}</p>
    <p class="wall-note">{article.facts.join(' · ')}</p>
    {#if index === 1}
      <button class="story-open" type="button" onclick={openHomeStory}>{$homeStoryCopy.open} <span aria-hidden="true">↗</span></button>
    {:else}
      <a href={article.link} target="_blank" rel="noreferrer">{$copy.read} ↗</a>
    {/if}
  {:else}
    <p class="wall-eyebrow">ADGUARD · {$copy.year}</p>
    <h1>{isFinal ? $copy.finalTitle : $copy.welcomeTitle}</h1>
    <p class="wall-summary">{isFinal ? $copy.finalSummary : $copy.welcomeSummary}</p>
    {#if !isFinal}<p class="wall-note">{$copy.welcomeNote}</p>{/if}
  {/if}
</article>
