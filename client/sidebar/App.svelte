<script lang="ts">
  import { onMount } from "svelte";
  import Settings from "./Settings.svelte";
  import Footer from "./Footer.svelte";
  import TabSelector from "./TabSelector.svelte";
  import Controls from "./Controls.svelte";

  const GIT_TAG = "__GIT_TAG__";
  let settingsComponent: Settings;
  let footerComponent: Footer;

  onMount(() => {
  });

</script>

<main class="container-fluid vh-100 d-flex flex-column p-3">
  <Settings bind:this={settingsComponent} />
  <TabSelector />
  <Controls />
  <div id="footer-displacement"></div>
</main>

<Footer version={GIT_TAG} bind:this={footerComponent} />

<style>
  #footer-displacement {
    height: 2rem;
    flex: 0 0 auto;
  }
</style>
