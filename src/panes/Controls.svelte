<script lang="ts">
  import * as _ from "underscore";
  import { onDestroy, onMount } from "svelte";
  import { State } from "@/lib/State";
  import { set } from "ramda";

  export let state: State;

  let rushing = state.rushing

  function restart() {
    state.restart()
  }

  function start() {
    state.start()
  }

  function stop() {
    state.stop()
  }

</script>

<div id="menu" class="pane" style="flex-grow: 1">
  <header>
    <section>
      <h1><span style="color: #0af; font-weight: bold">WebDAW</span></h1>
      <select bind:value={state.engine}>
        {#each state.engines as engine}
          <option value={engine}>{engine.name}</option>
        {/each}
      </select>
      <button on:click={() => state.saveLoadIsOpen.set(true)}>Save/Load</button>
      <fieldset>
        <button on:click={restart}>Restart</button>
        <button on:click={start}>Play</button>
        <button on:click={stop}>Stop</button>
      </fieldset>
      {#if $rushing > 0}
      Behind {$rushing} update{#if $rushing > 1}s{/if}.
      {/if}
    </section>
    <section>
      <a href="https://github.com/haunted-loaf/webdaw">Github</a>
      <a href="https://trello.com/b/p08pydKL/webdaw">Trello</a>
    </section>
  </header>
</div>
