<script lang="ts">
  let { name = "Room" }: { name?: string } = $props();
</script>

<div class="room">
  <span class="room-name">{name}</span>
</div>

<style>
  .room {
    display: flex;
    padding: 0.1em 0;
    background-color: var(--listitem-back-color);
  }

  .room:hover {
    background-color: var(--listitem-hover-back-color);
  }
</style>
