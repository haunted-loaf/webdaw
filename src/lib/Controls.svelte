<script lang="ts">
  import { Phrase, Instance, State, Track } from "@/store";
  import * as R from "ramda";
  import * as _ from "underscore";
  import { onDestroy, onMount } from "svelte";

  export let state: State;

  export let beatLengthMS: number = 100;
  export let basePitch: number = 50;

  let defaultDuration = 4;
  
  function beat(timeMS: number) {
    state.beatNum = Math.floor(timeMS / beatLengthMS);
    const playBeat = (state.beatNum + 1) % (state.song.length * 16);
    for (let track of state.song.tracks) {
      for (let instance of track.instances) {
        const instBeat = playBeat - instance.time
        if (instBeat >= 0 && instBeat < instance.length) {
          _.filter(instance.phrase.notes, (note) => note.time == instBeat).forEach(
            (note) => {
              const pitch = R.clamp(0, 127, basePitch + state.song.octaves[note.octave] * 12 + state.song.scale[note.degree])
              state.engine.note(timeMS + state.beatOriginMS, track.channel, pitch, note.velocity, note.length * beatLengthMS)
            }
          )
          instance.phrase.playing = true
          instance.phrase.beatNum = instBeat
        } else {
          instance.phrase.playing = false
          instance.phrase.beatNum = null
        }
        state = state
      }
    }
  }

  let timerId: number = null;

  function update(timeMS: number) {
    const beatsPerUpdate = Math.max(1, 100 / beatLengthMS);
    for (let i = 0; i < beatsPerUpdate; ++i) {
      beat(timeMS + i * beatLengthMS);
    }
  }

  async function start() {
    stop();
    timerId = window.setInterval(() => {
      const time = performance.now() - state.beatOriginMS;
      const timeQ = Math.floor(time / beatLengthMS) * beatLengthMS;
      update(timeQ + beatLengthMS);
    }, 100);
  }

  function stop() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  }
  stop();

  onMount(start);
  onDestroy(stop);
</script>

<main>
  <button on:click={start}>Start</button>
  <button on:click={stop}>Stop</button>

  <!-- Ticks per bar <input type="number" bind:value={state.ticksPerBar} size="4" min="1" max="64"/> -->

  Song length <input type="number" bind:value={state.song.length} size="4" min="1" max="64"/>

  Beat length <input type="number" bind:value={beatLengthMS} size="4" />

  Base pitch <input type="number" bind:value={basePitch} size="4" min="0" max="127" />
</main>
