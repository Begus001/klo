<script lang="ts">
  import { onMount } from "svelte";
  import Settings from "./Settings.svelte";
  import Footer from "./Footer.svelte";

  let settingsComponent: Settings;
  let footerComponent: Footer;

  onMount(() => {
  });

</script>

<main class="container-fluid vh-100 d-flex flex-column p-3">
  <Settings bind:this={settingsComponent} />
</main>

<Footer bind:this={footerComponent} />

<style>
</style>
