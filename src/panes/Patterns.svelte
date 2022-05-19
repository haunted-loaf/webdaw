<script lang="ts">
  import { keys, values, without } from "underscore";
  import { State } from "@/lib/State";
  import { Pattern } from "@/lib/Pattern";

  export let state: State;

  function make(type: "tone" | "percussion") {
    const pattern = new Pattern(state, {
      type: type,
    });
    state.patternId = pattern.id;
  }

  function unmake() {
    delete state.patterns[state.patternId];
    state.patternId = keys(state.patterns)[0];
    // state = state;
  }

  let value : string
</script>

<div class="pane" style="min-width: 20em">
  <header>Patterns</header>
  <main style="display: flex; flex-direction: column">
    <select bind:value={state.patternId} size="10" style="flex-grow: 1">
      {#each values(state.patterns) as pattern}
        <option value={pattern.id}>{pattern.name}</option>
      {/each}
    </select>
    <div style="display: flex">
      <button title="New tonal pattern" on:click={() => make("tone")}>🎹</button>
      <button title="New percussive pattern" on:click={() => make("percussion")}>🥁</button>
      <button title="Remove pattern" on:click={unmake}>❌</button>
    </div>
  </main>
</div>
