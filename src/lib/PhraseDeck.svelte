<script lang="ts">
  import { colours } from "@/colours";
  import { afterUpdate } from "svelte";
  import { without } from "underscore";
  import { Phrase, State } from "../store";
  import PhrasePad from "./PhrasePad.svelte";
  export let state: State;

  function make() {
    const phrase: Phrase = new Phrase(state, {
      name: `Phrase ${state.song.phrases.length + 1}`,
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

<div class="pane" style="min-width: 20em">
  <header>Patterns</header>
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
  </main>
</div>
