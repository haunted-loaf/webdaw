<script lang="ts">
  import { MidiEngine } from "@/engines/midi";
  import { ToneEngine } from "@/engines/tone";
  import { State } from "@/store";
  import { afterUpdate } from "svelte";
  export let state: State;
  export let midiFailed: boolean;

  afterUpdate(() => {});
</script>

<main>
  <select bind:value={state.engine}>
    {#each state.engines as engine}
      <option value={engine}>{engine.name}</option>
    {/each}
  </select>
  {#if midiFailed}
  MIDI startup failed. <a href="midi.html">See more about why</a>
  {/if}
</main>
