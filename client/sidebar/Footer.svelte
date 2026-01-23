<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";

  let state = $state(ConnectionState.DISCONNECTED);

  onMount(() => {

    browser.runtime.onMessage.addListener((msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
          state = msg.data;
      }
    });

  });
</script>

{#if state === ConnectionState.DISCONNECTED}
  <footer class="disconnected">Disconnected</footer>
{:else if state === ConnectionState.CONNECTING}
  <footer class="reconnecting">Connecting...</footer>
{:else}
  <footer class="connected">Connected</footer>
{/if}

<style>
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    background-color: #0a0a0a;
    padding: 3px;
  }

  footer.disconnected {
    color: var(--bs-danger);
  }

  footer.reconnecting {
    color: var(--bs-warning);
  }

  footer.connected {
    color: var(--bs-success);
  }
</style>
