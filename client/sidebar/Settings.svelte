<script lang="ts">
  import { onMount } from "svelte";
  import {
    ConnectionState,
    MessageType,
    type Message,
  } from "../internal-messages";
  import { slide } from "svelte/transition";

  let serverInputElement: HTMLInputElement;
  let hidden = false;
  let connectionState = ConnectionState.DISCONNECTED;

  onMount(() => {
    browser.runtime.onMessage.addListener((msg: Message) => {
      if (msg.type === MessageType.CONNECTION_CHANGED) {
        connectionState = msg.data;
      }
    });
  });

  export function toggleVisibility() {
    hidden = !hidden;
  }

  function toggleConnect() {
    if (connectionState === ConnectionState.DISCONNECTED) {
      browser.runtime.sendMessage({
        type: MessageType.CONNECT,
        data: serverInputElement.value,
      } as Message);
    } else {
      browser.runtime.sendMessage({
        type: MessageType.CONNECT,
        data: undefined,
      } as Message);
    }
  }

  function disconnect() {}
</script>

<button class="btn btn-secondary mb-3" onclick={() => toggleVisibility()}
  >Settings</button
>
{#if !hidden}
  <div class="card" transition:slide={{ duration: 200 }}>
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
{/if}

<style>
  /* #settings { */
  /*   display: flex; */
  /*   flex-direction: column; */
  /*   justify-content: space-evenly; */
  /* } */
  /**/
  /* .settings-row { */
  /*   display: flex; */
  /*   justify-content: space-evenly; */
  /* } */
</style>
