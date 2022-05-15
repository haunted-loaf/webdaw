<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let program: number;
  export let instruments: string[];

  const dispatch = createEventDispatcher();

  function onChange(num: number) {
    program += num
    dispatch("change", { program: program });
  }
</script>

<main>
  <button on:click={() => onChange(-1)}>&lt;</button>

  <select bind:value={program} on:change={() => onChange(0)}>
    {#each instruments as name, i}
      {#if name !== null}
        <option value={i}>{name}</option>
      {/if}
    {/each}
  </select>

  <button on:click={() => onChange(1)}>&gt;</button>
</main>
