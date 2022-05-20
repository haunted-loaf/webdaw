<script lang="ts">
import { Channel } from "@/lib/Channel";

import { State } from "@/lib/State";


  import { createEventDispatcher } from "svelte";

  export let state: State;
  export let channel: Channel;
  export let number: number;

  const dispatch = createEventDispatcher();

  function onChange(num: number) {
    channel.program += num
    state.engine.programChange(
      0,
      number,
      channel.program
    );
    dispatch("change", { program: channel.program });
  }
</script>

<horizontal>
  {#if channel.type == "tone"}
  <!-- <button on:click={() => onChange(-1)}>&lt;</button> -->
  <span>{number}</span>
  <select bind:value={channel.program} on:change={() => onChange(0)}>
    {#each state.engine.instruments() as name, i}
      {#if name !== null}
        <option value={i}>{name}</option>
      {/if}
    {/each}
  </select>
  <!-- <button on:click={() => onChange(1)}>&gt;</button> -->
  {/if}
</horizontal>

<style>
  span {
    display: inline-block;
    width: 1.5em;
  }
</style>
