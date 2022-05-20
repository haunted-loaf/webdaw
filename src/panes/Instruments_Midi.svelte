<script lang="ts">
  import { State } from "@/lib/State";
import Channel from "./Channel.svelte";
  export let state: State;
</script>

<div class="pane">
  <header>MIDI Programs</header>
  <main>
    {#each state.song.channels as _, i}
      <Channel
        bind:state
        bind:channel={state.song.channels[i]}
        number={i}
      />
    {/each}
  </main>
</div>
