<script lang="ts">
  import { MessageType, type Message } from "../internal-messages";

  let serverInputElement: HTMLInputElement;
  let hidden = true;

  export function toggleVisibility() {
    hidden = !hidden;
  }

  function connect() {
    browser.runtime.sendMessage({
      type: MessageType.CONNECT,
      data: serverInputElement.value,
    } as Message);
  }
</script>

{#if !hidden}
  <div id="settings" class="hidden">
    <h1>Settings</h1>
    <div class="settings-row">
      <input
        id="server-input"
        type="text"
        bind:this={serverInputElement}
        onkeypress={(e) => {
          if (e.key === "Enter") connect();
        }}
      />
      <button onclick={connect}> Connect </button>
    </div>
  </div>
{/if}

<style>
  #settings {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }

  .settings-row {
    display: flex;
    justify-content: space-evenly;
  }
</style>
