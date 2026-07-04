<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { MessageType, type Message } from "../internal-messages";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  let selectedTab = $state<browser.tabs.Tab | undefined>();
  let acceptUrlChange = $state(true);

  onMount(() => {
    const listener = (msg: Message) => {
      if (msg.type === MessageType.TAB_SELECTED) {
        selectedTab = msg.data;
      } else if (msg.type === MessageType.TAB_CHANGED) {
        if (msg.data.changeInfo.title) {
          selectedTab = msg.data.tab;
        }
      }
    };
    browser.runtime.onMessage.addListener(listener);

    browser.runtime.sendMessage({
      type: MessageType.TAB_INFO_REQ,
      data: undefined,
    } as Message);

    browser.runtime.sendMessage({
      type: MessageType.GET_ACCEPT_URL_CHANGE,
    }).then((resp: any) => {
        acceptUrlChange = resp;
        console.log("test", resp);
    });

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  });

  function toggleTabLock() {
    if (selectedTab) {
      browser.runtime.sendMessage({
        type: MessageType.DESELECT_TAB,
      } as Message);
    } else {
      browser.runtime.sendMessage({
        type: MessageType.SELECT_TAB,
      } as Message);
    }
  }

  async function switchToCurrentTab() {
    if (selectedTab?.id == null || selectedTab.windowId == null) {
      return;
    }

    await browser.tabs.update(selectedTab.id, {
      active: true,
    });

    await browser.windows.update(selectedTab.windowId, {
      focused: true,
    });
  }

  function onAcceptUrlChangeChanged(e: Event) {
    const checked = (e.currentTarget as HTMLInputElement).checked;
    browser.runtime.sendMessage({
      type: MessageType.SET_ACCEPT_URL_CHANGE,
      data: checked
    } as Message);
  }
</script>

<CollapsibleSection name="Tab">
  {#if selectedTab}
    <div class="tab-row">
      <div class="tab-info-main">
        <div class="tab-title" title={selectedTab.title}>
          {selectedTab.title ?? "Untitled tab"}
        </div>

        <div class="tab-meta">
          tab #{selectedTab.id}
          {#if selectedTab.windowId != null}
            · window #{selectedTab.windowId}
          {/if}
        </div>
      </div>

      <div class="btn-group ab-actions">
        <button
          class="btn btn-outline-primary"
          onclick={() => switchToCurrentTab()}
        >
          Switch to
        </button>

        <button class="btn btn-danger" onclick={() => toggleTabLock()}>
          Release
        </button>
      </div>
    </div>
  {:else}
    <button class="btn btn-primary w-100" onclick={() => toggleTabLock()}>
      Capture active tab
    </button>
  {/if}

  <div class="form-check mt-2">
    <input class="form-check-input" type="checkbox" id="cbAcceptUrlChange" checked={acceptUrlChange} onchange={(e) => onAcceptUrlChangeChanged(e)}>
    <label class="form-check-label" for="cbAcceptUrlChange">
      Accept URL change request
    </label>
  </div>
</CollapsibleSection>

<style>
  .tab-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .tab-info-main {
    min-width: 0;
    flex: 1;
  }

  .tab-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    line-height: 1.2;
  }

  .tab-meta {
    margin-top: 0.15rem;
    color: #777;
    font-size: 0.75rem;
    line-height: 1.1;
  }

  .tab-actions {
    flex: 0 0 auto;
    white-space: nowrap;
  }
</style>
