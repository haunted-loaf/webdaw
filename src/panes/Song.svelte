<script lang="ts">
  import { Instance } from "@/lib/Instance";
  import { Pattern } from "@/lib/Pattern";
  import { Song } from "@/lib/Song";
  import { State } from "@/lib/State";
  import { onMount } from "svelte";
  import { identity, keys, times, without } from "underscore";

  export let state: State;
  export let song: Song;
  let tickNum = state.tickNum;

  let snapTicks: number = 64;
  let ghost: Instance = null;
  let scaleX = 1;
  let scaleY = 32;

  function instanceFromEvent(event: MouseEvent): Instance {
    const time = Math.floor(event.offsetX / scaleX / snapTicks) * snapTicks;
    const track = Math.floor(event.offsetY / scaleY);
    const pattern = state.patterns[state.patternId];
    const length = pattern.length;
    return { time, length, pattern: state.patternId, track: track };
  }

  function mousewheel(event: WheelEvent, target: Instance = null) {
    if (target) {
      target.length -= Math.sign(event.deltaY) * snapTicks;
      target.length = Math.max(1, target.length);
    }
    state = state;
  }

  let panning = false;

  function mousedown(event: MouseEvent, target: Instance = null) {
    if (event.button === 0) {
      if (target) return;
      target = instanceFromEvent(event);
      song.tracks[target.track].instances.push(target);
    } else if (event.button === 1) {
      panning = true;
      ghost = null;
    } else if (event.button === 2) {
      if (target)
        song.tracks[target.track].instances = without(
          song.tracks[target.track].instances,
          target
        );
    }
    state = state;
  }

  function mouseup(event: MouseEvent) {
    panning = false;
  }

  function mouseleave(event: MouseEvent) {
    ghost = null;
  }

  function mousemove(event: MouseEvent, target: Instance = null) {
    if (panning) {
      events.scrollLeft += -event.movementX * 2;
      events.scrollTop += -event.movementY * 2;
      return;
    }
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

  function make() {
    const pattern = new Pattern(state, {
      name: `Pattern ${keys(state.patterns).length + 1}`,
    });
    state.patternId = pattern.id;
    state = state;
  }

  function unmake() {
    delete state.patterns[state.patternId];
    state.patternId = keys(state.patterns)[0];
    state = state;
  }
</script>

<div class="pane">
  <aside>
    <label>
      Arrangement length
      <input
        type="number"
        bind:value={state.song.length}
        size="4"
        min={song.beatLength * song.barLength}
        step={song.beatLength * song.barLength}
      />
    </label>
    <label>
      Transpose <input
        type="number"
        bind:value={state.song.baseNote}
        size="4"
        min="0"
        max="127"
      />
    </label>
    <label>
      Tick length <input
        type="number"
        bind:value={state.song.tickLength}
        size="4"
        min="1"
        max="1000"
      />
    </label>
    <label>
      Ticks per beat <input
        type="number"
        bind:value={state.song.beatLength}
        size="4"
        min="1"
        max="127"
      /></label
    >
    <label>
      Beats per bar <input
        type="number"
        bind:value={state.song.barLength}
        size="4"
        min="1"
        max="127"
      />
    </label>
  </aside>
  <header>
    <section>
      <fieldset>
        <!-- <select bind:value={state.pattern}>
          {#each song.patterns as pattern}
            <option value={pattern}>{pattern.name}</option>
          {/each}
        </select> -->
        <input bind:value={song.name} />
        <!-- <button on:click={make}>+</button>
        <button on:click={unmake}>-</button> -->
      </fieldset>
    </section>
    <section>
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
      {#each times(Math.ceil(song.length / (song.beatLength * song.barLength)), (x) => x) as tick}
        <div
          class="tock"
          style="width: {scaleX * (song.beatLength * song.barLength)}px;"
        >
          {tick}
        </div>
      {/each}
    </div>
    <div class="lanes scale-names" bind:this={lanes}>
      {#each song.tracks as track}
        <div class="lane track" style="height: {scaleY}px;">
          <!-- {track.name} -->
          <select bind:value={track.channel}>
            {#each times(16, identity) as channel}
              <option value={channel}>{channel}</option>
            {/each}
          </select>
        </div>
      {/each}
    </div>
    <div class="events" bind:this={events}>
      <div
        class="pattern"
        style="width: {scaleX * song.length + 1}px; height: {scaleY *
          song.tracks.length +
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
            class="guide beats"
            style="background-size: {scaleX * song.beatLength}px"
          />
          <div
            class="guide octaves"
            style="background-size: 100% {scaleY * song.tracks.length}px"
          />
          <div
            class="guide bars"
            style="background-size: {scaleX *
              song.beatLength *
              song.barLength}px"
          />
        </div>
        {#if ghost}
          <div
            class="event note virtual"
            style="left:   {ghost.time * scaleX + 1}px;
                   top:    {ghost.track * scaleY + 1}px;
                   width:  {(scaleX - 1) * ghost.length + ghost.length - 1}px;
                   height: {scaleY - 1}px"
          >
            {state.patterns[ghost.pattern].name}
          </div>
        {/if}
        {#each song.tracks as track, i}
          {#each track.instances as instance}
            <div
              class="event instance"
              style="left:   {instance.time * scaleX + 1}px;
                 top:    {i * scaleY + 1}px;
                 width:  {(scaleX - 1) * instance.length +
                instance.length -
                1}px;
                 height: {scaleY - 1}px"
              on:mousedown|stopPropagation={(e) => mousedown(e, instance)}
              on:mousemove|stopPropagation={(e) => mousemove(e, instance)}
              on:wheel|preventDefault|stopPropagation={(e) =>
                mousewheel(e, instance)}
            >
              {state.patterns[instance.pattern].name}
            </div>
          {/each}
        {/each}
        {#if state.tickNum}
          <div
            class="cursor beat"
            style="left: {scaleX * ($tickNum % song.length)}px;"
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
