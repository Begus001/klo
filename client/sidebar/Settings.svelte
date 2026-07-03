<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  const stateKey = "settings-section-state";

  let serverInputElement: HTMLInputElement | undefined = $state();
  let connectionState = $state(ConnectionState.DISCONNECTED);

  onMount(async () => {
    const listener = (msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
        connectionState = msg.data;
      }
    };
    browser.runtime.onMessage.addListener(listener);

    loadState();

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  });

  function onVisibilityChanged(hidden: boolean) {
    if (!hidden) {
      loadState();
    }
  }

  function saveState() {
    let state: any = {};
    if (serverInputElement) {
      state.address = serverInputElement.value;
    }
    browser.storage.local.set({ [stateKey]: state, });
  }

  async function loadState() {
    let tmp = await browser.storage.local.get(stateKey);
    if (!tmp || !tmp[stateKey]){
      saveState();
    }

    let state = tmp[stateKey];

    if (serverInputElement && state.address) {
      serverInputElement.value = state.address;
    }
  }

  function toggleConnect() {
    if (connectionState === ConnectionState.DISCONNECTED) {
      browser.runtime.sendMessage({
        type: MessageType.CONNECT,
        data: serverInputElement!.value,
      } as Message);

      saveState();
    } else {
      browser.runtime.sendMessage({
        type: MessageType.CONNECT,
        data: undefined,
      } as Message);
    }
  }
</script>

<CollapsibleSection name="Settings" {onVisibilityChanged}>
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title">Settings</h5>
      <div class="input-group">
        <span class="input-group-text bg-secondary">Server</span>
        <input
          id="server-input"
          type="text"
          class="form-control"
          bind:this={serverInputElement}
          onkeydown={(e) => {
            if (e.key === "Enter") toggleConnect();
          }}
          onchange={() => saveState()}
        />

        {#if connectionState === ConnectionState.DISCONNECTED}
          <button class="btn btn-primary" onclick={() => toggleConnect()}
            >Connect</button
          >
        {:else}
          <button class="btn btn-danger" onclick={() => toggleConnect()}
            >Disconnect</button
          >
        {/if}
      </div>
    </div>
  </div>
</CollapsibleSection>

<style>
</style>
