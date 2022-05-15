<script lang="ts">
  import { colours } from "@/colours";
  import { afterUpdate } from "svelte";
  import _, { random } from "underscore";
  import type { State } from "../store";
  import PhrasePad from "./PhrasePad.svelte";
  export let state: State;

  function make() {
    const phrase = {
      name: `Phrase ${state.song.phrases.length + 1}`,
      length: 64,
      notes: [],
      colour: colours[random(colours.length)],
    };
    state.song.phrases.push(phrase);
    state.phrase = phrase
    state = state;
  }

  function unmake() {
    state.song.phrases = _.without(state.song.phrases, state.phrase)
    state.phrase = state.song.phrases[0]
    state = state;
  }

</script>

<main>
  <horizontal>
    <select bind:value={state.phrase}>
      {#each state.song.phrases as phrase}
        <option value={phrase}>{phrase.name}</option>
      {/each}
    </select>
    <button on:click={make}>+</button>
    <button on:click={unmake}>-</button>
  </horizontal>
  <PhrasePad bind:phrase={state.phrase} bind:state />
</main>
