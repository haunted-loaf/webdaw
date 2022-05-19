<script lang="ts">
  import { keys, values, without } from "underscore";
  import { Phrase, State } from "../store";

  export let state: State;

  function make(type: "tone" | "percussion") {
    const phrase: Phrase = new Phrase(state, {
      type: type,
    });
    state.phraseId = phrase.id;
  }

  function unmake() {
    delete state.song.phrases[state.phraseId];
    state.phraseId = keys(state.song.phrases)[0];
    // state = state;
  }

  let value : string
</script>

<div class="pane" style="min-width: 20em">
  <header>Patterns</header>
  <main style="display: flex; flex-direction: column">
    <select bind:value={state.phraseId} size="10" style="flex-grow: 1">
      {#each values(state.song.phrases) as phrase}
        <option value={phrase.id}>{phrase.name}</option>
      {/each}
    </select>
    <div style="display: flex">
      <button title="New tonal pattern" on:click={() => make("tone")}>🎹</button>
      <button title="New percussive pattern" on:click={() => make("percussion")}>🥁</button>
      <button title="Remove pattern" on:click={unmake}>❌</button>
    </div>
  </main>
</div>
