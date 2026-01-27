<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";

  let state = $state(ConnectionState.DISCONNECTED);
  let { version = "" } = $props();

  onMount(() => {
    browser.runtime.onMessage.addListener((msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
        state = msg.data;
      }
    });
  });
</script>

<footer
  class:disconnected={state == ConnectionState.DISCONNECTED}
  class:connecting={state == ConnectionState.CONNECTING}
  class:connected={state == ConnectionState.CONNECTED}
>
  <div id="version">
    {version}
  </div>

  {#if state === ConnectionState.DISCONNECTED}
    Disconnected
  {:else if state === ConnectionState.CONNECTING}
    Connecting...
  {:else}
    Connected
  {/if}
</footer>

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

  #version {
    display: block; 
    position: fixed;
    color: #888;
    left: 5px;
  }

  footer.disconnected {
    color: var(--bs-danger);
  }

  footer.connecting {
    color: var(--bs-warning);
  }

  footer.connected {
    color: var(--bs-success);
  }
</style>
