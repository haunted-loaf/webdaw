<script lang="ts">
  import { ToneEngine } from "@/engines/tone";
  import { State } from "@/lib/State";
  import { afterUpdate } from "svelte";
  import { AMSynthOptions, DuoSynthOptions, FMSynth, FMSynthOptions, MembraneSynthOptions, MetalSynthOptions, MonoSynthOptions, PluckSynthOptions } from "tone";
  import { RecursivePartial } from "tone/build/esm/core/util/Interface";
  import { ExtendedToneOscillatorType } from "tone/build/esm/source/oscillator/OscillatorInterface";
  import Channel from "./Channel.svelte";

  export let state: State;

  let synthType : string

  // let options : RecursivePartial<FMSynthOptions | AMSynthOptions | DuoSynthOptions | MonoSynthOptions | MetalSynthOptions | PluckSynthOptions | MembraneSynthOptions> = {
  let options : RecursivePartial<FMSynthOptions> = {
    vibratoAmount: 1,
    vibratoRate: 1000,
    pitchDecay: 0.1,
    octaves: 5,
    resonance: 1000,
    volume: 0,
    detune: 0,
    modulationIndex: 0,
    harmonicity: 0,
    oscillator: {
      type: "pwm",
      partialCount: 0,
      modulationFrequency: 7,
    },
    modulation: {
      type: "sawtooth",
      partialCount: 0,
      modulationFrequency: 13,
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      release: 0.1,
      sustain: 0.1,
    },
    modulationEnvelope: {
      attack: 0.1,
      decay: 0.2,
      release: 0.1,
      sustain: 0.1,
    }
  }

  const synthTypes = [
    "FMSynth",
    "DuoSynth",
    "MembraneSynth",
    "MetalSynth",
    "MonoSynth",
    "AMSynth",
    "PluckSynth",
  ]

  const oscillatorTypes = [
    "pwm",
    "pulse",
    "triangle",
    "square",
    "sawtooth",
    "sine",
    "fattriangle",
    "fatsquare",
    "fatsawtooth",
    "fatsine",
    "fmtriangle",
    "fmsquare",
    "fmsawtooth",
    "fmsine",
    "amtriangle",
    "amsquare",
    "amsawtooth",
    "amsine",
  ]

  afterUpdate(() => {
    let e = state.engine as ToneEngine;
    if (!e.rebuild)
      return;
    console.log("Rebuilding")
    e.synthType = synthType
    e.rebuild(options)
  });
</script>

<div class="pane">
  <header>Synth Configuration</header>
  <main style="display: flex; flex-direction: column; gap: 5px;">
    <!-- <label>
      Synth Type
      <select bind:value={synthType}>
        {#each synthTypes as type}
        <option value={type}>{type}</option>
        {/each}
      </select>
    </label> -->
    <label>
      Detune
      <input type="number" bind:value={options.detune} size="4"/>cents
    </label>
    <label>
      Modulation index
      <input type="number" bind:value={options.modulationIndex} size="4"/>
    </label>
    <label>
      Volume
      <input type="number" bind:value={options.volume} size="4"/>dB
    </label>
    <label>
      Oscillator
      <select bind:value={options.oscillator.type}>
        {#each oscillatorTypes as type}
        <option value={type}>{type}</option>
        {/each}
      </select>
    </label>
    <label>
      Frequency
      <input type="number" bind:value={options.oscillator.modulationFrequency} size="4" min="0" />Hz
    </label>
    <label>
      Partials
      <input type="number" bind:value={options.oscillator.partialCount} size="4" min="0" />
    </label>
    <label>
      Attack
      <input type="number" bind:value={options.envelope.attack} size="4" min="0" step="0.1" />
    </label>
    <label>
      Decay
      <input type="number" bind:value={options.envelope.decay} size="4" min="0" step="0.1" />
    </label>
    <label>
      Release
      <input type="number" bind:value={options.envelope.release} size="4" min="0" step="0.1" />
    </label>
    <label>
      Sustain
      <input type="number" bind:value={options.envelope.sustain} size="4" min="0" max="1" step="0.1"/>
    </label>
    <label>
      Mod. Oscillator
      <select bind:value={options.modulation.type}>
        {#each oscillatorTypes as type}
        <option value={type}>{type}</option>
        {/each}
      </select>
    </label>
    <label>
      Mod. Frequency
      <input type="number" bind:value={options.modulation.modulationFrequency} size="4" min="0" />Hz
    </label>
    <label>
      Mod.Partials
      <input type="number" bind:value={options.modulation.partialCount} size="4" min="0" />
    </label>
    <label>
      Attack
      <input type="number" bind:value={options.modulationEnvelope.attack} size="4" min="0" step="0.1" />
    </label>
    <label>
      Decay
      <input type="number" bind:value={options.modulationEnvelope.decay} size="4" min="0" step="0.1"/>
    </label>
    <label>
      Release
      <input type="number" bind:value={options.modulationEnvelope.release} size="4" min="0" step="0.1"/>
    </label>
    <label>
      Sustain
      <input type="number" bind:value={options.modulationEnvelope.sustain} size="4" min="0" max="1" step="0.1"/>
    </label>
  </main>
</div>
