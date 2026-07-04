<script lang="ts">
  import { onMount } from "svelte";
  import { MessageType, Tab, type AcceptUrlChangeData, type Message } from "../internal-messages";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  let selectedTab = $state<Tab | undefined>();
  let acceptUrlChange: AcceptUrlChangeData = $state({ automatic: true, manual: true });

  onMount(() => {
    const listener = (msg: Message) => {
      if (msg.type === MessageType.TAB_SELECTED) {
        selectedTab = msg.data;
      }
      else if (msg.type === MessageType.TAB_CHANGED) {
        if (msg.data.changeInfo.title) {
          selectedTab = msg.data.tab;
        }
      }
      else if (msg.type === MessageType.SET_ACCEPT_URL_CHANGE) {
        acceptUrlChange = msg.data;
      }
    };
    browser.runtime.onMessage.addListener(listener);

    browser.runtime.sendMessage({
      type: MessageType.TAB_INFO_REQ,
      data: undefined,
    } as Message);

    browser.runtime.sendMessage({
      type: MessageType.GET_ACCEPT_URL_CHANGE,
    } as Message);

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
    if (!selectedTab) {
      return;
    }

    await browser.tabs.update(selectedTab.id, {
      active: true,
    });

    await browser.windows.update(selectedTab.winId, {
      focused: true,
    });
  }

  function onAcceptUrlChangeChanged() {
    browser.runtime.sendMessage({
      type: MessageType.SET_ACCEPT_URL_CHANGE,
      data: $state.snapshot(acceptUrlChange),
    } as Message);
  }
</script>

<CollapsibleSection name="Tab">
  <ul class="list-group list-group-flush">
  {#if selectedTab}
    <li class="list-group-item">
    <div class="tab-row">
      <div class="tab-info-main">
        <div class="tab-title" title={selectedTab.title}>
          {selectedTab.title ?? "Untitled tab"}
        </div>

        <div class="tab-meta">
          tab #{selectedTab.id}
          {#if selectedTab.winId != null}
            · window #{selectedTab.winId}
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
  </li>
  {:else}
    <button class="btn btn-primary w-100" onclick={() => toggleTabLock()}>
      Capture active tab
    </button>
  {/if}

    <li class="list-group-item">
      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" id="cbAcceptUrlChangeAuto" bind:checked={acceptUrlChange.automatic} onchange={() => onAcceptUrlChangeChanged()}>
        <label class="form-check-label" for="cbAcceptUrlChangeAuto">
          Accept automatic URL change requests
        </label>
      </div>
      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" id="cbAcceptUrlChangeManual" bind:checked={acceptUrlChange.manual} onchange={() => onAcceptUrlChangeChanged()}>
        <label class="form-check-label" for="cbAcceptUrlChangeManual">
          Accept manual URL change requests
        </label>
      </div>
    </li>
  </ul>
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
</style>
