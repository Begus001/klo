<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  let props: {
    children: any;
    name: string;
    onVisibilityChanged?: (hidden: boolean) => void;
  } = $props();

  let hidden = $state(true);
  const stateKey = $derived(`${props.name.toLowerCase()}-section-hidden`);

  onMount(() => {
    loadHiddenState();
  });

  function toggleVisibility() {
    hidden = !hidden;
    props.onVisibilityChanged?.(hidden);
    saveHiddenState();
  }

  function saveHiddenState() {
    browser.storage.local.set({
      [stateKey]: hidden,
    });
  }

  async function loadHiddenState() {
    const tmp = await browser.storage.local.get(stateKey);

    if (typeof tmp[stateKey] === "boolean") {
      hidden = tmp[stateKey];
    } else {
      saveHiddenState();
    }
  }
</script>

<div class="card mb-2 collapsible-card">
  <button
    type="button"
    class="card-header collapsible-header"
    onclick={toggleVisibility}
  >
    <span class="collapsible-title">{props.name}</span>
    <span class="collapsible-arrow" class:open={!hidden}>▸</span>
  </button>

  {#if !hidden}
    <div transition:slide={{ duration: 200 }}>
      <div class="card-body p-1 m-1">
        {@render props.children()}
      </div>
    </div>
  {/if}
</div>

<style>
  .collapsible-card {
    flex-shrink: 0;
    background-color: var(--bs-dark);
    color: var(--bs-light);
  }

  .collapsible-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    border: 0;
    /* background: transparent; */
    color: inherit;

    padding: 0.65rem 0.75rem;
    text-align: left;
  }

  .collapsible-header:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  .collapsible-title {
    font-weight: 600;
  }

  .collapsible-arrow {
    color: #777;
    transition: transform 0.2s ease;
  }

  .collapsible-arrow.open {
    transform: rotate(90deg);
  }
</style>
