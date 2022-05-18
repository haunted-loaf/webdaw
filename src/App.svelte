<script lang="ts">
  import ChannelUI from "./lib/Channel.svelte";
  import Controls from "./lib/Controls.svelte";
  import { State } from "./store";
  import PhrasePane from "./lib/PhrasePad.svelte";
  import Arrangement from "./lib/Arrangement.svelte";

  let state = new State();
  let wait = state.init();

  function changeProgram(channel) {
    state.engine.programChange(
      0,
      channel,
      state.song.channels[channel].program
    );
  }

</script>

<Controls bind:state/>

<div id="arrangement">
  <Arrangement bind:state bind:song={state.song} />
</div>

<div id="instruments">
  <div class="pane">
    <header>Instruments</header>
    <main>
      {#each state.song.channels as _, i}
        <ChannelUI
          bind:state
          bind:channel={state.song.channels[i]}
          number={i}
          on:change={(e) => changeProgram(i)}
        />
      {/each}
    </main>
  </div>
</div>

<!-- <div id="patterns">
  <PhraseDeck bind:state />
</div> -->

<div id="pattern">
  <!-- Hello
  <div class="scroll">
    {#each times(100, (x) => x) as _}
      Scroll! Scroll!
    {/each}
  </div> -->
  <PhrasePane bind:state bind:phrase={state.phrase} />
</div>
