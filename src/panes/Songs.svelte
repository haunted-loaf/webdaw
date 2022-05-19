<script lang="ts">
  import { keys, values, without } from "underscore";
  import { State } from "@/lib/State";
  import { Song } from "@/lib/Song";

  export let state: State;

  function make() {
    const song = new Song(state, {});
    state.songId = song.id;
  }

  function unmake() {
    delete state.songs[state.songId];
    state.songId = keys(state.songs)[0];
    // state = state;
  }

  let value : string
</script>

<div class="pane" style="min-width: 15em">
  <header>Songs</header>
  <main style="display: flex; flex-direction: column">
    <select bind:value={state.songId} size="10" style="flex-grow: 1">
      {#each values(state.songs) as song}
        <option value={song.id}>{song.name}</option>
      {/each}
    </select>
    <div style="display: flex">
      <button title="New tonal pattern" on:click={() => make()}>🎼</button>
      <button title="Remove pattern" on:click={unmake}>❌</button>
    </div>
  </main>
</div>
