<script lang="ts">
  import { andThen, reverse } from "ramda";
  import { onMount } from "svelte";

  import _, { identity, times, without } from "underscore";
  import { Phrase, Note, State, notes } from "../store";

  export let state: State;
  export let phrase: Phrase;
  export let snapTicks: number = 4;

  let ghost: Note = null;

  let defaultDuration = 16;
  let scaleX = 8;
  let scaleY = 32;

  function noteFromEvent(event: MouseEvent): Note {
    const beat = Math.floor(event.offsetX / scaleX / snapTicks) * snapTicks;
    const pitch = Math.floor(
      ((event.target as HTMLElement).offsetHeight - event.offsetY) / scaleY
    );
    const octave = Math.floor(pitch / phrase.scale.degrees.length);
    const degree = pitch % phrase.scale.degrees.length;
    const duration = defaultDuration;
    const velocity = 100;
    return { time: beat, octave, degree, length: duration, velocity };
  }

  function mousewheel(event: WheelEvent, target: Note = null) {
    if (target) {
      target.length -= Math.sign(event.deltaY) * snapTicks;
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

  let lanes: HTMLElement;
  let events: HTMLElement;
  let timeline: HTMLElement;

  function scrollLink(
    from: HTMLElement,
    to: HTMLElement,
    top = true,
    left = true
  ) {
    from.addEventListener("scroll", () => {
      if (top) to.scrollTop = from.scrollTop;
      if (left) to.scrollLeft = from.scrollLeft;
    });
  }

  onMount(() => {
    scrollLink(events, lanes, true, false);
    scrollLink(events, timeline, false, true);
  });

  function make(type: "tone" | "percussion") {
    const phrase: Phrase = new Phrase(state, {
      type: type,
    });
    state.song.phrases.push(phrase);
    state.phrase = phrase;
    state = state;
  }

  function unmake() {
    state.song.phrases = without(state.song.phrases, state.phrase);
    state.phrase = state.song.phrases[0];
    state = state;
  }
</script>

<div class="pane">
  <!-- <aside /> -->
  <header>
    <section>
      <fieldset>
        <select bind:value={state.phrase}>
          {#each state.song.phrases as phrase}
            <option value={phrase}>{phrase.name}</option>
          {/each}
        </select>
        <input bind:value={phrase.name} />
        <button title="New tonal pattern" on:click={() => make("tone")}>+T</button>
        <button title="New percussive pattern" on:click={() => make("percussion")}>+P</button>
        <button title="Forget pattern" on:click={unmake}>X</button>
      </fieldset>
      <label>
        Phrase length
        <input
          type="number"
          bind:value={phrase.length}
          size="4"
          min={state.song.beatLength * state.song.barLength}
          step={state.song.beatLength * state.song.barLength}
        />
      </label>
      {#if phrase.tonal}
        <label>
          Scale
          <select bind:value={phrase.scale}>
            {#each state.song.scales as scale}
              <option value={scale}>{scale.name}</option>
            {/each}
          </select>
        </label>
        <label>
          Tonic
          <select bind:value={phrase.tonic}>
            {#each notes as note, i}
              <option value={i}>{note}</option>
            {/each}
          </select>
        </label>
        <label>
          Base octave
          <input
            type="number"
            bind:value={phrase.baseOctave}
            size="4"
            min="0"
            max={12 - phrase.octaves}
            step="1"
          />
        </label>
        <label>
          Octaves
          <input
            type="number"
            bind:value={phrase.octaves}
            size="4"
            min="1"
            max="12"
            step="1"
          />
        </label>
      {/if}
    </section>
    <section>
      <label>
        Note length
        <select bind:value={defaultDuration}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
        </select>
      </label>
      <label>
        Snap
        <select bind:value={snapTicks}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
        </select>
      </label>
      <label>
        Zoom X
        <select bind:value={scaleX}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
        </select>
      </label>
      <label>
        Zoom Y
        <select bind:value={scaleY}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
        </select>
      </label>
    </section>
  </header>
  <main class="compact event-grid">
    <div class="timeline" bind:this={timeline}>
      {#each times(Math.ceil(phrase.length / state.song.beatLength), (x) => x) as tick}
        <div class="tock" style="width: {scaleX * state.song.beatLength}px;">
          {tick}
        </div>
      {/each}
    </div>
    <div class="lanes scale-names" bind:this={lanes}>
      {#each reverse(times(phrase.octaves, (x) => x + phrase.baseOctave)) as octave}
        <div
          class="octave"
          style="height: {scaleY * phrase.scale.degrees.length}px;"
        >
          {#each reverse(phrase.scale.degrees) as degree}
            <div class="lane degree" style="height: {scaleY}px;">
              {phrase.noteNames[phrase.tonic + degree + octave * 12]}
            </div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="events" bind:this={events}>
      <div
        class="pattern"
        style="width: {scaleX * phrase.length + 1}px; height: {scaleY *
          phrase.scale.degrees.length *
          phrase.octaves +
          1}px;"
        on:mousemove={(e) => mousemove(e)}
        on:mousedown={(e) => mousedown(e)}
        on:mouseleave={(e) => mouseleave(e)}
        on:contextmenu|preventDefault={(e) => e}
        on:wheel|preventDefault|stopPropagation={(e) => mousewheel(e)}
        >
        <div class="guides">
          <div
            class="guide degrees"
            style="background-size: 100% {2 * scaleY}px"
          />
          <div
            class="guide snap"
            style="background-size: {scaleX * snapTicks}px"
          />
          <div
            class="guide octaves"
            style="background-size: 100% {scaleY *
              phrase.scale.degrees.length}px"
          />
          <div
            class="guide beats"
            style="background-size: {scaleX * state.song.beatLength}px"
          />
          <div
            class="guide bars"
            style="background-size: {scaleX *
              state.song.beatLength *
              state.song.barLength}px"
          />
        </div>
        {#if ghost}
          <div
            class="event note virtual {ghost.chord ? 'chord' : ''}"
            style="left:   {ghost.time * scaleX + 1}px;
                     bottom: {(ghost.degree +
              ghost.octave * phrase.scale.degrees.length) *
              scaleY +
              1}px;
                     width:  {(scaleX - 1) * ghost.length + ghost.length - 1}px;
                     height: {scaleY - 1}px"
          />
        {/if}
        {#each phrase.notes as note}
          <div
            class="event note {note.chord ? 'chord' : ''}"
            style="left:   {note.time * scaleX + 1}px;
                 bottom: {(note.degree +
              note.octave * phrase.scale.degrees.length) *
              scaleY +
              1}px;
                 width:  {(scaleX - 1) * note.length + note.length - 1}px;
                 height: {scaleY - 1}px"
            on:mousedown|stopPropagation={(e) => mousedown(e, note)}
            on:mousemove|stopPropagation={(e) => mousemove(e, note)}
            on:wheel|preventDefault|stopPropagation={(e) => mousewheel(e, note)}
          />
        {/each}
        {#if phrase.tickNum}
          <div
            class="cursor beat"
            style="left: {scaleX * (phrase.tickNum % phrase.length)}px;"
          />
        {/if}
      </div>
    </div>
  </main>
</div>

<style lang="less">
  .octaves {
    background: linear-gradient(#303030 1px, transparent 1px);
  }
  .degrees {
    background: // linear-gradient(#303030 1px, transparent 1px, transparent 50%, #303030 50%, #303030 calc(50% + 1px), transparent calc(50% + 1px)),
      linear-gradient(#181818 50%, #1d1d1d 50%);
  }
</style>
