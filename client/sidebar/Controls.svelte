<script lang="ts">
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import BackIcon from "./res/back.svg";
  import PlayIcon from "./res/play.svg";
  import PauseIcon from "./res/pause.svg";
  import ForwardIcon from "./res/forward.svg";
  import { MessageType, type Message } from "../internal-messages";

  function regrabVideoElement() {
    browser.runtime.sendMessage({
      type: MessageType.REGRAB_VIDEO_ELEMENT,
    } as Message);
  }

  function backward() {
    browser.runtime.sendMessage({
      type: MessageType.PLAYER_CONTROL_BACKWARD,
      data: 10
    } as Message);
  }

  function play() {
    browser.runtime.sendMessage({
      type: MessageType.PLAYER_CONTROL_PLAY
    } as Message);
  }

  function pause() {
    browser.runtime.sendMessage({
      type: MessageType.PLAYER_CONTROL_PAUSE
    } as Message);
  }

  function forward() {
    browser.runtime.sendMessage({
      type: MessageType.PLAYER_CONTROL_FORWARD,
      data: 10
    } as Message);
  }

  function syncTime() {
    browser.runtime.sendMessage({
      type: MessageType.FORCE_SYNC_PLAYBACK,
    } as Message);
  }

  function syncUrl() {
    browser.runtime.sendMessage({
      type: MessageType.FORCE_SYNC_URL,
    } as Message);
  }
</script>


<CollapsibleSection name="Controls">
  <div class="card mb-1">
    <div class="card-header">Player Controls</div>
    <div class="card-body p-2">
      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-primary" onclick={() => backward()}><img src={BackIcon} alt="Back" width="16" height="16" /></button>
        <button class="btn btn-primary" onclick={() => play()}><img src={PlayIcon} alt="Play" width="16" height="16" /></button>
        <button class="btn btn-primary" onclick={() => pause()}><img src={PauseIcon} alt="Pause" width="16" height="16" /></button>
        <button class="btn btn-primary" onclick={() => forward()}><img src={ForwardIcon} alt="Forward" width="16" height="16" /></button>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header">Fix bug controls</div>
    <div class="card-body p-2">
      <div class="d-flex justify-content-center gap-2">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary btn-sm" onclick={() => syncTime()}>Sync Playback</button>
          <button class="btn btn-outline-secondary btn-sm" onclick={() => syncUrl()}>Sync URL</button>
          <button class="btn btn-outline-secondary btn-sm" onclick={() => regrabVideoElement()}>Regrab Video Element</button>
        </div>
      </div>
    </div>
  </div>
</CollapsibleSection>


<style>
</style>
