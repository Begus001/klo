<script lang="ts">
  import { onMount } from "svelte";
  import Settings from "./Settings.svelte";
  import Footer from "./Footer.svelte";

  let settingsComponent: Settings;
  let footerComponent: Footer;

  onMount(() => {
  });

</script>

<main>
  <button onclick={() => settingsComponent.toggleVisibility()}>Settings</button>
  <Settings bind:this={settingsComponent} />
</main>

<Footer bind:this={footerComponent} />

<style>
  :global(body) {
    color: #eaeaea;
    background-color: #151921;
  }

  main {
    width: 100%;
    /* display: flex; */
    flex-direction: column;
  }

</style>
