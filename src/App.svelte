<script lang="ts">
  import ChannelUI from "./panes/Channel.svelte";
  import Controls from "./panes/Controls.svelte";
  import PatternPane from "./panes/Pattern.svelte";
  import Arrangement from "./panes/Arrangement.svelte";
  import Patterns from "./panes/Patterns.svelte";
  import { State } from "./lib/State";

  export let state: State;

  // state.onUpdate = () => state = state

  function changeProgram(channel) {
    state.engine.programChange(
      0,
      channel,
      state.song.channels[channel].program
    );
  }
</script>

<div id="patterns">
  <Patterns bind:state />
</div>

<Controls bind:state />

<div id="arrangement">
  <Arrangement bind:state bind:song={state.song} />
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
  <PatternPane bind:state bind:pattern={state.song.patterns[state.patternId]} />
</div>
