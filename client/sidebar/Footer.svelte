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
  <div id="footer-start">
    <div id="connection-status">
      {#if state === ConnectionState.DISCONNECTED}
        Disconnected
      {:else if state === ConnectionState.CONNECTING}
        Connecting...
      {:else}
        Connected
      {/if}
    </div>
  </div>

  <div id="footer-end">
    <div id="version">
      {version}
    </div>
  </div>
</footer>

<style>
  footer {
    position: fixed;
    display: flex;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #0a0a0a;
    padding: 3px 5px;
    gap: 10px;
  }

  #footer-start {
    display: flex;
    flex-grow: 1;
    justify-content: start;
  }

  #footer-end {
    display: flex;
    flex-grow: 1;
    justify-content: end;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  #version {
    display: block;
    color: #555;
    left: 5px;
    max-width: 150px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  #connection-status {
    display: block;
    justify-self: end;
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
