import { instrumentNames } from "@/lib/instruments";
import * as Tone from "tone";
import { FMSynth, FMSynthOptions, MembraneSynth, MetalSynth, PluckSynth, PolySynth, PolySynthOptions } from "tone";
import { RecursivePartial } from "tone/build/esm/core/util/Interface";
import { times } from "underscore";
import { Engine } from "../lib/engine";

export class ToneEngine implements Engine {

  waiter: Promise<this>
  voices: Tone.PolySynth[]
  synthType: string = "FMSynth"
  synth: Tone.PolySynth

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
    return "Tone.js"
  }

  rebuild(options: RecursivePartial<FMSynthOptions> = {}) {
    // if (!this.voices)
    //   return;
    if (this.synth) {
      // this.synth.dispose()
      this.synth.set(options)
    } else {
      this.synth = new PolySynth(Tone[this.synthType], options).toDestination()
    }
    // this.voices.forEach(v => {
    //   v.set(options)
    // })
  }

  note(time: number, channel: number, pitch: number, velocity: number, duration: number) {
    var f = 440 * Math.pow(2, (pitch - 69) / 12)
    duration /= 1000
    velocity /= 100
    time /= 1000
    time -= performance.now() / 1000
    time += Tone.Transport.immediate()
    // this.voices[channel].triggerAttackRelease(f, duration, time, velocity)
    this.synth.triggerAttackRelease(f, duration, time, velocity)
  }

  programChange(time: number, channel: number, program: number) {
    // this.output.send([0xC0 + channel, program], time)
  }

  instruments() {
    return instrumentNames
  }

}
