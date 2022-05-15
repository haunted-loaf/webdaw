<script lang="ts">
  import _, { identity, times } from "underscore";
  import { Note, State, Instance, Phrase, Track } from "../store";

  export let state: State;
  export let track: Track;
  export let trackNum: number;

  let ghost: Instance = null;

  let scaleX = 16;
  let scaleY = 24;

  function instanceFromEvent(event: MouseEvent): Instance {
    const time = Math.floor(event.offsetX / scaleX) * state.song.ticksPerBar;
    // const track = Math.floor(
    //   ((event.target as HTMLElement).offsetHeight - event.offsetY) / scaleY
    // );
    const length = state.phrase.length;
    return { time, length, phrase: state.phrase };
  }

  function mousewheel(event: WheelEvent, target: Instance = null) {
    // if (target) {
    //   target.length -= Math.sign(event.deltaY);
    //   target.length = Math.max(1, target.length);
    // } else {
    //   defaultDuration *= Math.pow(2, -Math.sign(event.deltaY));
    //   defaultDuration = Math.max(1, defaultDuration);
    // }
    // if (note) {
    //   note.length = defaultDuration;
    //   note.time = Math.floor(note.time);
    // }
    // phrase = phrase;
  }

  function mousedown(event: MouseEvent, target: Instance = null) {
    if (event.button === 0) {
      if (target) return;
      target = instanceFromEvent(event);
      track.instances.push(target);
      track = track;
    } else if (event.button === 1) {
      // do nothing
    } else if (event.button === 2) {
      if (target)
        track.instances = _.without(track.instances, target);
    }
  }

  function mouseleave(event: MouseEvent) {
    ghost = null;
  }

  function mousemove(event: MouseEvent, target: Instance = null) {
    if (target) {
      ghost = null;
      return;
    }
    if ((event.target as HTMLElement).classList.contains("note")) {
      ghost = null;
      return;
    }
    ghost = instanceFromEvent(event);
  }
</script>

<div class="h">
  <div>
    <select bind:value={track.channel}>
      {#each _.times(16, _.identity) as num}
        <option value={num}>{num}</option>
      {/each}
    </select>
  </div>
  <div
    class="pattern"
    style="width: {scaleX * state.song.length + 1}px; height: {scaleY + 1}px;"
    on:mousemove={(e) => mousemove(e)}
    on:mousedown={(e) => mousedown(e)}
    on:mouseleave={(e) => mouseleave(e)}
    on:wheel={(e) => mousewheel(e)}
    on:contextmenu|preventDefault={(e) => e}
  >
    <div class="guides">
      <div class="pitches" style="background-size: 100% {scaleY}px" />
      <div class="ticks" style="background-size: {scaleX}px" />
    </div>
    {#if ghost}
      <div
        class="note virtual"
        style="left:   {(ghost.time / state.song.ticksPerBar) * scaleX + 1}px;
               bottom: 1px;
               width:  {(scaleX - 1) * (ghost.length / 16) +
          ghost.length / 16 -
          1}px;
               height: {scaleY - 1}px;
               background: {ghost.phrase.colour}"
        on:mousedown={(e) => mousedown(e, ghost)}
      >{state.phrase.name}</div>
    {/if}
    {#each track.instances as instance}
      <div
        class="note"
        style="left:  {(instance.time / state.song.ticksPerBar) * scaleX + 1}px;
              bottom: 1px;
              width:  {(scaleX - 1) * (instance.length / 16) +
          instance.length / 16 -
          1}px;
              height: {scaleY - 1}px;
              background: {instance.phrase.colour}"
        on:mousedown|stopPropagation={(e) => mousedown(e, instance)}
        on:mousemove|stopPropagation={(e) => mousemove(e, instance)}
        on:wheel|stopPropagation={(e) => mousewheel(e, instance)}
        >{instance.phrase.name}</div>
    {/each}
    {#if state.beatNum}
      <div
        class="beat"
        style="left: {scaleX *
          (Math.floor(state.beatNum / 16) % state.song.length)}px; width: {scaleX}px"
      />
    {/if}
  </div>
</div>

<style>
  select, button {
    height: 24px;
  }
  .h {
    display: flex;
  }
  .beat {
    pointer-events: none;
    position: absolute;
    top: 0;
    bottom: 0;
    background: #f00;
    opacity: 0.1;
    /* transition: left 0.1s; */
  }
  .pattern {
    box-sizing: border-box;
    display: flex;
    position: relative;
    overflow: hidden;
    background: #0c0e0f;
  }
  .guides {
  }
  .octaves,
  .pitches,
  .bars,
  .beats,
  .ticks {
    pointer-events: none;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }
  .bars {
    background: linear-gradient(to right, #42a065 1px, transparent 1px);
  }
  .beats {
    background: linear-gradient(to right, #2d6b45 1px, transparent 1px);
  }
  .ticks {
    background: linear-gradient(to right, #292929 1px, transparent 1px);
  }
  .pitches {
    background: linear-gradient(#262b30 1px, transparent 1px);
  }
  .octaves {
    background: linear-gradient(#262b30 1px, transparent 1px);
    /* opacity: 0.5; */
  }
  .note.virtual {
    pointer-events: none;
    opacity: 0.25;
  }
  .note {
    display: flex;
    box-sizing: border-box;
    background: #21a14f;
    color: #000;
    position: absolute;
    font-size: 0.5em;
    opacity: 0.75;
    padding: 2px;
    overflow: hidden;
    border: 1px solid #2bd167;
    align-items: center;
    justify-content: center;
  }
  .note:hover {
    background: #309e59;
  }
</style>
