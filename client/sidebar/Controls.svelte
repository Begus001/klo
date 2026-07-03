<script lang="ts">
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import BackIcon from "./res/back.svg";
  import PlayIcon from "./res/play.svg";
  import PauseIcon from "./res/pause.svg";
  import ForwardIcon from "./res/forward.svg";
</script>


<CollapsibleSection name="Controls">
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title">Player Controls</h5>
      <div class="d-flex justify-content-center gap-1">
        <button class="btn btn-primary"><img src={BackIcon} alt="Back" width="16" height="16" /></button>
        <button class="btn btn-primary"><img src={PlayIcon} alt="Play" width="16" height="16" /></button>
        <button class="btn btn-primary"><img src={PauseIcon} alt="Pause" width="16" height="16" /></button>
        <button class="btn btn-primary"><img src={ForwardIcon} alt="Forward" width="16" height="16" /></button>
      </div>
      <h5 class="card-title">Sync controls</h5>
      <div class="d-flex justify-content-center gap-1">
        <button class="btn btn-outline-secondary btn-sm">Force Sync Playback</button>
        <button class="btn btn-outline-secondary btn-sm">Force Sync URL</button>
      </div>
    </div>
  </div>
</CollapsibleSection>


<style>
</style>
