import { drumNames, instrumentNames } from "@/instruments";
import * as Tone from "tone";
import { times } from "underscore";
import { Engine } from "../engine";

export class ToneEngine implements Engine {

  instruments: Tone.PolySynth[]

  init(): this {
    this.instruments = times(16, () => new Tone.PolySynth<Tone.FMSynth>().toDestination())
    return this
  }

  get name() {
    return "Tone.js"
  }

  note(time: number, channel: number, pitch: number, velocity: number, duration: number) {
    var f = 440 * Math.pow(2, (pitch - 69) / 12)
    console.log(f)
    this.instruments[channel].triggerAttackRelease(f, duration / 1000)
  }

  programChange(time: number, channel: number, program: number) {
    // this.output.send([0xC0 + channel, program], time)
  }

  channelInstrumentNames(channel: number) {
    if (channel == 9) {
      return drumNames
    } else {
      return instrumentNames
    }
  }

}
