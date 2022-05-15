<script lang="ts">
import { reverse } from "ramda";

  import _, { identity, times } from "underscore";
  import { Phrase, Note, State } from "../store";

  export let state: State;
  export let phrase: Phrase;

  let ghost: Note = null;

  let defaultDuration = 4;
  let scaleX = 16
  let scaleY = 16

  function noteFromEvent(event: MouseEvent): Note {
    const beat = Math.floor(event.offsetX / scaleX);
    const pitch = Math.floor(
      ((event.target as HTMLElement).offsetHeight - event.offsetY) / scaleY
    );
    const octave = Math.floor(pitch / state.song.scale.length);
    const degree = pitch % state.song.scale.length;
    const duration = defaultDuration;
    const velocity = 100;
    return { time: beat, octave, degree, length: duration, velocity };
  }

  function mousewheel(event: WheelEvent, target: Note = null) {
    if (target) {
      target.length -= Math.sign(event.deltaY);
      target.length = Math.max(1, target.length);
    } else {
      defaultDuration *= Math.pow(2, -Math.sign(event.deltaY));
      defaultDuration = Math.max(1, defaultDuration);
    }
    if (ghost) {
      ghost.length = defaultDuration;
      ghost.time = Math.floor(ghost.time);
    }
    phrase = phrase;
  }

  function mousedown(event: MouseEvent, note: Note = null) {
    if (event.button === 0) {
      phrase.notes.push(noteFromEvent(event));
      phrase.notes = phrase.notes;
    } else if (event.button === 1) {
      if (note) phrase.notes = _.without(phrase.notes, note);
    } else if (event.button === 2) {
      if (note) phrase.notes = _.without(phrase.notes, note);
    }
  }

  function mouseleave(event: MouseEvent) {
    ghost = null;
  }

  function mousemove(event: MouseEvent, target: Note = null) {
    if (target) {
      if (event.button === 1) phrase.notes = _.without(phrase.notes, ghost);
      ghost = null;
      return;
    }
    if ((event.target as HTMLElement).classList.contains("note")) {
      ghost = null;
      return;
    }
    ghost = noteFromEvent(event);
  }
</script>

<input bind:value={phrase.name}/>
Phrase length <input type="number" bind:value={phrase.length} size="4" min="16" max="64" step="16"/>

Note length <input type="number" bind:value={defaultDuration} size="3" />

<div class="h">
  <div class="scale-names" style="display: flex; flex-direction: column">
    {#each reverse(state.song.octaves) as octave}
      {#each reverse(state.song.scaleNames) as name}
        <span style="height: {scaleY}px">{name}{octave}</span>
      {/each}
    {/each}
  </div>
  <div
    class="pattern"
    style="width: {scaleX * phrase.length + 1}px; height: {scaleY *
      state.song.scale.length *
      state.song.octaves.length +
      1}px;"
    on:mousemove={(e) => mousemove(e)}
    on:mousedown={(e) => mousedown(e)}
    on:mouseleave={(e) => mouseleave(e)}
    on:wheel={(e) => mousewheel(e)}
    on:contextmenu|preventDefault={(e) => e}
  >
    <div class="guides">
      <div class="ticks" style="background-size: {scaleX}px" />
      <div class="pitches" style="background-size: 100% {scaleY}px" />
      <div
        class="octaves"
        style="background-size: 100% {scaleY * state.song.scale.length}px"
      />
      <div class="beats" style="background-size: {scaleX * 4}px" />
      <div class="bars" style="background-size: {scaleX * 4 * 4}px" />
    </div>
    {#if ghost}
      <div
        class="note virtual"
        style="left:   {ghost.time * scaleX + 1}px;
               bottom: {(ghost.degree + ghost.octave * state.song.scale.length) * scaleY +
          1}px;
               width:  {(scaleX - 1) * ghost.length + ghost.length - 1}px;
               height: {scaleY - 1}px"
      />
    {/if}
    {#each phrase.notes as note}
      <div
        class="note"
        style="left:   {note.time * scaleX + 1}px;
               bottom: {(note.degree + note.octave * state.song.scale.length) * scaleY +
          1}px;
               width:  {(scaleX - 1) * note.length + note.length - 1}px;
               height: {scaleY - 1}px"
        on:mousedown|stopPropagation={(e) => mousedown(e, note)}
        on:mousemove|stopPropagation={(e) => mousemove(e, note)}
        on:wheel|stopPropagation={(e) => mousewheel(e, note)}
      />
    {/each}
    {#if phrase.beatNum}
      <div
        class="beat"
        style="left: {scaleX *
          (phrase.beatNum % phrase.length)}px; width: {scaleX}px"
      />
    {/if}
  </div>
</div>

<p>Apologies for the colonialism. Other scales will be along shortly.</p>

<style>
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
    background: #141616;
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
    background: linear-gradient(#292929 1px, transparent 1px);
  }
  .octaves {
    background: linear-gradient(#3d7b55 1px, transparent 1px);
    /* opacity: 0.5; */
  }
  .note.virtual {
    pointer-events: none;
    opacity: 0.25;
  }
  .note {
    box-sizing: border-box;
    background: #208e49;
    position: absolute;
    font-size: 0.5em;
    opacity: 0.75;
    text-align: left;
    padding: 2px;
    overflow: hidden;
    border-right: 4px solid #0bd556;
  }
  .note:hover {
    background: #309e59;
  }
</style>
