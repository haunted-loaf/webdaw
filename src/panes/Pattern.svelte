<script lang="ts">
  import { Note } from "@/lib/Note";
  import { notes, Pattern } from "@/lib/Pattern";
  import { State } from "@/lib/State";
  import { andThen, reverse } from "ramda";
  import { onMount } from "svelte";
  import { identity, times, without } from "underscore";

  export let state: State;
  export let pattern: Pattern;
  export let snapTicks: number = 4;

  let autoChordEnabled : boolean = !!pattern.autoChord

  let tickNum = pattern.tickNum;

  let ghost: Note = null;

  let defaultDuration = 16;
  let scaleX = 8;
  let scaleY = 32;

  function applyAutoChordEnabled () {
    if (autoChordEnabled) {
      pattern.autoChord ||= {
        degrees: [0],
        delay: 0
      }
    } else {
      pattern.autoChord = null
    }
  }

  function noteFromEvent(event: MouseEvent): Note {
    const beat = Math.floor(event.offsetX / scaleX / snapTicks) * snapTicks;
    const pitch = Math.floor(
      ((event.target as HTMLElement).offsetHeight - event.offsetY) / scaleY
    );
    const octave = Math.floor(pitch / pattern.scale.degrees.length);
    const degree = pitch % pattern.scale.degrees.length;
    const duration = defaultDuration;
    const velocity = 100;
    const chord = null;
    return { time: beat, octave, degree, length: duration, velocity, chord };
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
    pattern = pattern;
  }

  let panning = false;

  function mousedown(event: MouseEvent, note: Note = null) {
    if (event.button === 0) {
      pattern.notes.push(noteFromEvent(event));
      pattern.notes = pattern.notes;
    } else if (event.button === 1) {
      panning = true;
      ghost = null;
    } else if (event.button === 2) {
      if (note) pattern.notes = without(pattern.notes, note);
    }
  }

  function mouseup(event: MouseEvent) {
    panning = false;
  }

  function mouseleave(event: MouseEvent) {
    ghost = null;
  }

  function mousemove(event: MouseEvent, target: Note = null) {
    if (panning) {
      events.scrollLeft += -event.movementX * 2;
      events.scrollTop += -event.movementY * 2;
      return;
    }
    if (target) {
      if (event.button === 1) pattern.notes = without(pattern.notes, ghost);
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
    scrollLink(lanes, events, true, false);
    scrollLink(timeline, events, false, true);
  });
</script>

<div class="pane">
  <aside>
    <label>
      Pattern length
      <input
        type="number"
        bind:value={pattern.length}
        size="4"
        min={state.song.beatLength * state.song.barLength}
        step={state.song.beatLength * state.song.barLength}
      />
    </label>
    <label>
      Beats per bar
      <input
        type="number"
        bind:value={pattern.barLength}
        size="4"
        min={1}
        step={1}
      />
    </label>
    {#if pattern.tonal}
      <label>
        Scale
        <select bind:value={pattern.scale}>
          {#each state.scales as scale}
            <option value={scale}>{scale.name}</option>
          {/each}
        </select>
      </label>
      <label>
        Tonic
        <select bind:value={pattern.tonic}>
          {#each notes as note, i}
            <option value={i}>{note}</option>
          {/each}
        </select>
      </label>
      <label>
        Base octave
        <input
          type="number"
          bind:value={pattern.baseOctave}
          size="4"
          min="0"
          max={12 - pattern.octaves}
          step="1"
        />
      </label>
      <label>
        Octaves
        <input
          type="number"
          bind:value={pattern.octaves}
          size="4"
          min="1"
          max="12"
          step="1"
        />
      </label>
      <label>
        Auto-chorder
        <input type="checkbox" bind:checked={autoChordEnabled} on:change={applyAutoChordEnabled} />
      </label>
      {#if pattern.autoChord}
      <label>
        Chord
        <select bind:value={pattern.autoChord.degrees}>
          <option value={[0, 4, 7]}>Major</option>
          <option value={[0, 4, 7]}>Major</option>
          <option value={[0, 3, 7]}>Minor</option>
          <option value={[0, 4, 7, 12]}>Major+1</option>
        </select>
      </label>
      <label>
        Delay
        <input
          type="number"
          bind:value={pattern.autoChord.delay}
          size="4"
          min="0"
          step="1"
        />
      </label>
      {/if}
    {/if}
  </aside>
  <header>
    <section>
      <fieldset>
        <!-- <select bind:value={state.pattern}>
          {#each state.song.patterns as pattern}
            <option value={pattern}>{pattern.name}</option>
          {/each}
        </select> -->
        <input bind:value={pattern.name} />
        <!-- <button title="New tonal pattern" on:click={() => make("tone")}>+T</button> -->
        <!-- <button title="New percussive pattern" on:click={() => make("percussion")}>+P</button> -->
        <!-- <button title="Forget pattern" on:click={unmake}>X</button> -->
      </fieldset>
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
      {#each times(Math.ceil(pattern.length / state.song.beatLength), (x) => x) as tick}
        <div class="tock" style="width: {scaleX * state.song.beatLength}px;">
          {tick}
        </div>
      {/each}
    </div>
    <div class="lanes scale-names" bind:this={lanes}>
      {#each reverse(times(pattern.octaves, (x) => x + pattern.baseOctave)) as octave}
        <div
          class="octave"
          style="height: {scaleY * pattern.scale.degrees.length}px;"
        >
          {#each reverse(pattern.scale.degrees) as degree}
            <div class="lane degree" style="height: {scaleY}px;">
              {pattern.noteNames[pattern.tonic + degree + octave * 12]}
            </div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="events" bind:this={events}>
      <div
        class="pattern"
        style="width: {scaleX * pattern.length + 1}px; height: {scaleY *
          pattern.scale.degrees.length *
          pattern.octaves +
          1}px;"
        on:mousemove={(e) => mousemove(e)}
        on:mousedown={(e) => mousedown(e)}
        on:mouseleave={(e) => mouseleave(e)}
        on:mouseup={(e) => mouseup(e)}
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
              pattern.scale.degrees.length}px"
          />
          <div
            class="guide beats"
            style="background-size: {scaleX * state.song.beatLength}px"
          />
          <div
            class="guide bars"
            style="background-size: {scaleX *
              state.song.beatLength *
              pattern.barLength}px"
          />
        </div>
        {#if ghost}
          <div
            class="event note virtual {ghost.chord ? 'chord' : ''}"
            style="left:   {ghost.time * scaleX + 1}px;
                     bottom: {(ghost.degree +
              ghost.octave * pattern.scale.degrees.length) *
              scaleY +
              1}px;
                     width:  {(scaleX - 1) * ghost.length + ghost.length - 1}px;
                     height: {scaleY - 1}px"
          />
        {/if}
        {#each pattern.notes as note}
          <div
            class="event note {note.chord ? 'chord' : ''}"
            style="left:   {note.time * scaleX + 1}px;
                 bottom: {(note.degree +
              note.octave * pattern.scale.degrees.length) *
              scaleY +
              1}px;
                 width:  {(scaleX - 1) * note.length + note.length - 1}px;
                 height: {scaleY - 1}px"
            on:mousedown|stopPropagation={(e) => mousedown(e, note)}
            on:mousemove|stopPropagation={(e) => mousemove(e, note)}
            on:wheel|preventDefault|stopPropagation={(e) => mousewheel(e, note)}
          />
        {/each}
        {#if $tickNum}
          <div
            class="cursor beat"
            style="left: {scaleX * ($tickNum % pattern.length)}px;"
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
