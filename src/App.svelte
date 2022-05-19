<script lang="ts">
  import ChannelUI from "./panes/Channel.svelte";
  import Controls from "./panes/Controls.svelte";
  import PatternPane from "./panes/Pattern.svelte";
  import Song from "./panes/Song.svelte";
  import Songs from "./panes/Songs.svelte";
  import Patterns from "./panes/Patterns.svelte";
  import { State } from "./lib/State";
  import SaveLoad from "./panes/SaveLoad.svelte";

  export let state: State;

  function changeProgram(channel) {
    state.engine.programChange(
      0,
      channel,
      state.song.channels[channel].program
    );
  }
</script>

<SaveLoad bind:state />

<div id="songs">
  <Songs bind:state />
</div>

<div id="patterns">
  <Patterns bind:state />
</div>

<Controls bind:state />

<div id="arrangement">
  <Song bind:state song={state.song} />
</div>

<div id="instruments">
  <div class="pane">
    <header>Instruments</header>
    <main>
      {#each state.song.channels as _, i}
        <ChannelUI
          bind:state
          bind:channel={state.song.channels[i]}
          number={i}
          on:change={(e) => changeProgram(i)}
        />
      {/each}
    </main>
  </div>
</div>

<div id="pattern">
  <PatternPane bind:state bind:pattern={state.patterns[state.patternId]} />
</div>
