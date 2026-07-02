<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";
  import { slide } from "svelte/transition";

  let serverInputElement: HTMLInputElement | undefined = $state();
  let hidden = $state(false);
  let connectionState = $state(ConnectionState.DISCONNECTED);

  onMount(() => {
    browser.runtime.onMessage.addListener((msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
        connectionState = msg.data;
      }
    });
  });

  export async function toggleVisibility() {
    hidden = !hidden;
    if (!hidden) {
      let lastAddress = await getAddress();
      if (lastAddress) {
        serverInputElement!.value = lastAddress;
      }
    }
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
    browser.storage.local.set({"last-address": serverInputElement!.value});
  }

  async function getAddress() {
    let tmp = await browser.storage.local.get("last-address");
    return tmp["last-address"];
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
