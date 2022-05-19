<script lang="ts">
  import { State } from "@/lib/State";
  import {
    Dialog,
    DialogOverlay,
    DialogTitle,
  } from "@rgossiaux/svelte-headlessui";
  import { onMount, onDestroy } from "svelte";
  import { Unsubscriber } from "svelte/store";

  export let state: State;

  let open = state.saveLoadIsOpen;
  let subscription: Unsubscriber;

  let value: string = JSON.stringify(state.dump(), null, 2);

  function unsubscribe() {
    if (subscription) subscription();
    subscription = null;
  }

  function load(append: boolean) {
    if (!append) state.clear();
    state = state.load(JSON.parse(value));
  }

  onMount(() => {
    function helper() {
      value = JSON.stringify(state.dump(), null, 2);
    }
    unsubscribe();
    subscription = open.subscribe(helper);
    helper();
  });

  onDestroy(unsubscribe);
</script>

{#if open}
  <Dialog open={$open} on:close={() => open.set(false)}>
    <DialogOverlay class="dialog-overlay" />
    <div class="dialog">
      <header>
        <DialogTitle>Load or save data</DialogTitle>
      </header>
      <main style="display: flex">
        <textarea bind:value style="flex-grow: 1" />
      </main>
      <footer>
        <button
          title="Add the songs and patterns from the data dump to what you already have"
          on:click={() => load(true)}>Append</button
        >
        <button
          title="Replace the songs and patterns with those from the data dump"
          on:click={() => load(false)}>Replace</button
        >
        <div style="flex-grow: 1" />
        <button on:click={() => open.set(false)}>Close</button>
      </footer>
    </div>
  </Dialog>
{/if}

<style lang="less">
</style>
