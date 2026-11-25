<script lang="ts">
  import Stage from './lib/world/Stage.svelte';
  import { createJourneyState } from './lib/world/journey-state';
  import { language, copy, setLanguage } from './lib/content/i18n';

  const journey = createJourneyState();
  let contentLayer = $state<HTMLDivElement>();
  let error = $state<'loadError' | 'webglError' | ''>('');

  $effect(() => {
    document.documentElement.lang = $language;
    document.title = $copy.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', $copy.description);
  });
</script>

<main class="experience" class:is-ready={$journey.ready} data-motion={$journey.moving ? 'moving' : 'stopped'} data-stop={$journey.stop} data-settled={$journey.cameraSettled} data-discoveries={$journey.discoveries} aria-label={$copy.scene}>
  <div bind:this={contentLayer} class="world-content"></div>
  <Stage {journey} layer={contentLayer as HTMLDivElement} onerror={kind => { error = kind; }} />

  <header class="masthead">
    <img class="brand-logo" src={`${import.meta.env.BASE_URL}adguard-logo.svg`} alt="AdGuard" width="178" height="42" />
    <div class="language-switch" role="group" aria-label={$copy.language}>
      <button type="button" lang="en" aria-label="English" aria-pressed={$language === 'en'} onclick={() => setLanguage('en')}>EN</button>
      <span aria-hidden="true">/</span>
      <button type="button" lang="ru" aria-label="Русский" aria-pressed={$language === 'ru'} onclick={() => setLanguage('ru')}>RU</button>
    </div>
  </header>

  {#if !$journey.ready && !error}
    <div class="loading-state" role="status"><span class="loading-paper">✦</span><span class="loading-track"><i></i></span><p>{$copy.loading}</p></div>
  {/if}
  {#if error}
    <div class="error-state" role="alert"><p>{$copy[error]}</p><button type="button" onclick={() => window.location.reload()}>{$copy.retry}</button></div>
  {/if}

  <footer class="journey-footer" class:visible={$journey.ready}>
    <div class="journey-controls">
      <div class="journey-status" aria-live="polite">
        {#if $journey.message}{$copy.interactions[$journey.message].message}
        {:else if $journey.moving}{$copy.travelHint}
        {/if}
      </div>
    </div>
  </footer>
</main>
