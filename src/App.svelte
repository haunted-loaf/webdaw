<script lang="ts">
  import ChannelUI from "./panes/Channel.svelte";
  import Controls from "./panes/Controls.svelte";
  import PatternPane from "./panes/Pattern.svelte";
  import Song from "./panes/Song.svelte";
  import Songs from "./panes/Songs.svelte";
  import Patterns from "./panes/Patterns.svelte";
  import { State } from "./lib/State";
  import SaveLoad from "./panes/SaveLoad.svelte";
  import InstrumentsMidi from "./panes/Instruments_Midi.svelte";
  import InstrumentsTone from "./panes/Instruments_Tone.svelte";

  export let state: State;

  let waiter = Promise.all(state.engines.map((e) => e.waiter));
</script>

{#await waiter}
  Loading
{:then _}
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
    <div id="midi">
      <InstrumentsMidi bind:state />
    </div>

    <div id="synth">
      <InstrumentsTone bind:state />
    </div>
  </div>

  <div id="pattern">
    <PatternPane bind:state bind:pattern={state.patterns[state.patternId]} />
  </div>
{:catch e}
  {e}
{/await}
