<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  let props: { children: any; name: string, onVisibilityChanged?: (hidden: boolean) => void } = $props();
  let hidden = $state(true);
  const stateKey = $derived(`${props.name.toLowerCase()}-section-hidden`);

  onMount(async () => {
    loadHiddenState();
  });

  export async function toggleVisibility() {
    hidden = !hidden;
    if (props.onVisibilityChanged) {
      props.onVisibilityChanged(hidden);
    }
    saveHiddenState();
  }

  function saveHiddenState() {
    browser.storage.local.set({
      [stateKey]: hidden,
    });
  }

  async function loadHiddenState() {
    let tmp = await browser.storage.local.get(stateKey);
    if (!tmp) {
      saveHiddenState();
    }
    hidden = tmp[stateKey];
  }
</script>

<div class="container-fluid p-0 m-0 d-flex flex-column mb-3">
  {#if !hidden}
    <div transition:slide={{ duration: 200 }}>
      {@render props.children()}
    </div>
  {/if}

  <button
    class="btn btn-sm settings-toggle"
    class:btn-outline-secondary={hidden}
    class:btn-outline-danger={!hidden}
    onclick={() => toggleVisibility()}
  >
    {hidden ? props.name : "Close"}
  </button>
</div>

<style>
  .settings-toggle {
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
  }
</style>
