<script lang="ts">
  import { homeStoryOpen, homeStoryCopy } from '../content/home-story';
  import { language } from '../content/i18n';
  import { articlesByLanguage } from '../content/articles';

  let dialog = $state<HTMLDialogElement>();
  let body = $state<HTMLDivElement>();
  $effect(() => {
    if (!dialog) return;
    if ($homeStoryOpen && !dialog.open) {
      dialog.showModal();
      if (body) body.scrollTop = 0;
    } else if (!$homeStoryOpen && dialog.open) dialog.close();
  });
  function closeStory() {
    homeStoryOpen.set(false);
    dialog?.close();
  }
  function backdrop(event: MouseEvent) {
    if (event.target !== dialog || !dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeStory();
  }
</script>

<!-- The native dialog owns focus, Escape, and background inertness. -->
<dialog bind:this={dialog} class="home-story-modal" aria-labelledby="home-story-title" aria-describedby="home-story-lead" onclose={() => homeStoryOpen.set(false)} oncancel={() => homeStoryOpen.set(false)} onclick={backdrop}>
  {#if $homeStoryOpen}
    <header class="story-toolbar">
      <span>{$homeStoryCopy.eyebrow}</span>
      <button class="story-close" type="button" aria-label={$homeStoryCopy.close} onclick={closeStory}><span aria-hidden="true">×</span></button>
    </header>
    <div class="story-scroll" bind:this={body}>
      <article class="story-paper">
        <div class="story-intro">
          <p class="release-label">AdGuard Home <b>1.0</b></p>
          <h2 id="home-story-title">{$homeStoryCopy.title}</h2>
          <p id="home-story-lead" class="story-lead">{$homeStoryCopy.lead}</p>
          <div class="story-timeline">
            <div><strong>2018</strong><span>{$homeStoryCopy.first}</span></div>
            <span class="timeline-thread" aria-hidden="true"><i></i><i></i><i></i></span>
            <div><strong>2026</strong><span>{$homeStoryCopy.now}</span></div>
          </div>
        </div>
        <section class="story-reading">
          <h3>{$homeStoryCopy.heading}</h3>
          <p>{$homeStoryCopy.body}</p>
        </section>
        <figure>
          <figcaption><span class="screen-label">01 / {$homeStoryCopy.before}</span><h3>{$homeStoryCopy.beforeTitle}</h3></figcaption>
          <div class="screenshot-mount"><img src={`${import.meta.env.BASE_URL}blog/home/dashboard-before.png`} alt={$homeStoryCopy.beforeAlt} decoding="async" /></div>
        </figure>
        <figure>
          <figcaption><span class="screen-label">02 / {$homeStoryCopy.after}</span><h3>{$homeStoryCopy.afterTitle}</h3></figcaption>
          <div class="screenshot-mount"><img src={`${import.meta.env.BASE_URL}blog/home/dashboard-after.png`} alt={$homeStoryCopy.afterAlt} decoding="async" /></div>
        </figure>
        <div class="story-reading afterword"><p>{$homeStoryCopy.detail}</p></div>
        <a class="screenshot-source" href={`https://adguard-dns.io/${$language}/blog/adguard-home-v1-0-beta.html`} target="_blank" rel="noreferrer">{$homeStoryCopy.source} ↗</a>
        <footer class="story-footer">
          <span>{$homeStoryCopy.footer}</span>
          <a class="full-story" href={articlesByLanguage[$language][0].link} target="_blank" rel="noreferrer">{$homeStoryCopy.read} <span aria-hidden="true">↗</span></a>
        </footer>
      </article>
    </div>
  {/if}
</dialog>

<style>
  .home-story-modal { box-sizing: border-box; width: min(1040px, calc(100vw - 64px)); max-width: none; max-height: min(960px, calc(100dvh - 64px)); padding: 0; border: 1px solid #e0d3b7; border-radius: 5px 12px 7px 3px; overflow: hidden; color: #455c50; background: #f5efdf; box-shadow: 0 20px 90px #192b384d, 5px 7px 0 #d5c9ae; font-family: 'Golos Text', sans-serif; }
  .home-story-modal::backdrop { background: #25394494; backdrop-filter: blur(5px); }
  .story-toolbar { display: flex; justify-content: space-between; align-items: center; min-height: 70px; padding: 9px 24px 9px 40px; background: #ede6d3; border-bottom: 1px solid #d6ceb7; gap: 16px; }
  .story-toolbar > span { font-size: 11px; letter-spacing: 2px; font-weight: 600; }
  .story-close { display: grid; place-items: center; width: 42px; height: 42px; padding: 0 0 3px; border: 1px solid #c4c6af; border-radius: 50%; background: #f8f3e5; color: #556d57; font-size: 30px; line-height: 1; }
  .story-close:hover { background: #e1e8d7; }
  .story-scroll { max-height: min(888px, calc(100dvh - 136px)); overflow-y: auto; overscroll-behavior: contain; touch-action: pan-y pinch-zoom; scrollbar-color: #b2b89c transparent; scrollbar-width: thin; }
  .story-paper { padding: 40px 56px 38px; background-image: radial-gradient(#927a5410 .65px, transparent .8px); background-size: 5px 5px; }
  .release-label { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 8px; font-size: 14px; font-weight: 500; }
  .release-label b { padding: 4px 9px; background: #dde6cf; color: #527356; border-radius: 3px; font-size: 13px; }
  h2 { margin: 0 0 14px; font-family: var(--font-hand); font-size: clamp(42px, 5.5vw, 68px); line-height: 1; font-weight: 600; color: #456b53; }
  .story-lead { max-width: 760px; margin: 0; font-size: 18px; line-height: 1.65; color: #60715f; }
  .story-timeline { display: flex; gap: 28px; align-items: center; margin: 28px 0 32px; padding: 18px 0; border-top: 1px solid #dcd3bc; border-bottom: 1px solid #dcd3bc; }
  .story-timeline > div { display: flex; flex-direction: column; gap: 5px; }
  .story-timeline strong { font-family: var(--font-hand); font-size: 37px; font-weight: 600; line-height: 1; }
  .story-timeline div > span { font-size: 12px; color: #798572; }
  .timeline-thread { flex: 1; display: flex; justify-content: space-between; height: 1px; background: #c4c9af; }
  .timeline-thread i { height: 5px; width: 5px; background: #c4c9af; border-radius: 50%; margin-top: -2px; }
  .story-reading h3 { margin: 0 0 12px; font-size: 22px; font-weight: 500; line-height: 1.4; }
  .story-reading p { margin: 0; max-width: 810px; font-size: 16px; line-height: 1.85; color: #667361; }
  figure { margin: 30px 0 0; }
  figcaption { margin-bottom: 14px; }
  .screen-label { font-size: 10px; letter-spacing: 2px; font-weight: 600; color: #8a9078; }
  figcaption h3 { margin: 5px 0 0; font-family: var(--font-hand); font-size: 32px; font-weight: 500; }
  .screenshot-mount { position: relative; padding: 10px; background: #fffdf6; border: 1px solid #e1dac9; box-shadow: 2px 4px 0 #746a4912; }
  .screenshot-mount::before, .screenshot-mount::after { content: ''; position: absolute; width: 62px; height: 20px; background: #d5d5bda6; z-index: 1; }
  .screenshot-mount::before { left: -12px; top: 3px; transform: rotate(-35deg); }
  .screenshot-mount::after { right: -12px; top: 3px; transform: rotate(35deg); }
  img { display: block; width: 100%; height: auto; background: #fff; }
  .afterword { margin-top: 26px; }
  .screenshot-source { display: inline-block; margin-top: 16px; font-size: 11px; line-height: 1.6; color: #829079; text-underline-offset: 3px; }
  .story-footer { margin-top: 30px; padding-top: 23px; border-top: 1px solid #d8d0b9; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .story-footer > span { font-family: var(--font-hand); font-size: 23px; max-width: 330px; line-height: 1.15; color: #899378; }
  .full-story { display: inline-flex; align-items: center; gap: 22px; padding: 14px 18px; background: #dfe7d2; border: 1px solid #c3cdb3; color: #45654c; text-decoration: none; font-size: 13px; line-height: 1.5; }
  .full-story:hover { background: #d1dfc1; }
  button:focus-visible, a:focus-visible { outline-color: #5d7b59; }
  @media (max-width: 650px) {
    .home-story-modal { width: calc(100vw - 20px); max-height: calc(100dvh - 24px); box-shadow: 0 12px 45px #192b3859, 2px 3px 0 #d5c9ae; }
    .story-toolbar { min-height: 64px; padding: 8px 12px 8px 20px; gap: 8px; }
    .story-toolbar > span { font-size: 9px; letter-spacing: 1px; max-width: 140px; line-height: 1.6; }
    .story-close { width: 38px; height: 38px; }
    .story-scroll { max-height: calc(100dvh - 90px); }
    .story-paper { padding: 27px 22px; }
    .story-lead { font-size: 16px; line-height: 1.65; }
    .story-timeline { margin: 23px 0; gap: 12px; }
    .story-timeline div > span { font-size: 10px; max-width: 130px; }
    .story-timeline > div:last-child { text-align: right; }
    .story-reading h3 { font-size: 20px; }
    .story-reading p { font-size: 15px; line-height: 1.8; }
    .screenshot-mount { padding: 5px; margin: 0 -12px; }
    .screenshot-mount::before, .screenshot-mount::after { width: 38px; height: 14px; }
    .screenshot-mount::before { left: -4px; }
    .screenshot-mount::after { right: -4px; }
    figcaption h3 { font-size: 29px; }
    .story-footer { align-items: start; flex-direction: column; gap: 17px; }
    .full-story { width: 100%; justify-content: space-between; }
  }
</style>
