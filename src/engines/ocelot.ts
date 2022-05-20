import { instrumentNames } from "@/lib/instruments";
import { FMSynth, FMSynthOptions, MembraneSynth, MetalSynth, MonoSynth, Oscillator, PluckSynth, PolySynth, PolySynthOptions, Transport } from "tone";
import { RecursivePartial } from "tone/build/esm/core/util/Interface";
import { times } from "underscore";
import { Engine } from "../lib/engine";

export class OcelotEngine implements Engine {

  waiter: Promise<this>
  synth: PolySynth<MonoSynth>

  constructor() {
    this.waiter = this.init()
  }

  async init(): Promise<this> {
    // this.voices = times(16, () => new PolySynth(Tone.Synth).toDestination())
    // this.synth = new PolySynth(Tone[this.synthType]).toDestination()
    this.rebuild()
    return this
  }

  get name() {
    return "Ocelot"
  }

  rebuild() {
    if (this.synth) {
    } else {
      this.synth = new PolySynth(MonoSynth).toDestination()
      this.synth.set({
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.1,
        },
      })
    }
  }

  note(time: number, channel: number, pitch: number, velocity: number, duration: number) {
    var f = 440 * Math.pow(2, (pitch - 69) / 12)
    duration /= 1000
    velocity /= 1000
    time /= 1000
    time -= performance.now() / 1000
    time += Transport.immediate()
    // this.voices[channel].triggerAttackRelease(f, duration, time, velocity)
    this.synth.triggerAttackRelease(f, duration, time, velocity)
    // this.synth.start(
  }

  programChange(time: number, channel: number, program: number) {
    // this.output.send([0xC0 + channel, program], time)
  }

  instruments() {
    return instrumentNames
  }

}
