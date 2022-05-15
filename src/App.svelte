<script lang="ts">
  import PhraseDeck from "./lib/PhraseDeck.svelte";
  import ChannelUI from "./lib/Channel.svelte";
  import TrackUI from "./lib/Track.svelte";
  import Controls from "./lib/Controls.svelte";

  import { State } from "./store";
  import { random, times } from "underscore";
  import { colours } from "./colours";
  import { MidiEngine } from "./engines/midi";
  import EngineSelect from "./lib/EngineSelect.svelte";
  import { ToneEngine } from "./engines/tone";

  var state: State = {
    song: {
      scale: [0, 2, 4, 5, 7, 9, 11],
      scaleNames: ["C", "D", "E", "F", "G", "A", "B"],
      octaves: [0, 2, 3],
      ticksPerBar: 16,
      tracks: times(10, (i) => ({ channel: i, instances: [] })),
      channels: times(16, (x) => ({ program: x })),
      phrases: [
        {
          name: "Default",
          notes: [],
          length: 64,
          colour: colours[random(colours.length)],
        },
      ],
      length: 64,
    },
    beatNum: null,
    beatOriginMS: performance.now(),
    engines: [],
    engine: null,
    phrase: null,
  };

  let midiFailed = false;

  state.phrase = state.song.phrases[0];

  async function init() {
    try {
      const midi = await navigator.requestMIDIAccess({ sysex: false });
      state.engines.push(new MidiEngine(midi).init());
    } catch (e) {
      midiFailed = true;
    }
    state.engines.push(new ToneEngine().init());
    state.engine = state.engines[0];
  }

  let wait = init();

  function changeProgram(channel) {
    state.engine.programChange(
      0,
      channel,
      state.song.channels[channel].program
    );
  }
</script>

<main>
  {#await wait}
    Starting up DAW
  {:then _}
    <vertical>
      <EngineSelect bind:state bind:midiFailed />
      <Controls bind:state />
      <horizontal>
        <vertical>
          {#each state.song.tracks as track, i}
            <TrackUI bind:track bind:state trackNum={i} />
          {/each}
          <PhraseDeck bind:state />
        </vertical>
        <vertical>
          {#each state.song.channels as _, i}
            <ChannelUI
              bind:program={state.song.channels[i].program}
              instruments={state.engine.channelInstrumentNames(i)}
              on:change={(e) => changeProgram(i)}
            />
          {/each}
        </vertical>
      </horizontal>
    </vertical>
  {:catch e}
    <h2>Failed to start the DAW</h2>
    <p>
      I don't know why, but your browser says the reason is:
      {e}
    </p>
  {/await}
</main>

<p>
  <a href="https://trello.com/b/p08pydKL/webdaw">Github</a>
  .
  <a href="https://trello.com/b/p08pydKL/webdaw">Trello</a>
</p>

<style lang="less">
  vertical {
    display: flex;
    flex-direction: column;
  }
  horizontal {
    display: flex;
  }
</style>
