<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";

  let state = $state("Disconnected");

  export function setConnected(connectionState: ConnectionState) {
    if (connectionState === ConnectionState.DISCONNECTED) {
      state = "Disconnected";
    }
    else if (connectionState === ConnectionState.CONNECTING) {
      state = "Connecting...";
    }
    else if (connectionState === ConnectionState.CONNECTED) {
      state = "Connected";
    }
  }

  onMount(() => {

    browser.runtime.onMessage.addListener((msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
          setConnected(msg.data);
      }
    });

  });
</script>

<footer>{state}</footer>

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
</style>
