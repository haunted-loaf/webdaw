<script lang="ts">
  import { Phrase, Instance, State, Track } from "@/store";
  import * as R from "ramda";
  import * as _ from "underscore";
  import { onDestroy, onMount } from "svelte";

  export let state: State;

  function tick(timeMS: number) {
    state.tickNum = Math.floor(timeMS / state.song.tickLength);
    const playTick = (state.tickNum + 1) % state.song.length;
    for (let phrase of state.song.phrases) {
      phrase.playing = false;
      phrase.tickNum = null;
    }
    for (let track of state.song.tracks) {
      for (let instance of track.instances) {
        const phrase = instance.phrase;
        const instTick = playTick - instance.time;
        if (instTick >= 0 && instTick < instance.length) {
          const phraseTick = instTick % phrase.length;
          _.filter(phrase.notes, (note) => note.time == phraseTick).forEach(
            (note) => {
              (note.chord || [0]).forEach((chord) => {
                const pitch = R.clamp(
                  0,
                  127,
                  state.song.baseNote +
                    (phrase.baseOctave + note.octave) * 12 +
                    phrase.scale.degrees[note.degree] +
                    chord
                );
                state.engine.note(
                  timeMS + state.beatOriginMS,
                  track.channel,
                  pitch,
                  note.velocity,
                  note.length * state.song.tickLength
                );
              });
            }
          );
          phrase.playing = true;
          phrase.tickNum = phraseTick;
        }
        state = state;
      }
    }
  }

  let timerId: number = null;

  function update(timeMS: number) {
    const beatsPerUpdate = Math.max(1, 100 / state.song.tickLength);
    for (let i = 0; i < beatsPerUpdate; ++i) {
      tick(timeMS + i * state.song.tickLength);
    }
  }

  async function start() {
    stop();
    timerId = window.setInterval(() => {
      const time = performance.now() - state.beatOriginMS;
      const timeQ =
        Math.floor(time / state.song.tickLength) * state.song.tickLength;
      update(timeQ + state.song.tickLength);
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

<div id="menu" class="pane" style="flex-grow: 1">
  <header>
    <section>
      <h1><span style="color: #0af; font-weight: bold">WebDAW</span></h1>
      <select bind:value={state.engine}>
        {#each state.engines as engine}
          <option value={engine}>{engine.name}</option>
        {/each}
      </select>
      <fieldset>
        <button on:click={start}>Start</button>
        <button on:click={stop}>Stop</button>
      </fieldset>
    </section>
    <section>
      <a href="https://github.com/haunted-loaf/webdaw">Github</a>
      <a href="https://trello.com/b/p08pydKL/webdaw">Trello</a>
    </section>
  </header>
</div>
