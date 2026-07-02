<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import {
    MessageType,
    type Message,
  } from "../internal-messages";

  let hidden = $state(true);
  let selectedTab = $state<browser.tabs.Tab | undefined>();

  onMount(() => {
    const listener = (msg: Message) => {
      if (msg.type === MessageType.TAB_SELECTED) {
        selectedTab = msg.data;
      }
    };

    browser.runtime.onMessage.addListener(listener);

    browser.runtime.sendMessage({
      type: MessageType.GET_SELECTED_TAB,
      data: undefined,
    } as Message);

    const tabInfoInterval = setInterval(() => {
      if (!selectedTab) {
        return;
      }
      browser.runtime.sendMessage({
        type: MessageType.GET_SELECTED_TAB,
        data: undefined,
      } as Message);
      console.debug("title:", selectedTab.title!);
    }, 1000);

    loadHiddenState();

    return () => {
      clearInterval(tabInfoInterval);
      browser.runtime.onMessage.removeListener(listener);
    };
  });

  function setHidden(isHidden: bool) {
    hidden = isHidden;
    saveHiddenState();
  }

  function toggleVisibility() {
    hidden = !hidden;
    saveHiddenState();
  }

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

  function saveHiddenState() {
    browser.storage.local.set({"tab-section-hidden": hidden});
  }

  async function loadHiddenState() {
    let tmp = await browser.storage.local.get("tab-section-hidden");
    if (!tmp) {
      return;
    }
    setHidden(tmp["tab-section-hidden"]);
  }
</script>

<div class="container-fluid p-0 m-0 mt-3 d-flex flex-column">
  {#if !hidden}
    <div transition:slide={{ duration: 200 }}>
      <div class="tab-selector-card mb-2">
        <div class="tab-selector-header">
          <div>
            <h5  class="card-title">Tab</h5>
            <div class="tab-selector-subtitle">
              {selectedTab ? "Tab selected" : "No tab selected"}
            </div>
          </div>

          <button
            class="btn"
            class:btn-primary={!selectedTab}
            class:btn-danger={selectedTab}
            onclick={() => toggleTabLock()}
          >
            {selectedTab ? "Release tab" : "Select tab"}
          </button>
        </div>

        {#if selectedTab}
          <div class="tab-info">
            <div class="tab-info-main">
              {#key selectedTab.title}
                <div class="tab-title" title={selectedTab.title}>
                  {selectedTab.title ?? "Untitled tab"}
                </div>
              {/key}

              <div class="tab-meta">
                tab #{selectedTab.id}
                {#if selectedTab.windowId != null}
                  · window #{selectedTab.windowId}
                {/if}
              </div>
            </div>

            <button
              class="btn btn-sm btn-outline-primary switch-button"
              onclick={() => switchToCurrentTab()}
            >
              Switch to
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <button
    class="btn btn-sm tab-toggle"
    class:btn-outline-secondary={hidden}
    class:btn-outline-danger={!hidden}
    onclick={() => toggleVisibility()}
  >
    {hidden ? "Tab" : "Close"}
  </button>
</div>

<style>
  .tab-toggle {
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
  }

  .tab-selector-card {
    background-color: var(--bs-dark);
    color: var(--bs-light);
    border: 1px solid rgba(255, 255, 255, 0.125);
    border-radius: var(--bs-border-radius);
    padding: 0.65rem 0.75rem;
  }

  .tab-selector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .tab-selector-title {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.1;
  }

  .tab-selector-subtitle {
    margin-top: 0.15rem;
    color: #777;
    font-size: 0.8rem;
    line-height: 1.1;
  }

  .tab-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.55rem;
    padding-top: 0.55rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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

  .switch-button {
    flex: 0 0 auto;
  }
</style>
