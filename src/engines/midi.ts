import { drumNames, instrumentNames } from "@/instruments"
import { Engine } from "../engine"

export class MidiEngine implements Engine {

  access: WebMidi.MIDIAccess
  output: WebMidi.MIDIOutput

  constructor(access: WebMidi.MIDIAccess) {
    this.access = access
  }

  get name() {
    return "WebMidi"
  }

  init(): this {
    this.output = Array.from(this.access.outputs.values())[0]
    return this
  }

  note(time: number, channel: number, pitch: number, velocity: number, duration: number) {
    const output = this.output
    output.send([0x90 + channel, pitch, velocity], time)
    output.send([0x80 + channel, pitch, velocity], time + duration)
  }

  programChange(time: number, channel: number, program: number) {
    this.output.send([0xC0 + channel, program], time)
  }

  channelInstrumentNames(channel: number) {
    if (channel == 9) {
      return drumNames
    } else {
      return instrumentNames
    }
  }

}
