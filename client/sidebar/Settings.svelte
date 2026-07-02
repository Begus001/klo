<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";
  import { slide } from "svelte/transition";

  let serverInputElement: HTMLInputElement | undefined = $state();
  let hidden = $state(true);
  let connectionState = $state(ConnectionState.DISCONNECTED);

  onMount(async () => {
    const listener = (msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
        connectionState = msg.data;
      }
    };
    browser.runtime.onMessage.addListener(listener);

    loadHiddenState();
    loadAddress();

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  });

  export async function toggleVisibility() {
    hidden = !hidden;
    loadAddress();
    saveHiddenState();
  }

  function setHidden(isHidden: bool) {
    hidden = isHidden;
    loadAddress();
    saveHiddenState();
  }

  function toggleConnect() {
    if (connectionState === ConnectionState.DISCONNECTED) {
      browser.runtime.sendMessage({
        type: MessageType.CONNECT,
        data: serverInputElement!.value,
      } as Message);

      saveAddress();
    } else {
      browser.runtime.sendMessage({
        type: MessageType.CONNECT,
        data: undefined,
      } as Message);
    }
  }

  function saveAddress() {
    if (!serverInputElement) {
      return;
    }
    browser.storage.local.set({"last-address": serverInputElement.value});
  }

  async function loadAddress() {
    let tmp = await browser.storage.local.get("last-address");
    if (!tmp || !serverInputElement || !tmp["last-address"]) {
      return;
    }
    serverInputElement.value = tmp["last-address"];
  }

  function saveHiddenState() {
    browser.storage.local.set({"settings-section-hidden": hidden});
  }

  async function loadHiddenState() {
    let tmp = await browser.storage.local.get("settings-section-hidden");
    if (!tmp) {
      return;
    }
    setHidden(tmp["settings-section-hidden"]);
  }
</script>

<div class="container-fluid p-0 m-0 d-flex flex-column">
  {#if !hidden}
    <div transition:slide={{ duration: 200 }}>
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
              onchange={() => saveAddress()}
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
    </div>
  {/if}


  <button 
    class="btn btn-sm settings-toggle" 
    class:btn-outline-secondary={hidden} 
    class:btn-outline-danger={!hidden} 
    onclick={() => toggleVisibility()}
  >
    {hidden ? 'Settings' : 'Close'}
  </button>
</div>

<style>
  .settings-toggle {
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }
</style>
