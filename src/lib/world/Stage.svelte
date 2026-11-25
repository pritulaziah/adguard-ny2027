<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { NoToneMapping, PerspectiveCamera, Scene, SRGBColorSpace } from 'three';
  import { WebGPURenderer } from 'three/webgpu';
  import { YearWorld } from './YearWorld';
  import type { JourneyStore } from './journey-state';

  let { layer, journey, onerror }: {
    layer: HTMLDivElement;
    journey: JourneyStore;
    onerror: (kind: 'loadError' | 'webglError') => void;
  } = $props();

  let host: HTMLDivElement;
  let cleanup: (() => void) | null = null;

  onMount(() => {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    host.append(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, 1, 0.1, 100);
    const renderer = new WebGPURenderer({
      canvas,
      antialias: true,
      alpha: false,
      // `?webgl` checks the WebGL2 fallback without a WebGPU-capable browser.
      forceWebGL: new URLSearchParams(window.location.search).has('webgl'),
    });
    renderer.toneMapping = NoToneMapping;
    renderer.outputColorSpace = SRGBColorSpace;

    let world: YearWorld | null = null;
    let stopped = false;
    let last = performance.now();

    const size = (): void => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(size);
    observer.observe(host);
    size();

    const frame = (time: number): void => {
      const delta = Math.min((time - last) / 1000, 0.05);
      last = time;
      world?.tick(delta);
      renderer.render(scene, camera);
    };

    // A hidden tab must not keep the GPU busy.
    const onVisibility = (): void => {
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        last = performance.now();
        renderer.setAnimationLoop(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    void (async () => {
      try {
        await renderer.init();
        if (stopped) return;
        const backend = (renderer as unknown as { backend?: { isWebGPUBackend?: boolean } }).backend;
        document.documentElement.dataset.renderer = backend?.isWebGPUBackend ? 'webgpu' : 'webgl';
        world = new YearWorld({ renderer, scene, camera, layer, journey, onerror: () => onerror('loadError') });
        renderer.setAnimationLoop(frame);
      } catch (cause) {
        console.error(cause);
        renderer.setAnimationLoop(null);
        onerror('webglError');
      }
    })();

    cleanup = (): void => {
      stopped = true;
      renderer.setAnimationLoop(null);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      world?.destroy();
      world = null;
      renderer.dispose();
      canvas.remove();
    };
  });

  onDestroy(() => cleanup?.());
</script>

<div class="world-stage" bind:this={host}></div>
