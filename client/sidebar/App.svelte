<script lang="ts">
  import Counter from "./Counter.svelte";
</script>

<h1>Hello, Svelte!</h1>
{#each Array(10) as i (i)}
  <Counter />
{/each}
