<script lang="ts">
  import { onMount } from "svelte";
  import Footer from "./Footer.svelte";
  import RoomList from "./RoomList.svelte";

  let dark = $state(true);

  onMount(() => {
    document.body.classList.add("dark");

    browser.runtime.onMessage.addListener((msg) => {
      console.log(msg);
    });
  });

  function toggleDark() {
    dark = !dark;
    document.body.classList.toggle("dark");
    browser.runtime.sendMessage("kekw");
  }
</script>

<main>
  <h1>Hello, Svelte!</h1>
  <button onclick={() => toggleDark()}>{dark ? "light" : "dark"}</button>
  <RoomList />
</main>

<Footer />

<style>
  :global(body) {
    color: var(--primary-fore-color);
    background-color: var(--primary-back-color);
  }
</style>
