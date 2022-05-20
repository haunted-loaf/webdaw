import { instrumentNames } from "@/lib/instruments";
import * as Tone from "tone";
import { times } from "underscore";
import { Engine } from "../lib/engine";

export class ToneEngine implements Engine {

  waiter: Promise<this>
  voices: Tone.PolySynth[]

  constructor() {
    this.waiter = this.init()
  }

  async init(): Promise<this> {
    this.voices = times(16, () => new Tone.PolySynth<Tone.FMSynth>().toDestination())
    return this
  }

  get name() {
    return "Tone.js"
  }

  note(time: number, channel: number, pitch: number, velocity: number, duration: number) {
    var f = 440 * Math.pow(2, (pitch - 69) / 12)
    duration /= 1000
    velocity /= 1000
    time /= 1000
    time -= performance.now() / 1000
    time += Tone.Transport.immediate()
    this.voices[channel].triggerAttackRelease(f, duration, time, velocity)
  }

  programChange(time: number, channel: number, program: number) {
    // this.output.send([0xC0 + channel, program], time)
  }

  instruments() {
    return instrumentNames
  }

}
